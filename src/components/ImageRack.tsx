import React from 'react'
import { ImageRackProp, ReactImageElement } from '../types/ImageTypes'
import { element } from 'prop-types'

export const ImageRack = (props: ImageRackProp) => {
    return (
        <div className='d-flex flex-row mt-3 bp3-dark' style={{}}>
            {props.images.map((element: ReactImageElement, index: number) => {
                return (
                    <div
                        className='imageContainer border border-dark mx-2'
                        style={{ height: 'auto', width: 102 }}
                    >
                        {element}
                    </div>
                )
            })}
        </div>
    )
}
