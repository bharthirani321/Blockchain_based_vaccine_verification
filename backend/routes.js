const express = require("express");
const pinata = require("./pinata.js");

const router = express.Router();

router.post("/uploadVaccine", async (req, res) => {
  try {
    const response = await pinata.post(
      "/pinning/pinJSONToIPFS",
      req.body
    );

    res.json({
      cid: response.data.IpfsHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;