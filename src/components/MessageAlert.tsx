
import React from 'react'
import { MessageAlertProp } from '../types/MessageTypes';

const MessageAlert = (props: MessageAlertProp) => {

    switch (props.alertType) {
        case 'newMessage':
            return (
                <div className="alert alert-info fixed-top text-center" role="alert">
                    <strong>New Messages. Scroll down to see them.</strong>
                </div>
            )
        case 'tryingToConnect':
            return (
                <div className="alert alert-warning fixed-top text-center" role="alert">
                    <strong>Trying to connect to server</strong>
                </div>
            )
        case 'cannotConnect':
            return (
                <div className="alert alert-danger fixed-top text-center" role="alert">
                    <strong>Cannot connect to server</strong>
                </div>
            )
    }
}

export default MessageAlert