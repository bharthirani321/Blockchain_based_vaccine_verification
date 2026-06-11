// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract VaccineRegistry {

    struct Batch {
        string dataCID;
        bytes32 merkleRoot;
        string sigCID;
        bytes32 sigHash;
        uint uploadTime;
        uint signatureTime;
        uint approvalTime;
        uint status;
        address manufacturer;
        address regulator;
    }

    mapping(bytes32 => Batch) public batches;
    bytes32[] public batchList;

    address public manufacturerRole;
    address public regulatorRole;

    constructor() {
        manufacturerRole = msg.sender;
        regulatorRole = msg.sender;
    }

    function registerBatch(
        bytes32 batchId,
        string memory dataCID,
        bytes32 merkleRoot
    ) public {
        batches[batchId] = Batch({
            dataCID: dataCID,
            merkleRoot: merkleRoot,
            sigCID: "",
            sigHash: 0,
            uploadTime: block.timestamp,
            signatureTime: 0,
            approvalTime: 0,
            status: 1,
            manufacturer: msg.sender,
            regulator: address(0)
        });

        batchList.push(batchId);
    }

    function storeAggregatedSignature(
        bytes32 batchId,
        string memory sigCID,
        bytes32 sigHash
    ) public {
        batches[batchId].sigCID = sigCID;
        batches[batchId].sigHash = sigHash;
        batches[batchId].signatureTime = block.timestamp;
        batches[batchId].status = 2;
    }

    function approveBatch(bytes32 batchId) public {
        batches[batchId].approvalTime = block.timestamp;
        batches[batchId].status = 3;
        batches[batchId].regulator = msg.sender;
    }

    function getBatch(bytes32 batchId) public view returns (Batch memory) {
        return batches[batchId];
    }

    function getBatchCount() public view returns (uint) {
        return batchList.length;
    }

    function getBatchId(uint index) public view returns (bytes32) {
        return batchList[index];
    }
}