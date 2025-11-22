import express from 'express';
const router = express.Router();
import thread from '../models/ThreadSchema.js';
import getGeminiResponse from '../utils/Gemini.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';



// test route
router.get("/test", async (req,res)=>{
    try {
        const threads = new thread({
            threadId: "teat-1234",
            title : "Test Thread2"
        });
        const response = await threads.save();
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({err : "Server error1"});
    }
});

router.use((req, res, next) => {
  if (!req.user) return res.status(401).json({ err: "Unauthorized" });
  next();
});

//get all threads route
router.get("/thread", async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("threads") // populate with full thread docs
      .exec();

    res.json(user.threads.sort((a, b) => b.updatedAt - a.updatedAt));
  } catch (err) {
    console.error(err + " in threads route");
    res.status(500).json({ err: "Server error in threads route" });
  }
});

// get a particular thread by threadId
router.get("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const threadDoc = await thread.findOne({ threadId });
    if (!threadDoc) {
      return res.status(404).json({ err: "Thread not found" });
    }

    res.json(threadDoc.messages);
  } catch (err) {
    console.log(err + " in single thread route");
    res.status(500).json({ err: "Server error in single thread route" });
  }
});

// delete thread route
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const threadDoc = await thread.findOneAndDelete({ threadId });
    if (!threadDoc) {
      return res.status(404).json({ err: "Thread not found" });
    }

    // Remove ref from user.threads
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { threads: threadDoc._id }
    });

    res.json({ message: "Thread deleted successfully" });
  } catch (err) {
    console.error(err + " in delete thread route");
    res.status(500).json({ err: "Server error in delete thread route" });
  }
});

// most important route (in this route we connect to backend with gemini api and then save the response in mongodb)
// most important route
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ err: "Thread ID and message are required" });
  }

  try {
    const user = await User.findById(req.user.id);

    // 1. Find or create a thread in Thread collection
    let threadDoc = await thread.findOne({ threadId });

    if (!threadDoc) {
      threadDoc = new thread({
        threadId: uuidv4(),
        title: message,
        messages: []
      });

      await threadDoc.save();

      // 2. Save thread _id inside user.threads
      user.threads.push(threadDoc._id);
      await user.save();
    }

    // 3. Push user message
    threadDoc.messages.push({ role: "user", content: message });

    // 4. Gemini API call
    const assistantReply =
      (await getGeminiResponse(message)) ||
      "Sorry, I couldn't process your request.";

    threadDoc.messages.push({
      role: "A.K. GPT",
      content: assistantReply
    });

    threadDoc.updatedAt = Date.now();
    await threadDoc.save();

    res.json({ assistantReply });
  } catch (err) {
    console.log(err + " in post chat route");
    res.status(500).json({ err: "Server error in post chat route" });
  }
});




export default router;