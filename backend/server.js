import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './Routes/chat.js';
import authRouter from './Routes/auth.js';
import path from 'path';
import { fileURLToPath } from "url";
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.set("trust proxy", 1);

app.use(cors({
  origin: ["https://a-k-gpt-7qx2.onrender.com"],
  credentials: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: process.env.SESSION_SECRET || "super secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req,res) => {
  res.send({msg : "A.K GPT backend running"});
})

app.use('/api', router);
app.use('/auth', authRouter);

MongoDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});

async function MongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err}`);
    process.exit(1); // Stop server if DB fails
  }
}
