
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent, FocusEvent } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import TextParagraphs from '../components/TextParagraphs'
import {MessageElementProp, MessageElementState} from '../types/MessageTypes'

import color from 'color'
import MessageHeader from './MessageHeader';
import MessageEditor from './MessageEditor';
import { Card, Tooltip, Intent } from '@blueprintjs/core';

export default class MessageElement extends React.Component<MessageElementProp, MessageElementState>{
    
    private canFinishEdit = false
    private width: number | string = '50vw'

    private defaultText: string

    constructor(props: MessageElementProp){
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.showEdit = this.showEdit.bind(this)
        this.hideEdit = this.hideEdit.bind(this)
        this.defaultText = `User from ${this.props.messageData.senderIP} wants to say somehting`
        if(this.props.messageData.text && this.props.messageData.text.length > 0) 
            this.state = { text: this.props.messageData.text.join('\n'), toggleEdit: false}
        else this.state = { text: '', toggleEdit: (this.props.messageData.editedAt==0)?true:false}
    }

    componentDidMount(){
        //animation when created
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement) $(thisElement).hide().fadeIn()
        //showedit doesnt call this for the first time
        if(this.props.messageData.editedAt==0 && this.props.editable) this.props.onFocus()
    }


    handleChange(val: string){      
        if(val) {
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

    showEdit() {
        if (this.props.editable && !this.state.toggleEdit && (this.props.messageData.editedAt != 0)) {
            let thisElement = ReactDOM.findDOMNode(this)
            if (thisElement) {
                let messageBoxWidth = $(thisElement).width()
                if (messageBoxWidth) this.width = messageBoxWidth
            }
            if(this.props.editable) this.props.onFocus()
            this.setState({ toggleEdit: true })
        }
    }

    hideEdit() {
        if (this.props.editable && this.canFinishEdit && this.state.toggleEdit) {
            if(!this.props.messageData.showRealTime && (this.props.messageData.editedAt == 0)) this.props.onSend(this.props.messageData)
            this.props.onTextChange(this.props.messageData.messageID, this.state.text.split('\n'))
            if(this.props.editable) this.props.onBlur()
            this.setState({toggleEdit: false})
        }
    }


    render() {
        let toggleEdit = this.state.toggleEdit
        let darkColor = color(this.props.messageData.color).darken(0.5).hex().toString()
        let timeString = new Date(this.props.messageData.createdAt).toLocaleTimeString()
        return (
            <Card 
                onClick={this.showEdit}
                interactive={true}
                className="text-white text-justify"
                style={{ 
                    backgroundColor: this.props.messageData.color, 
                    maxWidth: '75%', 
                    marginLeft: (this.props.editable) ? 'auto' : '', marginRight: (this.props.editable) ? '' : 'auto',
                    marginTop: '1rem',
                    marginBottom: '0px',                        
                    fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.9rem'}}
                >
                
                <MessageHeader
                    color={darkColor}
                    time={timeString}
                    sender={this.props.messageData.senderIP}
                />

                {(toggleEdit && this.props.editable) ? (                
                    <MessageEditor 
                        id={this.props.messageData.messageID}
                        text={this.state.text}
                        width={this.width} 
                        onFinishEditClick={this.hideEdit} 
                        handlers={{
                            onCancel: this.hideEdit,
                            onChange: this.handleChange,
                            onEdit: this.handleChange,
                            onConfirm: this.hideEdit
                        }}
                    />
                ) : (
                        <Tooltip
                            disabled={!this.props.editable} 
                            content={<span>Click to <b>Edit</b></span>}
                            intent={Intent.PRIMARY}
                            hoverOpenDelay={1000}
                            hoverCloseDelay={200}
                            position="left"
                        >
                            <div>
                                <TextParagraphs
                                    isEditable={this.props.editable} 
                                    texts={
                                        (this.props.messageData.text && this.props.messageData.text.length > 0) ? this.props.messageData.text : [this.defaultText]} 
                                />
                            </div>
                        </Tooltip>
                    )
                }
            </Card>
        )
    }
}