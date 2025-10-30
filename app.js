// ============================================
// UI FUNCTIONS
// ============================================
const API_URL = 'http://localhost:8080/api';
// Перевірка авторизації при завантаженні
function checkAuth() {
    const token = localStorage.getItem('token');
    const authStatus = document.getElementById('auth-status');
    const loginForm = document.getElementById('login-form');
    
    if (token) {
        // Перевіряємо токен
        fetch('http://localhost:8080/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                authStatus.innerHTML = `
                    <div style="color: green;">
                        ✅ Авторизовано: ${data.user.fullName} (${data.user.role})
                        <button onclick="logout()" style="margin-left: 10px; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Вийти
                        </button>
                    </div>
                `;
                loginForm.style.display = 'none';
            } else {
                // Токен невалідний
                localStorage.removeItem('token');
                showLoginForm();
            }
        })
        .catch(() => {
            showLoginForm();
        });
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    const authStatus = document.getElementById('auth-status');
    const loginForm = document.getElementById('login-form');
    
    authStatus.innerHTML = '<div style="color: orange;">⚠️ Не авторизовано. Дані не зберігатимуться в БД.</div>';
    loginForm.style.display = 'block';
}

async function quickLogin() {
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (!username || !password) {
        alert('Введіть логін і пароль');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            alert('✅ Успішний вхід!');
            checkAuth(); // Оновлюємо статус
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Помилка авторизації: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    alert('✅ Ви вийшли з системи');
    checkAuth();
}

// Викликаємо при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
function toHex(value) {
    try {
        const str = typeof value.toString === 'function' 
            ? value.toString() 
            : String(value);
        const bigIntValue = BigInt(str);
        const hex = '0x' + bigIntValue.toString(16);
        console.log(`   toHex: ${str.substring(0, 20)}... -> ${hex.substring(0, 20)}...`);
        return hex;
    } catch (error) {
        console.error('toHex error:', error);
        throw new Error(`Не вдалося конвертувати в hex: ${error.message}`);
    }
}
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

function getUsername() {
    return localStorage.getItem('username');
}

async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

function generatePatientID(passport, medicalCard) {
    const combined = passport + medicalCard;
    const patientID = ethers.keccak256(ethers.toUtf8Bytes(combined));
    console.log('🆔 Generated Patient ID:', patientID);
    return patientID;
}

function switchTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Ініціалізація системи
async function initializeSystem() {
    const initButton = document.querySelector('button[onclick="initializeSystem()"]');
    const loadingSpinner = document.getElementById('init-loading');

    if (initButton) initButton.disabled = true;
    if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
    if (initButton) initButton.innerHTML = '<span class="loading"></span> Ініціалізація...';

    try {
        console.log('=== ПОЧАТОК ІНІЦІАЛІЗАЦІЇ ===');
        
        // Крок 1: Генерація Paillier ключів
        console.log('🔑 Крок 1/2: Генерація Paillier ключів...');
        const keysGenerated = initializePaillierKeys();
        if (!keysGenerated) {
            throw new Error("Не вдалося згенерувати Paillier ключі");
        }
        
        // Крок 2: Підключення до блокчейну
        console.log('⛓️ Крок 2/2: Підключення до блокчейну...');
        const blockchainConnected = await initializeBlockchain();
        if (!blockchainConnected) {
            throw new Error("Не вдалося підключитися до блокчейну");
        }
        
        updateSystemStatus();
        showAlert('success', '✅ Система успішно ініціалізована!');
        
        await diagnoseContractConnection();
        
    } catch (error) {
        console.error('❌ Помилка ініціалізації:', error);
        showAlert('error', `❌ Помилка ініціалізації: ${error.message}`);
    } finally {
        if (initButton) initButton.disabled = false;
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (initButton) initButton.innerHTML = 'Ініціалізувати систему';
    }
}

function showAlert(type, message) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = message;
    alert.style.marginTop = '15px';
    
    const content = document.querySelector('.container');
    if (content) {
        content.insertBefore(alert, content.firstChild);
    }
    
    setTimeout(() => alert.remove(), 5000);
}

function updateSystemStatus() {
    const blockchainStatus = document.getElementById('blockchain-status');
    if (blockchainStatus) {
        blockchainStatus.textContent = 'Підключено';
        blockchainStatus.className = 'badge badge-success';
    }
    
    const keysStatus = document.getElementById('keys-status');
    if (keysStatus) {
        keysStatus.textContent = 'Згенеровано';
        keysStatus.className = 'badge badge-success';
    }
    
    const contractStatus = document.getElementById('contract-status');
    if (contractStatus) {
        contractStatus.textContent = 'Підключено';
        contractStatus.className = 'badge badge-success';
    }
}

// Збереження даних пацієнта
async function storePatientData(event) {
    event.preventDefault();
    
    const passport = document.getElementById('passport')?.value;
    const medicalCard = document.getElementById('medicalCard')?.value;
    const height = parseFloat(document.getElementById('height')?.value);
    const weight = parseFloat(document.getElementById('weight')?.value);
    
    // ✅ ДОДАЙТЕ ЦЕ:
    const initialSessions = parseInt(document.getElementById('initialSessions')?.value || '0');

    // Валідація
    if (!passport || !medicalCard || isNaN(height) || isNaN(weight)) {
        showAlert('error', '❌ Заповніть всі поля коректно');
        return;
    }
    
    // ✅ ДОДАЙТЕ валідацію для сесій:
    if (isNaN(initialSessions) || initialSessions < 0) {
        showAlert('error', '❌ Кількість сесій має бути >= 0');
        return;
    }

    if (!passport || !medicalCard || isNaN(height) || isNaN(weight)) {
        showAlert('error', '❌ Заповніть всі поля коректно');
        return;
    }

    if (height < 50 || height > 250) {
        showAlert('error', '❌ Висота повинна бути 50-250 см');
        return;
    }

    if (weight < 10 || weight > 300) {
        showAlert('error', '❌ Вага повинна бути 10-300 кг');
        return;
    }

    const regBtn = document.getElementById('reg-btn');
    const loadingSpinner = document.getElementById('reg-loading');
    
    if (regBtn) regBtn.disabled = true;
    if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
    if (regBtn) regBtn.innerHTML = '<span class="loading"></span> Реєстрація...';

    try {
        // 1. Перевірка ініціалізації
        if (!globalPublicKey || !globalPrivateKey || !contract) {
            throw new Error("Система не ініціалізована");
        }

        const patientIDBytes32 = generatePatientID(passport, medicalCard);
        console.log('🆔 Patient ID:', patientIDBytes32);

        // 2. ДОДАНО: Перевірка параметрів Paillier в контракті
        console.log('🔍 Перевірка параметрів Paillier...');
        const paillierParams = await contract.getPaillierParams();
        
        if (paillierParams[0].toString() === '0') {
            console.log('⚠️ Параметри Paillier не встановлені! Встановлюємо...');
            
            const nHex = '0x' + BigInt(globalPublicKey.n.toString()).toString(16);
            const nSquaredHex = '0x' + BigInt(globalPublicKey._n2.toString()).toString(16);
            const gHex = '0x' + BigInt(globalPublicKey.g.toString()).toString(16);
            
            console.log('Відправка параметрів Paillier...');
            const setParamsTx = await contract.setPaillierParams(
                nHex,
                nSquaredHex,
                gHex,
                { gasLimit: 200000 }
            );
            
            console.log('⏳ Очікування підтвердження параметрів...');
            await setParamsTx.wait();
            console.log('✅ Параметри Paillier встановлено в контракті');
        } else {
            console.log('✅ Параметри Paillier вже встановлені');
        }

        // 3. Перевірка чи пацієнт існує
        console.log('🔍 Перевірка чи пацієнт існує...');
        const exists = await contract.patientExists(patientIDBytes32);
        if (exists) {
            throw new Error('Пацієнт вже зареєстрований');
        }
        console.log('✅ Пацієнт не існує, можна реєструвати');

        // 4. Шифрування
    console.log('\n=== ШИФРУВАННЯ ===');
    console.log('Height:', height, 'см');
    console.log('Weight:', weight, 'кг');
    console.log('Initial sessions:', initialSessions); 

    const heightEncrypted = globalPublicKey.encrypt(height);
    const weightEncrypted = globalPublicKey.encrypt(weight);
    const sessionsEncrypted = globalPublicKey.encrypt(initialSessions);  

        // 5. Тест розшифрування
        const heightTest = globalPrivateKey.decrypt(heightEncrypted);
        const weightTest = globalPrivateKey.decrypt(weightEncrypted);
        
        console.log('✅ Тест: Height:', heightTest, 'Weight:', weightTest);

        if (Math.abs(heightTest - height) > 0.1 || Math.abs(weightTest - weight) > 0.1) {
            throw new Error('Помилка шифрування');
        }

        // 6. Конвертація в hex
        console.log('🔄 Конвертація в hex...');
        const heightHex = toHex(heightEncrypted);
        const weightHex = toHex(weightEncrypted);
        const sessionsHex = toHex(sessionsEncrypted);

        console.log('Height hex:', heightHex.substring(0, 20) + '...');
        console.log('Weight hex:', weightHex.substring(0, 20) + '...');
        console.log('Sessions hex:', sessionsHex.substring(0, 20) + '...');

        // 7. ЗМІНЕНО: Відправка з фіксованим gasLimit
        console.log('📤 Відправка транзакції в блокчейн...');
        const tx = await contract.storePatientData(
            patientIDBytes32,
            heightHex,
            weightHex,
            sessionsHex,
            { gasLimit: 500000 }  // ✅ ДОДАНО фіксований gasLimit
        );

        console.log('⏳ Очікування підтвердження транзакції...');
        const receipt = await tx.wait();
        
        console.log('✅ Транзакція підтверджена!');
        console.log('TX Hash:', receipt.hash);
        console.log('Block:', receipt.blockNumber);

        showPatientInfo(patientIDBytes32, passport, medicalCard, height, weight);
        showAlert('success', '✅ Пацієнт успішно зареєстрований!');

        // Очистити форму
        document.getElementById('passport').value = '';
        document.getElementById('medicalCard').value = '';
        document.getElementById('height').value = '';
        document.getElementById('weight').value = '';

    } catch (error) {
        console.error('❌ Помилка:', error);
        let errorMsg = error.message;
        
        if (error.code === 'ACTION_REJECTED') {
            errorMsg = 'Транзакція відхилена користувачем';
        } else if (error.message.includes('insufficient funds')) {
            errorMsg = 'Недостатньо коштів на гаманці';
        } else if (error.message.includes('Patient already exists')) {
            errorMsg = 'Пацієнт вже зареєстрований в системі';
        } else if (error.message.includes('Paillier params not set')) {
            errorMsg = 'Параметри Paillier не встановлені. Спробуйте ще раз.';
        }
        
        showAlert('error', `❌ ${errorMsg}`);
    } finally {
        if (regBtn) regBtn.disabled = false;
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (regBtn) regBtn.innerHTML = 'Зареєструвати';
    }
}

// Розрахунок дози
async function calculateDose(event) {
    event.preventDefault();
    
    const passport = document.getElementById('calcPassport')?.value;
    const medicalCard = document.getElementById('calcMedicalCard')?.value;
    const doseCoefficient = parseFloat(document.getElementById('doseCoefficient')?.value);

    if (!passport || !medicalCard || isNaN(doseCoefficient)) {
        showAlert('error', '❌ Заповніть всі поля');
        return;
    }

    const calcBtn = document.getElementById('calc-btn');
    const loadingSpinner = document.getElementById('calc-loading');
    
    if (calcBtn) calcBtn.disabled = true;
    if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
    if (calcBtn) calcBtn.innerHTML = '<span class="loading"></span> Розрахунок...';

    try {
        if (!globalPublicKey || !globalPrivateKey || !contract) {
            throw new Error("Система не ініціалізована");
        }

        const patientIDBytes32 = generatePatientID(passport, medicalCard);
        
        console.log('=== РОЗРАХУНОК ДОЗИ ===');
        console.log('Patient ID (bytes32):', patientIDBytes32);

        const patientExists = await contract.patientExists(patientIDBytes32);
        console.log('Пацієнт існує:', patientExists);

        if (!patientExists) {
            throw new Error('Пацієнт не зареєстрований в блокчейні. Спочатку зареєструйте пацієнта.');
        }

        // Отримуємо дані
        const patientData = await contract.retrievePatientData(patientIDBytes32);
        const weightEncrypted = patientData[1];
        
        // Розшифровуємо вагу
        const weight = Number(globalPrivateKey.decrypt(weightEncrypted));
        console.log('Розшифрована вага:', weight, 'кг');
        
        if (weight <= 0 || isNaN(weight) || weight > 500) {
            throw new Error(`Некоректне значення ваги: ${weight}`);
        }

        // Розраховуємо дозу
        const result = await calculateDoseOnChain(patientIDBytes32, weight, doseCoefficient);

        if (result.success) {
            // КРИТИЧНО: Перевіряємо токен перед збереженням
            const token = localStorage.getItem('token');
            console.log('🔑 Токен:', token ? 'Є' : 'НЕМАЄ');
            
            if (!token) {
                console.warn('⚠️ Токен відсутній, пропускаю збереження в БД');
                showAlert('warning', '⚠️ Доза розрахована, але не збережена (потрібна авторизація)');
            } else {
                // Зберігаємо в БД
                console.log('💾 Збереження дози в БД...');
                
                try {
                    const saveResponse = await fetch(`http://localhost:8080/api/patients/${patientIDBytes32}/dose`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            doseEncrypted: result.doseEncryptedForDB, // Зашифрована доза
                            doseDecrypted: parseFloat(result.calculatedDose), // Розшифрована доза
                            doseCoefficient: doseCoefficient,
                            txHash: null
                        })
                    });

                    if (!saveResponse.ok) {
                        const errorText = await saveResponse.text();
                        console.error('❌ HTTP помилка:', saveResponse.status, errorText);
                        throw new Error(`HTTP ${saveResponse.status}: ${errorText}`);
                    }

                    const saveData = await saveResponse.json();
                    console.log('✅ Доза збережена в БД:', saveData);
                    
                } catch (dbError) {
                    console.error('❌ Помилка запису в БД:', dbError);
                    showAlert('warning', '⚠️ Доза розрахована, але не збережена в БД: ' + dbError.message);
                }
            }
            
            showCalcResult(result, passport, medicalCard, doseCoefficient);
            showAlert('success', `✅ Доза розрахована: ${result.calculatedDose} мг (BSA: ${result.bsa} м²)`);
        } else {
            showAlert('error', `❌ Помилка розрахунку: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ Помилка розрахунку:', error);
        showAlert('error', `❌ ${error.message}`);
    } finally {
        if (calcBtn) calcBtn.disabled = false;
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (calcBtn) calcBtn.innerHTML = 'Розрахувати';
    }
}

// Оновлення сесій
async function updateSessions(event) {
event.preventDefault();

// ПЕРЕВІРКА РОЛІ (Nurse та Doctor мають доступ)
const userRole = getUserRole();
if (userRole === 'Auditor') {
    showAlert('error', '❌ Аудитори не мають доступу до оновлення сесій.');
    return;
}

const passport = document.getElementById('sessionPassport').value;
const medicalCard = document.getElementById('sessionMedicalCard').value;

if (!passport || !medicalCard) {
    showAlert('error', '❌ Заповніть всі поля.');
    return;
}

const sessionBtn = document.getElementById('session-btn');
if (sessionBtn) sessionBtn.disabled = true;
if (sessionBtn) sessionBtn.innerText = 'Оновлення...';

try {
    // Перевіряємо ініціалізацію
    if (!globalPublicKey || !globalPrivateKey || !contract) {
        throw new Error("Система не ініціалізована. Спочатку натисніть 'Ініціалізувати систему'");
    }

    // Генеруємо patientID
    const patientID = generatePatientID(passport, medicalCard);
    console.log('=== ОНОВЛЕННЯ СЕСІЙ ===');
    console.log('Patient ID:', patientID);

    // Викликаємо функцію оновлення на блокчейні
    console.log('Виклик updateChemotherapySessionsOnChain...');
    const result = await updateChemotherapySessionsOnChain(patientID);
    console.log('Результат оновлення:', result);

    if (result && result.success) {
        // Оновлюємо в БД
        try {
            const dbResult = await apiRequest(`/patients/${patientID}/sessions`, {
                method: 'PUT',
                body: JSON.stringify({
                    sessionsEncrypted: result.newSessionsEncrypted,
                    txHash: result.txHash
                })
            });

            if (dbResult && dbResult.success) {
                console.log('✅ Сесії оновлено в БД');
            }
        } catch (dbError) {
            console.error('DB session update error:', dbError);
        }

        // ДОДАНО: Показати результат на екрані
        showSessionResult(result, passport, medicalCard);
        showAlert('success', `✅ Сесію оновлено! Поточна кількість: ${result.sessionsDecrypted}`);
    } else {
        // Якщо result.success === false або result === null
        const errorMsg = result?.error || 'Невідома помилка оновлення';
        showAlert('error', `❌ Помилка оновлення: ${errorMsg}`);
    }
} catch (error) {
    console.error('❌ Помилка при оновленні:', error);
    showAlert('error', `❌ Помилка: ${error.message}`);
} finally {
    if (sessionBtn) {
        sessionBtn.disabled = false;
        sessionBtn.innerText = 'Додати +1';
    }
}
}
/**
 * Показати інформацію про зареєстрованого пацієнта
 */
function showPatientInfo(result, patientID, passport, medicalCard, height, weight) {
    const resultDiv = document.getElementById('store-result');
    if (!resultDiv) {
        console.warn('Element #store-result not found');
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="result">
            <h3>✅ Пацієнт зареєстрований</h3>
            
            <div class="result-item">
                <div class="result-label">Patient ID (зашифрований)</div>
                <div class="result-value" style="font-size: 11px; word-break: break-all;">${patientID}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Статус</div>
                <div class="result-value" style="color: #155724;">🔒 Дані зашифровані та збережені</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">TX Hash</div>
                <div class="result-value tx-hash" onclick="copyToClipboard('${result.txHash}')" title="Клік для копіювання">
                    ${result.txHash}
                    <span class="copy-icon">📋</span>
                </div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Block Number</div>
                <div class="result-value">${result.blockNumber || '-'}</div>
            </div>
        </div>
    `;
}
// Функції для відображення результатів
function showStoreResult(result, passport, medicalCard, height, weight, sessions) {
    const resultDiv = document.getElementById('store-result');
    if (!resultDiv) return;
    
    const patientID = generatePatientID(passport, medicalCard);
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="result">
            <h3>✅ Дані збережено в блокчейні</h3>
            <div class="result-item">
                <div class="result-label">Patient ID</div>
                <div class="result-value" style="font-size: 11px; word-break: break-all;">${patientID}</div>
            </div>
            <div class="result-item">
                <div class="result-label">Статус</div>
                <div class="result-value" style="color: #155724;">🔒 Дані зашифровані</div>
            </div>
            <div class="result-item">
                <div class="result-label">TX Hash</div>
                <div class="result-value tx-hash" onclick="copyToClipboard('${result.txHash}')" title="Клік для копіювання">
                    ${result.txHash}
                    <span class="copy-icon">📋</span>
                </div>
            </div>
        </div>
    `;
}

function showCalcResult(result, passport, medicalCard, doseCoefficient) {
    const resultDiv = document.getElementById('calc-result');
    if (!resultDiv) return;
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="result">
            <h3>✅ Доза розрахована</h3>
            <div class="result-item">
                <div class="result-label">💊 Розрахована доза</div>
                <div class="result-value" style="color: #155724; font-size: 28px; font-weight: bold;">${result.calculatedDose} мг</div>
            </div>
            <div class="result-item">
                <div class="result-label">TX Hash</div>
                <div class="result-value tx-hash" onclick="copyToClipboard('${result.txHash}')" title="Клік для копіювання">
                    ${result.txHash}
                    <span class="copy-icon">📋</span>
                </div>
            </div>
        </div>
    `;
}

function showSessionResult(result, passport, medicalCard) {
    const resultDiv = document.getElementById('session-result');
    if (!resultDiv) {
        console.warn('Element #session-result not found');
        return;
    }
    
    const patientID = generatePatientID(passport, medicalCard);
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="result">
            <h3>✅ Сесія оновлена</h3>
            <div class="result-item">
                <div class="result-label">Patient ID</div>
                <div class="result-value" style="font-size: 11px; word-break: break-all;">${patientID}</div>
            </div>
            <div class="result-item">
                <div class="result-label">Поточна кількість сесій</div>
                <div class="result-value" style="color: #155724; font-size: 20px; font-weight: bold;">${result.sessionsDecrypted}</div>
            </div>
            <div class="result-item">
                <div class="result-label">TX Hash</div>
                <div class="result-value" style="font-size: 11px; word-break: break-all;">${result.txHash.substring(0, 30)}...</div>
            </div>
        </div>
    `;
}

// Функція для копіювання в буфер обміну
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('success', '✅ TX Hash скопійовано!');
    }).catch(err => {
        console.error('Помилка копіювання:', err);
        showAlert('error', '❌ Не вдалося скопіювати');
    });
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    console.log('=================================');
    console.log('Medical Data System');
    console.log('=================================');
    
    const authToken = getAuthToken();
    const username = getUsername();
    const userRole = getUserRole();
    
    if (!authToken) {
        console.log('❌ Не автентифіковано');
        window.location.href = 'login.html';
    } else {
        console.log('✅ Автентифіковано');
        console.log('Користувач:', username);
        console.log('Роль:', userRole);
    }
});