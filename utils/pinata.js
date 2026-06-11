const axios = require('axios');

const PINATA_API_KEY = "6cbeb0391209c26ceb79";
const PINATA_SECRET_API_KEY = "f572859d1cf6448b8b1fd67116a082de18eaf061cabcf2e799f2b4a77c051fc0";

async function uploadToIPFS(data) {
    try {
        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            data,
            {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data.IpfsHash;

    } catch (error) {
        console.error("Pinata upload error:", error.response?.data || error.message);
    }
}

module.exports = { uploadToIPFS };