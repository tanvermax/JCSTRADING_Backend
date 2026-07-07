"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./app/routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("./app/config/passport");
const globalerrorhandler_1 = require("./app/middleware/globalerrorhandler");
const notFounde_1 = __importDefault(require("./app/middleware/notFounde"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ১. অনুমোদিত অরিজিনগুলোর লিস্ট (Live + Local)
const allowedOrigins = [
    "http://jcstradingbd.com",
    "https://jcstradingbd.com",
    "http://localhost:5000",
    "http://localhost:3000",
];
// ২. স্ট্যান্ডার্ড CORS মিডলওয়্যার (OPTIONS সহ)
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
// ৩. ডায়নামিক কাস্টম হেডার মিডলওয়্যার (মোবাইল এবং লোকালহোস্টের CORS ফিক্স)
app.use((req, res, next) => {
    const origin = req.headers.origin;
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
app.options("*path", (0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
// ৫. API রাউটস
app.use("/api/v1", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to jcs trading Database backend system",
    });
});
app.use(notFounde_1.default);
app.use(globalerrorhandler_1.globalErrorHandler);
exports.default = app;
