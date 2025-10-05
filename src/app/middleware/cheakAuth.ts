import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVarse } from "../config/env";
import { IsActive } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';


export const cheakAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {

        const accesToken = req.headers.authorization || req.cookies.accessToken;
        // console.log(accesToken)
        if (!accesToken) {
            throw new AppError(403, "no Token found")
        }

        const verifiedToken = verifyToken(accesToken, envVarse.JWT_ACCES_SECRET) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email })
        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }
        if (!isUserExist.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
        }
        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }
        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route!!!")
        }

        req.user = verifiedToken
        next()
    } catch (error) {
        console.log("JWT error", error)
        next(error);
    }

}

