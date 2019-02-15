import React, { MouseEvent } from 'react'
import { colors, bp3_colors } from "../utils/colors";
import { ITreeNode, Icon, Tree, Tooltip, Position } from "@blueprintjs/core";
import { ColorTreeProp, ColorTreeState, ColorDataType } from '../types/MessageTypes';



export class ColorTree extends React.Component<ColorTreeProp,ColorTreeState>{
    constructor(props: ColorTreeProp){
        super(props)
        this.state = {
            nodes: colorNodeTree
        }
    }

    private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
        if (nodes == null) {
            return
        }
        for (const node of nodes) {
            callback(node)
            if(node.childNodes) this.forEachNode(node.childNodes, callback)
        }
    }

    private handleNodeClick = (nodeData: ITreeNode<ColorDataType>, _nodePath: number[], ev: MouseEvent) =>{
        const previouslySelected = nodeData.isSelected
        this.forEachNode(this.state.nodes, n => (n.isSelected = false))
        nodeData.isSelected = true
        if(nodeData.nodeData && nodeData.nodeData.colorValue) this.props.onNodeClick(nodeData.nodeData.colorValue)
        this.setState(this.state)
    }

    private handleNodeCollapse = (nodeData: ITreeNode) => {
        nodeData.isExpanded = false
        this.setState(this.state)
    }
    
    private handleNodeExpand = (nodeData: ITreeNode) => {
        nodeData.isExpanded = true
        this.setState(this.state)
    }

    render(){
        return(
            <Tree
                contents = {this.state.nodes}
                onNodeClick = {this.handleNodeClick}
                onNodeCollapse = {this.handleNodeCollapse}
                onNodeExpand = {this.handleNodeExpand}
            />
        )
    }
}

const colorNodeTree: ITreeNode<ColorDataType>[] = colors.map((colorName: string, index: number) => {
    return (
        {
            id: index,
            label: colorName,
            hasCaret: true,
            isExpanded: false,
            nodeData: { colorValue : bp3_colors[colorName][1]},
            secondaryLabel: (
                <Icon icon="symbol-circle" iconSize={40} color={bp3_colors[colorName][1]} />
            ),
            childNodes: bp3_colors[colorName].map((colorValue: string, colorIndex: number) => {
                return (
                    {
                        id: colorIndex,
                        label: colorName + ' ' + colorIndex,
                        nodeData: { colorValue },  
                        secondaryLabel: (
                            <Icon icon="symbol-circle"  iconSize={40} color={bp3_colors[colorName][colorIndex]}/>
                        )                      
                    }
                )
            })
        }
    )
})