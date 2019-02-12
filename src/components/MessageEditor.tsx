import React from 'react'
import { render } from 'react-dom';
import { MessageHeaderProp, MessageEditorProp } from '../types/MessageTypes';

const MessageEditor = (props: MessageEditorProp) => {
    return (
        <div>
            <textarea key="1" onChange={props.onChange} placeholder="Say Something, its free :)" autoFocus={true} onFocus={props.onFocus} onBlur={props.onBlur}
                style={{
                    fontSize: '0.8rem', height: props.height, width: props.width,
                    minWidth: '20vw', overflowY: 'hidden', backgroundColor: props.bgcolor
                }}
                onKeyUp={props.onTextChange} onPaste={props.onTextChange} onSubmit={props.onSubmit} onKeyPress={props.onKeyPress}
                className="form-control text-white text-justify messageInput" value={props.text}></textarea>
            <p key="2" className="text-right" style={{ marginBottom: '0rem' }}><a href="" onClick={props.onFinishEditClick}>Finish Edit</a></p>
        </div>
    )
}

export default MessageEditor