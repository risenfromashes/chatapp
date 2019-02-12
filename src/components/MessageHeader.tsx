import React from 'react'
import { MessageHeaderProp } from '../types/MessageTypes';


const MessageHeader = (props: MessageHeaderProp) => {
    return (
        <div style={{ color: props.color, fontSize: '0.75rem', height: '0.8rem' }}
            className="d-flex flex-row">
            <p className="text-left w-auto mr-auto">From: <b className="text-primary">{props.sender}</b></p>
            <p className="text-right w-auto ml-auto">At: <b className="text-info">{props.time}</b></p> 
        </div>
    )
}

export default MessageHeader
