import React from 'react'
import { Tooltip, Intent } from '@blueprintjs/core';
import {TextParagraphsProps} from '../types/MessageTypes'

const TextParagraphs = (props : TextParagraphsProps)=>(    
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
    </div>
)

export default TextParagraphs
