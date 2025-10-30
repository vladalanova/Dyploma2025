require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const odbc = require('odbc');
const { requireAuth, requireRole, generateToken } = require('./routes/auth.js');

const app = express();
app.disable('x-powered-by');


const PORT = process.env.PORT || 8080;

// ============================================
// CORS КОНФІГУРАЦІЯ
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

// ============================================
// DATABASE CONNECTION
// ============================================
const connectionString = `
Driver={ODBC Driver 17 for SQL Server};
Server=DESKTOP-N103H81\\SQLEXPRESS;
Database=Medical_Blockchain;
Trusted_Connection=Yes;
`;

async function getConnection() {
    try {
        const connection = await odbc.connect(connectionString);
        console.log("Підключено до бази даних!");
        return connection;
    } catch (err) {
        console.error("Помилка підключення до БД:", err);
        throw err;
    }
}

// ============================================
// API ROUTES
// ============================================

// Тестовий маршрут API
app.get('/api', (req, res) => {
    res.json({ message: 'API працює!' });
});

// Тест БД
app.get('/api/test', async (req, res) => {
    try {
        const db = await getConnection();
        const result = await db.query('SELECT @@VERSION AS version');
        await db.close();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =================== AUTH ===================

// Реєстрація
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, username, email, password, role } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Всі поля обов\'язкові'
            });
        }

        const db = await getConnection();

        const existingUser = await db.query(
            `SELECT * FROM Users WHERE Username = ? OR Email = ?`,
            [username, email]
        );

        if (existingUser.length > 0) {
            await db.close();
            return res.status(400).json({
                success: false,
                error: 'Користувач з таким логіном або email вже існує'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(`
            INSERT INTO Users (Username, PasswordHash, Email, FullName, Role, CreatedAt)
            VALUES (?, ?, ?, ?, ?, GETDATE())
        `, [username, hashedPassword, email, fullName, role || 'Doctor']);

        const result = await db.query(
            'SELECT * FROM Users WHERE Username = ?',
            [username]
        );

        await db.close();

        const user = result[0];

        res.json({
            success: true,
            message: 'Користувач успішно зареєстрований',
            user: {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                role: user.Role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Помилка сервера при реєстрації'
        });
    }
});

// Вхід
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Логін та пароль обов\'язкові'
            });
        }

        const db = await getConnection();

        const result = await db.query(
            'SELECT * FROM Users WHERE Username = ?',
            [username]
        );

        if (result.length === 0) {
            await db.close();
            return res.status(401).json({
                success: false,
                error: 'Невірний логін або пароль'
            });
        }

        const user = result[0];
        const isValid = await bcrypt.compare(password, user.PasswordHash);

        if (!isValid) {
            await db.close();
            return res.status(401).json({
                success: false,
                error: 'Невірний логін або пароль'
            });
        }

        await db.query(
            'UPDATE Users SET LastLogin = GETDATE() WHERE UserID = ?',
            [user.UserID]
        );

        await db.close();

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                fullName: user.FullName,
                role: user.Role,
                ethereumAddress: user.EthereumAddress
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Помилка сервера при вході'
        });
    }
});

// Перевірка токену
app.get('/api/auth/verify', requireAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ============================================
// PATIENTS API ROUTES
// ============================================

// Створення пацієнта
app.post('/api/patients', requireAuth, async (req, res) => {
    try {
        const { passport, medicalCard, heightEncrypted, weightEncrypted, 
                sessionsEncrypted, patientID, txHash, blockNumber } = req.body;
        
        console.log('=== РЕЄСТРАЦІЯ ПАЦІЄНТА В БД ===');
        console.log('PatientID:', patientID);
        console.log('Passport:', passport);
        console.log('MedicalCard:', medicalCard);
        
        // Валідація
        if (!patientID || !passport || !medicalCard || !heightEncrypted || !weightEncrypted || !sessionsEncrypted) {
            return res.status(400).json({
                success: false,
                error: 'Всі поля обов\'язкові'
            });
        }
        
        const db = await getConnection();
        
        // Перевіряємо дублікат
        const existing = await db.query(
            'SELECT PatientID FROM Patients WHERE PatientID = ?',
            [patientID]
        );
        
        if (existing.length > 0) {
            await db.close();
            return res.status(400).json({
                success: false,
                error: 'Пацієнт з таким ID вже існує'
            });
        }
        
        // INSERT без OUTPUT (для сумісності з ODBC)
        await db.query(`
            INSERT INTO Patients 
            (PatientID, Passport, MedicalCard, HeightEncrypted, WeightEncrypted, 
             ChemotherapySessionsEncrypted, TxHash, BlockNumber, CreatedBy, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
        `, [patientID, passport, medicalCard, heightEncrypted, weightEncrypted, 
            sessionsEncrypted, txHash || null, blockNumber || 0, req.user.id]);
        
        console.log('✅ INSERT виконано');
        
        // Отримуємо доданий запис окремим SELECT
        const result = await db.query(
            'SELECT * FROM Patients WHERE PatientID = ?',
            [patientID]
        );
        
        await db.close();
        
        console.log('✅ Пацієнт збережено:', result[0]);
        
        res.json({
            success: true,
            patient: result[0]
        });
    } catch (error) {
        console.error('Store patient error:', error);
        console.error('ODBC Errors:', error.odbcErrors);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Оновлення пацієнта (txHash)
app.put('/api/patients/:patientID', requireAuth, async (req, res) => {
    try {
        const { patientID } = req.params;
        const { txHash, blockNumber } = req.body;
        
        const db = await getConnection();
        
        await db.query(`
            UPDATE Patients 
            SET TxHash = ?, 
                BlockNumber = ?,
                UpdatedAt = GETDATE()
            WHERE PatientID = ?
        `, [txHash, blockNumber || 0, patientID]);
        
        // Окремий SELECT
        const result = await db.query(
            'SELECT * FROM Patients WHERE PatientID = ?',
            [patientID]
        );
        
        await db.close();
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пацієнт не знайдений'
            });
        }
        
        res.json({
            success: true,
            patient: result[0]
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Збереження розрахованої дози
app.post('/api/patients/:patientID/dose', requireAuth, async (req, res) => {
    try {
        const { patientID } = req.params;
        const { doseEncrypted, doseDecrypted, txHash, doseCoefficient } = req.body;

        console.log('=== ЗБЕРЕЖЕННЯ ДОЗИ ===');
        console.log('PatientID:', patientID);
        console.log('DoseDecrypted:', doseDecrypted);
        console.log('DoseCoefficient:', doseCoefficient);

        // Валідація
        if (isNaN(parseFloat(doseDecrypted))) {
            return res.status(400).json({
                success: false,
                error: 'Invalid DoseDecrypted value'
            });
        }

        const db = await getConnection();
        
        // Перевіряємо пацієнта
        const patientCheck = await db.query(
            'SELECT PatientID FROM Patients WHERE PatientID = ?',
            [patientID]
        );
        
        if (patientCheck.length === 0) {
            await db.close();
            return res.status(404).json({
                success: false,
                error: 'Пацієнт не знайдений в БД'
            });
        }

        // INSERT без OUTPUT
        await db.query(`
            INSERT INTO DoseCalculations 
            (PatientID, DoseEncrypted, DoseDecrypted, DoseCoefficient, 
             TxHash, CalculatedBy, CalculatedAt)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        `, [
            patientID,
            doseEncrypted || null,
            parseFloat(doseDecrypted),
            parseFloat(doseCoefficient),
            txHash || null,
            req.user.id
        ]);

        // Отримуємо останній запис
        const result = await db.query(`
            SELECT TOP 1 * FROM DoseCalculations 
            WHERE PatientID = ? 
            ORDER BY CalculatedAt DESC
        `, [patientID]);

        await db.close();

        console.log('✅ Доза збережена:', result[0]);

        res.json({
            success: true,
            dose: result[0]
        });
        
    } catch (error) {
        console.error('Помилка при збереженні дози:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Оновлення сесій
app.put('/api/patients/:patientID/sessions', requireAuth, async (req, res) => {
    try {
        const { patientID } = req.params;
        const { sessionsEncrypted, txHash } = req.body;
        
        const db = await getConnection();
        
        await db.query(`
            UPDATE Patients 
            SET ChemotherapySessionsEncrypted = ?,
                UpdatedAt = GETDATE()
            WHERE PatientID = ?
        `, [sessionsEncrypted, patientID]);
        
        // Окремий SELECT
        const result = await db.query(
            'SELECT * FROM Patients WHERE PatientID = ?',
            [patientID]
        );
        
        // Лог аудиту
        await db.query(`
            INSERT INTO AuditLog (UserID, Action, Details, Timestamp)
            VALUES (?, ?, ?, GETDATE())
        `, [req.user.id, 'UPDATE_SESSIONS', JSON.stringify({ patientID, txHash })]);
        
        await db.close();
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пацієнт не знайдений'
            });
        }
        
        res.json({
            success: true,
            patient: result[0]
        });
    } catch (error) {
        console.error('Update sessions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// СТАТИЧНІ ФАЙЛИ ТА HTML - НАПРИКІНЦІ!
// ============================================
app.use(express.static(path.join(__dirname, 'public')));

// HTML маршрути (fallback)
const staticLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Занадто часті запити до статичних файлів.'
});

app.use('/', staticLimiter, express.static(path.join(__dirname, 'public')));


//app.get('/login', (req, res) => {
    //res.sendFile(path.join(__dirname, 'public', 'login.html'));
//});

//app.get('/register', (req, res) => {
    //res.sendFile(path.join(__dirname, 'public', 'register.html'));
//});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, async () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`API доступне на http://localhost:${PORT}/api`);
    
    // Тестуємо підключення до БД
    try {
        await getConnection();
    } catch (err) {
        console.error('Не вдалося підключитися до БД при старті');
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nЗупинка сервера...');
    process.exit(0);

});

