import { create } from "ipfs-http-client";

// Local IPFS daemon
export const ipfs = create({
  url: "http://127.0.0.1:5001/api/v0"
});

export async function uploadMultipleFiles(files) {
  try {
    const prepared = files.map(f => ({
      path: f.path || f.originalname || `file-${Date.now()}`,
      content: f.content
    }));

    let rootCID = null;

    for await (const file of ipfs.addAll(prepared, { wrapWithDirectory: true })) {
      if (file.path === "") {
        rootCID = file.cid.toString();
      }
    }

    return { rootCID };
  } catch (err) {
    console.error("IPFS upload error:", err);
    throw err;
  }
}
