
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, ReactNode, CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import MessageElement from './MessageElement'

import io from 'socket.io-client'

const socket = io(window.location.origin)



interface MessageData{
    key: number,
    text: string[]
}

interface MessageContainerProp{
    MessageTexts: string[][]    
}
interface MessageContainerState{
    Messages: MessageData[],
    id: string | undefined,
    ip: string | undefined,
    connected: boolean,
    attemptingConnection: boolean
}

export default class MessageContainer extends React.Component<MessageContainerProp, MessageContainerState>{
    private count: number
    private newText: boolean = false
    constructor(props: MessageContainerProp){
        super(props)        
        this.handleAddButtonClick = this.handleAddButtonClick.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.count = this.props.MessageTexts.length
        this.state = {
            Messages : this.props.MessageTexts.map((text,index) =>{
                return {key: index, text}
            }),
            connected: false,
            id: undefined,
            ip: undefined,
            attemptingConnection: true
        }

        socket.on('connect',()=>{}).on('connection', (ip: string)=>{
            this.setState({connected: true, id: socket.id, ip})
        })

        socket.on('reconnecting', (attemptNumber: number) => {
            this.setState({connected: false, attemptingConnection: true})
          });
        socket.on('reconnect_error', (error: any) => {
            this.setState({connected: false, attemptingConnection: false})
        })
        socket.on('reconnect_failed', () => {
            this.setState({connected: false, attemptingConnection: false})
        });       
    }
    componentDidMount(){
        socket.on('newMessage', (count: number)=>{
            this.addNew()
        })
        socket.on('textEdit', (newText: MessageData) =>{
            console.log(newText)
            this.updateState(newText.key, newText.text)
        })
    }
    addNew(){        
        this.setState({
            Messages: this.state.Messages.concat({key: this.count++, text: ['Say something! It costs you just a second!']})
        })
    }
    handleAddButtonClick(){
        this.addNew()
        socket.emit('newMessage', this.state)
        this.newText = true         
    }

    handleChange(key: number, newText: string[]){
        this.updateState(key, newText)
        socket.emit('newText', {key, text: newText})
    }

    private updateState(key: number, text : string[]){
        let prevMessagesState : MessageData[] = this.state.Messages
        let newMessagesState: MessageData[] = prevMessagesState.map((MessageElement, index)=>{
            if(index === key){
                return  {key , text}
            }
            else return MessageElement
        })
        this.setState({
            Messages : newMessagesState
        })
    }   

    render(): ReactNode {
        const fontStyle: CSSProperties = { fontSize: '2rem', height: '4rem' }
        return (
            <div id="Texts" className="d-flex flex-column align-items-center w-100 py-4">
                {this.state.connected ? 
                    ([<div key="1" className="messageContents w-100 mx-auto d-flex flex-column align-items-center">
                        {this.state.Messages.map((Message) => {
                            return <MessageElement key={Message.key} index={Message.key} text={Message.text} onTextChange={this.handleChange}></MessageElement>
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