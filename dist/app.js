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
app.use((0, cors_1.default)({
    origin: [
        "http://jcstradingbd.com",
        "https://jcstradingbd.com",
        // "https://jcstrading.vercel.app",
        "http://localhost:5000",
        "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
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
app.options("*", (0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to jcs trading Database backend system",
    });
});
app.use(notFounde_1.default);
app.use(globalerrorhandler_1.globalErrorHandler);
exports.default = app;
