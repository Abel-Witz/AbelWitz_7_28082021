const mysql = require("mysql");
require("dotenv").config();


  /*****************************/
 /* Setup database connection */
/*****************************/
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    post: process.env.MYSQL_PORT | 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true
});

let successfullyConnected;
let connectionError;
const promises = [];

connection.connect(function(err) {
    if (err) {
        successfullyConnected = false;
        connectionError = err;

        while (promises.length > 0) {
            promises.pop()[1](connectionError);
        }

        return;
    };

    successfullyConnected = true;

    while (promises.length > 0) {
        promises.pop()[0](connection);
    }
});

module.exports = () => {
    let resolveFunction;
    let rejectFunction;

    const promise = new Promise((resolve, reject) => {
        if (successfullyConnected === true) {
            resolve(connection);
        } else if (successfullyConnected === false) {
            reject(connectionError);
        } else {
            resolveFunction = resolve;
            rejectFunction = reject;
        }
    })

    if (successfullyConnected === undefined) {
        promises.push([resolveFunction, rejectFunction]);
    }

    return promise;
};