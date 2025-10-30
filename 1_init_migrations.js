const MedicalDataStorage = artifacts.require("MedicalDataStorage");

module.exports = function (deployer) {
  deployer.deploy(MedicalDataStorage);
};
