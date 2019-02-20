//

import fs from 'fs'
import React from 'react'
import ReactDOM from 'react-dom/server'
import path from 'path'
import MessageContainer from '../components/MessageContainer'
import { MessageData } from '../types/MessageTypes'

let renderStringFromMessageData = async (
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
                            <MessageContainer Messages={messageArray} />
                        )
                    )
                resolve(stringHTML)
            }
        )
    })
}

export default renderStringFromMessageData
