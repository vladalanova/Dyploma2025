const express = require('express');
const bodyParser = require('body-parser');
const odbc = require('odbc');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

// ============================================
// ВАЖЛИВО: CORS КОНФІГУРАЦІЯ
// ============================================
app.use(cors({
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:8081',
        'http://localhost:8081'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Додаткові CORS заголовки
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());

const connectionString = `
Driver={ODBC Driver 17 for SQL Server};
Server=DESKTOP-N103H81\\SQLEXPRESS;
Database=Medical_Blockchain;
Trusted_Connection=Yes;
`;

async function getConnection() {
    try {
        const connection = await odbc.connect(connectionString);
        console.log("✅ Connected to database!");
        return connection;
    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}

// Приклад запиту
app.get('/test', async (req, res) => {
    try {
        const db = await getConnection();
        const result = await db.query('SELECT @@VERSION AS version');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    console.log('Server running on port $',{port});
    await getConnection(); // <-- тут перевірка підключення
});
