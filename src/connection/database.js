const mysql = require('mysql');

//Declaration param
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const pass = process.env.DB_PASSWORD || '';
const db = process.env.DB_DATABASE || '';

//Make connection
const connection = mysql.createConnection({
    host: host,
    user: user,
    password: pass,
    database: db,
    dateStrings: 'date'
});

connection.connect((error) => {
    if(error) throw error;

    console.log('Connection database success...');
});

module.exports = connection;