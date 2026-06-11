import React, { useState } from "react";
import Web3 from "web3";
import VaccineABI from "../contracts/VaccineRegistry.json";

const CONTRACT_ADDRESS = "0xF4C0128e426149d1C6b6C68e08C1Cffd3d390B5b";

function RegulatorVerify() {
  const [batchId, setBatchId] = useState("");
  const [record, setRecord] = useState(null);
  const [msg, setMsg] = useState("");

  const loadRecord = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const contract = new web3.eth.Contract(VaccineABI.abi, CONTRACT_ADDRESS);
      const batchIdHex = web3.utils.keccak256(batchId);

      const res = await contract.methods.getBatch(batchIdHex).call();
      setRecord(res);

    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  const approve = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(VaccineABI.abi, CONTRACT_ADDRESS);

      const batchIdHex = web3.utils.keccak256(batchId);
      const tx = await contract.methods.approveBatch(batchIdHex).send({
        from: accounts[0]
      });

      setMsg("Approved: " + tx.transactionHash);

    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div>
      <h3>Regulator — Verify & Approve</h3>

      <input
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      />

      <button onClick={loadRecord}>Load Batch</button>

      {record && (
        <div style={{ padding: "10px", border: "1px solid gray" }}>
          <p><b>dataCID:</b> {record.dataCID}</p>
          <p><b>merkleRoot:</b> {record.merkleRoot}</p>
          <p><b>sigCID:</b> {record.sigCID}</p>
          <p><b>sigHash:</b> {record.sigHash}</p>
          <p><b>Status:</b> {record.status}</p>

          <button onClick={approve}>Approve</button>
        </div>
      )}

      <p>{msg}</p>
    </div>
  );
}

export default RegulatorVerify;
