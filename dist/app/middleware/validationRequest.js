"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateRequest = (ZodSchema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("===== Before Parsing =====");
        // console.log("req.body:", req.body);
        // console.log("req.file:", req.file);
        // console.log("==========================");
        // req.body =JSON.parse(req.body.data || {}) || req.body
        if (req.body && req.body.data) {
            try {
                req.body = JSON.parse(req.body.data);
            }
            catch (parseError) {
                console.error("Failed to parse req.body.data:", parseError);
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON in form data",
                    errorSources: [],
                });
            }
        }
        // Validate with Zod
        req.body = yield ZodSchema.parseAsync(req.body || {});
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateRequest = validateRequest;
