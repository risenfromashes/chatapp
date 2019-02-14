import React from 'react'
import { MessageHeaderProp } from '../types/MessageTypes';
import {Icon, Divider} from '@blueprintjs/core'

const MessageHeader = (props: MessageHeaderProp) => {
    return (
        <div
            style={{ color: props.color, fontSize: '0.8rem' }}
            className="d-flex flex-row py-2">
                <Icon icon="user"/>
                <span><b>{props.sender}</b></span>
                <Divider/>
                <Icon icon="time"/>
                <span>{props.time}</span>        
            <hr/> 
        </div>
    )
}

export default MessageHeader

{/* <span className="text-left w-auto mr-auto">From: <b className="text-primary">{props.sender}</b></span>
            <span className="text-right w-auto ml-auto">At: <b className="text-info">{props.time}</b></span> */}