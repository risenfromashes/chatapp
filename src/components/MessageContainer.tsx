import React, { ReactNode, CSSProperties } from 'react'
import $ from 'jquery'
import uuidv1 from 'uuid/v1'
import MessageElement from '../components/MessageElement'
import {
    MessageContainerProp,
    MessageContainerState,
    MessageData,
    ConnectionState
} from '../types/MessageTypes'

import {
    textUpdateEventData,
    textEditEventData,
    colorChangeEventData,
    newImageEventData
} from '../types/EventDataTypes'

import getRandomColor from '../utils/colors'
import MessageAlert, { showErrorToast } from './MessageAlert'
import AddButton from './AddButton'
import {
    Navbar,
    NavbarGroup,
    Alignment,
    NavbarHeading,
    NavbarDivider,
    Button,
    Classes
} from '@blueprintjs/core'
import { SettingsDrawer } from './SettingsDrawer'
import { ImageData } from '../types/ImageTypes'
import { EVENTS } from '../types/Event'

export default class MessageContainer extends React.Component<
    MessageContainerProp,
    MessageContainerState
> {
    private socket: SocketIOClient.Socket | undefined

    //these are for checking if this instance sent message
    private myNewText: boolean = false
    private haveSentEmptyMessage: boolean = false
    private mostRecentMessageID: string | undefined

    //show messages as typed or not
    //timer and counter to implement oneclick for showrealtime and dblclick for not
    private showRealTime: boolean = true
    private buttonPressCount: number = 0
    private buttonTimer: any

    constructor(props: MessageContainerProp) {
        super(props)
        this.socket = this.props.Socket || undefined
        //setting state recieved from ajax and passed in by index/app.js
        this.state = {
            Messages:
                this.props.Messages && this.props.Messages.length > 0
                    ? this.props.Messages.map(Message => {
                          return {
                              text: Message.text,
                              images: Message.images,
                              createdAt: Message.createdAt,
                              editedAt: Message.editedAt,
                              senderIP: Message.senderIP,
                              senderID: Message.senderID,
                              messageID: Message.messageID,
                              color: Message.color,
                              showRealTime: Message.showRealTime
                          }
                      })
                    : [],
            id: undefined,
            ip: undefined,
            connected: false,
            connectionNo: 0,
            attemptingConnection: true,
            myColor: getRandomColor(0),
            isFocused: false,
            newText: false,
            drawerOpen: false
        }
    }

    componentDidMount() {
        if (this.socket) {
            //setting state to show proper error message
            this.socket.on('reconnecting', (attemptNumber: number) => {
                this.setState({ connected: false, attemptingConnection: true })
            })
            this.socket.on('reconnect_error', (error: any) => {
                this.setState({ connected: false, attemptingConnection: false })
            })
            this.socket.on('reconnect_failed', () => {
                this.setState({ connected: false, attemptingConnection: false })
            })

            //refresh data once really connected
            this.socket
                .on('connect', () => {})
                .on('connection', (connectionState: ConnectionState) => {
                    if (connectionState.Messages) {
                        this.setState({
                            Messages: connectionState.Messages,
                            connected: true,
                            id: this.socket ? this.socket.id : undefined,
                            ip: connectionState.ip,
                            connectionNo: connectionState.connectionNo,
                            myColor: getRandomColor(
                                connectionState.connectionNo
                            )
                        })
                    } else {
                        this.setState({
                            connected: true,
                            id: this.socket ? this.socket.id : undefined,
                            ip: connectionState.ip
                        })
                    }
                })

            //if text is changed update the text by id
            this.socket.on(
                EVENTS.TEXT_UPDATE,
                (updateEventData: textUpdateEventData) => {
                    this.modifybyID(
                        updateEventData.messageID,
                        updateEventData.newText
                    )
                }
            )
            //if there is new text , gets the data and adds it
            this.socket.on(EVENTS.NEW_MESSAGE, (newMessage: MessageData) => {
                this.addNew(newMessage)
            })

            //if someone changes his color
            this.socket.on(
                EVENTS.COLOR_CHANGE,
                (eventData: colorChangeEventData) => {
                    let newMessageState = this.changeColorByClientID(
                        eventData.clientID,
                        eventData.newColor
                    )
                    this.setState({ Messages: newMessageState })
                }
            )
            //if images in a message is modified
            this.socket.on(
                EVENTS.IMAGE_CHANGE,
                (eventData: newImageEventData) => {
                    this.modifybyID(
                        eventData.messageID,
                        undefined,
                        eventData.newImages
                    )
                }
            )
            //enables space key as a shortcut for the button click
            $(document).on('keypress', (e: any) => {
                if (e.which == 32 && !this.state.isFocused) {
                    this.handleAddButtonClick()
                    e.preventDefault()
                }
            })
        }
    }

    componentDidUpdate() {
        //sort the messages by time
        let sortedMessages = this.state.Messages.sort(
            (Message1: MessageData, Message2: MessageData) =>
                Message1.createdAt - Message2.createdAt
        )
        if (this.state.Messages != sortedMessages)
            this.setState({ Messages: sortedMessages })

        if (this.myNewText) {
            let docHeight = $('body').height()
            if (docHeight) $(document).scrollTop(docHeight + 200)
            this.myNewText = false
        }
    }

    //stores the previous messageData array from state, updates the message with the given id and returns the updated array
    //edit time is updated
    //createdTime update is also available for non showrealtime messages
    //and setStates the updated array
    private modifybyID = (
        messageID: string,
        text?: string[],
        images?: ImageData[],
        time?: number
    ): MessageData[] => {
        let newMessageData: MessageData
        let prevMessagesState: MessageData[] = this.state.Messages
        let newMessagesState: MessageData[] = prevMessagesState.map(
            MessageElement => {
                if (MessageElement.messageID == messageID) {
                    newMessageData = {
                        messageID,
                        text: text || MessageElement.text,
                        images: images || MessageElement.images,
                        createdAt: time || MessageElement.createdAt,
                        editedAt: new Date().getTime(),
                        senderID: MessageElement.senderID,
                        senderIP: MessageElement.senderIP,
                        color: MessageElement.color,
                        showRealTime: MessageElement.showRealTime
                    }
                    return newMessageData
                } else {
                    return MessageElement
                }
            }
        )
        this.setState({
            Messages: newMessagesState
        })
        return newMessagesState
    }

    //iterates through all the data and changes the color of matched clientid
    private changeColorByClientID = (
        clientID: string,
        newColor: string
    ): MessageData[] => {
        let newMessageData: MessageData
        let prevMessagesState: MessageData[] = this.state.Messages
        let newMessagesState: MessageData[] = prevMessagesState.map(
            MessageElement => {
                if (MessageElement.senderID == clientID) {
                    newMessageData = {
                        messageID: MessageElement.messageID,
                        text: MessageElement.text,
                        images: MessageElement.images,
                        createdAt: MessageElement.createdAt,
                        editedAt: MessageElement.editedAt,
                        senderID: MessageElement.senderID,
                        senderIP: MessageElement.senderIP,
                        color: newColor,
                        showRealTime: MessageElement.showRealTime
                    }
                    return newMessageData
                } else {
                    return MessageElement
                }
            }
        )
        this.setState({
            Messages: newMessagesState
        })
        return newMessagesState
    }

    private addNew = (
        newMessageData?: MessageData
    ): MessageData | undefined => {
        //if this instance is properly connected and the user hvnt sent empty messages, add the new message, giving
        //this instances id, ip, timestamp, color etc
        if (
            this.state.id &&
            this.state.ip &&
            this.state.connected &&
            !this.haveSentEmptyMessage
        ) {
            let newMessage: MessageData
            if (newMessageData) {
                newMessage = newMessageData
            } else {
                newMessage = {
                    text: [],
                    images: [],
                    messageID: uuidv1(),
                    senderID: this.state.id,
                    senderIP: this.state.ip,
                    createdAt: new Date().getTime(),
                    editedAt: 0,
                    color: this.state.myColor,
                    showRealTime: this.showRealTime
                }
                this.haveSentEmptyMessage = true
                this.mostRecentMessageID = newMessage.messageID
            }
            this.setState({
                Messages: this.state.Messages.concat(newMessage)
            })

            //this instance has sent a message
            if (newMessage.senderID == this.state.id) this.myNewText = true

            //shows the newmessage alert only if the user has scrolled above
            let docHeight = $(document).innerHeight()
            if (window && docHeight) {
                if (
                    !this.myNewText &&
                    window.pageYOffset < docHeight - window.innerHeight - 200
                ) {
                    this.setState({ newText: true })

                    setTimeout(() => {
                        this.setState({ newText: false })
                    }, 2000)
                }
            }
            //returns the created messagedata
            return newMessage
        }
        return undefined
    }

    private handleAddButtonClick = () => {
        //if there is just 1 button press in the span of 200 ms,
        //message wont be shown realtime
        //if the button is pressed again before 200ms, resets buttoncount and sets showrealtime to false
        this.buttonPressCount++
        if (this.buttonPressCount == 1) {
            this.buttonTimer = setTimeout(() => {
                this.showRealTime = true
                this.buttonPressCount = 0
                let newMessageData = this.addNew()
                if (newMessageData && this.socket)
                    this.socket.emit(EVENTS.NEW_MESSAGE, newMessageData)
            }, 200)
        } else {
            clearTimeout(this.buttonTimer)
            this.showRealTime = false
            this.buttonPressCount = 0
            let newMessageData = this.addNew()
            //emits the event
            //emits the event only if its showrealtime
            //otherwise it sends the event after its value is set
            if (newMessageData && this.socket && newMessageData.showRealTime)
                this.socket.emit(EVENTS.NEW_MESSAGE, newMessageData)
            if (!this.socket) showErrorToast("Can't send message")
        }
    }

    //for changing the message color of this user
    private changeMyColor = (newColor: string) => {
        //strictly checking connection
        if (
            this.state.connected &&
            this.state.id &&
            this.state.ip &&
            this.socket
        ) {
            let eventData: colorChangeEventData = {
                clientID: this.state.id,
                clientIP: this.state.ip,
                newColor,
                currentMessageArray: this.changeColorByClientID(
                    this.state.id,
                    newColor
                )
            }

            this.socket.emit(EVENTS.COLOR_CHANGE, eventData)
            this.setState({ myColor: newColor })
        }
    }

    //for nonshowrealtime messages
    //it emits the newMessageEvent after the message has been edited
    private onSend = (message: MessageData) => {
        if (this.socket && message.editedAt == 0) {
            message.createdAt = new Date().getTime()
            this.modifybyID(
                message.messageID,
                undefined,
                undefined,
                message.createdAt
            )
            this.socket.emit(EVENTS.NEW_MESSAGE, message)
        }
        if (!this.socket) showErrorToast("Can't send message")
    }
    //handles change of text
    private handleTextChange = (messageID: string, newText: string[]) => {
        //if properly connected update state and the message array received from modifybyID
        if (
            this.state.id &&
            this.state.ip &&
            this.state.connected &&
            this.socket
        ) {
            let eventData: textEditEventData = {
                clientID: this.state.id,
                clientIP: this.state.ip,
                messageID,
                currentMessageArray: this.modifybyID(messageID, newText),
                newText
            }
            //check if the message was edited by this instance
            if (messageID == this.mostRecentMessageID && newText.length > 0)
                this.haveSentEmptyMessage = false
            //emits the event
            this.socket.emit(EVENTS.TEXT_EDIT, eventData)
        } else showErrorToast("Can't edit message.")
    }

    //handles new image data added to message
    private handleImagesChange = (
        messageID: string,
        newImages: ImageData[]
    ) => {
        if (
            this.state.id &&
            this.state.ip &&
            this.state.connected &&
            this.socket
        ) {
            let eventData: newImageEventData = {
                clientID: this.state.id,
                clientIP: this.state.ip,
                messageID,
                currentMessageArray: this.modifybyID(
                    messageID,
                    undefined,
                    newImages,
                    undefined
                ),
                newImages
            }
            //check if the message was edited by this instance
            if (messageID == this.mostRecentMessageID && newImages.length > 0)
                this.haveSentEmptyMessage = false
            //emits the event
            this.socket.emit(EVENTS.IMAGE_CHANGE, eventData)
        } else showErrorToast("Can't add image.")
    }

    private openDrawer = () => {
        this.setState({ drawerOpen: true })
    }
    private closeDrawer = () => {
        this.setState({ drawerOpen: false })
    }

    private handleMessageFocus = () => {
        this.setState({ isFocused: true })
    }

    private handleMessageBlur = () => {
        this.setState({ isFocused: false })
    }

    render(): ReactNode {
        return (
            <div id='Texts' className='w-100 px-3 messageContainer py-5'>
                <Navbar fixedToTop={true}>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>RS Chatapp</NavbarHeading>
                        <NavbarDivider />
                        <Button
                            className={`${Classes.MINIMAL} d-none d-md-block`}
                            icon='user'
                            large={true}
                            text={this.state.ip}
                            style={{
                                outline: 'none',
                                width: '200px',
                                overflow: 'hidden'
                            }}
                        />
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT}>
                        <Button
                            className={Classes.MINIMAL}
                            icon='menu'
                            large={true}
                            style={{ outline: 'none' }}
                            onClick={this.openDrawer}
                        />
                    </NavbarGroup>
                </Navbar>

                <SettingsDrawer
                    handleDrawer={{
                        isOpen: this.state.drawerOpen,
                        onClose: this.closeDrawer
                    }}
                    ip={this.state.ip || 'User'}
                    onTreeNodeClick={this.changeMyColor}
                />

                {this.state.connected ||
                    (this.state.attemptingConnection ? (
                        <MessageAlert alertType='tryingToConnect' />
                    ) : (
                        <MessageAlert alertType='tryingToConnect' />
                    ))}
                {this.state.newText && <MessageAlert alertType='newMessage' />}

                <div
                    key='1'
                    className='messageContents w-100 mx-auto d-flex flex-column align-items-center my-3'
                >
                    {this.state.Messages.map((Message, index) => {
                        return (
                            <MessageElement
                                key={index}
                                messageData={Message}
                                editable={this.state.id == Message.senderID}
                                onSend={this.onSend}
                                onFocus={this.handleMessageFocus}
                                onBlur={this.handleMessageBlur}
                                onTextChange={this.handleTextChange}
                                onImagesChange={this.handleImagesChange}
                            />
                        )
                    })}
                </div>
                {this.state.isFocused || !this.state.connected || (
                    <AddButton onClick={this.handleAddButtonClick} />
                )}
            </div>
        )
    }
}
