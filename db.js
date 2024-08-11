const mongoose=require('mongoose');
require('dotenv').config();

//Define the  mongodb connection url
const mongourl=process.env.MONGODB_URL_LOCAL;//use in case want to run db server on localhost
// const mongourl=process.env.MONGODB_URL;

//Set up mongodb connection
mongoose.connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).catch(err => console.log('Mongoose connection error:', err));

//Get the default connection
//Mongoose maintains a default object representing the mongodb connection
const db=mongoose.connection;

//define event listners for database connection
//connected,error,disconnected::---> all are event listner keywords
db.on('connected',()=>{
    console.log('connected to Mongodb server');//when connected to mongodb will print this message
});

db.on('error',()=>{
    console.log('Mongodb connection error')
});

db.on('disconnected',()=>{
    console.log("mongodb disconnected")
});

//Export the database connection
module.exports=db;