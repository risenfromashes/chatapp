import React from 'react'
import { Button, Intent, Colors } from '@blueprintjs/core'
import { AddButtonProp } from '../../types/MessageTypes'

const AddButton = (props: AddButtonProp) => {
    return (
        <Button
            className='rounded rounded-circle fixed-bottom mx-auto mb-2'
            icon='chat'
            intent={Intent.PRIMARY}
            onClick={props.onClick}
            large={true}
            style={{ outline: 'none', height: '4rem', width: '4rem' }}
        />
    )
}

export default AddButton

/**
 * Bootstrap Button
 *  < button key = "2" type = "button" onClick = { props.onClick }
    className = "btn btn-success rounded-circle mx-auto mb-2 fixed-bottom d-flex justify-content-center align-content-center py-0"
    style = {{ fontSize: '3rem', height: '5rem', width: '5rem' }}> <b>&#xff0b;</b></button >
 */
