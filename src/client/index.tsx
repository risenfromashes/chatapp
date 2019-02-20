import $ from 'jquery'
import React, {
    ReactNode,
    Props,
    MouseEvent,
    ChangeEvent,
    FocusEvent,
    CSSProperties,
    KeyboardEvent,
    ClipboardEvent,
    FormEvent
} from 'react'
import ReactDOM from 'react-dom'
import MessageContainer from '../components/MessageContainer'

import io from 'socket.io-client'

const socket: SocketIOClient.Socket = io(window.location.origin)

let messageData: any

$.getJSON('/getMessages', (data: any) => {
    messageData = data
    ReactDOM.hydrate(
        <MessageContainer Socket={socket} Messages={messageData} />,
        document.getElementById('root')
    )
})

$(document).ready(() => {})
