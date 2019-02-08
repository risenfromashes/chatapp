
import color from 'color'


let getRandomColor = () => color.hsl([((new Date().getTime() % 21)*18)*20,50,50]).hex().toString()

export default getRandomColor