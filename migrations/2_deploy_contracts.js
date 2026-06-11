const VaccineRegistry = artifacts.require("VaccineRegistry");

module.exports = function (deployer) {
  deployer.deploy(VaccineRegistry);
};