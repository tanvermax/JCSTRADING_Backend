
import express, { Request, Response } from "express"
import { router } from "./app/routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middleware/globalerrorhandler";
import notFounde from "./app/middleware/notFounde";
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: [
    "https://jcstrading.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
  
}))
app.use(cookieParser())


app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PH BACKEND Database backend system"
  })
})
app.use(notFounde)

app.use(globalErrorHandler);


export default app;