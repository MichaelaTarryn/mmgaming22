require('dotenv').config();
const mysql = require('mysql');
    const connection = mysql.createPool({
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
require('dotenv').config();

// const mysql = require('mysql');

module.exports = connection;