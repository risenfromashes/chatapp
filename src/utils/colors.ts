
import color from 'color'


let getRandomColor = (num: number): string =>{
        if(num == 0) return color.hsl([(Math.random()*19)*20,50,50]).hex().toString()
        else return color.hsl([(num % 19)*20,50,50]).hex().toString()
    }

export default getRandomColor