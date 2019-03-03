import React from 'react'
import { MessageAlertProp } from '../../types/MessageTypes'
import { Toast, Position, Toaster, Intent, IToaster } from '@blueprintjs/core'

let mToaster: IToaster

//creates toaster if its not created already
//this extra layer is to not mess up with ssr
const createToaster = () => {
    if (document && !mToaster) {
        mToaster = Toaster.create({
            className: 'toaster',
            position: Position.TOP
        })
    }
}

export const showErrorToast = (errorMessage: string) => {
    createToaster()
    if (mToaster)
        mToaster.show({
            message: errorMessage,
            intent: Intent.DANGER
        })
}

const MessageAlert = (props: MessageAlertProp) => {
    switch (props.alertType) {
        case 'newMessage':
            return (
                <Toaster position={Position.TOP}>
                    <Toast
                        message='New Messages. Scroll down to see them.'
                        intent={Intent.PRIMARY}
                        timeout={3000}
                    />
                </Toaster>
            )
        case 'tryingToConnect':
            return (
                <div
                    className='alert alert-warning fixed-top text-center'
                    role='alert'
                >
                    <strong>Trying to connect to server</strong>
                </div>
            )
        case 'cannotConnect':
            return (
                <div
                    className='alert alert-danger fixed-top text-center'
                    role='alert'
                >
                    <strong>Cannot connect to server</strong>
                </div>
            )
    }
}

export default MessageAlert
