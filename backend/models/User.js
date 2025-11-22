import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    googleId: String, // store google profile id here
    threads : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "thread"

    }]
});

export default mongoose.model("User", userSchema);