import express, { Request, Response } from 'express'
import path from 'path'
import socketIO, { Socket } from 'socket.io'
import {
    MessageData,
    MessageContainerState,
    ConnectionState
} from '../types/MessageTypes'
import {
    textEditEventData,
    textUpdateEventData,
    colorChangeEventData,
    newImageEventData
} from '../types/EventDataTypes'
import { stat } from 'fs'
import uuidv1 from 'uuid/v1'
import multer from 'multer'
import rendertostring from './ssr'
import { EVENTS } from '../types/Event'
import './config/config'

export const app = express()
const server = app.listen(process.env.PORT || 80, () => {
    console.log('Connected to port 80')
})

const io = socketIO.listen(server)

const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve(__dirname, '../public/image_uploads'))
    },
    filename: (req: Request, file, callback) => {
        let fileName = uuidv1() + '-' + file.originalname
        req.imgSrcPath = '../image_uploads/' + fileName
        callback(null, fileName)
    }
})

const imageUpload = multer({ storage: diskStorage })
const imageUploadMiddleWare = imageUpload.fields([
    { name: 'image', maxCount: 1 }
])

//keeps all the messages from server startup
let messageData: MessageData[] = []
let connectedClientCount: number = 0

io.on('connection', (socket: Socket) => {
    let connectionState: ConnectionState = {
        ip: socket.handshake.address,
        Messages: messageData,
        connectionNo: ++connectedClientCount
    }

    console.log('client connected', socket.id, socket.handshake.address)

    socket.emit('connection', connectionState)

    socket.on(EVENTS.TEXT_EDIT, (eventData: textEditEventData) => {
        messageData = eventData.currentMessageArray

        let updateEventData: textUpdateEventData = {
            clientID: eventData.clientID,
            clientIP: eventData.clientIP,
            newText: eventData.newText,
            messageID: eventData.messageID
        }

        socket.broadcast.emit(EVENTS.TEXT_UPDATE, updateEventData)
    })

    socket.on(EVENTS.NEW_MESSAGE, (eventData: MessageData) => {
        if (eventData) {
            messageData.push(eventData)
            socket.broadcast.emit(EVENTS.NEW_MESSAGE, eventData)
        }
    })

    socket.on(EVENTS.COLOR_CHANGE, (eventData: colorChangeEventData) => {
        messageData = eventData.currentMessageArray
        socket.broadcast.emit(EVENTS.COLOR_CHANGE, eventData)
    })

    socket.on(EVENTS.IMAGE_CHANGE, (eventData: newImageEventData) => {
        messageData = eventData.currentMessageArray
        socket.broadcast.emit(EVENTS.IMAGE_CHANGE, eventData)
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
 *  newImageEvent: emitted by a client | clientid, messageid and imagedata is provided
 *  newImageEvent: broadcasted by the server| same data is sended back
 *
 */

app.use(express.static(path.join(__dirname, '../public/')))

app.get(
    '/',
    (request: Request, response: Response): void => {
        rendertostring(messageData)
            .then((renderedHTML: string) => {
                response.status(200).send(renderedHTML)
            })
            .catch((err: any) => {
                console.log(err)
            })
    }
)

//* this are essential routes used for user entry
app.get('/login')
app.post('/login')

app.get('/getMessages', (request: Request, response: Response) => {
    response.json(messageData)
})

app.post(
    '/upload',
    imageUploadMiddleWare,
    (request: Request, response: Response) => {
        response.json({
            status: 'success',
            imagePath: request.imgSrcPath
        })
    }
)
