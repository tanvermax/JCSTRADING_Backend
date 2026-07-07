/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendresponse"
import { AuthService } from './auth.service';
import AppError from '../../errorHelper/AppError';
import { createUserToken } from '../../utils/user.token';
import { setAuthCookie } from '../../utils/setCookies';
import { envVarse } from '../../config/env';
import passport from 'passport';




const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const loginInfo = await AuthServices.credentialsLogin(req.body)
    console.log(req.body)
    passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
            return next(new AppError(401, err))
        }

        if (!user) {
            // console.log("from !user");
            // return new AppError(401, info.message)
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserToken(user)

        // delete user.toObject().password
        // console.log("userTokens",userTokens)

        const { password: pass, ...rest } = user.toObject()


        setAuthCookie(res, userTokens)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest

            },
        })
    })(req, res, next)

});

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,      
        sameSite: "none"   
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,      // 👈 'false' থেকে 'true' করা হলো
        sameSite: "none"   // 👈 'lax' থেকে 'none' করা হলো
    })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully",
        data: null,
    })
})

const googlCallbackConmtroll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    let redirectTo = req.query.state ? req.query.state as string : " ";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    const user = req.user;
    console.log(user);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "user not found")
    }
    const tokenInfo = createUserToken(user);
    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVarse.FRONT_END_URL}/${redirectTo}`)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "password changed  successfully",
        success: true,
        data: null,
    })
})
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string)

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    })
})

export const AuthController = {
    credentialsLogin, logout, googlCallbackConmtroll, getNewAccessToken
}