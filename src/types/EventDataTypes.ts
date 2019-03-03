import { string } from 'prop-types'
import { MessageData } from './MessageTypes'
import { ImageData } from './ImageTypes'
import { access } from 'fs'

/**
 * events:
 *  textEditEvent: emitted by a client | clientid,ip, messageID and newText is sent => textEditEventData
 *  textUpdateEvent: broadcasted by the server | messageID, newText is sent => textUpdateEventData
 *
 *  newMessageEvent: emitted by a client | clientid,ip and text is sent as MessageData =>  MessageData
 *  newMessageEvent: broadcasted by the server | clientid,ip,messageID, newText is sent as MessageData => MessageData
 *
 */

export interface textEditEventData {
    clientID: string
    messageID: string
    currentMessageArray: MessageData[]
    newText: string[]
}

export interface textUpdateEventData {
    clientID: string
    messageID: string
    newText: string[]
}

export interface colorChangeEventData {
    clientID: string
    newColor: string
    currentMessageArray: MessageData[]
}

export interface newImageEventData {
    clientID: string
    messageID: string
    newImages: ImageData[]
    currentMessageArray: MessageData[]
}
