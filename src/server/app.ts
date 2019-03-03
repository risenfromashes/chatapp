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
import bodyParser from 'body-parser'
import { renderMessageContainer, renderLoginScreen } from './ssr'
import { EVENTS } from '../types/Event'
import './config/config'
import { request } from 'https'

export const app = express()
const server = app.listen(process.env.PORT || 80, () => {
    console.log('Connected to port 80')
})

app.use(bodyParser.json())
//error handler
app.use(
    (
        error: Error,
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        console.log(error)
        response.redirect('/login')
    }
)

import {
    socketMiddleware,
    authenticate,
    authenticateNotRedirect,
    setCookieAndRespond,
    authenticateAndRespondStatus
} from './middleware/authenticate'
import { User, IUser, IUserDoc } from './db/models/user'
import { isObject } from 'util'
import { NextFunction } from 'connect'

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

io.use(require('socket.io-cookie-parser')(process.env.SECRET))
io.use(socketMiddleware)

io.on('connection', (socket: Socket) => {
    let connectionState: ConnectionState = {
        Messages: messageData
    }

    console.log('client connected', socket.id, socket.handshake.address)

    socket.emit('connection', connectionState)

    socket.on(EVENTS.TEXT_EDIT, (eventData: textEditEventData) => {
        messageData = eventData.currentMessageArray

        let updateEventData: textUpdateEventData = {
            clientID: eventData.clientID,
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
    authenticate,
    (request: Request, response: Response): void => {
        if (request.userId && request.username) {
            renderMessageContainer(
                request.userId,
                request.username,
                messageData
            )
                .then((renderedHTML: string) => {
                    response.status(200).send(renderedHTML)
                })
                .catch((err: any) => {
                    console.log(err)
                    response.redirect('/login')
                })
        } else response.redirect('/login')
    }
)

//* this are essential routes used for user entry
app.get(
    '/login',
    authenticateNotRedirect,
    (request: Request, response: Response) => {
        renderLoginScreen()
            .then((renderedHTML: string) => {
                response.send(renderedHTML)
            })
            .catch((err: any) => {
                console.log(err)
            })
    }
)
app.post('/login', (request: Request, response: Response) => {
    const { username, password } = request.body
    if (username && password) {
        User.getUserByCredentials(username, password)
            .then(user => {
                if (!user) return Promise.reject()
                else {
                    return user
                        .getAuthToken()
                        .then(token => {
                            setCookieAndRespond(response, token)
                        })
                        .catch(err => {
                            return Promise.reject()
                        })
                }
            })
            .catch(() => response.sendStatus(400))
    } else response.sendStatus(400)
})

app.post('/register', (request: Request, response: Response) => {
    const { username, password } = request.body
    if (username && password) {
        const userDoc: IUserDoc = {
            Username: username,
            Password: password
        }
        const user = new User(userDoc)
        user.registerUser()
            .then(user => {
                if (!user) return Promise.reject()
                else {
                    console.log('made user')
                    return user
                        .getAuthToken()
                        .then(token => {
                            setCookieAndRespond(response, token)
                        })
                        .catch(err => {
                            console.log(err)
                            return Promise.reject()
                        })
                }
            })
            .catch(() => response.sendStatus(400))
    } else response.sendStatus(400)
})

export interface getMessageResponse {
    messageData: MessageData[]
    userID: string
    username: string
}
app.get(
    '/getMessages',
    authenticateAndRespondStatus,
    (request: Request, response: Response) => {
        if (request.userId && request.username) {
            const responseData: getMessageResponse = {
                messageData,
                userID: request.userId,
                username: request.username
            }
            response.status(200).json(responseData)
        } else response.sendStatus(401)
    }
)

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
