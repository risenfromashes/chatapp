import { Socket } from "socket.io";
import { ChangeEvent, KeyboardEvent, ClipboardEvent, FormEvent, FocusEvent, MouseEvent } from "react";

export interface MessageHeaderProp{
    color: string,
    sender: string,
    time: string
}

export interface MessageEditorProp{
    height: string | number,
    width: string | number,
    bgcolor: string,
    text: string,
    onFocus: (event: FocusEvent) => void,
    onBlur: (event: FocusEvent) => void,
    onChange: (event: ChangeEvent | KeyboardEvent) => void,
    onTextChange: (event: KeyboardEvent | ClipboardEvent) => void,
    onKeyPress: (event: KeyboardEvent) => void,
    onSubmit: (event: FormEvent) => void,
    onFinishEditClick: (event: MouseEvent) => void
}

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
    color: string,
    showRealTime: boolean
}

export interface MessageAlertProp{
    alertType: 'newMessage' | 'cannotConnect' | 'tryingToConnect'
}

export interface MessageContainerProp{
    Socket?: SocketIOClient.Socket | undefined,
    Messages: MessageData[]   
}

export interface MessageContainerState{
    Messages: MessageData[],
    ip: string | undefined,
    id: string | undefined,
    connected: boolean,
    attemptingConnection: boolean,
    connectionNo: number,
    myColor: string,
    isFocused: boolean,
    newText: boolean
}

export interface AddButtonProp{
    onClick: (event: MouseEvent)=> void
}

export interface ConnectionState{
    ip: string,
    connectionNo: number,
    Messages: MessageData[]
}