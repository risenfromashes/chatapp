
import React from 'react'
import { AddButtonProp } from '../types/MessageTypes';

const AddButton = (props: AddButtonProp) => {
    return (
        <button key="2" type="button" onClick={props.onClick}
            className="btn btn-success rounded-circle mx-auto mb-2 fixed-bottom d-flex justify-content-center align-content-center py-0"
            style={{ fontSize: '3rem', height: '5rem', width: '5rem' }}><b>&#xff0b;</b></button>
    )
}

export default AddButton