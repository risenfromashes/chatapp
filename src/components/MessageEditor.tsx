import React, { ChangeEvent, RefObject, MouseEvent} from 'react'
import ReactDOM from 'react-dom'
import { MessageEditorProp, MessageEditorState } from '../types/MessageTypes'
import { EditableText, Button, Classes, FileInput } from '@blueprintjs/core'
import { ImageRack } from './ImageRack';

export class MessageEditor extends React.Component<
    MessageEditorProp,
    MessageEditorState
> {
    private refToImageInput: RefObject<HTMLInputElement>
    private refToTextInput: RefObject<EditableText>
    constructor(props: MessageEditorProp) {
        super(props)
        this.refToImageInput = React.createRef()
        this.refToTextInput = React.createRef()
        this.state={images:[]}
    }

    componentDidMount(){
        let thisElement = ReactDOM.findDOMNode(this)
        if(thisElement instanceof Element){
            let textArea = thisElement.querySelector('textarea')
            if(textArea){
                textArea.onpaste = function(this: DocumentAndElementEventHandlers, ev: ClipboardEvent){
                    console.log('paste!!')
                }
            }
        }
        // if(textInputContainer) {
        //     console.log(textInputContainer)
        //     let textarea = textInputContainer.
        //     if(textarea){
        //         console.log(textarea)
        //         textarea.onblur = function(this: GlobalEventHandlers,ev: FocusEvent){
        //             console.log('bla')
        //         }
        //     }
        // }
    }

    private handleFileInput = (ev: ChangeEvent<HTMLInputElement>) => {
        if (ev.target && ev.target.files && ev.target.files.length > 0){
            this.handleImage(ev.target.files)
        }                    
    }

    private handleClick = (ev: MouseEvent) => {
        this.props.onCancelSubmit()
        if (this.refToImageInput.current) this.refToImageInput.current.click()
    }

    private handleImage = (files: FileList) => {
        for (var i = 0; i < files.length; i++) {
            //test type
            if (RegExp('image/*').test(files[i].type)) {
                var src = window.URL.createObjectURL(files[i])
                // var img = $('<img>')
                //     .width(100)
                //     .prop('src', src)
                //     .on('load', function(this: HTMLImageElement) {
                //         console.log(this.src)
                //         window.URL.revokeObjectURL(this.src)
                //     })
                // $('#container').append(img)

                let imageElement = React.createElement('img', {
                    src,
                    className: 'image',
                    width: 100,
                    onLoad: function(this: HTMLImageElement) {
                        window.URL.revokeObjectURL(imageElement.props.src)
                    }
                })

                this.setState({images: this.state.images.concat(imageElement)})

                console.log('... file[' + i + '].name = ' + files[i].name)

                // var formData = new FormData()
                // formData.append('image' + i, files[i])
                // let sendRequest = () => {
                //     $.ajax({
                //         type: 'post',
                //         url: '/upload',
                //         data: formData,
                //         contentType: false,
                //         processData: false,
                //         success: function(response) {
                //             if (response.status != 'success') sendRequest()
                //         }
                //     })
                // }
                // sendRequest()
            }
        }
    }

    render() {
        return (
            <div
                className='d-block'
                style={{ width: this.props.width, height: 'auto' }}
            >
                <EditableText
                    ref={this.refToTextInput}
                    className='d-block'
                    placeholder='Say something, its free :D'
                    multiline={true}
                    minLines={3}
                    maxLines={Infinity}
                    isEditing={true}
                    intent='none'
                    value={this.props.text}
                    confirmOnEnterKey={true}
                    {...this.props.handlers}
                />

                <ImageRack images={this.state.images}/>

                <div className='d-flex flex-wrap align-content-center mt-4'>
                    <div className='imageInput mr-auto'>
                        <input
                            className='imageInputForm'
                            type='file'
                            ref={this.refToImageInput}
                            multiple
                            accept='image/*'
                            style={{ display: 'none', position: 'absolute' }}
                            onChange={this.handleFileInput}
                        />
                        <Button
                            text='Add Image(s)'
                            icon='media'
                            style={{ fontSize: '0.75rem' }}
                            className={Classes.MINIMAL}
                            onClick={this.handleClick}
                        />
                    </div>
                    <div className='finishEdit ml-auto'>
                        <p className='text-right'>
                            <a href='' onClick={this.props.onFinishEditClick}>
                                Finish Edit
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}
