import React from 'react'
import { Drawer, Button, Classes } from "@blueprintjs/core";
import { SettingsDrawerProp } from '../types/MessageTypes';
import { ColorTree } from './ColorTree';


export const SettingsDrawer = (props: SettingsDrawerProp) => {
    return (
        <Drawer
            {...props.handleDrawer}
            title="Customize"
            className="bg-dark"
            autoFocus={true}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}
            enforceFocus={true}
            hasBackdrop={true}
            usePortal={true}
            size={200}
            vertical={false}
        >
            <Button className={`${Classes.MINIMAL} d-md-none d-block`} icon="user" large={true} text={props.username} style={{ outline: 'none'}} />
            <Button className={Classes.MINIMAL} icon="style" large={true} intent="primary" text="Change Color" style={{ outline: 'none'}}/>
            <ColorTree onNodeClick={props.onTreeNodeClick} />
        </Drawer>
    )
}