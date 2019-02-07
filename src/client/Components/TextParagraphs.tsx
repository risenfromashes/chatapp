import React from 'react'

interface TextParagraphsProps{
    texts: string[]
}

const TextParagraphs = (props : TextParagraphsProps)=>(
        <div className="text-container"> 
            {props.texts.map((text: string, index)=>{
                return (
                    <p key={index} className="text-left text-justify" style ={{wordBreak: 'break-word'}}>{text}</p>
                )
            })}
        </div>
)

export default TextParagraphs