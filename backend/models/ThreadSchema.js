import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    content : {
        type : String,
        required: true
    },
    role : {
        type : String,
        enum : ["user", "A.K. GPT"],
        required: true,
        default : "user",
    },
    timestamp : {
        type : Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema({
    threadId : {
        type : String,
        required: true,
        unique: true,
    },
    title : {
        type : String,
        default: "New Chat"
    },
    messages : [MessageSchema],
    createdAt : {
        type : Date,
        default: Date.now
    },
    updatedAt : {
        type : Date,
        default: Date.now
    }
});

export default mongoose.model("thread", ThreadSchema);