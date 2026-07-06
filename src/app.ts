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

app.use(
  cors({
    origin: [
      "http://jcstradingbd.com",
      "https://jcstradingbd.com",
      // "https://jcstrading.vercel.app",
      "http://localhost:5000",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://jcstradingbd.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // OPTIONS রিকোয়েস্ট আসলে সরাসরি ২০০ সাকসেস পাঠাবে
  }
  next();
});
app.options("/", cors());
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to jcs trading Database backend system",
  });
});
app.use(notFounde);

app.use(globalErrorHandler);

export default app;
