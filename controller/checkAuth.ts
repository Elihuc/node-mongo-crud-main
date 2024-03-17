import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export interface RequestWithCredentials extends Request {
    token?: string;
}

export default (req: RequestWithCredentials, res: Response, next: NextFunction) => {

    const bearerHeader = req.headers['authorization'];

    if(!process.env.TOKEN_KEY){
        return res.sendStatus(500);
    }

    if (bearerHeader){
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        jwt.verify(token, process.env.TOKEN_KEY, (error,data)=>{
            if (error){
                return res.sendStatus(403);
            } else{
                req.token = token;
                next();
            }
        })
    } else {
        return res.sendStatus(403);
    }
}