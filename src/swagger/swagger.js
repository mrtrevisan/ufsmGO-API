import dotenv from 'dotenv';
dotenv.config();

//swagger
import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger.json'
const endpointsFiles = [
    '../controllers/authController.js', 
    '../controllers/dataController.js',
    '../controllers/userController.js', 
    '../middlewares/ensureNameNotUsed.js', 
    '../middlewares/ensureUserExists.js',
    '../server.js'
]

const swaggerOptions = {
    info: {
        title: 'ufsmgo-api',
        description: "Documentation automatically generated by the <b>swagger-autogen</b> module."
    },
    host: process.env.API_URL,
    schemes: [
        "https"
    ]
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions);