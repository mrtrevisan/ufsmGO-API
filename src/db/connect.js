const {Pool} = require('pg');

async function connect(){
    if(global.connection) return global.connection.connect()
    else {
        const pool = new Pool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            database: process.env.DATABASE_DB,
            password: process.env.DATABASE_PASSWORD,
            port: process.env.DATABASE_PORT
        });
        global.connection = pool
        return pool.connect()
    }
}  

export {connect};