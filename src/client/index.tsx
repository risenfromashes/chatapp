import React from 'react'
import ReactDOM from 'react-dom'
import MessageContainer from '../components/MessageComponents/MessageContainer'

import io from 'socket.io-client'
import { getMessageResponse } from '../server/app'

const socket: SocketIOClient.Socket = io(window.location.origin)

let messageData: any

fetch('/getMessages', {
    method: 'GET',
    mode: 'same-origin',
    credentials: 'include',
    redirect: 'follow'
})
    .then(res => {
        if (res.status === 401) window.location.assign('/login')
        else return res.json()
    })
    .then((response: getMessageResponse) => {
        ReactDOM.hydrate(
            <MessageContainer
                Socket={socket}
                Messages={response.messageData}
                UserID={response.userID}
                Username={response.username}
            />,
            document.getElementById('root')
        )
    })
    .catch(err => {
        console.log(err)
    })
