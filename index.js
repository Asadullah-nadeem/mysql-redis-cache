const express = require('express');
const redis = require('redis');
const app = express();
const sql = require('mysql2')
const PORT = 3000;

// Database MYSQL Example2 10,000 Query
const db = sql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'Example2',
    port: 3306,
})
db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error:', err);
    } else {
        console.log('Connected to MySQL Database.');
    }
});

// Client Redis for MySql
const rClient = redis.createClient();
rClient.on('error', (err) => {
    console.error('Redis Error:', err);
});
(async () => {
    try {
        await rClient.connect();
        console.log('Connected to Redis.');
    } catch (error) {
        console.error('Redis Connection Failed:', error);
    }
})();
async function getData(query) {
    try {
        const cacheResult = await rClient.get(query);
        if (cacheResult) {
            console.log('Returning data from Redis cache');
            return JSON.parse(cacheResult);
        }

        return new Promise((resolve, reject) => {
            db.query(query, async (err, results) => {
                if (err) {
                    reject('Error querying MySQL database');
                } else {
                    await rClient.set(query, JSON.stringify(results), {
                        EX: 3600, // Expiry time in seconds (1 hour)
                    });
                    console.log('Returning data from MySQL');
                    resolve(results);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Client To connect to redis
// let redClient;
// (async () => {
//     try {
//         redClient = redis.createClient();
//         redClient.on('error', (err) => {
//         console.error(err);
//     })
//         await redClient.connect();
//         console.log("Redis client connected successfully.");
//     } catch (err) {
//         console.error("Error in connecting to Redis:", err);
//     }
// })();

// app.get('/', (req, res) => {
//     res.send('Hellow');
// });

// Fetch Users
app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM users LIMIT 10000';
        const data = await getData(query);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// With Redis 1st time run get time 19.76s second time run get data 13ms
// app.get('/calculate-data', async(req, res) => {
//     try{
//         let calculateData = 0;
//         // Check
//         const cachedData = await redClient.get('calculate-data');
//         if (cachedData) {
//             return res.json({data: cachedData});
//         }
//         for (let i = 1; i <= 10000000000; i++) {
//             calculateData += i;
//         }
//
//         // Store Data is Redis data
//         await redClient.set('calculate-data', calculateData);
//         return res.json({data: calculateData});
//     }catch(error){
//         return res.json({error: error.message});
//     }
// });


// Without Redis Get data 19.76s Run time get the value or Calculate Data
// app.get('/calculate-data', (req, res) => {
//     try{
//         let calculateData = 0;
//         for (let i = 1; i <= 10000000000; i++) {
//             calculateData += i;
//         }
//         return res.json({data: calculateData});
//     }catch(error){
//         return res.json({error: error.message});
//     }
// });

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});