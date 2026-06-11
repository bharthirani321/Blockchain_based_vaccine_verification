import fs from "fs";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import * as bls from "@noble/curves/bls12-381";
import { randomBytes } from "@noble/hashes/utils";
import axios from "axios";
import FormData from "form-data";

// ----------------------------------------------------
//  Helper function: Upload file to IPFS via HTTP API
// ----------------------------------------------------
async function uploadToIpfsHttpApi(fileBuffer, filename) {
  const form = new FormData();
  form.append("file", fileBuffer, { filename });

  const url = "http://127.0.0.1:5001/api/v0/add?pin=true";

  // Required for Node 20 (duplex fix)
  const resp = await axios.post(url, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    responseType: "text",
    fetchOptions: { duplex: "half" }
  });

  // Parse IPFS response
  const lines = resp.data.trim().split("\n");
  const last = JSON.parse(lines[lines.length - 1]);

  return last.Hash; // final CID
}

// ----------------------------------------------------
//  MAIN SCRIPT
// ----------------------------------------------------
async function main() {
  console.log("🚀 Starting Vaccine Prototype Script...\n");

  // 1️⃣ Create dataset
  const vaccineData = [
    { batchId: "BATCH001", vaccine: "Covishield", manufacturer: "ABC Biotech", expiry: "2026-01-31" },
    { batchId: "BATCH002", vaccine: "Covaxin", manufacturer: "XYZ Labs", expiry: "2026-03-15" }
  ];

  fs.writeFileSync("vaccine_data.json", JSON.stringify(vaccineData, null, 2));
  console.log("📄 Vaccine dataset created.");

  // 2️⃣ Merkle root
  const leaves = vaccineData.map(x => keccak256(JSON.stringify(x)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const rootBuf = tree.getRoot();
  const merkleRootHex = "0x" + rootBuf.toString("hex");

  console.log("🌿 Merkle Root:", merkleRootHex, "\n");

  // 3️⃣ BLS Signature Aggregation (CDC & VI)
  console.log("🔐 Generating BLS keys & signatures...");

  const privKeys = [randomBytes(32), randomBytes(32)];
  const pubKeys = privKeys.map(k => bls.bls12_381.getPublicKey(k));

  const msg = Buffer.from(merkleRootHex.replace("0x", ""), "hex");
  const signatures = privKeys.map(k => bls.bls12_381.sign(msg, k));

  const aggSig = bls.bls12_381.aggregateSignatures(signatures);
  const aggPub = bls.bls12_381.aggregatePublicKeys(pubKeys);

  const proofData = {
    merkleRoot: merkleRootHex,
    aggregatedSignature: Buffer.from(aggSig).toString("hex"),
    aggregatedPubKey: Buffer.from(aggPub).toString("hex"),
    signers: 2,
    verifiedBy: "CDC & VI Testing Authority"
  };

  fs.writeFileSync("proof_data.json", JSON.stringify(proofData, null, 2));
  console.log("🧪 Proof file created (proof_data.json).\n");

  // 4️⃣ Upload both files to local IPFS daemon
  console.log("📤 Uploading to IPFS (HTTP API)...");

  const vaccineCID = await uploadToIpfsHttpApi(
    fs.readFileSync("vaccine_data.json"),
    "vaccine_data.json"
  );

  const proofCID = await uploadToIpfsHttpApi(
    fs.readFileSync("proof_data.json"),
    "proof_data.json"
  );

  console.log("📦 Vaccine CID:", vaccineCID);
  console.log("📦 Proof CID:", proofCID);

  // 5️⃣ Create summary file
  const summary = {
    merkleRoot: merkleRootHex,
    datasetCID: vaccineCID,
    proofCID: proofCID,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync("upload_summary.json", JSON.stringify(summary, null, 2));
  console.log("\n✅ upload_summary.json written!");

  console.log("🎯 Script completed successfully!");
}

// Run script
main().catch(err => console.error("❌ ERROR:", err));