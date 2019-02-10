
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, FocusEvent } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import TextParagraphs from '../components/TextParagraphs'
import {MessageElementProp, MessageElementState} from '../types/MessageTypes'
import color from 'color'

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
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement) $(thisElement).hide().fadeIn()
    }

    componentDidUpdate(){
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

    handleMouseEnter(e: MouseEvent){
        if(this.props.editable && !this.state.toggleEdit) $(e.target).children('.edit-button').slideDown('slow')
    }
    handleMouseLeave(e: MouseEvent){
        if(this.props.editable && !this.state.toggleEdit) $(e.target).children('.edit-button').slideUp('slow')
    }

    render() {
        let toggleEdit = this.state.toggleEdit
        return (
            <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} onClick={this.showEdit}
                className="border border-dark rounded my-2 px-3 py-2 text-white w-auto text-justify messageBox"
                style={{ backgroundColor: this.props.messageData.color, maxWidth: '75%', marginLeft: (this.props.editable) ? 'auto' : '', marginRight: (this.props.editable) ? '' : 'auto', 
                        fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.8rem'}}>
                
                {(toggleEdit && this.props.editable) ? (
                    [
                        <textarea key="1" onChange={this.handleChange} placeholder="Say Something, its free :)" autoFocus={true} onFocus={this.handleFocus} onBlur={this.handleBlur}
                            style={{ fontSize: '0.8rem', height: this.height, width: this.width, minWidth: '20vw', overflowY: 'hidden', backgroundColor: color(this.props.messageData.color).darken(0.5).hex().toString() }}
                            onKeyUp={this.autoGrow} onPaste={this.autoGrow} onSubmit={this.hideEdit} onKeyPress={this.handleSubmit}
                            className="form-control text-white text-justify messageInput" value={this.state.text}></textarea>,
                        <p key="2" className="text-right" style={{ marginBottom: '0rem' }}><a href="" onClick={this.toggleEditState}>Finish Edit</a></p>
                    ]
                ) : (
                        [
                            <div key="1" style={{color: color(this.props.messageData.color).darken(0.5).hex().toString(), fontSize: '0.75rem', height: '0.8rem'}}
                                className="d-flex flex-row">
                                <p className="text-left w-auto mr-auto">From: <b className="text-primary">{this.props.messageData.senderIP}</b></p>
                                <p className="text-right w-auto ml-auto">At: <b className="text-info">{new Date(this.props.messageData.createdAt).toLocaleTimeString()}</b></p>
                            </div>,
                            <hr key="2"></hr>,
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