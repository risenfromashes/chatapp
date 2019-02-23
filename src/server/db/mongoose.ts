import mongoose from 'mongoose'
import mongodb from 'mongodb'

mongoose.Promise = global.Promise

console.log('Mongodb uri : ' + process.env.MONGODB_URI)

if (process.env.MONGODB_URI)
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })

export default mongoose
