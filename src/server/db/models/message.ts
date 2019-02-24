import mongoose, { Schema, Model, Document, model } from 'mongoose'
import { ImageData } from '../../../types/ImageTypes'
import { IUser, User } from './user'
import { MessageData } from '../../../types/MessageTypes'

export interface IMessage extends Document {
    senderID: string
    createdAt: number
    editedAt: number
    text: string[]
    images: ImageData[]
    add(): Promise<IMessage>
    delete(): Promise<IMessage>
}

export interface IMessageModel extends Model<IMessage> {
    edit(
        _id: string,
        newText?: string[],
        newImage?: ImageData[]
    ): Promise<IMessage>
}
const MessageSchema: Schema = new Schema({
    senderID: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    editedAt: {
        type: Number,
        default: 0
    },
    text: [
        {
            type: String,
            default: ''
        }
    ],
    images: [
        {
            imageName: {
                type: String,
                default: 'Image'
            },
            src: {
                type: String,
                required: true
            },
            height: Number,
            width: Number
        }
    ]
})

MessageSchema.methods.add = function(this: IMessage): Promise<IMessage> {
    let message = this
    return User.findOne({ _id: message.senderID })
        .then(user => {
            if (!user) return Promise.reject('Invalid User')
            else return Promise.resolve()
        })
        .then(() => {
            return message.save()
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

MessageSchema.methods.delete = function(this: IMessage): Promise<IMessage> {
    let message = this
    return message.remove()
}

MessageSchema.statics.edit = function(
    this: IMessageModel,
    _id: string,
    newText?: string[],
    newImage?: ImageData[]
): Promise<IMessage> {
    let Message = this

    //* check validity of edit here

    return Message.findById(_id)
        .then(message => {
            if (!message) return Promise.reject('Could not find message.')
            else
                return message.update({
                    $set: {
                        text: newText || message.text,
                        images: newImage || message.images,
                        editedAt: new Date().getTime()
                    }
                })
        })
        .then((message: IMessage) => {
            if (!message) return Promise.reject('Cannot update message')
            else return Promise.resolve(message)
        })
        .catch(err => Promise.reject(err))
}

MessageSchema.statics.search = function(
    this: Model<IUser>,
    searchQuery: string
) {
    //TODO : Implement fuzzy search for the messages here
}

export const Message: Model<IMessage> = model<IMessage>(
    'Message',
    MessageSchema
)
