
import $ from 'jquery'
import React, { ReactNode, Props, MouseEvent, ChangeEvent, FocusEvent, CSSProperties, KeyboardEvent, ClipboardEvent, FormEvent } from 'react'
import ReactDOM from 'react-dom'

import MessageContainer from './Components/MessageContainer'

import io from 'socket.io-client'

const socket = io(window.location.origin)


ReactDOM.render(
    <MessageContainer Messages= {[]}/>,
    document.getElementById('root')
)

$(document).ready(()=>{
})

