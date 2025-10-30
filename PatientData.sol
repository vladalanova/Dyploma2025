// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalData {
    struct PatientData {
        uint256 heightEncrypted;
        uint256 weightEncrypted;
        uint256 chemotherapySessionsEncrypted;
        bool exists;
        uint256 timestamp;
    }
    
    uint256 public n;  
    uint256 public nSquared;  
    uint256 public g;  
    
    mapping(bytes32 => PatientData) private patients;
    
    event PatientDataStored(bytes32 indexed patientID, uint256 heightEncrypted, uint256 weightEncrypted, uint256 chemotherapySessionsEncrypted, uint256 timestamp);
    event PatientDataRetrieved(bytes32 indexed patientID);
    event ChemotherapySessionUpdated(bytes32 indexed patientID, uint256 newSessionsEncrypted);
    event DoseCalculated(bytes32 indexed patientID, uint256 doseEncrypted);
    event PaillierParamsSet(uint256 n, uint256 nSquared, uint256 g);
    
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
    

    function storePatientData(
        bytes32 patientID,
        uint256 heightEncrypted,
        uint256 weightEncrypted,
        uint256 chemotherapySessionsEncrypted
    ) external {
        require(!patients[patientID].exists, "Patient already exists");
        require(nSquared > 0, "Paillier params not set");
        
        patients[patientID] = PatientData({
            heightEncrypted: heightEncrypted,
            weightEncrypted: weightEncrypted,
            chemotherapySessionsEncrypted: chemotherapySessionsEncrypted,
            exists: true,
            timestamp: block.timestamp
        });
        
        emit PatientDataStored(patientID, heightEncrypted, weightEncrypted, chemotherapySessionsEncrypted, block.timestamp);
    }
    
    function retrievePatientData(bytes32 patientID) 
        external 
        view 
        returns (uint256 heightEncrypted, uint256 weightEncrypted, uint256 chemotherapySessionsEncrypted, uint256 timestamp) 
    {
        require(patients[patientID].exists, "Patient data not found");
        
        PatientData memory patient = patients[patientID];
        
        return (patient.heightEncrypted, patient.weightEncrypted, patient.chemotherapySessionsEncrypted, patient.timestamp);
    }
    
    function calculateDoseEncrypted(
        bytes32 patientID,
        uint256 encryptedDoseCoefficient
    ) external returns (uint256 doseEncrypted) {
        require(patients[patientID].exists, "Patient data not found");
        require(nSquared > 0, "Paillier params not set");
        
        PatientData memory patient = patients[patientID];

        doseEncrypted = paillierAdd(
            paillierAdd(patient.heightEncrypted, patient.weightEncrypted),
            encryptedDoseCoefficient
        );
        
        emit DoseCalculated(patientID, doseEncrypted);
        return doseEncrypted;
    }

    function calculateDoseWithConstants(
        bytes32 patientID,
        uint256 encryptedDoseCoefficient,
        uint256 heightInCm, 
        uint256 weightInKg   
    ) external returns (uint256 doseEncrypted) {
        require(patients[patientID].exists, "Patient data not found");
        require(nSquared > 0, "Paillier params not set");
        
        PatientData memory patient = patients[patientID];
        
        uint256 heightWeightProduct = paillierMultiply(patient.heightEncrypted, weightInKg);
        
        doseEncrypted = paillierMultiply(heightWeightProduct, 1); 
        
        emit DoseCalculated(patientID, doseEncrypted);
        return doseEncrypted;
    }
    
    function updateChemotherapySessions(
        bytes32 patientID,
        uint256 encryptedOne
    ) external {
        require(patients[patientID].exists, "Patient data not found");
        require(nSquared > 0, "Paillier params not set");
        
        patients[patientID].chemotherapySessionsEncrypted = paillierAdd(
            patients[patientID].chemotherapySessionsEncrypted,
            encryptedOne
        );
        
        emit ChemotherapySessionUpdated(patientID, patients[patientID].chemotherapySessionsEncrypted);
    }
    
    function patientExists(bytes32 patientID) external view returns (bool) {
        return patients[patientID].exists;
    }
    

    function getChemotherapySessions(bytes32 patientID) external view returns (uint256) {
        require(patients[patientID].exists, "Patient data not found");
        return patients[patientID].chemotherapySessionsEncrypted;
    }
    
    function getPatientTimestamp(bytes32 patientID) external view returns (uint256) {
        require(patients[patientID].exists, "Patient data not found");
        return patients[patientID].timestamp;
    }
    
    function getPaillierParams() external view returns (uint256, uint256, uint256) {
        return (n, nSquared, g);
    }
}