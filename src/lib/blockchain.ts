// Dynamically resolve Node fs and path on server only to prevent bundler compilation errors in browser.
let fs: any = null;
let path: any = null;
if (typeof window === "undefined") {
  try {
    fs = require("fs");
    path = require("path");
  } catch (e) {
    console.warn("Server fs/path require failed:", e);
  }
}

export interface AnchorReceipt {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  anchoredAt: string;
  error?: string;
}

export interface RevocationReceipt {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  revokedAt: string;
  error?: string;
}

export interface CredentialOnChainRecord {
  hash: string;
  isRevoked: boolean;
  revocationReason: string;
  issuerWallet: string;
  blockTimestamp: number;
}

export interface BlockchainProvider {
  chainId: number;
  chainName: string;
  contractAddress: string;
  anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt>;
  revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt>;
  getCredentialHash(uuid: string): Promise<CredentialOnChainRecord>;
}

// ---------------------------------------------------------
// Mock Blockchain Provider for Local Development
// ---------------------------------------------------------
export class MockBlockchainProvider implements BlockchainProvider {
  chainId = 84532; // Base Sepolia Chain ID
  chainName = "Base Sepolia (Mocked)";
  contractAddress = "0xMockCredentialRegistryAddressBaseSepolia";

  private getStateFilePath() {
    if (!fs || !path) return "";
    const dir = path.join(process.cwd(), "src", "lib");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, "mock_blockchain_state.json");
  }

  private readState(): Record<string, CredentialOnChainRecord> {
    if (typeof window !== "undefined") {
      try {
        const content = localStorage.getItem("mock_blockchain_state");
        return content ? JSON.parse(content) : {};
      } catch (e) {
        console.error("Failed to read mock blockchain state from localStorage:", e);
        return {};
      }
    }

    const filePath = this.getStateFilePath();
    if (filePath && fs && fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to read mock blockchain state, resetting:", e);
      }
    }
    return {};
  }

  private writeState(state: Record<string, CredentialOnChainRecord>) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mock_blockchain_state", JSON.stringify(state));
      } catch (e) {
        console.error("Failed to write mock blockchain state to localStorage:", e);
      }
      return;
    }

    const filePath = this.getStateFilePath();
    if (filePath && fs) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
      } catch (e) {
        console.error("Failed to write mock blockchain state:", e);
      }
    }
  }

  async anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt> {
    const state = this.readState();
    if (state[uuid]) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        anchoredAt: "",
        error: "Credential already anchored on-chain (mock)"
      };
    }

    state[uuid] = {
      hash: dataHash,
      isRevoked: false,
      revocationReason: "",
      issuerWallet: issuerWallet || "0x0000000000000000000000000000000000000000",
      blockTimestamp: Math.floor(Date.now() / 1000)
    };
    this.writeState(state);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const blockNum = Math.floor(Math.random() * 100000) + 1200000;

    return {
      success: true,
      transactionHash: txHash,
      blockNumber: blockNum,
      anchoredAt: new Date().toISOString()
    };
  }

  async revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt> {
    const state = this.readState();
    const record = state[uuid];
    if (!record) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: "Credential not found on-chain (mock)"
      };
    }

    if (record.isRevoked) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: "Credential already revoked on-chain (mock)"
      };
    }

    record.isRevoked = true;
    record.revocationReason = reason;
    this.writeState(state);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const blockNum = Math.floor(Math.random() * 100000) + 1300000;

    return {
      success: true,
      transactionHash: txHash,
      blockNumber: blockNum,
      revokedAt: new Date().toISOString()
    };
  }

  async getCredentialHash(uuid: string): Promise<CredentialOnChainRecord> {
    const state = this.readState();
    const record = state[uuid];
    if (record) {
      return record;
    }
    return {
      hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      isRevoked: false,
      revocationReason: "",
      issuerWallet: "0x0000000000000000000000000000000000000000",
      blockTimestamp: 0
    };
  }
}

// ---------------------------------------------------------
// Base Sepolia Viem Blockchain Provider
// ---------------------------------------------------------
const ABI = [
  {
    inputs: [
      { name: "uuid", type: "string" },
      { name: "dataHash", type: "bytes32" },
      { name: "issuerWallet", type: "address" }
    ],
    name: "anchorCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "uuid", type: "string" },
      { name: "reason", type: "string" }
    ],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "uuid", type: "string" }],
    name: "getCredential",
    outputs: [
      { name: "dataHash", type: "bytes32" },
      { name: "issuerWallet", type: "address" },
      { name: "isRevoked", type: "bool" },
      { name: "revocationReason", type: "string" },
      { name: "blockTimestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "issuer", type: "address" }],
    name: "isIssuerVerified",
    outputs: [{ name: "status", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export class BaseSepoliaProvider implements BlockchainProvider {
  chainId = 84532;
  chainName = "Base Sepolia";
  contractAddress: string;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  }

  private async getClients() {
    // Dynamic import to avoid crash if viem is not fully set up or imported in edge runtimes
    const { createPublicClient, createWalletClient, http } = await import("viem");
    const { baseSepolia } = await import("viem/chains");
    const { privateKeyToAccount } = await import("viem/accounts");

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "https://sepolia.base.org";
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    if (!privateKey) {
      return { publicClient, walletClient: null, account: null };
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    return { publicClient, walletClient, account };
  }

  async anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();
      if (!walletClient || !account) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is missing on server");
      }

      // Format dataHash correctly as bytes32
      const formattedHash = dataHash.startsWith("0x") ? (dataHash as `0x${string}`) : (`0x${dataHash}` as `0x${string}`);

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "anchorCredential",
        args: [uuid, formattedHash, issuerWallet as `0x${string}`]
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for 1 confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        anchoredAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.anchorCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        anchoredAt: "",
        error: e.message || "Base Sepolia transaction failed"
      };
    }
  }

  async revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();
      if (!walletClient || !account) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is missing on server");
      }

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "revokeCredential",
        args: [uuid, reason]
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        revokedAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.revokeCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: e.message || "Base Sepolia transaction failed"
      };
    }
  }

  async getCredentialHash(uuid: string): Promise<CredentialOnChainRecord> {
    try {
      const { publicClient } = await this.getClients();
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "getCredential",
        args: [uuid]
      }) as [string, string, boolean, string, bigint];

      return {
        hash: result[0],
        issuerWallet: result[1],
        isRevoked: result[2],
        revocationReason: result[3],
        blockTimestamp: Number(result[4])
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.getCredentialHash error:", e);
      return {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        issuerWallet: "0x0000000000000000000000000000000000000000",
        isRevoked: false,
        revocationReason: "",
        blockTimestamp: 0
      };
    }
  }
}

// ---------------------------------------------------------
// Global Provider Getter
// ---------------------------------------------------------
export function getBlockchainProvider(): BlockchainProvider {
  const contractAddr = process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (contractAddr && contractAddr !== "0x0000000000000000000000000000000000000000" && privateKey) {
    console.log("Blockchain Service: Using Base Sepolia Network.");
    return new BaseSepoliaProvider();
  } else {
    console.log("Blockchain Service: Config unavailable. Using MockBlockchainProvider.");
    return new MockBlockchainProvider();
  }
}
