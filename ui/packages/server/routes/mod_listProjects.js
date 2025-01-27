const mysql = require('mysql');

const PROJECT_DATABASE_HOST = process.env.PROJECT_DATABASE_HOST || "db.example.com";
const PROJECT_DATABASE_PORT = process.env.PROJECT_DATABASE_PORT || "5432";
const PROJECT_DATABASE_USERNAME = process.env.PROJECT_DATABASE_USERNAME || "user";
const PROJECT_DATABASE_PASSWORD = process.env.PROJECT_DATABASE_PASSWORD || "password";
const PROJECT_DATABASE_DATABASE_NAME = process.env.PROJECT_DATABASE_NAME || "name";

var _getListProjects = function (req, res) {

    var msg;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var username = credentials.split(':')[0];
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`;
        return res.status(400).json({ "error": msg });
    }

    // Create SQL statement
    const sql = `SELECT project FROM acls WHERE user="${username}" AND projectRole IN ('contributor', 'manager');`

    var con = mysql.createConnection({
        host: PROJECT_DATABASE_HOST,
        port: PROJECT_DATABASE_PORT,
        user: PROJECT_DATABASE_USERNAME,
        password: PROJECT_DATABASE_PASSWORD,
        database: PROJECT_DATABASE_DATABASE_NAME
    });

    con.connect(function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ "error": err });
        }
        con.query(sql, function (err, results) {
            if (err) {
                con.end();
                console.error(err);
                return res.status(500).json({ "error": err });
            } else {
                con.end();
                console.log(JSON.stringify(results));
                return res.status(200).json({ "data": results });
            }
        });
    });
}

module.exports.getListProjects = _getListProjects;
