import express from 'express';
const router = express.Router();
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import checkAuth from './checkAuth';
import verifyCode from './verifyCode';
import {RequestWithCredentials} from './checkAuth';
import {RequestWithToken} from './verifyCode'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
dotenv.config();

type UserItem = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface Test {
    email: string,
    password: string
}

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isVerify: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});
const User = mongoose.model('User', userSchema);


/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              firstName:
 *                  type: string
 *                  description: The first name of the user
 *              lastName:
 *                  type: string
 *                  description: The last name of the user
 *              email:
 *                  type: string
 *                  description: The email address of the user
 *              password:
 *                  type: string
 *                  description: This password will be crypt by the api
 */

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: The authentication routes and functions
 */


/**
 * @swagger
 * /api/account/addUser:
 *  post:
 *      summary: Create a new account
 *      tags: [Authentication]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: The user was successfully created
 *              content:
 *                  application/json:
 *                      $ref: '#/components/schemas/User'
 */
router.post('/addUser', async(req,res) => {

    if(!process.env.TOKEN_KEY){
        return res.sendStatus(500);
    }

    const {firstName, lastName, email, password} = req.body;
    const isUserExist = await User.findOne({email: email});

    if(isUserExist){
        return res.status(401).send('User Exist');
    }

    const hash = await bcryptjs.hash(password, 10);

    const code = getRandomInt(1000,9999);
    console.log(code);
    
    const dataToToken = {
        email: email,
        code: code
    }

    const token = jwt.sign(
        dataToToken, 
        process.env.TOKEN_KEY,
        {expiresIn: '5m'});

    const new_user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash
    })
    try {
        const savedUser = await new_user.save();
        return res.status(200).send(token);
    } catch (error) {
        return res.status(500).send(error);
    }
})

/**
 * @swagger
 * /api/account/users:
 *  get:
 *      summary: Returns the list of all users
 *      tags: [Authentication]
 *      responses:
 *          200:
 *              description: The list of all users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/User'
 */
router.get('/users', async(req,res) => {
    try {
        const users = await User.find();
        return res.status(200).send(users);
    } catch (error) {
        return res.status(500).send(error);
    }
})

router.get('/user/:id', async(req,res) => {
    const id = req.params.id;
    User.findById(id)
    .then(account => {
        return res.status(200).send(account);
    })
    .catch(error => {
        return res.status(500).send(error);
    })
})

router.get('/greeting', checkAuth, (req ,res) => {
    const requestWithCredentials = req as RequestWithCredentials;
    return res.status(200).json({
        message: requestWithCredentials.token
    })
})

router.post('/signup', async(req ,res) => {

    const user: UserItem = req.body.user;

    const hash = await bcryptjs.hash(user.password,10)

    const dataToToken = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hash,
    }

    const token = jwt.sign(dataToToken, process.env.TOKEN_KEY as string);

    return res.status(200).json({
        hash: hash,
        token: token,
    })
})

router.put('/verify', verifyCode, async(req, res) => {
    const requestWithToken = req as RequestWithToken;
    const email = requestWithToken.email;
    try {
        const updatedUser = await User.findOneAndUpdate({email: email}, {
            isVerify: true
        }, {new: true});
        return res.status(200).send(updatedUser);
    } catch (error) {
        return res.status(500).send(error);
    }
})

router.post('/login', (req,res) => {
    const {email, password} = req.body;
    User.findOne({email: email})
    .then(async (account: any) => {
        if(account){

            const isMatch = await bcryptjs.compare(password, account.password);
            if(isMatch){

            } else {

            }

        } else {
            return res.status(401).send('Account not exist');
        }
    })
    .catch(error => {
        return res.status(500).send(error);
    })
})

router.delete('/delete/:id', async(req,res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        return res.status(200).send(deletedUser);
    } catch (error) {
        return res.status(500).send(error);
    }
})

function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export default router;