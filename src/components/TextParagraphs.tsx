import React from 'react'

interface TextParagraphsProps{
    texts: string[]
}

const TextParagraphs = (props : TextParagraphsProps)=>(
        <div className="text-container"> 
            {(props.texts && props.texts.length>0)?
                (props.texts.map((text: string, index)=>{
                    return (
                        (text.length>0)? (
                            <p key={index} className="text-justify py-0 my-0" style ={{wordBreak: 'break-word'}}>{text}</p>
                        ):
                        (<br></br>)
                    )
                })               
                ):
            (<p key="1" className="text-justify py-0 my-0" style ={{wordBreak: 'break-word'}}>''</p>)}
            <br></br>
        </div>
)

export default TextParagraphs