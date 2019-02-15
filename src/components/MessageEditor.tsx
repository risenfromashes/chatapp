import React from 'react'
import { MessageEditorProp } from '../types/MessageTypes';
import { EditableText } from '@blueprintjs/core';

const MessageEditor = (props: MessageEditorProp) => {
    return (
        <div className="d-block" style={{width: props.width, height:"auto"}}>
            <EditableText
                className="d-block"
                placeholder="Say something, its free :D"
                multiline={true}
                minLines={3}
                maxLines= {Infinity}
                isEditing={true}
                intent="none"
                value={props.text}
                confirmOnEnterKey={true}
                {...props.handlers}
            ></EditableText>
            <p className="text-right mb-0 mt-2" ><a href="" onClick={props.onFinishEditClick}>Finish Edit</a></p>
        </div>
    )
}

export default MessageEditor

