import dotenv from 'dotenv'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({path:'./env'})
connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000 ,()=>{
        console.log(`Server running on port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("mongo db connection failed",err);
    
})








/* approach 1 
import express from 'express'
const app = express();
// Connect to MongoDB
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.error("ERROR",error);
            throw error;
        })
        app.listen(process.removeListener.PORT , ()=>{
            console.log(`Server running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR",error);
        throw error;
    }
})()
*/
