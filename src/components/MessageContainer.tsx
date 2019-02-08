
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, ReactNode, CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import uuidv1 from 'uuid/v1'
import MessageElement from '../components/MessageElement'
import {MessageContainerProp, MessageContainerState, MessageData, ConnectionState} from '../types/MessageTypes'

import io from 'socket.io-client'
import { Socket } from 'socket.io';
import { textUpdateEventData, textEditEventData } from '../types/EventDataTypes';

import getRandomColor from '../utils/colors'



export default class MessageContainer extends React.Component<MessageContainerProp, MessageContainerState>{
    
    private socket: SocketIOClient.Socket

    private newText: boolean = false
    private haveSentEmptyMessage: boolean = false
    private mostRecentMessageID: string | undefined
    private isFocused: boolean = false

    constructor(props: MessageContainerProp){
        super(props)        
        this.handleAddButtonClick = this.handleAddButtonClick.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleMessageFocus = this.handleMessageFocus.bind(this)
        this.handleMessageBlur = this.handleMessageBlur.bind(this)
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
                        messageID: Message.messageID,
                        color: Message.color
                    }
                }) : [],
            id: undefined,
            ip: undefined,
            connected: false,
            connectionNo: 0,
            attemptingConnection: true,
            myColor: getRandomColor(0)
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
                        ip: connectionState.ip,
                        connectionNo: connectionState.connectionNo,
                        myColor: getRandomColor(connectionState.connectionNo)
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


        $(document).on('keypress', (e: any)=>{
            if((e.which == 110 || e.which == 78)&& !this.isFocused){
                this.handleAddButtonClick()
                e.preventDefault()
            }
        })
    }

    componentDidUpdate(){
        let sortedMessages = this.state.Messages.sort((Message1: MessageData, Message2: MessageData)=> Message1.createdAt - Message2.createdAt)
        if(this.state.Messages != sortedMessages) this.setState({Messages: sortedMessages})

        if(this.newText){
            let docHeight = $('body').height()
            if(docHeight) $(document).scrollTop(docHeight + 200)
            this.newText = false
        }
    }

    private modifybyID(messageID: string, text : string[]): MessageData[]{
        let newMessageData: MessageData
        let prevMessagesState : MessageData[] = this.state.Messages
        let newMessagesState: MessageData[] = prevMessagesState.map((MessageElement)=>{
            if(MessageElement.messageID == messageID){
                newMessageData = {
                    messageID,
                    text,
                    createdAt: MessageElement.createdAt,
                    editedAt: new Date().getTime(),
                    senderID: MessageElement.senderID,
                    senderIP: MessageElement.senderIP,
                    color: MessageElement.color
                }
                return newMessageData
            }
            else{
                return MessageElement
            }
        })
        this.setState({
                Messages : newMessagesState
        }) 
        return newMessagesState
    }

    private addNew(newMessageData?: MessageData): MessageData | undefined {
        if(this.state.id && this.state.ip && this.state.connected && !this.haveSentEmptyMessage){
            let newMessage: MessageData
            if(newMessageData) {
                newMessage = newMessageData
            } 
            else {
                newMessage = {
                    text: [],
                    messageID: uuidv1(),
                    senderID: this.state.id,
                    senderIP: this.state.ip,
                    createdAt: new Date().getTime(),
                    editedAt: 0,
                    color: this.state.myColor
                }
                this.haveSentEmptyMessage = true
                this.mostRecentMessageID = newMessage.messageID
            }
            this.setState({
                Messages: this.state.Messages.concat(newMessage)
            })
            this.newText = true   
            return newMessage 
        }
        return undefined        
    }

    handleAddButtonClick(){
        let newMessageData = this.addNew()
        if(newMessageData) this.socket.emit('newMessageEvent', newMessageData)      
    }

    handleChange(messageID: string, newText: string[]){
        if(this.state.id && this.state.ip && this.state.connected){
            let eventData: textEditEventData = {
                clientID: this.state.id,
                clientIP: this.state.ip,
                messageID,
                currentMessageArray: this.modifybyID(messageID, newText),
                newText
            }
            if((messageID == this.mostRecentMessageID) && newText.length > 0) this.haveSentEmptyMessage = false
            this.socket.emit('textEditEvent', eventData)
        }      
    }

    handleMessageFocus(){
        this.isFocused = true
    }

    handleMessageBlur(){
        this.isFocused = false
    }

    render(): ReactNode {
        const fontStyle: CSSProperties = { fontSize: '2rem', height: '4rem' }
        return (
            <div id="Texts" className="d-flex flex-column align-items-center w-100 py-4 px-3">
                {this.state.connected ? 
                    ([<div key="1" className="messageContents w-100 mx-auto d-flex flex-column align-items-center mb-5">
                        {this.state.Messages.map((Message, index) => {
                            return <MessageElement key={index} messageData={Message} editable={(this.state.id==Message.senderID)}
                                onFocus={this.handleMessageFocus} onBlur={this.handleMessageBlur}
                                onTextChange={this.handleChange}></MessageElement>
                        })}
                    </div>,
                    <button key="2" type="button" onClick={this.handleAddButtonClick} className="btn btn-success rounded-2 w-25 mx-auto mb-2 py-2 fixed-bottom" style={fontStyle}>+</button>])
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