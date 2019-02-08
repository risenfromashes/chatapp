import React from 'react'

interface TextParagraphsProps{
    texts: string[]
}

const TextParagraphs = (props : TextParagraphsProps)=>(
        <div className="text-container"> 
            {(props.texts && props.texts.length>0)?
            (props.texts.map((text: string, index)=>{
                return (
                    <p key={index} className="text-justify" style ={{wordBreak: 'break-word'}}>{text}</p>
                )
            })):
            (<p key="1" className="text-justify" style ={{wordBreak: 'break-word'}}>''</p>)}
        </div>
)

export default TextParagraphs