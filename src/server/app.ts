import express, { Request, Response } from 'express'
import path from 'path'
import socketIO, { Socket }  from 'socket.io'
import {MessageData, MessageContainerState, ConnectionState} from '../types/MessageTypes'
import {textEditEventData, textUpdateEventData, colorChangeEventData} from '../types/EventDataTypes'
import { stat } from 'fs';

import rendertostring from './ssr'

const app = express()
const server = app.listen(process.env.PORT || 80, () => {
    console.log('Connected to port 80')
})

const io = socketIO.listen(server)


//keeps all the messages from server startup
let messageData: MessageData[] = []
let connectedClientCount: number = 0

io.on('connection', (socket: Socket) =>{
    
    let connectionState: ConnectionState = {
        ip: socket.handshake.address,
        Messages: messageData,
        connectionNo: ++connectedClientCount
    }

    console.log('client connected', socket.id, socket.handshake.address)

    socket.emit('connection', connectionState)

    socket.on('textEditEvent', (eventData: textEditEventData)=>{
        
        messageData = eventData.currentMessageArray

        let updateEventData: textUpdateEventData = {
            clientID: eventData.clientID,
            clientIP: eventData.clientIP,
            newText: eventData.newText,
            messageID: eventData.messageID
        }

        socket.broadcast.emit('textUpdateEvent', updateEventData)
    })

    socket.on('newMessageEvent', (eventData: MessageData)=>{
        if(eventData) {
            messageData.push(eventData)
            socket.broadcast.emit('newMessageEvent', eventData)
        }
    })

    socket.on('colorChangeEvent', (eventData: colorChangeEventData)=>{
        messageData = eventData.currentMessageArray
        socket.broadcast.emit('colorChangeEvent', eventData)
    })

})

/**
 * events:
 *  textEditEvent: emitted by a client | clientid,ip, messageID and newText is sent => textEditEventData
 *  textUpdateEvent: broadcasted by the server | messageID, newText is sent => textUpdateEventData
 * 
 *  newMessageEvent: emitted by a client | clientid,ip and text is sent as MessageData =>  MessageData
 *  newMessageEvent: broadcasted by the server | clientid,ip,messageID, newText is sent as MessageData => MessageData
 * 
 */

app.use(express.static(path.join(__dirname,'../public/')))

app.get('/',(request: Request, response: Response):void=>{
    rendertostring(messageData).then((renderedHTML: string)=>{
        response.status(200).send(renderedHTML)
    }).catch(err=>{
        console.log(err)
    })
})

app.get('/getMessages',(request: Request, response: Response)=>{
    response.json(messageData)
})