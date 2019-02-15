import { Colors } from '@blueprintjs/core';

interface color_group{
    [index: string]: string[]
}

export const bp3_colors: color_group = {
    'Gray': [
        Colors.DARK_GRAY1,
        Colors.DARK_GRAY2,
        Colors.DARK_GRAY3,
        Colors.DARK_GRAY4,
        Colors.DARK_GRAY5,
        Colors.GRAY1
    ],
    'Blue': [
        Colors.BLUE1,
        Colors.BLUE2,
        Colors.BLUE3,
        Colors.BLUE4,
    ],
    'Green': [
        Colors.GREEN1,
        Colors.GREEN2,
        Colors.GREEN3,
        Colors.GREEN4
    ],
    'Orange': [
        Colors.ORANGE1,
        Colors.ORANGE2,
        Colors.ORANGE3,
        Colors.ORANGE4
    ],
    'Red': [
        Colors.RED1,
        Colors.RED2,
        Colors.RED3,
        Colors.RED4
    ],
    'Vermillion': [
        Colors.VERMILION1,
        Colors.VERMILION2,
        Colors.VERMILION3,
        Colors.VERMILION4
    ],
    'Rose': [
        Colors.ROSE1,
        Colors.ROSE2,
        Colors.ROSE3,
        Colors.ROSE4
    ],
    'Violet': [
        Colors.VIOLET1,
        Colors.VIOLET2,
        Colors.VIOLET3,
        Colors.VIOLET4
    ],
    'Indigo': [
        Colors.INDIGO1,
        Colors.INDIGO2,
        Colors.INDIGO3,
        Colors.INDIGO4
    ],
    'Cobalt': [
        Colors.COBALT1,
        Colors.COBALT2,
        Colors.COBALT3,
        Colors.COBALT4
    ],
    'Turquoise': [
        Colors.TURQUOISE1,
        Colors.TURQUOISE2,
        Colors.TURQUOISE3,
        Colors.TURQUOISE4
    ],
    'Forest': [
        Colors.FOREST1,
        Colors.FOREST2,
        Colors.FOREST3,
        Colors.FOREST4
    ],
    'Lime': [
        Colors.LIME1,
        Colors.LIME2,
        Colors.LIME3,
        Colors.LIME4

    ],
    'Gold': [
        Colors.GOLD1,
        Colors.GOLD2,
        Colors.GOLD3,
        Colors.GOLD4
    ],
    'Sepia': [
        Colors.SEPIA1,
        Colors.SEPIA2,
        Colors.SEPIA3,
        Colors.SEPIA4
    ]
}

export const colors: string[] = Object.keys(bp3_colors)


let getRandomColor = (num: number): string =>{
    let color: string[]
    if (num == 0) color = bp3_colors[colors[Math.floor(Math.random() * (colors.length))]]
    else color = bp3_colors[colors[num % colors.length]]
    return color[Math.floor(num % (color.length))]
}


export default getRandomColor

// randomness isn't always that random
// let color = bp3_colors[colors[Math.floor(Math.random()*(colors.length))]]
// return color[Math.floor(Math.random()*(color.length))]