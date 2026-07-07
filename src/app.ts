import express, { Request, Response } from "express";
import { router } from "./app/routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middleware/globalerrorhandler";
import notFounde from "./app/middleware/notFounde";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ১. অনুমোদিত অরিজিনগুলোর লিস্ট (Live + Local)
const allowedOrigins = [
  "http://jcstradingbd.com",
  "https://jcstradingbd.com",
  "http://localhost:5000",
  "http://localhost:3000",
];

// ২. স্ট্যান্ডার্ড CORS মিডলওয়্যার (OPTIONS সহ)
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

// ৩. ডায়নামিক কাস্টম হেডার মিডলওয়্যার (মোবাইল এবং লোকালহোস্টের CORS ফিক্স)
app.use((req, res, next) => {
  const origin = req.headers.origin as string;

  // যদি রিকোয়েস্টের অরিজিন আমাদের লিস্টে থাকে, তবে সেটিকে ডায়নামিকালি সেট করবে
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  

  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.header("Surrogate-Control", "no-store");
  // প্রি-ফ্লাইট (OPTIONS) রিকোয়েস্ট সরাসরি হ্যান্ডেল করা
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ৪. সব রাউটের জন্য OPTIONS এনাবল করা (ওয়াইল্ডকার্ড ফিক্সড)
app.options("*path", cors());

app.use(cookieParser());

// ৫. API রাউটস
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to jcs trading Database backend system",
  });
});

app.use(notFounde);
app.use(globalErrorHandler);

export default app;