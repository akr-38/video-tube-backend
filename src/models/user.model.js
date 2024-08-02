import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true,                             //used for applying search
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String,                                 //couldinary url      
    },
    coverImage:{
        type: String,                                 //couldinary url 
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password:{
        type: String,
        required :[true, 'Password is required'] 
    },
    refreshToken:{
        type:String,
    }

},{ timestamps : true })

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        _id : this._id,
        username : this.username,
        email : this.email,
        fullName : this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        } 
    )
}

export const User = mongoose.model('User', userSchema )