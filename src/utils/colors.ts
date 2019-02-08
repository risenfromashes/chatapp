
import color from 'color'

let getRandomColor = () => color.hsl([Math.floor(Math.random()*18)*20,95,40]).hex().toString()

export default getRandomColor