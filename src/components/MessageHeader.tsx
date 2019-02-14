import React from 'react'
import { MessageHeaderProp } from '../types/MessageTypes';
import {Icon, Divider} from '@blueprintjs/core'

const MessageHeader = (props: MessageHeaderProp) => {
    return (
        <div className="d-flex flex-wrap align-content-center mb-3">
            <Icon icon="user" iconSize={25} tagName="div"/>
            <div className="mx-2 my-auto">{props.sender}</div>
            <Divider/>
            <div 
                className="mx-2 my-auto"
                style={{fontFamily:'arial', fontSize: '0.75rem'}}>
                {props.time}
            </div>
        </div>        
    )
}

export default MessageHeader

{/* <span className="text-left w-auto mr-auto">From: <b className="text-primary">{props.sender}</b></span>
            <span className="text-right w-auto ml-auto">At: <b className="text-info">{props.time}</b></span> */}