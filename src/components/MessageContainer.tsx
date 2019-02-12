
import React, { ReactNode, CSSProperties } from 'react'
import $ from 'jquery'
import uuidv1 from 'uuid/v1'
import MessageElement from '../components/MessageElement'
import {MessageContainerProp, MessageContainerState, MessageData, ConnectionState} from '../types/MessageTypes'

import { textUpdateEventData, textEditEventData } from '../types/EventDataTypes';

import getRandomColor from '../utils/colors'



export default class MessageContainer extends React.Component<MessageContainerProp, MessageContainerState>{
    
    private socket: SocketIOClient.Socket | undefined

    private myNewText: boolean = false
    private haveSentEmptyMessage: boolean = false
    private mostRecentMessageID: string | undefined

    private showRealTime: boolean = true
    private buttonPressCount: number = 0
    private buttonTimer: any
    

    constructor(props: MessageContainerProp){
        super(props)        
        this.handleAddButtonClick = this.handleAddButtonClick.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleMessageFocus = this.handleMessageFocus.bind(this)
        this.handleMessageBlur = this.handleMessageBlur.bind(this)
        this.socket = this.props.Socket || undefined
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
                        color: Message.color,
                        showRealTime: Message.showRealTime
                    }
                }) : [],
            id: undefined,
            ip: undefined,
            connected: false,
            connectionNo: 0,
            attemptingConnection: true,
            myColor: getRandomColor(0),
            isFocused: false,
            newText: false
        }       
    }

    componentDidMount(){       

        if(this.socket) {
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
                            id: (this.socket)? this.socket.id : undefined,
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
                            id: (this.socket)? this.socket.id : undefined,
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
                if((e.which == 32)&& !this.state.isFocused){
                    this.handleAddButtonClick()
                    e.preventDefault()
                }
            })
        }
    }

    componentDidUpdate(){
        let sortedMessages = this.state.Messages.sort((Message1: MessageData, Message2: MessageData)=> Message1.createdAt - Message2.createdAt)
        if(this.state.Messages != sortedMessages) this.setState({Messages: sortedMessages})

        if(this.myNewText){
            let docHeight = $('body').height()
            if(docHeight) $(document).scrollTop(docHeight + 200)
            this.myNewText = false
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
                    color: MessageElement.color,
                    showRealTime: MessageElement.showRealTime
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
                    color: this.state.myColor,
                    showRealTime: this.showRealTime
                }
                this.haveSentEmptyMessage = true
                this.mostRecentMessageID = newMessage.messageID
            }
            this.setState({
                Messages: this.state.Messages.concat(newMessage)
            })

            if(newMessage.senderID == this.state.id) this.myNewText = true

            let docHeight = $(document).innerHeight()
            if(window && docHeight){
                console.log(window.pageYOffset, docHeight, window.innerHeight)
                if(!this.myNewText && (window.pageYOffset < ((docHeight-window.innerHeight)-200))){
                    this.setState({newText: true})
        
                    setTimeout(()=>{
                        this.setState({newText: false})
                    },2000) 
                }
            } 

            return newMessage 
        }
        return undefined        
    }

    handleAddButtonClick(){
        this.buttonPressCount++
        if(this.buttonPressCount == 1){
            this.buttonTimer = setTimeout(()=>{
                this.showRealTime = true
                this.buttonPressCount = 0
                let newMessageData = this.addNew()
                if(newMessageData && this.socket) this.socket.emit('newMessageEvent', newMessageData) 
            },200)
        }
        else{
            clearTimeout(this.buttonTimer)
            this.showRealTime = false
            this.buttonPressCount = 0
            let newMessageData = this.addNew()
            if(newMessageData && this.socket) this.socket.emit('newMessageEvent', newMessageData)
        }     
    }

    handleChange(messageID: string, newText: string[]){
        if(this.state.id && this.state.ip && this.state.connected && this.socket){
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
        this.setState({isFocused: true})
    }

    handleMessageBlur(){
        this.setState({isFocused: false})
    }

    render(): ReactNode {
        const fontStyle: CSSProperties = { fontSize: '2rem', height: '4rem' }
        return (
            <div id="Texts" className="d-flex flex-column align-items-center w-100 py-4 px-3">
                    {this.state.connected || (this.state.attemptingConnection ? (
                            <div className="alert alert-warning fixed-top text-center" role="alert">
                                <strong>Trying to connect to server</strong>
                            </div>
                        )
                        :
                        (
                            <div className="alert alert-danger fixed-top text-center" role="alert">
                            <strong>Cannot connect to server</strong>
                            </div>
                        )                        
                    )}
                    {this.state.newText && 
                        <div className="alert alert-info fixed-top text-center" role="alert">
                            <strong>New Messages. Scroll down to see them.</strong>
                        </div>
                    }
                    <div key="1" className="messageContents w-100 mx-auto d-flex flex-column align-items-center mb-5">
                        {this.state.Messages.map((Message, index) => {
                            return <MessageElement key={index} messageData={Message} editable={(this.state.id==Message.senderID)}
                                onFocus={this.handleMessageFocus} onBlur={this.handleMessageBlur}
                                onTextChange={this.handleChange}></MessageElement>
                        })}
                    </div>
                    {this.state.isFocused || !this.state.connected || <button key="2" type="button" onClick={this.handleAddButtonClick} 
                    className="btn btn-success rounded-circle mx-auto mb-2 fixed-bottom d-flex justify-content-center align-content-center py-0" 
                    style={{fontSize: '3rem', height: '5rem', width: '5rem'}}><b>&#xff0b;</b></button>}
            </div>
        )
    } 
}