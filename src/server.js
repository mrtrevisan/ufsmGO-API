//access to .env file
import dotenv from 'dotenv';
dotenv.config();

//express server
import express from 'express';
const app = express();

//cors policy 
import cors from 'cors';
app.use(cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

//receive JSON trough req body
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//swagger
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
const swaggerFile = fs.readFileSync('./src/swagger/swagger.json')

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(JSON.parse(swaggerFile)));

//endpoint controllers
import { authController } from './controllers/authController.js';
import { userController } from './controllers/userController.js';
import { dataController } from './controllers/dataController.js';

app.use('/', authController);
app.use('/', userController);
app.use('/', dataController);

//server port
const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port ${port}`));

//home page
app.get('/', async function(req, res){
    res.json('UfsmGO');
})