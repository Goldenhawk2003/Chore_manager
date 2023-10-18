const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'mywebsite'
});

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Store in database
        const query = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
        db.query(query, [email, passwordHash], (error, results) => {
            if (error) throw error;
            res.status(201).send('User registered!');
        });

    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT password_hash FROM users WHERE email = ?';
    db.query(query, [email], async (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const passwordHash = results[0].password_hash;

            const isMatch = await bcrypt.compare(password, passwordHash);

            if (isMatch) {
                res.send('Logged in successfully');
            } else {
                res.status(400).send('Invalid credentials');
            }
        } else {
            res.status(400).send('Invalid credentials');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
