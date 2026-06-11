import React, { useState } from "react";
import axios from "axios";

function SubmitSignatures() {
  const [batchId, setBatchId] = useState("");
  const [resultsFile, setResultsFile] = useState(null);
  const [signatures, setSignatures] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    try {
      setMsg("Submitting signatures...");

      const fileBase64 = resultsFile
        ? await resultsFile.arrayBuffer().then((buf) => btoa(String.fromCharCode(...new Uint8Array(buf))))
        : null;

      const body = {
        batchId,
        testReportBase64: fileBase64,
        individualSignatures: JSON.parse(signatures)
      };

      const res = await axios.post("http://localhost:4000/api/submitTestResults", body);

      setMsg(
        `Signature Stored On-chain
         sigCID: ${res.data.sigCID}
         sigHash: ${res.data.sigHash}
         Tx: ${res.data.txHash}`
      );
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div>
      <h3>CDC Tester — Submit Test Results & Signatures</h3>

      <input
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      />

      <input type="file" onChange={(e) => setResultsFile(e.target.files[0])} />

      <textarea
        placeholder='Enter signatures as JSON e.g. [{"signer":"0x..","sig":"0x.."}]'
        value={signatures}
        onChange={(e) => setSignatures(e.target.value)}
        style={{ width: "100%", height: "80px" }}
      />

      <button onClick={handleSubmit}>Submit</button>

      <p>{msg}</p>
    </div>
  );
}

export default SubmitSignatures;
