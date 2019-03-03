import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { Request, NextFunction, Response, response } from 'express'
import { app } from '../app'
import { AuthTokenPayload, User } from '../db/models/user'
import { EVENTS } from '../../types/Event'

app.use(cookieParser(process.env.SECRET))

export const authenticate = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    let token: string = request.signedCookies.accessToken
    if (token) {
        User.getUserByToken(token)
            .then(userData => {
                request.userId = userData.user._id
                request.access = userData.access
                request.username = userData.user.Username
                next()
            })
            .catch(err => {
                response.redirect('/login')
            })
    } else {
        response.redirect('/login')
    }
}

export const authenticateAndRespondStatus = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    let token: string = request.signedCookies.accessToken
    if (token) {
        User.getUserByToken(token)
            .then(userData => {
                request.userId = userData.user._id
                request.access = userData.access
                request.username = userData.user.Username
                next()
            })
            .catch(err => {
                response.sendStatus(401)
            })
    } else {
        response.sendStatus(401)
    }
}

export const authenticateNotRedirect = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    let token: string = request.signedCookies.accessToken
    if (token) {
        User.getUserByToken(token)
            .then(userData => {
                request.userId = userData.user._id
                request.access = userData.access
                request.username = userData.user.Username
                next()
            })
            .catch(err => {
                next()
            })
    } else {
        next()
    }
}

export const setCookieAndRespond = (
    response: Response,
    accessToken: string
) => {
    response
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            signed: true
        })
        .sendStatus(302)
}

export const deleteCookieAndRespond = (response: Response) => {
    response
        .clearCookie('accessToken', {
            httpOnly: true,
            signed: true
        })
        .sendStatus(302)
}

export const socketMiddleware = (
    socket: SocketIO.Socket,
    next: NextFunction
) => {
    let token: string = socket.request.signedCookies.accessToken
    if (token) {
        User.getUserByToken(token)
            .then(userData => {
                next()
            })
            .catch(err => {
                next(new Error(err))
            })
    } else {
        next(new Error('Unauthenticated user'))
    }
}
