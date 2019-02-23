import mongoose from '../mongoose'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Document, Model, model } from 'mongoose'

export interface AuthTokenPayload {
    _id: string
    access: 'auth' | 'admin'
}

export interface IUser extends Document {
    UserName: string
    Password: string
    tokens: Array<{ access: String; token: String }>
}

const UserSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
        maxlength: 16
    },
    Password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20
    },
    tokens: [
        {
            access: {
                type: String,
                enum: ['auth', 'admin'],
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
})

UserSchema.pre<IUser>('save', function(next) {
    let user = this
    if (user.isModified('Password')) {
        bcrypt
            .genSalt(20)
            .then(salt => {
                return bcrypt.hash(user.Password, salt)
            })
            .then(hash => {
                user.Password = hash
                next()
            })
            .catch(err => {
                console.log(err)
                next(err)
            })
    } else next()
})

//do something special here later
//right now it just saves the user
UserSchema.methods.registerUser = function(this: IUser) {
    let user = this
    return user.save()
}

//todo: check .toHexString()

UserSchema.methods.getAuthToken = function(this: IUser) {
    let user = this
    let payload: AuthTokenPayload = {
        _id: user._id.toHexString(),
        access: 'auth'
    }
    if (process.env.JWT_SECRET) {
        let token = jwt.sign(payload, process.env.JWT_SECRET).toString()
        user.tokens.push({ access: payload.access, token })
        return user.save().then(() => token)
    } else return Promise.reject('error. JWT_SECRET config variable not set')
}

UserSchema.methods.deleteAuthToken = function(this: IUser, token: string) {
    let user = this
    let updateOperator = {
        $pull: {
            tokens: { token }
        }
    }
    return user.update(updateOperator)
}

UserSchema.methods.unregisterUser = function(this: IUser) {
    let user = this
    return user.remove()
}

UserSchema.statics.getUserByCredentials = function(
    this: Model<IUser>,
    username: string,
    password: string
) {
    let User = this
    User.findOne({ Username: username }).then(user => {
        if (!user) return Promise.reject('User not found')
        else {
            return bcrypt
                .compare(password, user.Password)
                .then(verified => {
                    if (verified) Promise.resolve(user)
                    else Promise.reject('Incorrect Password')
                })
                .catch(err => {
                    console.log('Error trying to verify password', err)
                    return Promise.reject('Something went wrong')
                })
        }
    })
}

UserSchema.statics.getUserByToken = function(
    this: Model<IUser>,
    token: string
) {
    let User = this
    let decodedToken: any
    if (process.env.JWT_SECRET) {
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            console.log('Error trying to verify token', err)
            return Promise.reject('Error trying to verify auth token')
        }

        return User.findOne({
            _id: decodedToken._id,
            'tokens.token': token,
            'tokens.access': decodedToken.access
        })
    } else return Promise.reject('JWT secret is undefined')
}

export const User: Model<IUser> = model<IUser>('User', UserSchema)
