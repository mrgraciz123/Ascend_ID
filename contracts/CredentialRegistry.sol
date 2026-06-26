// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRegistry
 * @dev Cryptographically anchors SHA-256 verifiable credential hashes on-chain for AscendID.
 */
contract CredentialRegistry {
    address public owner;

    struct CredentialRecord {
        bytes32 dataHash;
        address issuerWallet;
        bool isRevoked;
        string revocationReason;
        uint256 blockTimestamp;
    }

    // Maps credential UUID string to its record
    mapping(string => CredentialRecord) private _credentials;
    
    // Maps issuer address to their verification status (On-Chain Issuer Registry)
    mapping(address => bool) private _verifiedIssuers;

    // Smart Contract Events for off-chain indexing
    event IssuerRegistered(address indexed issuer, bool status);
    event CredentialIssued(string indexed uuid, bytes32 indexed dataHash, address indexed issuerWallet, uint256 timestamp);
    event CredentialRevoked(string indexed uuid, string reason, uint256 timestamp);
    event CredentialVerified(string indexed uuid, address indexed checker, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyVerifiedIssuer() {
        require(_verifiedIssuers[msg.sender] || msg.sender == owner, "Only verified issuers can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
        _verifiedIssuers[msg.sender] = true;
        emit IssuerRegistered(msg.sender, true);
    }

    /**
     * @dev Register or update an issuer's wallet verification status.
     */
    function registerIssuer(address issuer, bool status) external onlyOwner {
        _verifiedIssuers[issuer] = status;
        emit IssuerRegistered(issuer, status);
    }

    /**
     * @dev Check if an issuer's wallet is whitelisted.
     */
    function isIssuerVerified(address issuer) external view returns (bool) {
        return _verifiedIssuers[issuer];
    }

    /**
     * @dev Anchors a SHA-256 credential data hash to the ledger.
     */
    function anchorCredential(string calldata uuid, bytes32 dataHash, address issuerWallet) external onlyVerifiedIssuer {
        require(_credentials[uuid].dataHash == bytes32(0), "Credential already anchored");
        
        _credentials[uuid] = CredentialRecord({
            dataHash: dataHash,
            issuerWallet: issuerWallet,
            isRevoked: false,
            revocationReason: "",
            blockTimestamp: block.timestamp
        });

        emit CredentialIssued(uuid, dataHash, issuerWallet, block.timestamp);
    }

    /**
     * @dev Revokes an anchored credential hash.
     */
    function revokeCredential(string calldata uuid, string calldata reason) external onlyVerifiedIssuer {
        CredentialRecord storage record = _credentials[uuid];
        require(record.dataHash != bytes32(0), "Credential not found");
        require(!record.isRevoked, "Credential already revoked");
        
        // Non-owners can only revoke credentials they issued
        if (msg.sender != owner) {
            require(record.issuerWallet == msg.sender, "Only the issuer can revoke");
        }

        record.isRevoked = true;
        record.revocationReason = reason;

        emit CredentialRevoked(uuid, reason, block.timestamp);
    }

    /**
     * @dev Retrieve credential records for verification.
     */
    function getCredential(string calldata uuid) external view returns (
        bytes32 dataHash,
        address issuerWallet,
        bool isRevoked,
        string memory revocationReason,
        uint256 blockTimestamp
    ) {
        CredentialRecord memory record = _credentials[uuid];
        return (
            record.dataHash,
            record.issuerWallet,
            record.isRevoked,
            record.revocationReason,
            record.blockTimestamp
        );
    }

    /**
     * @dev Log verification scan events for off-chain metrics.
     */
    function logVerification(string calldata uuid) external {
        emit CredentialVerified(uuid, msg.sender, block.timestamp);
    }
}
