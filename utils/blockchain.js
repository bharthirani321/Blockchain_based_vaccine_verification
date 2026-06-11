const { Web3 } = require('web3');
const contractJSON = require('../build/contracts/VaccineRegistry.json');

const web3 = new Web3('http://127.0.0.1:7545');

const contract = new web3.eth.Contract(
    contractJSON.abi,
    contractJSON.networks["5777"].address
);

async function getAccount() {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
}

module.exports = { web3, contract, getAccount };