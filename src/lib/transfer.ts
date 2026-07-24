import type { Network, TokenConfig } from "./tokens";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
] as const;

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }>;
      publicKey?: { toString: () => string };
    };
  }
}

const CHAIN_IDS: Record<"ethereum" | "bsc", string> = {
  ethereum: "0x1",
  bsc: "0x38",
};

async function ensureEvmChain(network: "ethereum" | "bsc") {
  if (!window.ethereum) throw new Error("MetaMask no detectado.");
  const chainId = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;
  const target = CHAIN_IDS[network];
  if (chainId.toLowerCase() === target.toLowerCase()) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902 && network === "bsc") {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function transferEvmToken(params: {
  token: TokenConfig;
  amount: number;
  treasury: string;
}): Promise<string> {
  const { token, amount, treasury } = params;
  if (token.network === "solana") {
    throw new Error("Red incorrecta para transferencia EVM.");
  }
  if (!window.ethereum) throw new Error("Instala MetaMask para continuar.");

  const { BrowserProvider, Contract, parseUnits } = await import("ethers");

  await ensureEvmChain(token.network);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  if (token.isNative || !token.contractAddress) {
    const value = parseUnits(String(amount), token.decimals);
    const tx = await signer.sendTransaction({ to: treasury, value });
    await tx.wait();
    return tx.hash;
  }

  const contract = new Contract(token.contractAddress, ERC20_ABI, signer);
  const value = parseUnits(String(amount), token.decimals);
  const tx = await contract.transfer(treasury, value);
  await tx.wait();
  return tx.hash as string;
}

export async function transferSolanaToken(params: {
  token: TokenConfig;
  amount: number;
  treasury: string;
}): Promise<string> {
  const { token, amount, treasury } = params;
  if (token.network !== "solana") {
    throw new Error("Red incorrecta para transferencia Solana.");
  }
  if (!window.solana?.isPhantom) {
    throw new Error("Instala Phantom Wallet para continuar.");
  }

  const {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
  } = await import("@solana/web3.js");

  await window.solana.connect();
  const from = window.solana.publicKey?.toString();
  if (!from) throw new Error("No se pudo conectar Phantom.");

  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed",
  );
  const fromPubkey = new PublicKey(from);
  const toPubkey = new PublicKey(treasury);
  const { blockhash } = await connection.getLatestBlockhash();

  if (token.isNative || !token.contractAddress) {
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      }),
    );
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;
    const { signature } = await window.solana.signAndSendTransaction(tx);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }

  const {
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
  } = await import("@solana/spl-token");

  const mint = new PublicKey(token.contractAddress);
  const fromAta = await getAssociatedTokenAddress(mint, fromPubkey);
  const toAta = await getAssociatedTokenAddress(mint, toPubkey);

  const tx = new Transaction();
  try {
    await getAccount(connection, toAta);
  } catch {
    tx.add(
      createAssociatedTokenAccountInstruction(
        fromPubkey,
        toAta,
        toPubkey,
        mint,
      ),
    );
  }

  const rawAmount = BigInt(
    Math.round(amount * 10 ** token.decimals),
  );
  tx.add(
    createTransferInstruction(fromAta, toAta, fromPubkey, rawAmount),
  );
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;

  const { signature } = await window.solana.signAndSendTransaction(tx);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}

export async function transferTokenToTreasury(params: {
  token: TokenConfig;
  amount: number;
  treasury: string;
}): Promise<string> {
  if (params.token.network === "solana") {
    return transferSolanaToken(params);
  }
  return transferEvmToken(params);
}

export function explorerTxUrl(network: Network, hash: string): string {
  if (network === "ethereum") return `https://etherscan.io/tx/${hash}`;
  if (network === "bsc") return `https://bscscan.com/tx/${hash}`;
  return `https://solscan.io/tx/${hash}`;
}
