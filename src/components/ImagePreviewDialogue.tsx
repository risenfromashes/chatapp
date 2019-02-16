import React, { MouseEvent } from 'react'
import { ImageBoxProp, ImageBoxState, ImagePreviewDialogueProp, ImagePreviewDialogueState } from '../types/ImageTypes';
import { Spinner, Dialog } from '@blueprintjs/core';
import $ from 'jquery'
import { stat } from 'fs';


export class ImagePreviewDialogue extends React.Component<ImagePreviewDialogueProp, ImagePreviewDialogueState>{

    constructor(props: ImagePreviewDialogueProp){
        super(props)        
        this.state = {
            isLoaded: false,
            isOpen: this.props.isOpen
        }
    }

    //internal state for close button
    //To avoid infinite loop : 
    //one way: 
    //props to state : only if props is true
    //state to props : only if state is false
    componentDidUpdate = (prevProps: ImagePreviewDialogueProp, prevState: ImagePreviewDialogueState) => {
        if((this.props.isOpen != prevProps.isOpen) && this.props.isOpen){
            this.setState({isOpen: this.props.isOpen})
        }
        else if((this.state.isOpen != prevState.isOpen) && !this.state.isOpen){
            this.props.onClose()
        }
    }      

    private onClose = ()=>{
        this.setState({isOpen: false})
    }
    private onloadhandler = ()=>{
        this.setState({isLoaded: true})
    }

    render(){
        let docHeight = $(document).height() || 500,
            docWidth = $(document).width() || 700
        return (
            <Dialog
                autoFocus={true}
                lazy={true}
                title="Image Preview"
                onClose={this.onClose}
                canEscapeKeyClose={true}
                canOutsideClickClose={true}
                enforceFocus={true}
                isOpen={this.state.isOpen}
                usePortal={true}
                icon='media'
                style={{width:'auto', height:'auto'}}
            >
                <div 
                    className='imgBox rounded border border-dark bg-dark bp3-dialog-body'
                    style={{zIndex: 1000}}>
                    {<img
                        src={this.props.src}
                        width={(this.props.src_width>this.props.src_height)?(docWidth*0.8):''}
                        height={(this.props.src_height>this.props.src_width)?(docHeight*0.8):''}
                        onLoad={this.onloadhandler}
                        style={{
                            display: this.state.isLoaded ? 'block' : 'none'
                        }}
                    />}
                    {(this.state.isLoaded) || (
                        <div
                            className='loadScreen d-flex flex-wrap align-content-center justify-content-center'
                            style={{ height: '80vh' , width: '80vw'}}
                        >
                            <Spinner intent='primary' size={20} />
                        </div>
                    )}
                </div>
            </Dialog>
        )
    }   
}

