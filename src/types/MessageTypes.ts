import { Socket } from 'socket.io'
import {
    ChangeEvent,
    KeyboardEvent,
    ClipboardEvent,
    FormEvent,
    FocusEvent,
    MouseEvent,
    RefObject
} from 'react'
import { TreeEventHandler, ITreeNode, Card } from '@blueprintjs/core'
import { ReactImageElement, ImageData } from './ImageTypes'

export interface MessageHeaderProp {
    sender: string
    time: string
}

export interface MessageEditorProp {
    width: number
    text: string
    id: string
    handlers: {
        onCancel: (value: string) => void
        onChange: (value: string) => void
        onConfirm: (value: string) => void
        onEdit: (value: string) => void
    }
    onImageChange: (newImage: ImageData) => void
    onFinishEditClick: (event: MouseEvent) => void
    onCancelSubmit: () => void
}
export interface MessageEditorState {
    images: ReactImageElement[]
}

export interface MessageContentProps {
    onPreviewOpen: () => void
    onPreviewClose: () => void
    getComputedParentWidth: (callback: Function) => void
    isEditable: boolean
    texts: string[]
    images: ImageData[]
    cardWidth: number
}

export interface MessageContentState {
    readyForImage: boolean
    width: number
}

export interface MessageElementProp {
    messageData: MessageData
    editable: boolean
    onSend: (message: MessageData) => void
    onFocus: () => void
    onBlur: () => void
    onTextChange: (messageID: string, text: string[]) => void
    onImagesChange: (messageID: string, images: ImageData[]) => void
}

export interface MessageElementState {
    text: string
    toggleEdit: boolean
    previewOpen: boolean
    width: number
}

export interface MessageData {
    senderID: string //client will tell the id of the user but the server will later verify that
    messageID?: string //client wont set the id
    createdAt: number
    editedAt: number
    text: string[]
    images: ImageData[]
    color: string
    showRealTime: boolean
}

export interface MessageAlertProp {
    alertType: 'newMessage' | 'cannotConnect' | 'tryingToConnect'
}

export interface MessageContainerProp {
    Socket?: SocketIOClient.Socket | undefined
    Messages: MessageData[]
}

export interface MessageContainerState {
    Messages: MessageData[]
    ip: string | undefined
    id: string | undefined
    connected: boolean
    drawerOpen: boolean
    attemptingConnection: boolean
    connectionNo: number
    myColor: string
    isFocused: boolean
    newText: boolean
}

export interface SettingsDrawerProp {
    handleDrawer: {
        isOpen: boolean
        onClose: () => void
    }
    ip: string
    onTreeNodeClick: (newColor: string) => void
}

//types related to color settings
export interface ColorDataType {
    colorValue: string
}
export interface ColorTreeProp {
    onNodeClick: (newColor: string) => void
}

export interface ColorTreeState {
    nodes: ITreeNode<ColorDataType>[]
}

export interface AddButtonProp {
    onClick: (event: MouseEvent) => void
}

export interface ConnectionState {
    ip: string
    connectionNo: number
    Messages: MessageData[]
}
