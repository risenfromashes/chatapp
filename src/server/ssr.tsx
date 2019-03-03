//

import fs from 'fs'
import React from 'react'
import ReactDOM from 'react-dom/server'
import path from 'path'
import MessageContainer from '../components/MessageComponents/MessageContainer'
import { MessageData } from '../types/MessageTypes'
import { LoginScreen } from '../components/LoginComponents/LoginScreen'

export const renderMessageContainer = (
    userID: string,
    username: string,
    messageArray: MessageData[]
): Promise<any> => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path.join(__dirname, '../public/html/index.html'),
            (err: Error, data: any) => {
                if (err) reject('Error trying to render to string')
                if (!data) reject('Unable to read file')

                let stringHTML: string = data
                    .toString()
                    .replace(
                        '<!--App root-->',
                        ReactDOM.renderToString(
                            <MessageContainer
                                Messages={messageArray}
                                UserID={userID}
                                Username={username}
                            />
                        )
                    )
                resolve(stringHTML)
            }
        )
    })
}

export const renderLoginScreen = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path.join(__dirname, '../public/html/login.html'),
            (err: Error, data: any) => {
                if (err) reject('Error trying to render to string')
                if (!data) reject('Unable to read file')

                let stringHTML: string = data
                    .toString()
                    .replace(
                        '<!--App root-->',
                        ReactDOM.renderToString(<LoginScreen />)
                    )
                resolve(stringHTML)
            }
        )
    })
}
