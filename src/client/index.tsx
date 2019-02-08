
import $ from 'jquery'
import React, { ReactNode, Props, MouseEvent, ChangeEvent, FocusEvent, CSSProperties, KeyboardEvent, ClipboardEvent, FormEvent } from 'react'
import ReactDOM from 'react-dom'
import MessageContainer from '../components/MessageContainer'
import bootstrap from 'react-bootstrap/'

import io from 'socket.io-client'

const socket: SocketIOClient.Socket = io(window.location.origin)


ReactDOM.render(
    <MessageContainer Socket={socket} Messages= {[]}/>,
    document.getElementById('root')
)

$(document).ready(()=>{
})

