// ✅ Main API
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { uploadToIPFS } = require('../utils/pinata');
const { web3, contract, getAccount } = require('../utils/blockchain');
const axios = require('axios');
const app = express();

// ✅ CORS MUST BE HERE (TOP)
app.use(cors({
    origin: '*'  
}));

app.use(bodyParser.json());
app.use(express.json());

// ✅ Test route
app.get('/test', (req, res) => {
    res.send("CORS working");
});

// ✅ Main API
app.post('/register', async (req, res) => {
    try {
        console.log("REGISTER API CALLED");

        console.log("Request body:", req.body);

        const { batchName, vaccine, manufacturer } = req.body;

        const data = { batchName, vaccine, manufacturer };

        console.log("Data:", data);

        // 🔥 MERKLE TREE START
        const leaves = Object.values(data).map(x => keccak256(x));
        const tree = new MerkleTree(leaves, keccak256);
        const merkleRoot = tree.getRoot().toString('hex');

        console.log("Merkle Root:", merkleRoot);
        // 🔥 MERKLE TREE END

        const cid = await uploadToIPFS(data);

        console.log("Request body:", req.body);

        if (!cid) {
            return res.status(500).json("CID generation failed");
        }

        const batchId = web3.utils.keccak256(batchName);

        const account = await getAccount();
        await contract.methods.registerBatch(
            batchId,
            cid,
            "0x" + merkleRoot
        ).send({ from: account, gas: 3000000, gasPrice: '20000000000' });

        res.json({ 
            cid,
            merkleRoot: "0x" + merkleRoot
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ VALIDATION API
app.post('/validate', async (req, res) => {
    try {
        console.log("VALIDATION API CALLED");

        const { batchName } = req.body;

        const batchId = web3.utils.keccak256(web3.utils.utf8ToHex(batchName));

        // 🔥 Simulated authority signature
        const timestamp = Date.now();
        const message = web3.utils.soliditySha3(
            { type: 'bytes32', value: batchId },
            { type: 'uint256', value: timestamp }
        );

        const signatureHash = web3.utils.soliditySha3(
            { type: 'bytes32', value: batchId },
            { type: 'uint256', value: timestamp }
        );

        console.log("BatchID:", batchId);
        console.log("Signature:", signatureHash);

        const account = await getAccount();

        await contract.methods.storeAggregatedSignature(
            batchId,
            "signatureCID", // placeholder
            signatureHash
        ).send({
            from: account,
            gas: 3000000,
            gasPrice: '20000000000'
        });

        res.json({
            message: "Batch validated",
            signature: signatureHash
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/verify', async (req, res) => {
    try {
        console.log("VERIFY API CALLED");

        const { batchName } = req.body;

        const batchId = web3.utils.keccak256(
            web3.utils.utf8ToHex(batchName)
        );

        // 🔹 Step 1: Get from blockchain
        const batch = await contract.methods.getBatch(batchId).call();

        if (!batch.dataCID || batch.dataCID === "") {
            return res.json({ status: "INVALID", reason: "Batch not found" });
        }

        const cid = batch.dataCID;
        const storedRoot = batch.merkleRoot;
        const signature = batch.sigHash;

        // 🔹 Step 2: Fetch from IPFS
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const response = await axios.get(url);
        const data = response.data;

        // 🔹 Step 3: Recompute Merkle Root
        const keccak256 = require('keccak256');
        const { MerkleTree } = require('merkletreejs');

        const leaves = Object.values(data).map(x => keccak256(x));
        const tree = new MerkleTree(leaves, keccak256);
        const computedRoot = "0x" + tree.getRoot().toString('hex');

        // 🔹 Step 4: Compare
        if (computedRoot !== storedRoot) {
            return res.json({
                status: "INVALID",
                reason: "Merkle mismatch"
            });
        }

        // 🔹 Step 5: Signature check
        if (!signature || signature === "0x0") {
            return res.json({
                status: "INVALID",
                reason: "Not validated by CDC"
            });
        }

        // ✅ SUCCESS
        res.json({
            status: "VALID",
            cid: cid
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ LAST: start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

