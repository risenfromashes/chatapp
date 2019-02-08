
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, ReactNode, CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import uuidv1 from 'uuid/v1'
import MessageElement from '../components/MessageElement'
import {MessageContainerProp, MessageContainerState, MessageData, ConnectionState} from '../types/MessageTypes'

import io from 'socket.io-client'
import { Socket } from 'socket.io';
import { textUpdateEventData, textEditEventData } from '../types/EventDataTypes';




export default class MessageContainer extends React.Component<MessageContainerProp, MessageContainerState>{
    
    private socket: SocketIOClient.Socket

    private newText: boolean = false
    private haveSentEmptyMessage: boolean = false
    private mostRecentMessageID: string | undefined

    constructor(props: MessageContainerProp){
        super(props)        
        this.handleAddButtonClick = this.handleAddButtonClick.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.socket = this.props.Socket
        this.state = {
            Messages: 
                (this.props.Messages && this.props.Messages.length > 0) ? this.props.Messages.map((Message) => {
                    return {
                        text: Message.text,
                        createdAt: Message.createdAt,
                        editedAt: Message.editedAt,
                        senderIP: Message.senderIP,
                        senderID: Message.senderID,
                        messageID: Message.messageID
                    }
                }) : [],
            id: undefined,
            ip: undefined,
            connected: false,
            attemptingConnection: true
        }
               
    }

    componentDidMount(){       

        this.socket.on('reconnecting', (attemptNumber: number) => {
            this.setState({connected: false, attemptingConnection: true})
          });
        this.socket.on('reconnect_error', (error: any) => {
            this.setState({connected: false, attemptingConnection: false})
        })
        this.socket.on('reconnect_failed', () => {
            this.setState({connected: false, attemptingConnection: false})
        });

        this.socket.on('connect', () => { }).on('connection', (connectionState: ConnectionState) => {
            if(connectionState.Messages) {
                this.setState(
                    {   
                        Messages: connectionState.Messages,
                        connected: true,
                        id: this.socket.id,
                        ip: connectionState.ip
                    }
                )
            }
            else {
                this.setState(
                    {   
                        connected: true,
                        id: this.socket.id,
                        ip: connectionState.ip
                    }
                )
            }
        })
    
        this.socket.on('textUpdateEvent', (updateEventData: textUpdateEventData)=>{
            this.modifybyID(updateEventData.messageID,updateEventData.newText)
        })

        this.socket.on('newMessageEvent', (newMessage: MessageData)=>{
            this.addNew(newMessage)
        })
    }

    componentDidUpdate(){
        let sortedMessages = this.state.Messages.sort((Message1: MessageData, Message2: MessageData)=> Message1.createdAt - Message2.createdAt)
        if(this.state.Messages != sortedMessages) this.setState({Messages: sortedMessages})
    }

    private modifybyID(messageID: string, text : string[]): MessageData|undefined{
        let newMessageData: MessageData | undefined
        let prevMessagesState : MessageData[] = this.state.Messages
        let newMessagesState: MessageData[] = prevMessagesState.map((MessageElement)=>{
            if(MessageElement.messageID == messageID){
                newMessageData = {
                    messageID,
                    text,
                    createdAt: MessageElement.createdAt,
                    editedAt: new Date().getTime(),
                    senderID: MessageElement.messageID,
                    senderIP: MessageElement.senderIP
                }
                return newMessageData
            }
            else{
                return MessageElement
            }
        })
        if(newMessagesState != prevMessagesState){
            this.setState({
                Messages : newMessagesState
            })
        } 
        return newMessageData
    }

    private addNew(newMessageData?: MessageData): MessageData | undefined {
        if(this.state.id && this.state.ip && this.state.connected && !this.haveSentEmptyMessage){
            let newMessage: MessageData
            if(newMessageData) {
                newMessage = newMessageData
            } 
            else {
                newMessage = {
                    text: [`User from ${this.state.ip} wants to say somehting`],
                    messageID: uuidv1(),
                    senderID: this.state.id,
                    senderIP: this.state.ip,
                    createdAt: new Date().getTime(),
                    editedAt: 0
                }
                this.haveSentEmptyMessage = true
                this.mostRecentMessageID = newMessage.messageID
            }
            this.setState({
                Messages: this.state.Messages.concat(newMessage)
            })
            return newMessage 
        }
        return undefined        
    }

    handleAddButtonClick(){
        let newMessageData = this.addNew()
        if(newMessageData) this.socket.emit('newMessageEvent', newMessageData)
        this.newText = true         
    }

    handleChange(messageID: string, newText: string[]){
        if(this.state.id && this.state.ip && this.state.connected){
            this.modifybyID(messageID, newText)
            let eventData: textEditEventData = {
                clientID: this.state.id,
                clientIP: this.state.ip,
                messageID,
                currentMessageArray: this.state.Messages,
                newText
            }
            if(messageID == this.mostRecentMessageID) this.haveSentEmptyMessage = false
            this.socket.emit('textEditEvent', eventData)
        }      
    }

    render(): ReactNode {
        const fontStyle: CSSProperties = { fontSize: '2rem', height: '4rem' }
        return (
            <div id="Texts" className="d-flex flex-column align-items-center w-100 py-4">
                {this.state.connected ? 
                    ([<div key="1" className="messageContents w-100 mx-auto d-flex flex-column align-items-center">
                        {this.state.Messages.map((Message, index) => {
                            return <MessageElement key={index} messageData={Message}
                             onTextChange={this.handleChange}></MessageElement>
                        })}
                    </div>,
                    <button key="2" type="button" onClick={this.handleAddButtonClick} className="btn btn-success rounded-2 w-25 mt-2 py-auto" style={fontStyle}>+</button>])
                    : (this.state.attemptingConnection ? (
                        <div className="alert alert-warning" role="alert">
                            <strong>Trying to connect to server</strong>
                        </div>
                        )
                        :
                        (
                            <div className="alert alert-danger" role="alert">
                            <strong>Cannot connect to server</strong>
                            </div>
                        )                        
                    )
                }
            </div>
        )
    } 
}