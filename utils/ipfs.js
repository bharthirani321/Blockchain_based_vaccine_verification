const { create } = require('ipfs-http-client');

const ipfs = create({
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http'
});

async function uploadToIPFS(data) {
    const result = await ipfs.add(JSON.stringify(data));
    return result.cid.toString();
}

async function getFromIPFS(cid) {
    let data = '';

    for await (const chunk of ipfs.cat(cid)) {
        data += chunk.toString();
    }

    return JSON.parse(data);
}

module.exports = { uploadToIPFS, getFromIPFS };