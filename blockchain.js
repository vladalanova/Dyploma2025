const CONTRACT_ABI = [
{
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSessionsEncrypted",
          "type": "uint256"
        }
      ],
      "name": "ChemotherapySessionUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "doseEncrypted",
          "type": "uint256"
        }
      ],
      "name": "DoseCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "n",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "nSquared",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "g",
          "type": "uint256"
        }
      ],
      "name": "PaillierParamsSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "PatientDataRetrieved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "heightEncrypted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "weightEncrypted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chemotherapySessionsEncrypted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PatientDataStored",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "g",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "n",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "nSquared",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_n",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_nSquared",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_g",
          "type": "uint256"
        }
      ],
      "name": "setPaillierParams",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "c1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "c2",
          "type": "uint256"
        }
      ],
      "name": "paillierAdd",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "c",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "k",
          "type": "uint256"
        }
      ],
      "name": "paillierMultiply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "base",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "exponent",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "modulus",
          "type": "uint256"
        }
      ],
      "name": "modExp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "heightEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "weightEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "chemotherapySessionsEncrypted",
          "type": "uint256"
        }
      ],
      "name": "storePatientData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "retrievePatientData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "heightEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "weightEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "chemotherapySessionsEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "weightDecrypted",
          "type": "uint256"
        }
      ],
      "name": "calculateDoseMosteller",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "heightWeightProduct",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "getEncryptedDataForDose",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "heightEncrypted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "weightEncrypted",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "encryptedOne",
          "type": "uint256"
        }
      ],
      "name": "updateChemotherapySessions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "patientExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "getChemotherapySessions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "patientID",
          "type": "bytes32"
        }
      ],
      "name": "getPatientTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getPaillierParams",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
];

const GANACHE_RPC = "http://127.0.0.1:7545";
const CONTRACT_ADDRESS = "0x67F141a0D47504A1347DD06e31edC7FDdb1eD7Ea";
const PRIVATE_KEY = "";

let provider = null;
let wallet = null;
let contract = null;

const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

function hexToBigInt(value) {
    if (typeof value === 'string' && value.startsWith('0x')) {
        return BigInt(value);
    }
    return BigInt(value);
}

// Обмеження до uint256
function limitToBigIntSize(value) {
    const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    
    let bigIntValue;
    
    // Конвертація в BigInt
    if (typeof value === 'string' && value.startsWith('0x')) {
        bigIntValue = BigInt(value);
    } else if (typeof value === 'string') {
        bigIntValue = BigInt(value);
    } else if (typeof value === 'bigint') {
        bigIntValue = value;
    } else {
        bigIntValue = BigInt(value.toString());
    }
    
    // ОБМЕЖЕННЯ до uint256
    if (bigIntValue > MAX_UINT256) {
        console.warn(`⚠️ Значення перевищує uint256: ${bigIntValue.toString().substring(0, 50)}...`);
        console.warn(`Обрізаємо до uint256 через модуль`);
        bigIntValue = bigIntValue % MAX_UINT256;
    }
    
    return bigIntValue;
}


async function estimateGasWithFallback(contract, methodName, args) {
    try {
        const gasEstimate = await contract[methodName].estimateGas(...args);
        return gasEstimate;
    } catch (error) {
        console.warn(`Gas estimation failed for ${methodName}:`, error.message || error);
        return BigInt(500000);
    }
}

function parseContractError(error) {
    if (error.message && error.message.includes("revert")) {
        if (error.message.includes("Patient not found")) {
            return "Пацієнт не знайдений в системі";
        } else if (error.message.includes("Invalid patient ID")) {
            return "Невірний ID пацієнта";
        } else if (error.message.includes("Patient already exists")) {
            return "Пацієнт вже існує в системі";
        } else if (error.message.includes("Paillier params not set")) {
            return "Параметри Paillier не встановлені. Спочатку ініціалізуйте систему.";
        }
    }
    if (error.code === "CALL_EXCEPTION") {
        return "Помилка виклику контракту. Можливо, пацієнт не існує або невірні параметри";
    }
    return error.message || "Невідома помилка контракту";
}

// У blockchain.js
async function initializeBlockchain() {
    try {
        console.log('=== ІНІЦІАЛІЗАЦІЯ БЛОКЧЕЙНУ ===');
        
        // 1. Ініціалізуємо Paillier
        if (!initializePaillierKeys()) {
            throw new Error('Paillier keys failed');
        }
        
        // 2. Підключення до Ganache
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
        
        const privateKey = '';
        wallet = new ethers.Wallet(privateKey, provider);
        
        const contractAddress = '0x67F141a0D47504A1347DD06e31edC7FDdb1eD7Ea';
        contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
        
        console.log('✅ Підключено до Ganache');
        
        // 3. Перевірка і синхронізація параметрів
        const [contractN, contractN2, contractG] = await contract.getPaillierParams();
        
        console.log('\n=== ПЕРЕВІРКА ПАРАМЕТРІВ ===');
        
        if (contractN.toString() === '0') {
            console.log('⚠️ Параметри не встановлені, встановлюємо...');
            const result = await setPaillierParamsOnChain();
            
            if (!result.success) {
                throw new Error('Не вдалося встановити параметри');
            }
            
            console.log('✅ Параметри встановлені');
        } else {
            // Перевіряємо відповідність
            const nMatch = contractN.toString() === globalPublicKey.n.toString();
            const n2Match = contractN2.toString() === globalPublicKey._n2.toString();
            const gMatch = contractG.toString() === globalPublicKey.g.toString();
            
            console.log('Клієнт n:', globalPublicKey.n.toString().substring(0, 30) + '...');
            console.log('Контракт n:', contractN.toString().substring(0, 30) + '...');
            console.log('Співпадають: n=' + (nMatch ? '✅' : '❌') + 
                       ' n²=' + (n2Match ? '✅' : '❌') + 
                       ' g=' + (gMatch ? '✅' : '❌'));
            
            if (!nMatch || !n2Match || !gMatch) {
                console.error('❌ Параметри не співпадають!');
                
                if (confirm('Параметри в контракті не співпадають з локальними ключами.\nОчистити localStorage і перегенерувати ключі?')) {
                    localStorage.clear();
                    location.reload();
                    return false;
                }
                
                throw new Error('Параметри не синхронізовані');
            }
            
            console.log('✅ Параметри синхронізовані');
        }
        
        // 4. Тест гомоморфного додавання
        console.log('\n=== ТЕСТ СИСТЕМИ ===');
        const testPassed = await quickTest();
        
        if (!testPassed) {
            throw new Error('Тест системи провалено');
        }
        
        console.log('✅ Система готова до роботи\n');
        return true;
        
    } catch (error) {
        console.error('❌ Помилка ініціалізації:', error);
        showAlert('error', error.message);
        return false;
    }
}
async function quickTest() {
    try {
        console.log('Тест 1: Шифрування/розшифрування...');
        const e5 = globalPublicKey.encrypt(5);
        const d5 = globalPrivateKey.decrypt(e5.toString());
        
        if (Math.abs(d5 - 5) > 0.01) {
            console.error('❌ Тест 1 провалено:', d5, '!== 5');
            return false;
        }
        console.log('✅ Тест 1: 5 -> encrypt -> decrypt -> ', d5);
        
        console.log('Тест 2: Гомоморфне додавання (локально)...');
        const e3 = globalPublicKey.encrypt(3);
        const e2 = globalPublicKey.encrypt(2);
        const e5_sum = globalPublicKey.add(e3.toString(), e2.toString());
        const d5_sum = globalPrivateKey.decrypt(e5_sum.toString());
        
        if (Math.abs(d5_sum - 5) > 0.01) {
            console.error('❌ Тест 2 провалено:', d5_sum, '!== 5');
            return false;
        }
        console.log('✅ Тест 2: E(3) + E(2) -> ', d5_sum);
        
        console.log('Тест 3: Гомоморфне додавання (контракт)...');
        const e3_hex = '0x' + bigInt(e3).toString(16);
        const e2_hex = '0x' + bigInt(e2).toString(16);
        
        const e5_contract = await contract.paillierAdd(e3_hex, e2_hex);
        const d5_contract = globalPrivateKey.decrypt(e5_contract.toString());
        
        if (Math.abs(d5_contract - 5) > 0.01) {
            console.error('❌ Тест 3 провалено:', d5_contract, '!== 5');
            console.error('E(3):', e3.toString());
            console.error('E(2):', e2.toString());
            console.error('Contract result:', e5_contract.toString());
            return false;
        }
        console.log('✅ Тест 3: Contract.add(E(3), E(2)) -> ', d5_contract);
        
        console.log('✅ Всі тести пройдено!');
        return true;
        
    } catch (error) {
        console.error('❌ Помилка тесту:', error);
        return false;
    }
}
async function setPaillierParamsOnChain() {
    try {
        if (!globalPublicKey) {
            throw new Error("Спочатку ініціалізуйте Paillier ключі");
        }
        
        const n = globalPublicKey.n.toString();
        const nSquared = globalPublicKey._n2.toString();
        const g = globalPublicKey.g.toString();
        
        const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        const nBigInt = BigInt(n);
        const nSquaredBigInt = BigInt(nSquared);
        const gBigInt = BigInt(g);
        
        if (nBigInt > maxUint256) {
            throw new Error(`n занадто велике для uint256! n має ${n.length} цифр, max 77 цифр`);
        }
        if (nSquaredBigInt > maxUint256) {
            throw new Error(`n² занадто велике для uint256! n² має ${nSquared.length} цифр, max 77 цифр`);
        }
        if (gBigInt > maxUint256) {
            throw new Error(`g занадто велике для uint256!`);
        }
        
        console.log('Встановлення параметрів Paillier:');
        console.log('n:', n.substring(0, 30) + '... (' + n.length + ' digits)');
        console.log('n²:', nSquared.substring(0, 30) + '... (' + nSquared.length + ' digits)');
        console.log('g:', g.substring(0, 30) + '... (' + g.length + ' digits)');
        console.log('✅ Всі значення в межах uint256');
        
        const gasEstimate = await estimateGasWithFallback(contract, 'setPaillierParams', [
            n, nSquared, g
        ]);
        
        const tx = await contract.setPaillierParams(
            n, nSquared, g,
            { gasLimit: gasEstimate * BigInt(120) / BigInt(100) }
        );
        
        await tx.wait();
        
        console.log('Параметри Paillier успішно встановлені');
        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error('Помилка встановлення параметрів Paillier:', error);
        return { success: false, error: parseContractError(error) };
    }
}

/**
 * ВИПРАВЛЕНО: Зберегти дані пацієнта (bytes32 замість uint256)
 */
/**
 * ВИПРАВЛЕНО: Конвертація великих чисел у hex для ethers.js
 */
async function storePatientDataOnChain(patientID, height, weight, chemotherapySessions) {
    try {
        // Перевіряємо формат patientID
        if (!patientID.startsWith('0x') || patientID.length !== 66) {
            throw new Error(`Невірний формат patientID: ${patientID}`);
        }

        // Логування збереження даних у відкритому вигляді
        console.log('📦 Збереження даних пацієнта:');
        console.log('Patient ID (bytes32):', patientID);
        console.log('Height (open):', height);
        console.log('Weight (open):', weight);
        console.log('Sessions (open):', chemotherapySessions);

        // Перевірка чи існує пацієнт
        const existsResult = await patientExistsOnChain(patientID);
        if (existsResult.success && existsResult.exists) {
            throw new Error("Пацієнт вже існує в системі");
        }

        // Зберігаємо відкриті дані в БД
        const db = await getConnection();
        const result = await db.query(`
            INSERT INTO Patients 
            (PatientID, Height, Weight, ChemotherapySessions, CreatedAt)
            OUTPUT INSERTED.*
            VALUES (?, ?, ?, ?, GETDATE())
        `, [patientID, height, weight, chemotherapySessions]);

        await db.close();

        console.log('✅ Дані успішно збережено в базі даних');
        
        // Тепер шифруємо ці ж значення перед відправкою в блокчейн
        console.log('Шифрування даних для блокчейну...');
        const heightEncrypted = globalPublicKey.encrypt(height);
        const weightEncrypted = globalPublicKey.encrypt(weight);
        const sessionsEncrypted = globalPublicKey.encrypt(chemotherapySessions);

        console.log('Шифровані дані готові для блокчейну:');
        console.log('Encrypted Height:', heightEncrypted.toString().substring(0, 30) + '...');
        console.log('Encrypted Weight:', weightEncrypted.toString().substring(0, 30) + '...');
        console.log('Encrypted Sessions:', sessionsEncrypted.toString().substring(0, 30) + '...');

        // Оцінка газу для транзакції
        console.log('⛽ Оцінка газу...');
        const gasEstimate = await estimateGasWithFallback(contract, 'storePatientData', [
            patientID,
            heightEncrypted.toString(),
            weightEncrypted.toString(),
            sessionsEncrypted.toString()
        ]);

        // Відправка транзакції на блокчейн
        console.log('📝 Відправка транзакції...');
        const tx = await contract.storePatientData(
            patientID,
            heightEncrypted.toString(),
            weightEncrypted.toString(),
            sessionsEncrypted.toString(),
            { gasLimit: gasEstimate * BigInt(120) / BigInt(100) }
        );

        // Очікування підтвердження транзакції
        console.log('⏳ Очікування підтвердження...');
        const receipt = await tx.wait();
        
        console.log('✅ Дані успішно збережено в блокчейні');
        console.log('TX Hash:', tx.hash);
        console.log('Block:', receipt.blockNumber);

        return { 
            success: true, 
            patientID: patientID,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('❌ Store patient data error:', error);
        return { success: false, error: parseContractError(error) };
    }
}

async function retrievePatientDataFromChain(patientID) {
    try {
        //const patientIDBigInt = limitToBigIntSize(patientID);
        const existsResult = await patientExistsOnChain(patientID);
        
        if (existsResult.success && !existsResult.exists) {
            throw new Error("Пацієнт не знайдений в системі");
        }
        
        const result = await contract.retrievePatientData(patientIDBigInt);
        
        return {
            success: true,
            data: {
                heightEncrypted: result[0].toString(),
                weightEncrypted: result[1].toString(),
                chemotherapySessionsEncrypted: result[2].toString(),
                timestamp: result[3].toString()
            }
        };
    } catch (error) {
        return { success: false, error: parseContractError(error) };
    }
}

/**
 * HELPER: Універсальна конвертація BigInteger в JavaScript число без масштабування
 */
function bigIntToNumber(value) {
    if (typeof value === 'number') {
        return value;
    }
    
    if (typeof value === 'string') {
        return parseFloat(value);
    }
    
    if (typeof value === 'object' && value !== null) {
        // Перевірка на BigInteger з big-integer бібліотеки
        if (typeof value.toJSNumber === 'function') {
            return value.toJSNumber();
        }
        
        // Перевірка на звичайний BigInt
        if (typeof value === 'bigint') {
            return Number(value);
        }
        
        // Спроба конвертації через toString
        if (typeof value.toString === 'function') {
            const str = value.toString();
            const num = parseFloat(str);
            if (!isNaN(num)) {
                return num;
            }
        }
    }
    
    // Фоллбек
    return Number(value);
}

async function calculateDoseOnChain(patientIDBytes32, weight, doseCoefficient) {
    try {
        console.log('=== РОЗРАХУНОК ДОЗИ (ГОМОМОРФНО) ===');
        console.log('Patient ID:', patientIDBytes32);
        console.log('Вага:', weight, 'кг');
        console.log('Коефіцієнт:', doseCoefficient, 'мг/м²');
        
        // Отримуємо зашифровані дані
        console.log('📥 Отримання зашифрованих даних...');
        const encryptedData = await contract.getEncryptedDataForDose(patientIDBytes32);
        const heightEncrypted = encryptedData[0];
        const weightEncryptedFromChain = encryptedData[1];
        
        console.log('Encrypted Height:', heightEncrypted.toString().substring(0, 30) + '...');
        console.log('Encrypted Weight:', weightEncryptedFromChain.toString().substring(0, 30) + '...');
        
        // Розшифровуємо вагу для перевірки
        console.log('🔓 Розшифрування ваги...');
        const weightFromChain = Number(globalPrivateKey.decrypt(weightEncryptedFromChain));
        console.log('⚖️ Вага з блокчейну:', weightFromChain, 'кг');
        
        // Перевірка
        if (Math.abs(weightFromChain - weight) > 1) {
            console.warn('⚠️ Вага не співпадає!', weightFromChain, 'vs', weight);
        }
        
        // Гомоморфне множення: E(height) × weight
        console.log('🧮 Гомоморфне множення: E(height) × weight...');
        const productEncrypted = globalPublicKey.multiply(
            heightEncrypted,
            weight  // ВАЖЛИВО: Використовуємо weight, а не doseCoefficient!
        );
        
        console.log('Encrypted Product:', productEncrypted.toString().substring(0, 30) + '...');
        
        // Розшифровуємо добуток
        console.log('🔓 Розшифрування добутку...');
        const heightWeightProduct = Number(globalPrivateKey.decrypt(productEncrypted));
        console.log('✖️ Height × Weight:', heightWeightProduct);
        
        // Перевірка розумності
        if (heightWeightProduct < 5000 || heightWeightProduct > 50000) {
            console.warn('⚠️ Підозріле значення добутку:', heightWeightProduct);
        }
        
        // Розрахунок BSA за формулою Мостеллера
        console.log('📐 Розрахунок BSA...');
        const bsa = Math.sqrt(heightWeightProduct / 3600);
        console.log(`   BSA = √(${heightWeightProduct} / 3600) = ${bsa.toFixed(4)} м²`);
        
        // Перевірка BSA
        if (bsa < 0.5 || bsa > 3.5) {
            console.warn('⚠️ BSA поза нормальним діапазоном:', bsa.toFixed(4), 'м²');
        }
        
        // Розрахунок дози: Доза = BSA × коефіцієнт
        console.log('💊 Коефіцієнт:', doseCoefficient, 'мг/м²');
        const calculatedDose = bsa * doseCoefficient;
        console.log('💊 Доза:', calculatedDose.toFixed(2), 'мг');
        
        // Шифруємо фінальну дозу для БД
        const doseEncrypted = globalPublicKey.encrypt(Math.round(calculatedDose));
        
        return {
            success: true,
            patientIDHash: patientIDBytes32,
            heightWeightProduct: heightWeightProduct,
            bsa: bsa.toFixed(4),
            calculatedDose: calculatedDose.toFixed(2),
            doseCoefficient: doseCoefficient,
            doseEncryptedForDB: doseEncrypted.toString()
        };
        
    } catch (error) {
        console.error('❌ Помилка розрахунку дози:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
/**
 * ВИПРАВЛЕНО: Оновлення сесій (bytes32)
 */
async function updateChemotherapySessionsOnChain(patientID) {
    try {
        // 1. Отримуємо поточні зашифровані сесії
        const currentSessionsEncrypted = await contract.getChemotherapySessions(patientID);
        console.log('Поточні сесії (зашифровано):', currentSessionsEncrypted.toString());
        
        // Розшифровуємо для показу
        const currentSessions = globalPrivateKey.decrypt(currentSessionsEncrypted.toString());
        console.log('Поточні сесії (розшифровано):', currentSessions);
        
        // 2. Шифруємо 1
        const encryptedOne = globalPublicKey.encrypt(1);
        console.log('E(1):', encryptedOne.toString());
        
        // 3. Перевірка: розшифровуємо E(1) щоб переконатись що це 1
        const checkOne = globalPrivateKey.decrypt(encryptedOne.toString());
        console.log('Перевірка E(1) після розшифрування:', checkOne);
        
        if (Math.abs(checkOne - 1) > 0.01) {
            throw new Error(`E(1) розшифровується як ${checkOne}, а має бути 1!`);
        }
        
        // 4. Конвертуємо в hex і відправляємо в контракт
        const encryptedOneHex = toHex(encryptedOne);
        
        console.log('Відправка в контракт...');
        console.log('patientID:', patientID);
        console.log('encryptedOne (hex):', encryptedOneHex);
        
        // 5. Викликаємо контракт (він сам зробить додавання)
        const tx = await contract.updateChemotherapySessions(
            patientID,
            encryptedOneHex,
            { gasLimit: 300000 }
        );
        
        console.log('Транзакція відправлена, очікування підтвердження...');
        const receipt = await tx.wait();
        console.log('Транзакція підтверджена:', receipt.transactionHash);
        
        // 6. Отримуємо оновлене значення з контракту
        const newSessionsEncrypted = await contract.getChemotherapySessions(patientID);
        console.log('Нові сесії з контракту (зашифровано):', newSessionsEncrypted.toString());
        
        // 7. Розшифровуємо
        const newSessions = globalPrivateKey.decrypt(newSessionsEncrypted.toString());
        console.log('Нові сесії (розшифровано):', newSessions);
        
        // 8. Перевірка
        const expected = currentSessions + 1;
        console.log(`Очікувалось: ${expected}, отримано: ${newSessions}`);
        
        if (Math.abs(newSessions - expected) > 0.01) {
            console.warn(`⚠️ Невідповідність: очікувалось ${expected}, але отримано ${newSessions}`);
        } else {
            console.log(`✅ Сесія додана коректно: ${currentSessions} → ${newSessions}`);
        }
        
        return {
            success: true,
            newSessionsEncrypted: newSessionsEncrypted.toString(),
            sessionsDecrypted: newSessions,
            txHash: receipt.transactionHash
        };
        
    } catch (error) {
        console.error('❌ Помилка оновлення сесій:', error);
        showAlert('error', `❌ ${error.message}`);
        
        return {
            success: false,
            error: error.message
        };
    }
}
/**
 * ВИПРАВЛЕНО: Перевірка існування пацієнта (bytes32)
 */
async function patientExistsOnChain(patientID) {
    try {
        // patientID - hex string (bytes32), НЕ конвертуємо в BigInt
        const exists = await contract.patientExists(patientID);
        return { success: true, exists };
    } catch (error) {
        return { success: true, exists: false };
    }
}

async function diagnoseContractConnection() {
    try {
        console.log('=== Діагностика підключення ===');
        console.log('Provider:', provider ? 'OK' : 'FAILED');
        console.log('Wallet:', wallet ? 'OK' : 'FAILED');
        console.log('Contract:', contract ? 'OK' : 'FAILED');
        
        if (provider) {
            const blockNumber = await provider.getBlockNumber();
            console.log('Current block:', blockNumber);
        }
        
        if (wallet) {
            const balance = await provider.getBalance(wallet.address);
            console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
        }
        
        if (contract) {
            try {
                const params = await contract.getPaillierParams();
                console.log('Paillier params:', {
                    n: params[0].toString().substring(0, 20) + '...',
                    nSquared: params[1].toString().substring(0, 20) + '...',
                    g: params[2].toString().substring(0, 20) + '...'
                });
            } catch (testError) {
                console.log('Paillier params not set yet');
            }
        }
        
        console.log('=== Діагностика завершена ===');
    } catch (error) {
        console.error('Діагностика не вдалася:', error);
    }
}
async function debugFullEncryptionFlow() {
    console.log('\n\n=== ПОВНА ДІАГНОСТИКА СИСТЕМИ ===\n');
    
    // 1. Перевірка параметрів
    console.log('1️⃣ ПЕРЕВІРКА ПАРАМЕТРІВ');
    const paramsContract = await contract.getPaillierParams();
    const jsN = globalPublicKey.n.toString();
    const contractN = paramsContract[0].toString();
    
    console.log('JS n:', jsN.substring(0, 40) + '...');
    console.log('Contract n:', contractN.substring(0, 40) + '...');
    console.log('Співпадає:', jsN === contractN);
    
    if (jsN !== contractN) {
        console.error('❌ ПАРАМЕТРИ НЕ СПІВПАДАЮТЬ! Зупиняюсь.');
        return;
    }
    
    // 2. Тест локального шифрування
    console.log('\n2️⃣ ТЕСТ ЛОКАЛЬНОГО ШИФРУВАННЯ');
    const testValues = [0, 1, 5, 42];
    
    for (const val of testValues) {
        const enc = globalPublicKey.encrypt(val);
        const dec = Number(globalPrivateKey.decrypt(enc));
        console.log(`${val} → encrypt → decrypt → ${dec} | OK: ${dec === val}`);
        
        if (dec !== val) {
            console.error(`❌ Локальне шифрування НЕ працює для ${val}!`);
            return;
        }
    }
    
    // 3. Тест локального гомоморфного додавання
    console.log('\n3️⃣ ТЕСТ ЛОКАЛЬНОГО ГОМОМОРФНОГО ДОДАВАННЯ');
    const e0 = globalPublicKey.encrypt(0);
    const e1 = globalPublicKey.encrypt(1);
    const e0plus1_local = globalPublicKey.add(e0, e1);
    const result_local = Number(globalPrivateKey.decrypt(e0plus1_local));
    
    console.log('E(0) + E(1) локально = ', result_local);
    console.log('Очікується: 1');
    console.log('OK:', result_local === 1);
    
    if (result_local !== 1) {
        console.error('❌ Локальне гомоморфне додавання НЕ працює!');
        console.log('Проблема в бібліотеці Paillier або в precision');
        return;
    }
    
    // 4. Тест гомоморфного додавання через контракт
    console.log('\n4️⃣ ТЕСТ ГОМОМОРФНОГО ДОДАВАННЯ ЧЕРЕЗ КОНТРАКТ');
    const e0_new = globalPublicKey.encrypt(0);
    const e1_new = globalPublicKey.encrypt(1);
    
    console.log('E(0):', e0_new.toString().substring(0, 40) + '...');
    console.log('E(1):', e1_new.toString().substring(0, 40) + '...');
    
    const e0plus1_contract = await contract.paillierAdd(
        e0_new.toString(), 
        e1_new.toString()
    );
    
    console.log('E(0+1) з контракту:', e0plus1_contract.toString().substring(0, 40) + '...');
    
    const result_contract = Number(globalPrivateKey.decrypt(BigInt(e0plus1_contract)));
    console.log('Розшифровано:', result_contract);
    console.log('Очікується: 1');
    console.log('OK:', result_contract === 1);
    
    if (result_contract !== 1) {
        console.error('❌ Гомоморфне додавання через контракт НЕ працює!');
        console.error('Можливі причини:');
        console.error('- Параметри n² в контракті неправильні');
        console.error('- Функція paillierAdd в контракті має баг');
        console.error('- Overflow в обчисленнях Solidity');
        return;
    }
    
    // 5. Тест реального сценарію з сесіями
    console.log('\n5️⃣ ТЕСТ РЕАЛЬНОГО СЦЕНАРІЮ (СИМУЛЯЦІЯ СЕСІЙ)');
    
    // Симулюємо початкове значення sessions = 0
    const sessions0 = globalPublicKey.encrypt(0);
    console.log('Початкові сесії E(0):', sessions0.toString().substring(0, 40) + '...');
    
    // Перевірка розшифрування
    const sessions0_dec = Number(globalPrivateKey.decrypt(sessions0));
    console.log('Розшифровано початкові сесії:', sessions0_dec);
    
    if (sessions0_dec !== 0) {
        console.error('❌ Початкове значення сесій != 0!');
        return;
    }
    
    // Додаємо 1 через контракт
    const addOne = globalPublicKey.encrypt(1);
    console.log('Додаємо E(1):', addOne.toString().substring(0, 40) + '...');
    
    const sessions1 = await contract.paillierAdd(
        sessions0.toString(),
        addOne.toString()
    );
    console.log('Результат E(0+1):', sessions1.toString().substring(0, 40) + '...');
    
    const sessions1_dec = Number(globalPrivateKey.decrypt(BigInt(sessions1)));
    console.log('Розшифровано після додавання:', sessions1_dec);
    console.log('Очікується: 1');
    console.log('OK:', sessions1_dec === 1);
    
    if (sessions1_dec !== 1) {
        console.error('❌ СИМУЛЯЦІЯ СЕСІЙ НЕ ПРАЦЮЄ!');
        console.error('Отримано:', sessions1_dec);
        return;
    }
    
    console.log('\n✅✅✅ ВСІ ТЕСТИ ПРОЙДЕНО УСПІШНО! ✅✅✅');
    console.log('Система працює правильно. Проблема може бути в:');
    console.log('- Старих даних пацієнта (зареєстрованих з іншими ключами)');
    console.log('- Неправильному виклику функцій');
}

// Експортуємо для викликів з консолі

window.debugFullEncryptionFlow = debugFullEncryptionFlow;
