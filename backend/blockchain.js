const Web3 = require('web3');
const contractJSON = require('../build/contracts/VaccineRegistry.json');

// Connect to Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Get deployed contract
const contract = new web3.eth.Contract(
    contractJSON.abi,
    contractJSON.networks["5777"].address
);

// Use first Ganache account
const account = "0xa2d81926FE3E4D14fA11B066daa196E1E2e075A4";

module.exports = { web3, contract, account };