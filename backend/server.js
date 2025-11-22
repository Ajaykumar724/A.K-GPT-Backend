import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './Routes/chat.js';
import authRouter from './Routes/auth.js';
import fetch from 'node-fetch'; // Needed if Node < 18
import path from 'path';
import { fileURLToPath } from "url";
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { serialize } from 'v8';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials : true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
   secret: process.env.SESSION_SECRET || "super secret",
   resave: false,
   saveUninitialized: false,
   store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions"
   }),
   cookie: {secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());

// app.post('/test', async (req, res) => {

//   const prompt = req.body.prompt || "Explain to me how AI works";

  // try {
  //   const response = await fetch(
  //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         contents: [
  //           {
  //             role : "user" , 
  //             parts: [{ text: prompt }]
  //           }
  //         ]
  //       })
  //     }
  //   );

  //   const data = await response.json();
  //   console.log(data.candidates[0].content.parts[0].text);
  //   res.json(data.candidates[0].content.parts[0].text);
  // } catch (err) {
  //   console.error(`Here is something errored: ${err}`);
  //   res.status(500).send("Error calling Gemini API");
  // }
// });

app.use('/api', router);
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
  MongoDB();
});


const MongoDB = async () => {
   try {
     await mongoose.connect(process.env.MONGODB_URI);
     console.log("connected to MongoDB");
   } catch (err) {
     console.error(`Error connecting to MongoDB: ${err}`);
   }
}


