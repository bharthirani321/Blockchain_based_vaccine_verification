import React, { useState } from "react";
import UploadBatch from "./components/UploadBatch";
import SubmitSignatures from "./components/SubmitSignatures";
import RegulatorVerify from "./components/RegulatorVerify";

function App() {
  const [role, setRole] = useState("");

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "auto" }}>
      <h1>Vaccine Verification DApp</h1>

      <label>Select Role:</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">-- Select Role --</option>
        <option value="manufacturer">Manufacturer</option>
        <option value="cdc">CDC / Tester</option>
        <option value="regulator">Regulator</option>
      </select>

      <hr />

      {role === "manufacturer" && <UploadBatch />}
      {role === "cdc" && <SubmitSignatures />}
      {role === "regulator" && <RegulatorVerify />}
    </div>
  );
}

export default App;
