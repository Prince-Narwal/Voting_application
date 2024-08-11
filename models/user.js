const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String
    },
    adharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum: ['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
})


//used in comparison of old and new password
userSchema.pre('save', async function(next){
    const user = this;  

    // Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();

    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Override the plain password with the hashed one
        user.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})


//Function to compare the password
userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}


const User=mongoose.model('User',userSchema);
module.exports=User;