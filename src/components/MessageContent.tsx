import React from 'react'
import { Tooltip, Intent, ResizeSensor } from '@blueprintjs/core'
import { MessageContentProps, MessageContentState } from '../types/MessageTypes'
import { ImageBox } from './ImageBox'
import { ImageData } from '../types/ImageTypes'
import ReactDOM from 'react-dom'
import { LoadScreen } from './LoadScreen'

// TODO: Change it to a text and image display component, also pass in actual width to ImageBox
class MessageContent extends React.Component<
    MessageContentProps,
    MessageContentState
> {
    constructor(props: MessageContentProps) {
        super(props)
        this.state = {
            width: this.props.cardWidth,
            readyForImage: false
        }
    }

    componentDidMount = () => {
        this.updateWidth()
    }

    componentDidUpdate = (prevProps: MessageContentProps) => {
        if (prevProps.cardWidth != this.props.cardWidth) {
            this.setState({ readyForImage: false })
        } else if (!this.state.readyForImage) {
            this.updateWidth()
        }
    }

    private updateWidth = () => {
        this.props.getComputedParentWidth((width: number) => {
            if (width != 0) {
                this.setState({
                    width,
                    readyForImage: true
                })
            }
        })
    }

    render() {
        return (
            <div className='messageContent'>
                {this.props.texts &&
                    this.props.texts.length > 0 &&
                    this.props.texts.map((text: string, index) => {
                        let formattedText = text.replace(/ /g, '\u00a0')
                        return text.length > 0 ? (
                            <p
                                key={index}
                                className='card-text text-justify py-0 my-0'
                                style={{ wordBreak: 'break-word' }}
                            >
                                {formattedText}
                            </p>
                        ) : (
                            <br key={index} />
                        )
                    })}
                {this.state.readyForImage ? (
                    <div className='images'>
                        {this.props.images &&
                            this.props.images.length > 0 &&
                            this.props.images.map(
                                (_image: ImageData, index: number) => {
                                    return (
                                        <ImageBox
                                            key={index}
                                            src={_image.src}
                                            parentWidth={this.state.width - 40}
                                            {...this.props}
                                        />
                                    )
                                }
                            )}
                    </div>
                ) : (
                    <LoadScreen />
                )}
            </div>
        )
    }
}

export default MessageContent
