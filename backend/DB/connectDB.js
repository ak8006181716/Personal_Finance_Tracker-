import mongoose from 'mongoose'


const connectDB = async()=>{

    try{
        const data= await  mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    
    }
    catch(err){
        console.log("error in connecting mongoDB",err);
        process.exit(1);
    }   
}

export default connectDB;