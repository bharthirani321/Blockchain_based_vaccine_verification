import React, { useState } from "react";
import axios from "axios";

function UploadBatch() {
  const [batchId, setBatchId] = useState("");
  const [productId, setProductId] = useState("");
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    try {
      setMsg("Uploading...");

      const form = new FormData();
      form.append("batchId", batchId);
      form.append("productId", productId);
      form.append("autoRegister", "true"); // backend will call smart contract

      for (let i = 0; i < files.length; i++) {
        form.append("files", files[i]);
      }

      const res = await axios.post("http://localhost:4000/api/uploadBatch", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMsg(
        `Uploaded & Registered On-chain
         CID: ${res.data.cid}
         MerkleRoot: ${res.data.merkleRoot}
         Tx: ${res.data.registerTx}`
      );

    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div>
      <h3>Manufacturer — Upload Batch</h3>

      <input
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      />

      <input
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />

      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />

      <button onClick={handleUpload}>Submit Batch</button>

      <p>{msg}</p>
    </div>
  );
}

export default UploadBatch;
