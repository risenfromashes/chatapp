import React, {
    FormEvent,
    ChangeEvent,
    KeyboardEvent,
    ClipboardEvent,
    MouseEvent,
    FocusEvent,
    RefObject
} from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

import { MessageElementProp, MessageElementState } from '../types/MessageTypes'

import MessageHeader from './MessageHeader'
import { MessageEditor } from './MessageEditor'
import {
    Card,
    Tooltip,
    Intent,
    ResizeSensor,
    IResizeEntry
} from '@blueprintjs/core'
import MessageContent from './MessageContent'
import { ImageData } from '../types/ImageTypes'

export default class MessageElement extends React.Component<
    MessageElementProp,
    MessageElementState
> {
    private canFinishEdit = false

    private submitTimer: any
    private defaultText: string
    private refToCard: RefObject<Card>
    private mounted: boolean = false
    private resizeTimer?: any
    //for comparing to present width to detect resize
    private prevWindowWidth: number = process.env.BROWSER
        ? window.innerWidth
        : 0

    constructor(props: MessageElementProp) {
        super(props)
        this.refToCard = React.createRef()

        this.defaultText = `User from ${
            this.props.messageData.senderIP
        } wants to say something`
        if (
            this.props.messageData.text &&
            this.props.messageData.text.length > 0
        )
            this.state = {
                text: this.props.messageData.text.join('\n'),
                toggleEdit: false,
                previewOpen: false,
                width: process.env.BROWSER ? window.innerWidth / 2 : 200
            }
        else
            this.state = {
                text: '',
                toggleEdit: this.props.messageData.editedAt == 0 ? true : false,
                previewOpen: false,
                width: process.env.BROWSER ? window.innerWidth / 2 : 200
            }

        //watching for resize
        setInterval(() => {
            if (process.env.BROWSER) {
                if (window.innerWidth != this.prevWindowWidth) {
                    this.prevWindowWidth = window.innerWidth
                    this.handleResize()
                }
            }
        }, 100)
    }

    componentDidMount() {
        this.mounted = true
        //animation when created
        let thisElement = ReactDOM.findDOMNode(this)
        if (thisElement)
            $(thisElement)
                .hide()
                .fadeIn()
        //showedit doesnt call this for the first time
        if (this.props.messageData.editedAt == 0 && this.props.editable)
            this.props.onFocus()

        //also resize for fullscreenEvent
        if (process.env.BROWSER) {
            document.addEventListener('fullscreenchange', () => {
                this.handleResize()
            })
        }
    }

    componentDidUpdate = (prevProps: MessageElementProp) => {
        if (prevProps.messageData != this.props.messageData) this.handleResize()
    }

    private getComputedWidth = (callback: Function) => {
        let interval: any
        let getWidth = (): number => {
            let _card = this.refToCard.current
            if (_card) {
                let _cardElement = ReactDOM.findDOMNode(_card)
                if (_cardElement instanceof Element) {
                    console.log('doing resize')
                    return parseInt(
                        window
                            .getComputedStyle(_cardElement)
                            .getPropertyValue('width')
                            .replace('px', '')
                    )
                } else return 0
            } else return 0
        }
        //waiting till component gets mounted to get the proper width
        if (this.mounted) callback(getWidth())
        else
            interval = setInterval(() => {
                if (this.mounted) {
                    clearInterval(interval)
                    callback(getWidth())
                }
            }, Infinity)
    }

    private handleChange = (val: string) => {
        if (val) {
            //doesnt update on every change if showrealtime is false
            if (this.props.messageData.showRealTime)
                this.props.onTextChange(
                    this.props.messageData.messageID,
                    val.split('\n')
                )
            this.setState({ text: val })

            val = val.trim()
            if (val.length != 0) this.canFinishEdit = true
            else this.canFinishEdit = false
        } else {
            this.canFinishEdit = false
            this.setState({ text: '' })
        }
    }

    private handleImageChange = (newImage: ImageData) => {
        this.canFinishEdit = true
        this.props.onImagesChange(
            this.props.messageData.messageID,
            this.props.messageData.images.concat(newImage)
        )
    }
    private showEdit = () => {
        if (
            this.props.editable &&
            !this.state.toggleEdit &&
            this.props.messageData.editedAt != 0
        ) {
            let thisElement = this.refToCard.current
            if (thisElement) {
                this.getComputedWidth((width: number) => {
                    if (width != 0) this.setState({ width })
                })
            }
            if (this.props.editable) this.props.onFocus()
            this.setState({ toggleEdit: true })
        }
    }

    private submit = () => {
        if (
            this.props.editable &&
            this.canFinishEdit &&
            this.state.toggleEdit
        ) {
            if (
                !this.props.messageData.showRealTime &&
                this.props.messageData.editedAt == 0
            )
                this.props.onSend(this.props.messageData)
            this.props.onTextChange(
                this.props.messageData.messageID,
                this.state.text.split('\n')
            )
            if (this.props.editable) this.props.onBlur()
            this.setState({ toggleEdit: false })
        }
    }

    private handleClickSubmit = (ev: MouseEvent) => {
        ev.preventDefault()
        this.submit()
    }

    private cancelSubmit = () => {
        clearTimeout(this.submitTimer)
    }

    private handlePreviewOpen = () => {
        this.props.onFocus()
        this.setState({ previewOpen: true })
    }
    private handlePreviewClose = () => {
        this.props.onBlur()
        this.setState({ previewOpen: false })
    }

    private handleResize = () => {
        this.getComputedWidth((width: number) => {
            if (width != 0) this.setState({ width })
        })
    }

    render() {
        let toggleEdit = this.state.toggleEdit
        let timeString = new Date(
            this.props.messageData.createdAt
        ).toLocaleTimeString()
        return (
            <Card
                ref={this.refToCard}
                onClick={this.showEdit}
                interactive={true}
                className='text-white text-justify'
                style={{
                    backgroundColor: this.props.messageData.color,
                    minWidth: '20%',
                    maxWidth: '75%',
                    marginLeft: this.props.editable ? 'auto' : '',
                    marginRight: this.props.editable ? '' : 'auto',
                    marginTop: '1rem',
                    marginBottom: '0px',
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: '0.9rem'
                }}
            >
                <MessageHeader
                    time={timeString}
                    sender={this.props.messageData.senderIP}
                />

                {toggleEdit && this.props.editable ? (
                    <MessageEditor
                        id={this.props.messageData.messageID}
                        text={this.state.text}
                        width={this.state.width - 40}
                        onFinishEditClick={this.handleClickSubmit}
                        onImageChange={this.handleImageChange}
                        handlers={{
                            onCancel: this.submit,
                            onChange: this.handleChange,
                            onEdit: this.handleChange,
                            onConfirm: this.submit
                        }}
                        onCancelSubmit={this.cancelSubmit}
                    />
                ) : (
                    <Tooltip
                        disabled={
                            !(this.props.editable && !this.state.previewOpen)
                        }
                        lazy={true}
                        content={
                            <span>
                                Click to <b>Edit</b>
                            </span>
                        }
                        intent={Intent.PRIMARY}
                        hoverOpenDelay={1000}
                        hoverCloseDelay={200}
                        position='left'
                        usePortal={false}
                    >
                        <MessageContent
                            cardWidth={this.state.width}
                            isEditable={this.props.editable}
                            onPreviewOpen={this.handlePreviewOpen}
                            onPreviewClose={this.handlePreviewClose}
                            texts={
                                this.props.messageData.text &&
                                this.props.messageData.text.length > 0
                                    ? this.props.messageData.text
                                    : [this.defaultText]
                            }
                            images={this.props.messageData.images}
                            getComputedParentWidth={this.getComputedWidth}
                        />
                    </Tooltip>
                )}
            </Card>
        )
    }
}
