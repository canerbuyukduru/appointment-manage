import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    beautyCenterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BeautyCenter",
        required:true
    },
   rating:{
    type:Number,
    required:true,
    min:1,
    max:5
   },
   comment:{
    type:String,
    required:true,
    trim:true,
    minLength:10,
    maxLength:300
   },
   ownerReply:{
    text:{ type:String, trim:true, maxLength:500 },
    repliedAt:{ type:Date }
   }
},{timestamps:true})


// indexler
commentSchema.index({beautyCenterId:1,createdAt:-1})
commentSchema.index({userId:1})


export default mongoose.model("Comment",commentSchema)
