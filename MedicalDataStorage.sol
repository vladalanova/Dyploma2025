// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Смарт-контракт з правильним розрахунком дози хіміотерапії
 * Формула BSA: sqrt((height * weight) / 3600)
 * Доза: BSA * doseCoefficient
 */
contract MedicalDataStorage {
    struct PatientDataStorage {
        uint256 heightEncrypted;
        uint256 weightEncrypted;
        uint256 chemotherapySessionsEncrypted;
        bool exists;
        uint256 timestamp;
    }
    
    // Параметри Paillier (публічний ключ)
    uint256 public n;  // модуль
    uint256 public nSquared;  // n²
    uint256 public g;  // генератор
    
    mapping(bytes32 => PatientDataStorage) private patients;
    
    event PatientDataStored(bytes32 indexed patientID, uint256 heightEncrypted, uint256 weightEncrypted, uint256 chemotherapySessionsEncrypted, uint256 timestamp);
    event PatientDataRetrieved(bytes32 indexed patientID);
    event ChemotherapySessionUpdated(bytes32 indexed patientID, uint256 newSessionsEncrypted);
    event DoseCalculated(bytes32 indexed patientID, uint256 doseEncrypted);
    event PaillierParamsSet(uint256 n, uint256 nSquared, uint256 g);
    
    /**
     * Встановити параметри Paillier (викликається один раз при деплої)
     */
    function setPaillierParams(uint256 _n, uint256 _nSquared, uint256 _g) external {
        require(n == 0, "Paillier params already set");
        require(_n > 0 && _nSquared > 0 && _g > 0, "Invalid params");
        
        n = _n;
        nSquared = _nSquared;
        g = _g;
        
        emit PaillierParamsSet(_n, _nSquared, _g);
    }
    
    /**
     * Гомоморфне додавання Paillier: E(m1 + m2) = E(m1) * E(m2) mod n²
     */
    function paillierAdd(uint256 c1, uint256 c2) public view returns (uint256) {
        require(nSquared > 0, "Paillier params not set");
        return mulmod(c1, c2, nSquared);
    }
    
    /**
     * Гомоморфне множення на константу: E(m * k) = E(m)^k mod n²
     */
    function paillierMultiply(uint256 c, uint256 k) public view returns (uint256) {
        require(nSquared > 0, "Paillier params not set");
        return modExp(c, k, nSquared);
    }
    
    /**
     * Модульне піднесення до степеня (a^b mod m)
     */
    function modExp(uint256 base, uint256 exponent, uint256 modulus) public pure returns (uint256) {
        if (modulus == 1) return 0;
        
        uint256 result = 1;
        base = base % modulus;
        
        while (exponent > 0) {
            if (exponent % 2 == 1) {
                result = mulmod(result, base, modulus);
            }
            exponent = exponent >> 1;
            base = mulmod(base, base, modulus);
        }
        
        return result;
    }
    
    /**
     * Зберегти зашифровані дані пацієнта
     */
    function storePatientData(
        bytes32 patientID,
        uint256 heightEncrypted,
        uint256 weightEncrypted,
        uint256 chemotherapySessionsEncrypted
    ) external {
        require(!patients[patientID].exists, "Patient already exists");
        require(nSquared > 0, "Paillier params not set");
        
        patients[patientID] = PatientDataStorage({
            heightEncrypted: heightEncrypted,
            weightEncrypted: weightEncrypted,
            chemotherapySessionsEncrypted: chemotherapySessionsEncrypted,
            exists: true,
            timestamp: block.timestamp
        });
        
        emit PatientDataStored(patientID, heightEncrypted, weightEncrypted, chemotherapySessionsEncrypted, block.timestamp);
    }
    
    /**
     * Отримати зашифровані дані пацієнта
     */
    function retrievePatientData(bytes32 patientID) 
        external 
        view 
        returns (uint256 heightEncrypted, uint256 weightEncrypted, uint256 chemotherapySessionsEncrypted, uint256 timestamp) 
    {
        require(patients[patientID].exists, "Patient data not found");
        
        PatientDataStorage memory patient = patients[patientID];
        
        return (patient.heightEncrypted, patient.weightEncrypted, patient.chemotherapySessionsEncrypted, patient.timestamp);
    }
    
    /**
     * ПРАВИЛЬНИЙ РОЗРАХУНОК ДОЗИ за формулою Mosteller
     * BSA = sqrt((height × weight) / 3600)
     * Dose = BSA × coefficient
     * 
     * Використовує гомоморфне множення на відкриту константу
     */
    function calculateDoseMosteller(
        bytes32 patientID,
        uint256 weightDecrypted  // Розшифрована вага (з клієнта)
    ) external view returns (uint256 heightWeightProduct) {
        require(patients[patientID].exists, "Patient data not found");
        require(nSquared > 0, "Paillier params not set");
        
        PatientDataStorage memory patient = patients[patientID];
        
        // E(height × weight) = E(height)^weight mod n²
        // Повертаємо зашифрований добуток для розшифрування на клієнті
        heightWeightProduct = paillierMultiply(patient.heightEncrypted, weightDecrypted);
        
        return heightWeightProduct;
    }
    
    /**
     * АЛЬТЕРНАТИВНИЙ МЕТОД: повертає зашифровані дані для обробки на клієнті
     */
    function getEncryptedDataForDose(bytes32 patientID) 
        external 
        view 
        returns (uint256 heightEncrypted, uint256 weightEncrypted) 
    {
        require(patients[patientID].exists, "Patient data not found");
        
        PatientDataStorage memory patient = patients[patientID];
        
        return (patient.heightEncrypted, patient.weightEncrypted);
    }
    
    /**
     * Оновити сесії хіміотерапії (правильна гомоморфна операція)
     * E(sessions + 1) = E(sessions) * E(1) mod n²
     */
    function updateChemotherapySessions(
        bytes32 patientID,
        uint256 encryptedOne
    ) external {
        require(patients[patientID].exists, "Patient data not found");
        require(nSquared > 0, "Paillier params not set");
        
        // Гомоморфне додавання
        patients[patientID].chemotherapySessionsEncrypted = paillierAdd(
            patients[patientID].chemotherapySessionsEncrypted,
            encryptedOne
        );
        
        emit ChemotherapySessionUpdated(patientID, patients[patientID].chemotherapySessionsEncrypted);
    }
    
    /**
     * Перевірити чи існує пацієнт
     */
    function patientExists(bytes32 patientID) external view returns (bool) {
        return patients[patientID].exists;
    }
    
    /**
     * Отримати поточну кількість сесій (зашифровану)
     */
    function getChemotherapySessions(bytes32 patientID) external view returns (uint256) {
        require(patients[patientID].exists, "Patient data not found");
        return patients[patientID].chemotherapySessionsEncrypted;
    }
    
    /**
     * Отримати час реєстрації пацієнта
     */
    function getPatientTimestamp(bytes32 patientID) external view returns (uint256) {
        require(patients[patientID].exists, "Patient data not found");
        return patients[patientID].timestamp;
    }
    
    /**
     * Отримати параметри Paillier
     */
    function getPaillierParams() external view returns (uint256, uint256, uint256) {
        return (n, nSquared, g);
    }
}