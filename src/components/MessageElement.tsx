
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, FocusEvent } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import TextParagraphs from '../components/TextParagraphs'
import {MessageElementProp, MessageElementState} from '../types/MessageTypes'

import color from 'color'
import MessageHeader from './MessageHeader';
import MessageEditor from './MessageEditor';

export default class MessageElement extends React.Component<MessageElementProp, MessageElementState>{
    
    private canFinishEdit = false
    private height: number | string = '"0.2vh"'
    private width: number | string = '"0.5vw"'

    private defaultText: string

    constructor(props: MessageElementProp){
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.toggleEditState = this.toggleEditState.bind(this)
        this.showEdit = this.showEdit.bind(this)
        this.hideEdit = this.hideEdit.bind(this)
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
        this.autoGrow = this.autoGrow.bind(this)
        this.defaultText = `User from ${this.props.messageData.senderIP} wants to say somehting`
        if(this.props.messageData.text && this.props.messageData.text.length > 0) 
            this.state = { text: this.props.messageData.text.join('\n'), toggleEdit: false}
        else this.state = { text: '', toggleEdit: (this.props.messageData.editedAt==0)?true:false}
    }

    componentDidMount(){
        //animation when created
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement) $(thisElement).hide().fadeIn()
    }

    componentDidUpdate(){
        //saves the width of the div, to set that width to the textarea when edited again
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement){
            let messageBoxWidth = $(thisElement).width()
            if(messageBoxWidth) this.width = messageBoxWidth
        }
    }

    handleChange(e: ChangeEvent | KeyboardEvent){
        let val = $(e.target).val()      
        if(val) {
            val = val.toString()
            //doesnt update on every change if showrealtime is false
            if(this.props.messageData.showRealTime) this.props.onTextChange(this.props.messageData.messageID, val.split('\n'))

            this.setState({text: val})                 

            val = val.trim()
            if(val.length != 0) this.canFinishEdit = true
            else this.canFinishEdit = false
        }        
        else {
            this.canFinishEdit = false
            this.setState({text: ''})
        }
    }
    
    handleFocus(){
        this.props.onFocus()       
    }

    handleBlur(){
        this.props.onBlur()    
    }

    toggleEditState(e: KeyboardEvent | MouseEvent | FormEvent){
        this.showEdit()
        this.hideEdit(e)        
    }

    showEdit(){
        if(!this.state.toggleEdit) this.setState({toggleEdit: true})
    }
    hideEdit(e: KeyboardEvent | MouseEvent | FormEvent) {
        e.preventDefault()
        if (this.canFinishEdit && this.state.toggleEdit) {
            this.props.onTextChange(this.props.messageData.messageID, this.state.text.split('\n'))
            this.setState({toggleEdit: false})
        }
    }

    autoGrow(e : KeyboardEvent | ClipboardEvent) {
        let textElement = $(e.target)
        let innerHeight = textElement.innerHeight(),
            height = textElement.height(),
            scrollTop = textElement.scrollTop()

        //changes the height of the textarea to its innerheight until maximum height is reached
        if (height && innerHeight && scrollTop) {
            if (height < innerHeight) {
                if(height < 500) {
                    this.height = innerHeight + 20
                    textElement.height(this.height)
                } else {
                    this.height = 500
                    textElement.css('overflowY','auto')
                }
            }
        }
    }
    
    handleSubmit(e: KeyboardEvent){
        if(e.which == 13 && !e.shiftKey) {
            this.hideEdit(e)
            this.handleBlur() 
        }
    }

    //slide updown animation for the edit button/hyperlink
    handleMouseEnter(e: MouseEvent){
        if(this.props.editable && !this.state.toggleEdit) $(e.target).children('.edit-button').slideDown('slow')
    }
    handleMouseLeave(e: MouseEvent){
        if(this.props.editable && !this.state.toggleEdit) $(e.target).children('.edit-button').slideUp('slow')
    }

    render() {
        let toggleEdit = this.state.toggleEdit
        let darkColor = color(this.props.messageData.color).darken(0.5).hex().toString()
        let timeString = new Date(this.props.messageData.createdAt).toLocaleTimeString()
        return (
            <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} onClick={this.showEdit}
                className="border border-dark rounded my-2 px-3 py-2 text-white w-auto text-justify messageBox"
                style={{ backgroundColor: this.props.messageData.color, maxWidth: '75%', marginLeft: (this.props.editable) ? 'auto' : '', marginRight: (this.props.editable) ? '' : 'auto', 
                        fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.8rem'}}>
                        
                {(toggleEdit && this.props.editable) ? (                
                    <MessageEditor text={this.state.text} height={this.height} width={this.width} bgcolor={darkColor} 
                        onFinishEditClick={this.toggleEditState} onFocus={this.handleFocus} onBlur={this.handleBlur} onChange={this.handleChange}
                        onKeyPress={this.handleSubmit} onSubmit={this.hideEdit} onTextChange={this.autoGrow}
                    ></MessageEditor>
                ) : (
                        [
                            <MessageHeader key="1" color={darkColor}
                            time={timeString} sender={this.props.messageData.senderIP}
                            ></MessageHeader>,
                            <hr key="2"/>,
                            <TextParagraphs key="3" texts={
                                (this.props.messageData.text && this.props.messageData.text.length > 0) ? this.props.messageData.text : [this.defaultText]
                            } />,
                            <p key="4" className="text-right edit-button"
                                style={{ marginBottom: '0rem', display: 'none' }}>
                                <a href="" onClick={this.toggleEditState} >Edit</a>
                            </p>
                        ]
                    )
                }
            </div>
        )
    }
}