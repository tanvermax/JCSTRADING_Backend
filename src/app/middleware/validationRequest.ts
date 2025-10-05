import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateRequest = (ZodSchema: ZodObject<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log("===== Before Parsing =====");
            // console.log("req.body:", req.body);
            // console.log("req.file:", req.file);
            // console.log("==========================");
            // req.body =JSON.parse(req.body.data || {}) || req.body
            if (req.body && req.body.data) {
                try {
                    req.body = JSON.parse(req.body.data);
                } catch (parseError) {
                    console.error("Failed to parse req.body.data:", parseError);
                    return res.status(400).json({
                        success: false,
                        message: "Invalid JSON in form data",
                        errorSources: [],
                    });
                }
            }

            // Validate with Zod
            req.body = await ZodSchema.parseAsync(req.body || {});
            next()
        } catch (error) {
            next(error)
        }
    }


    