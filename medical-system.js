class MedicalDataSystem {
    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        try {
            const keysGenerated = initializePaillierKeys();
            if (!keysGenerated) throw new Error("Failed to generate Paillier keys");
            const blockchainReady = await initializeBlockchain();
            if (!blockchainReady) throw new Error("Failed to connect to blockchain");
            this.isInitialized = true;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    async generatePatientID(passport, medicalCard) {
    const combined = passport + medicalCard;
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
}
    async storePatientData(passport, medicalCard, height, weight) {
        if (!this.isInitialized) throw new Error("System not initialized");
        try {
            const patientID = generatePatientID(passport, medicalCard);
            const heightEncrypted = globalPublicKey.encrypt(height);
            const weightEncrypted = globalPublicKey.encrypt(weight);
            const chemotherapySessionsEncrypted = globalPublicKey.encrypt(0);

            const result = await storePatientDataOnChain(
                patientID, heightEncrypted, weightEncrypted, chemotherapySessionsEncrypted
            );
            if (result.success) {
                return {
                    success: true,
                    patientId: patientID,
                    encryptedData: {
                        height: heightEncrypted.toString(),
                        weight: weightEncrypted.toString(),
                        sessions: chemotherapySessionsEncrypted.toString()
                    },
                    txHash: result.txHash
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async retrieveAndCalculateDose(passport, medicalCard, doseCoefficient = 1.5) {
        if (!this.isInitialized) throw new Error("System not initialized");
        try {
            const patientID = generatePatientID(passport, medicalCard);
            const doseResult = await calculateDoseOnChain(patientID, doseCoefficient);
            if (!doseResult.success) throw new Error(doseResult.error);

            const retrieveResult = await retrievePatientDataFromChain(patientID);
            if (!retrieveResult.success) throw new Error(retrieveResult.error);

            const { heightEncrypted, weightEncrypted, chemotherapySessionsEncrypted } = retrieveResult.data;
            const heightDecrypted = globalPrivateKey.decrypt(bigInt(heightEncrypted));
            const weightDecrypted = globalPrivateKey.decrypt(bigInt(weightEncrypted));
            const sessionsDecrypted = globalPrivateKey.decrypt(bigInt(chemotherapySessionsEncrypted));
            const heightValue = Number(heightDecrypted.toString());
            const weightValue = Number(weightDecrypted.toString());
            const bsa = Math.sqrt((heightValue * weightValue) / 3600);
            const calculatedDose = bsa * doseCoefficient;

            return {
                success: true,
                patientId: patientID,
                encryptedData: {
                    height: heightEncrypted,
                    weight: weightEncrypted,
                    sessions: chemotherapySessionsEncrypted,
                    dose: doseResult.doseEncrypted
                },
                decryptedData: {
                    height: heightValue,
                    weight: weightValue,
                    sessions: Number(sessionsDecrypted.toString())
                },
                calculatedDose,
                bsa,
                txHash: doseResult.txHash
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateChemotherapySessions(passport, medicalCard) {
        if (!this.isInitialized) throw new Error("System not initialized");
        try {
            const patientID = generatePatientID(passport, medicalCard);
            const updateResult = await updateChemotherapySessionsOnChain(patientID);
            if (updateResult.success) {
                const newSessionsDecrypted = globalPrivateKey.decrypt(bigInt(updateResult.newSessionsEncrypted));
                return {
                    success: true,
                    patientId: patientID,
                    newSessionsEncrypted: updateResult.newSessionsEncrypted,
                    newSessionsDecrypted: Number(newSessionsDecrypted.toString()),
                    txHash: updateResult.txHash
                };
            } else {
                throw new Error(updateResult.error);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkPatientExists(passport, medicalCard) {
        if (!this.isInitialized) throw new Error("System not initialized");
        const patientID = generatePatientID(passport, medicalCard);
        return await patientExistsOnChain(patientID);
    }

    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            hasKeys: !!(globalPublicKey && globalPrivateKey),
            blockchainConnected: !!(provider && contract)
        };
    }
}

const medicalSystem = new MedicalDataSystem();