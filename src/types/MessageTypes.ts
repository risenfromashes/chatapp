import { Socket } from "socket.io";

export interface MessageElementProp{
    messageData: MessageData,
    editable: boolean,
    onFocus: ()=>void,
    onBlur: ()=> void,
    onTextChange: (messageID: string, text: string[]) => void
}

export interface MessageElementState{
    text : string,
    toggleEdit: boolean
}

export interface MessageData{
    senderID: string,
    senderIP: string,
    messageID: string,
    createdAt: number,
    editedAt: number,
    text: string[],
    color: string
}

export interface MessageContainerProp{
    Socket: SocketIOClient.Socket,
    Messages: MessageData[]   
}

export interface MessageContainerState{
    Messages: MessageData[],
    ip: string | undefined,
    id: string | undefined,
    connected: boolean,
    attemptingConnection: boolean,
    connectionNo: number,
    myColor: string
}

export interface ConnectionState{
    ip: string,
    connectionNo: number,
    Messages: MessageData[]
}