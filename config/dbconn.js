require('dotenv').config();
const { createPool } = require('mysql');
const connection = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,    
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

// connection.connect( (err)=> {
//     if(err) throw err 
// })

module.exports = connection;