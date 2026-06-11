let web3;
let account;
let contract;

// ✅ YOUR CONTRACT ADDRESS
const CONTRACT_ADDRESS = "0xc6cb85e6E703e21aaa41E6cE6c17eE65E2d3b218";

// ✅ YOUR CONTRACT ABI (FULL)
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "batchId", "type": "bytes32" },
            { "internalType": "string", "name": "dataCID", "type": "string" },
            { "internalType": "bytes32", "name": "merkleRoot", "type": "bytes32" }
        ],
        "name": "registerBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "batchId", "type": "bytes32" },
            { "internalType": "string", "name": "sigCID", "type": "string" },
            { "internalType": "bytes32", "name": "sigHash", "type": "bytes32" }
        ],
        "name": "storeAggregatedSignature",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "batchId", "type": "bytes32" }
        ],
        "name": "getBatch",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "dataCID", "type": "string" },
                    { "internalType": "bytes32", "name": "merkleRoot", "type": "bytes32" },
                    { "internalType": "string", "name": "sigCID", "type": "string" },
                    { "internalType": "bytes32", "name": "sigHash", "type": "bytes32" },
                    { "internalType": "uint256", "name": "uploadTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "signatureTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "approvalTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "status", "type": "uint256" },
                    { "internalType": "address", "name": "manufacturer", "type": "address" },
                    { "internalType": "address", "name": "regulator", "type": "address" }
                ],
                "internalType": "struct VaccineRegistry.Batch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// ✅ CONNECT WALLET (SAFE VERSION)
async function connectWallet() {
    if (!window.ethereum) {
        alert("Install MetaMask");
        return;
    }

    // 🔹 Check already connected
    const accounts = await window.ethereum.request({
        method: 'eth_accounts'
    });

    web3 = new Web3(window.ethereum);

    if (accounts.length === 0) {
        await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
    }

    const accs = await web3.eth.getAccounts();
    account = accs[0];

    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    console.log("Connected:", account);
}

//////////////////////////////////////////////////////
// 🏭 MANUFACTURER → REGISTER
//////////////////////////////////////////////////////
async function register() {
    try {
        await connectWallet();

        const batchName = document.getElementById("m_batch").value;
        const vaccine = document.getElementById("m_vaccine").value;
        const manufacturer = document.getElementById("m_manufacturer").value;

        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batchName, vaccine, manufacturer })
        });

        const data = await res.json();

        const batchId = web3.utils.keccak256(batchName);

        await contract.methods.registerBatch(
            batchId,
            data.cid,
            data.merkleRoot
        ).send({ from: account });

        document.getElementById("m_result").innerText = "Uploaded ✅";

    } catch (err) {
        console.error(err);
        document.getElementById("m_result").innerText = "Error ❌";
    }
}

//////////////////////////////////////////////////////
// 🧪 CDC → VALIDATE
//////////////////////////////////////////////////////
async function validateBatch() {
    try {
        await connectWallet();

        const batchName = document.getElementById("v_batch").value;
        const batchId = web3.utils.keccak256(batchName);

        // 🔹 Step 1: Fetch batch from blockchain
        const batch = await contract.methods.getBatch(batchId).call();

        if (!batch.dataCID || batch.dataCID === "") {
            document.getElementById("v_result").innerText =
                "Batch not found ❌";
            return;
        }

        // 🔹 Step 2: Generate signature (CDC approval)
        const timestamp = Date.now();

        const signature = web3.utils.soliditySha3(
            { type: 'bytes32', value: batchId },
            { type: 'uint256', value: timestamp }
        );

        console.log("Generated Signature:", signature);

        // 🔹 Step 3: Store signature on blockchain
        await contract.methods.storeAggregatedSignature(
            batchId,
            "signatureCID",  // optional (can be improved later)
            signature
        ).send({ from: account });

        // 🔹 Step 4: Show result
        document.getElementById("v_result").innerText =
            "Validated by CDC ✅";

    } catch (err) {
        console.error(err);
        document.getElementById("v_result").innerText =
            "Validation failed ❌";
    }
}

//////////////////////////////////////////////////////
// 🏛️ REGULATOR → VERIFY
//////////////////////////////////////////////////////
async function verifyBatch() {
    try {
        const batchName = document.getElementById("r_batch").value;

        const res = await fetch("http://localhost:3000/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batchName })
        });

        const data = await res.json();

        if (data.status === "VALID") {
            document.getElementById("r_result").innerText =
                "VALID ✅\nCID: " + data.cid;
        } else {
            document.getElementById("r_result").innerText =
                "INVALID ❌\nReason: " + data.reason;
        }

    } catch (err) {
        console.error(err);
        document.getElementById("r_result").innerText =
            "Verification failed ❌";
    }
}