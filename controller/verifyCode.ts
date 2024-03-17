import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export interface RequestWithToken extends Request {
    token?: string;
    email?: string
}

interface JWTPayload {
    code: string,
    email: string
}

export default (req: RequestWithToken, res: Response, next: NextFunction) => {

    const bearerHeader = req.headers['authorization'];

    if(!process.env.TOKEN_KEY){
        return res.sendStatus(500);
    }

    if (bearerHeader){
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        jwt.verify(token, process.env.TOKEN_KEY, (error, payload)=>{
            if (error){
                return res.sendStatus(403);
            } else{
                const data = payload as JWTPayload;
                const code = req.body.code; 
                if(parseInt(data.code) === parseInt(code)){
                    req.email = data.email;
                    next();
                } else {
                    return res.sendStatus(403);
                }
            }
        })
    } else {
        return res.sendStatus(403);
    }
}