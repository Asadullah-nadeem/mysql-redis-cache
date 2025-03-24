const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'Example2',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error:', err);
    } else {
        console.log('Connected to MySQL Database.');
    }
});

async function getData(query) {
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject('Error querying MySQL database');
            } else {
                resolve(results);
            }
        });
    });
}

// API Endpoint to Fetch Users (Without Redis)
app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM users LIMIT 10000';
        const data = await getData(query);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
