import React from 'react'
import { Spinner } from '@blueprintjs/core'

export const LoadScreen = () => {
    return (
        <div className='loadScreen d-flex flex-wrap align-content-center justify-content-center w-100'>
            <Spinner intent='primary' size={20} />
        </div>
    )
}
