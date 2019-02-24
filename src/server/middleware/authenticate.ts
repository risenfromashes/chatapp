import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { Request, NextFunction, Response } from 'express'
import { app } from '../app'
import { AuthTokenPayload, User } from '../db/models/user'

app.use(cookieParser(process.env.SECRET))

export const authenticate = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    let token: string = request.signedCookies.accessToken
    if (token) {
        User.getUserByToken(token).then(userData => {
            request.userId = userData.user._id
            request.access = userData.access
            next()
        })
    } else {
        response.redirect('/login')
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
        .sendStatus(200)
}
