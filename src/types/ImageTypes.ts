import { isOpen } from "@blueprintjs/core/lib/esm/components/context-menu/contextMenu";

export interface Dimensions{
    height: number,
    width: number
}

export interface ImageCallback{
    (dim: Dimensions): void
}

export interface ImageBoxProp{
    onPreviewOpen: ()=>void,
    onPreviewClose: ()=>void,
    parentWidth: number,
    src: string
}

export interface ImageBoxState{
    isReady: boolean,
    isLoaded: boolean,
    isPreviewOpen: boolean
}

export interface ImagePreviewDialogueProp{
    src_height: number,
    src_width: number,
    src: string,
    isOpen: boolean,
    onClose: ()=>void
}

export interface ImagePreviewDialogueState{
    isLoaded: boolean,
    isOpen: boolean
}