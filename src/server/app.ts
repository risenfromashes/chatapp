import express, { Request, Response } from 'express'
import path from 'path'
import socketIO, { Socket }  from 'socket.io'

const app = express()
const server = app.listen(80, () => {
    console.log('Connected to port 80')
})

const io = socketIO.listen(server)

io.on('connection', (socket: Socket) =>{

    console.log('client connected', socket.id, socket.handshake.address)
    socket.emit('connection', socket.handshake.address)

    socket.on('newMessage', (count: string)=>{
        console.log(count)
        socket.broadcast.emit('addNew', count)
    })
    socket.on('textEdit', (text: object)=>{
        socket.broadcast.emit('newText', text)
    })
})


app.use(express.static(path.join(__dirname,'./public/')))

app.get('/',(request: Request, response: Response):void=>{
    response.status(200).sendFile(path.join(__dirname,'./public/html/index.html'))
})