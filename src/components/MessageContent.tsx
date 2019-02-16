import React from 'react'
import { Tooltip, Intent } from '@blueprintjs/core';
import {MessageContentProps} from '../types/MessageTypes'
import { ImageBox } from './ImageBox';

// TODO: Change it to a text and image display component, also pass in actual width to ImageBox
const MessageContent = (props : MessageContentProps)=>(    
        <div>
            {(props.texts && props.texts.length > 0) &&
                (props.texts.map((text: string, index) => {
                    let formattedText = text.replace(/ /g, "\u00a0")
                    return (
                        (text.length > 0) ? (
                            <p key={index} className="card-text text-justify py-0 my-0" style={{ wordBreak: 'break-word' }}>{formattedText}</p>
                        ) :
                        (<br key={index} ></br>)
                    )
                })
                )
            }
            <ImageBox  
                src='http://livedoor.blogimg.jp/kamakuraidola/imgs/f/a/fa34c514.png' parentWidth={500}
                {...props}
            />
        </div>
)

export default MessageContent
