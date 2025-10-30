const seed = 12345;
bigInt.rand = (function(seed) {
    return function(bitLength) {
        seed = (seed * 16807) % 2147483647;
        return bigInt(seed).mod(bigInt(2).pow(bitLength));
    };
})(seed);

bigInt.prime = function (bitLength) {
    const start = Date.now();
    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
        const candidate = bigInt.randBetween(
            bigInt(2).pow(bitLength - 1),
            bigInt(2).pow(bitLength).subtract(1)
        ).or(1);

        attempts++;

        if (candidate.isProbablePrime(15)) {
            return candidate;
        }
    }
    throw new Error(`Failed to generate prime after ${maxAttempts} attempts`);
};

function L(u, n) {
    return u.subtract(1).divide(n);
}

const generateRandomKeys = function (bitLength = 128) {
    console.log(`Генерація ключів ${bitLength} біт...`);
    
    let p = bigInt.prime(bitLength / 2);
    let q = bigInt.prime(bitLength / 2);
    
    while (p.equals(q)) {
        q = bigInt.prime(bitLength / 2);
    }

    const n = p.multiply(q);
    const n2 = n.pow(2);
    const g = n.add(1);
    const lambda = bigInt.lcm(p.subtract(1), q.subtract(1));
    
    const gLambda = g.modPow(lambda, n2);
    console.log('g^lambda mod n²:', gLambda.toString().substring(0, 40) + '...');
    
    const L_gLambda = gLambda.subtract(1).divide(n);
    console.log('L(g^lambda):', L_gLambda.toString().substring(0, 40) + '...');
    console.log('n:', n.toString().substring(0, 40) + '...');
    
    const gcd = bigInt.gcd(L_gLambda, n);
    console.log('gcd(L(g^lambda), n):', gcd.toString());
    
    if (!gcd.equals(1)) {
        console.warn('L(g^lambda) та n не взаємно прості! Регенеруємо ключі...');
        return generateRandomKeys(bitLength);
    }
    
    const mu = L_gLambda.modInv(n);
    console.log('mu:', mu.toString().substring(0, 40) + '...');
    
    const check = L_gLambda.multiply(mu).mod(n);
    console.log('Перевірка (L * mu) mod n:', check.toString());
    
    if (!check.equals(1)) {
        console.error('mu обчислено неправильно! Регенеруємо...');
        return generateRandomKeys(bitLength);
    }

    const maxUint256 = bigInt(2).pow(256).subtract(1);
    if (n2.greater(maxUint256)) {
        return generateRandomKeys(bitLength - 16);
    }

    const publicKey = new PaillierPublicKey(n, g);
    const privateKey = new PaillierPrivateKey(lambda, mu, p, q, publicKey);
    
    // Тест шифрування
    console.log('\nТестування...');
    const testVal = 1;
    const enc = publicKey.encrypt(testVal);
    const dec = privateKey.decrypt(enc);
    console.log(`Тест: ${testVal} -> ${dec}`);
    
    if (Math.abs(dec - testVal) > 0.01) {
        console.error('Тест провалено! Регенеруємо ключі...');
        return generateRandomKeys(bitLength);
    }
    
    console.log('Ключі працюють!\n');
    return { publicKey, privateKey };
};

class PaillierPublicKey {
    constructor(n, g) {
        this.n = bigInt(n);
        this._n2 = this.n.pow(2);
        this.g = bigInt(g);
        // ВИПРАВЛЕНО: Зменшена precision для гомоморфного множення
        this.precision = bigInt(1); // Було 1e6, стало 1
    }

    encrypt(m) {
        const scaledM = this._scaleUp(m);
        
        console.log('=== ENCRYPT DEBUG ===');
        console.log('Original value:', m);
        console.log('Scaled value:', scaledM.toString());
        
        let r;
        do {
            r = bigInt.randBetween(1, this.n);
        } while (r.leq(1) || r.geq(this.n));

        const result = this.g.modPow(scaledM, this._n2)
            .multiply(r.modPow(this.n, this._n2))
            .mod(this._n2);
        
        console.log('Encrypted result:', result.toString().substring(0, 30) + '...');
        
        return result;
    }

    add(c1, c2) {
        return bigInt(c1).multiply(bigInt(c2)).mod(this._n2);
    }

    multiply(c, k) {
        // ВИПРАВЛЕНО: НЕ масштабуємо k при множенні
        console.log('=== MULTIPLY DEBUG ===');
        console.log('Encrypted value c:', c.toString().substring(0, 30) + '...');
        console.log('Scalar k:', k);
        
        // Множимо зашифроване значення на скаляр БЕЗ масштабування
        const result = bigInt(c).modPow(bigInt(k), this._n2);
        
        console.log('Result:', result.toString().substring(0, 30) + '...');
        
        return result;
    }

    _scaleUp(value) {
        // ВИПРАВЛЕНО: Масштабуємо тільки при шифруванні
        if (typeof value === 'number') {
            return bigInt(Math.round(value * this.precision.toJSNumber()));
        }
        if (typeof value === 'string') {
            return bigInt(value).multiply(this.precision);
        }
        if (bigInt.isInstance(value)) {
            return value.multiply(this.precision);
        }
        throw new Error(`Unsupported type for scaling: ${typeof value}`);
    }
}

class PaillierPrivateKey {
    constructor(lambda, mu, p, q, publicKey) {
        this.lambda = this._toBigInt(lambda);
        this.mu = this._toBigInt(mu);
        this._p = this._toBigInt(p);
        this._q = this._toBigInt(q);
        this.publicKey = publicKey;
    }

    _toBigInt(value) {
        const valueStr = value.toString();
        if (!/^-?\d+$/.test(valueStr)) {
            throw new RangeError(`Invalid value for BigInt: ${value}`);
        }
        return bigInt(valueStr);
    }

    decrypt(c) {
        c = this._toBigInt(c);
        
        // m = L(c^lambda mod n²) * mu mod n
        const cLambda = this.modPow(c, this.lambda, this.publicKey._n2);
        const L_cLambda = cLambda.subtract(bigInt(1)).divide(this.publicKey.n);
        const m = L_cLambda.multiply(this.mu).mod(this.publicKey.n);
        
        console.log('=== DECRYPT DEBUG ===');
        console.log('c^lambda mod n²:', cLambda.toString().substring(0, 30) + '...');
        console.log('L(c^lambda):', L_cLambda.toString().substring(0, 30) + '...');
        console.log('m (raw):', m.toString());
        console.log('m / precision:', m.divide(this.publicKey.precision).toString());
        
        return this._scaleDown(m);
    }

    _scaleDown(value) {
        const result = value.divide(this.publicKey.precision);
        console.log('_scaleDown result:', result.toString());
        return result.toJSNumber();
    }
    
    decryptInteger(c) {
        c = this._toBigInt(c);
        const x = this.modPow(c, this.lambda, this.publicKey._n2);
        const L = x.subtract(bigInt(1)).divide(this.publicKey.n);
        const m = L.multiply(this.mu).mod(this.publicKey.n);
        
        const result = m.divide(this.publicKey.precision);
        return parseInt(result.toString());
    }

    modPow(base, exponent, modulus) {
        base = this._toBigInt(base);
        exponent = this._toBigInt(exponent);
        modulus = this._toBigInt(modulus);

        if (modulus.eq(bigInt(1))) return bigInt(0);
        let result = bigInt(1);
        base = base.mod(modulus);

        while (exponent.greater(bigInt(0))) {
            if (exponent.and(bigInt(1)).eq(bigInt(1))) {
                result = result.multiply(base).mod(modulus);
            }
            exponent = exponent.shiftRight(1);
            base = base.square().mod(modulus);
        }
        return result;
    }
}

function L(u, n) {
    return u.subtract(1).divide(n);
}

let globalPublicKey = null;
let globalPrivateKey = null;

function initializePaillierKeys() {
    console.log('=== ІНІЦІАЛІЗАЦІЯ PAILLIER КЛЮЧІВ ===');
    
    // Спочатку намагаємося завантажити збережені ключі
    if (loadPaillierKeys()) {
        console.log('✅ Використовуються збережені ключі');
        return true;
    }
    
    // Якщо ключів немає, генеруємо нові
    console.log('Генерація нових Paillier ключів (256-bit)...');
    try {
        const keys = generateRandomKeys(256);
        globalPublicKey = keys.publicKey;
        globalPrivateKey = keys.privateKey;
        
        console.log('✅ Нові ключі згенеровано');
        console.log('n:', globalPublicKey.n.toString().substring(0, 50) + '...');
        console.log('n bit length:', globalPublicKey.n.toString(2).length);
        
        // Зберігаємо нові ключі
        savePaillierKeys();
        
        return true;
    } catch (error) {
        console.error('❌ Помилка генерації ключів:', error);
        return false;
    }
}
function savePaillierKeys() {
    if (!globalPublicKey || !globalPrivateKey) {
        console.error('Ключі не згенеровані');
        return false;
    }
    
    const keysData = {
        publicKey: {
            n: globalPublicKey.n.toString(),
            g: globalPublicKey.g.toString(),
            precision: globalPublicKey.precision.toString()
        },
        privateKey: {
            lambda: globalPrivateKey.lambda.toString(),
            mu: globalPrivateKey.mu.toString(),
            p: globalPrivateKey._p.toString(),
            q: globalPrivateKey._q.toString()
        }
    };
    
    localStorage.setItem('paillierKeys', JSON.stringify(keysData));
    console.log('✅ Ключі Paillier збережено в localStorage');
    return true;
}

function loadPaillierKeys() {
    const keysDataStr = localStorage.getItem('paillierKeys');
    
    if (!keysDataStr) {
        console.log('Ключі не знайдено в localStorage');
        return false;
    }
    
    try {
        const keysData = JSON.parse(keysDataStr);
        
        // Відновлюємо публічний ключ
        const n = bigInt(keysData.publicKey.n);
        const g = bigInt(keysData.publicKey.g);
        globalPublicKey = new PaillierPublicKey(n, g);
        
        // Відновлюємо приватний ключ
        const lambda = bigInt(keysData.privateKey.lambda);
        const mu = bigInt(keysData.privateKey.mu);
        const p = bigInt(keysData.privateKey.p);
        const q = bigInt(keysData.privateKey.q);
        globalPrivateKey = new PaillierPrivateKey(lambda, mu, p, q, globalPublicKey);
        
        console.log('✅ Ключі Paillier завантажено з localStorage');
        console.log('n:', globalPublicKey.n.toString().substring(0, 50) + '...');
        
        // Тест завантажених ключів
        const testVal = 42;
        const enc = globalPublicKey.encrypt(testVal);
        const dec = globalPrivateKey.decrypt(enc);
        
        if (Math.abs(dec - testVal) > 0.01) {
            console.error('❌ Завантажені ключі не працюють!');
            localStorage.removeItem('paillierKeys');
            return false;
        }
        
        console.log('✅ Тест завантажених ключів пройдено');
        return true;
        
    } catch (error) {
        console.error('❌ Помилка завантаження ключів:', error);
        localStorage.removeItem('paillierKeys');
        return false;
    }
}

function clearPaillierKeys() {
    localStorage.removeItem('paillierKeys');
    globalPublicKey = null;
    globalPrivateKey = null;
    console.log('🗑️ Ключі Paillier видалено з localStorage');
}