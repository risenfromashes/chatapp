import React, { MouseEvent } from 'react'
import { ImageBoxProp, ImageBoxState, Dimensions, ImageCallback } from '../types/ImageTypes';
import { Spinner } from '@blueprintjs/core';
import { ImagePreviewDialogue } from './ImagePreviewDialogue';



function getImageDimensions(imgsrc: string, callback: ImageCallback){
    let thisImage = new Image()
    thisImage.src = imgsrc
    thisImage.onload = function(){
        callback({
            height: thisImage.height,
            width: thisImage.width
        })
    }    
}


export class ImageBox extends React.Component<ImageBoxProp,ImageBoxState>{

    private width:number = 0
    private src_height:number = 0
    private src_width:number = 0

    constructor(props: ImageBoxProp){
        super(props)
        if(process.env.BROWSER) getImageDimensions(props.src, (dimensions: Dimensions) => {
            this.src_height = dimensions.height
            this.src_width = dimensions.width
            this.setState({ isReady: true })
        })
        this.state = {
            isReady: false,
            isLoaded: false,
            isPreviewOpen: false
        }
    }
    componentDidUpdate(){
        if(this.state.isReady){
            if(this.src_width > 2*this.props.parentWidth){
                this.width = this.props.parentWidth
            } else {
                this.width = this.props.parentWidth/2
            }
        }
    }

    private onloadhandler = ()=>{
        this.setState({isLoaded: true})
    }

    private handlePreviewOpen = (ev: MouseEvent)=>{
        ev.preventDefault()
        ev.stopPropagation()
        this.props.onPreviewOpen()
        this.setState({isPreviewOpen: true})
    }
    private handlePreviewClose = ()=>{
        this.props.onPreviewClose()
        this.setState({isPreviewOpen: false})
    }

    render(){
        return(
            <div className="imgBoxContainer d-flex d-wrap align-content-center justify-content-center bp3-interactive">
                <div 
                    className="imgBox rounded border border-dark bg-dark"
                    onClick={this.handlePreviewOpen}
                >
                {this.state.isReady && 
                    <img 
                        src={this.props.src} width={this.width} onLoad={this.onloadhandler} 
                        style={{display: (this.state.isLoaded)?'block' : 'none'}}>
                    </img>}
                {(this.state.isReady && this.state.isLoaded) ||
                    <div className="loadScreen d-flex flex-wrap align-content-center justify-content-center" style={{height:'20vh', width: this.props.parentWidth}}>
                        <Spinner intent="primary" size={20}/>
                    </div>
                }
                {(this.state.isReady && this.state.isLoaded) && 
                    <ImagePreviewDialogue 
                        src={this.props.src} 
                        src_height={this.src_height}
                        src_width={this.src_width}
                        isOpen={this.state.isPreviewOpen}
                        onClose={this.handlePreviewClose}/>}
                </div>
            </div>
        )
    }   
}