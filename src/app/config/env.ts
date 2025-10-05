import dotenv from "dotenv"

dotenv.config();


interface EnvConfig {
    PORT: number,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    JWT_ACCES_SECRET: string,
    JWT_ACCES_EXPIRE: string,
    BCRYPT_SALT_ROUNDE: string,
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string,
        CLOUDINARY_API_KEY: string,
        CLOUDINARY_API_SECRET: string
    },
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CLIENT_ID: string,
    EXPRESS_SESSION_SECRECT: string,
    GOOGLE_CALL_BACK_URL: string,
    FRONT_END_URL: string,
    REDIS_HOST: string,
    REDIS_PORT: string,
    REDIS_USERNAME: string,
    REDIS_PASSWORD: string,
   EMAIL_SENDER: {
     SMTP_PASS: string,
    SMTP_PORT: string,
    SMTP_HOST: string,
    SMTP_USER: string,
    SMTP_FORM: string,
   }

}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariable: string[] = ["PORT",
        "DB_URL",
        "NODE_ENV",
        "JWT_ACCES_SECRET",
        "JWT_ACCES_EXPIRE",
        "BCRYPT_SALT_ROUNDE",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CLIENT_ID",
        "EXPRESS_SESSION_SECRECT",
        "GOOGLE_CALL_BACK_URL",
        "FRONT_END_URL",
        "REDIS_HOST",
        "REDIS_PORT",
        "REDIS_USERNAME",
        "REDIS_PASSWORD",
        "SMTP_PASS",
        "SMTP_PORT",
        "SMTP_HOST",
        "SMTP_USER",
        "SMTP_FORM",

    ];

    requiredEnvVariable.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`missing required environment variable ${key}`)
        }
    })

    return {
        PORT: Number(process.env.PORT),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development",
        BCRYPT_SALT_ROUNDE: process.env.BCRYPT_SALT_ROUNDE as string,
        JWT_ACCES_EXPIRE: process.env.JWT_ACCES_EXPIRE as string,
        JWT_ACCES_SECRET: process.env.JWT_ACCES_SECRET as string,
        CLOUDINARY: {
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        },
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        EXPRESS_SESSION_SECRECT: process.env.EXPRESS_SESSION_SECRECT as string,
        GOOGLE_CALL_BACK_URL: process.env.GOOGLE_CALL_BACK_URL as string,
        FRONT_END_URL: process.env.FRONT_END_URL as string,
        REDIS_HOST: process.env.REDIS_HOST as string,
        REDIS_PORT: process.env.REDIS_PORT as string,
        REDIS_USERNAME: process.env.REDIS_USERNAME as string,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
       EMAIL_SENDER:{
         SMTP_PASS: process.env.SMTP_PASS as string,
        SMTP_PORT: process.env.SMTP_PORT as string,
        SMTP_HOST: process.env.SMTP_HOST as string,
        SMTP_USER: process.env.SMTP_USER as string,
        SMTP_FORM: process.env.SMTP_FORM as string,
       }


    }
}

export const envVarse = loadEnvVariables();
