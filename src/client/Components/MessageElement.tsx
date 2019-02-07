
import React, { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent, MouseEvent } from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import TextParagraphs from './TextParagraphs'
import {MessageData} from './MessageContainer'

interface MessageElementProp{
    messageDate: MessageData,
    onTextChange: (messageID: string, text: string[]) => void
}
interface MessageElementState{
    text : string,
    toggleEdit: boolean
}

export default class MessageElement extends React.Component<MessageElementProp, MessageElementState>{
    
    private canFinishEdit = true
    private height: number = 50


    constructor(props: MessageElementProp){
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.toggleEditState = this.toggleEditState.bind(this)
        this.showEdit = this.showEdit.bind(this)
        this.hideEdit = this.hideEdit.bind(this)
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.autoGrow = this.autoGrow.bind(this)

        if(this.props.messageDate.text && this.props.messageDate.text.length != 0) 
            this.state = { text: this.props.messageDate.text.join('\n'), toggleEdit: false}
        else this.state = { text: '', toggleEdit: false}
    }

    componentDidMount(){
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement) $(thisElement).hide().fadeIn()
    }

    handleChange(e: ChangeEvent | KeyboardEvent){
        let val = $(e.target).val()      
        if(val) {
            val = val.toString()
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
            this.props.onTextChange(this.props.messageDate.messageID, this.state.text.split('\n'))
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
                if(height < 300) {
                    this.height = innerHeight + 20
                    textElement.height(this.height)
                } else {
                    this.height = 300
                    textElement.css('overflowY','auto')
                }
            }
        }
    }
    
    handleSubmit(e: KeyboardEvent){
        if(e.which == 13 && !e.shiftKey) {
            this.hideEdit(e) 
        }
    }

    handleMouseEnter(e: MouseEvent){
        $(e.target).children('.edit-button').slideDown('slow')
    }
    handleMouseLeave(e: MouseEvent){
        $(e.target).children('.edit-button').slideUp('slow')
    }

    render() {
        let toggleEdit = this.state.toggleEdit
        return (<div onMouseEnter ={this.handleMouseEnter} onMouseLeave = {this.handleMouseLeave} onClick={this.showEdit}
            className="border border-dark rounded my-2 px-3 py-3 text-white bg-secondary w-50 text-justify">            
            {toggleEdit ? (
                [<textarea  key="1" onChange={this.handleChange} placeholder="Say Something" style= {{height: this.height, overflowY:'hidden'}} 
                    onKeyUp = {this.autoGrow} onPaste = {this.autoGrow} onSubmit={this.hideEdit} onKeyPress={this.handleSubmit}
                 className="form-control bg-dark text-white" value={this.state.text}></textarea>,
            <p key="2" className="text-right" style={{marginBottom : '0rem'}}><a href="" onClick={this.toggleEditState}>Finish Edit</a></p>]
            ) : ( 
                    [<TextParagraphs key="1" texts={this.props.messageDate.text}/>,
                    <p key="2" className="text-right edit-button"
                     style={{marginBottom : '0rem', display: 'none'}}>
                     <a href="" onClick={this.toggleEditState} >Edit</a></p>]
                )
            }
        </div>)
    }
}