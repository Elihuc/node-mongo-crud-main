import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import accountController from './controller/accounts'
dotenv.config();
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Find my scooter API Documentation',
            version: '1.0.0',
            description: 'NodeJS API using MongoDB for manging find my scooter app'
        },
    },
    apis: ['./controller/accounts.ts']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/account', accountController)

mongoose.connect(process.env.MONGO_URI as string)
.then(results => {
    app.listen(process.env.PORT,() => {
        console.log(`Server is running via port ${process.env.PORT}`)
    })
})
.catch(error => {
    console.error(error);
})



