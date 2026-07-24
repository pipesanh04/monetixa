import { NextResponse } from "next/server";
import { getSessionSerial } from "@/lib/auth";
import { getDepositWallet, isValidTxHash } from "@/lib/deposit";
import { sendTransferNotification } from "@/lib/email";
import { getPayoutAsset } from "@/lib/payout";
import { getTokenById } from "@/lib/tokens";
import type { Network } from "@/lib/tokens";

export type OrderRecord = {
  id: string;
  createdAt: string;
  serial: string;
  tokenId: string;
  tokenSymbol: string;
  network: Network;
  amount: string;
  paymentUsd: number;
  payoutAssetId: string;
  payoutSymbol: string;
  payoutAmount: number;
  destinationWallet: string;
  depositWallet: string | null;
  txHash: string;
  status: "pending_review" | "pending_payout";
  emailSent: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __mbxOrders: OrderRecord[] | undefined;
}

function getStore(): OrderRecord[] {
  if (!globalThis.__mbxOrders) {
    globalThis.__mbxOrders = [];
  }
  return globalThis.__mbxOrders;
}

export async function POST(request: Request) {
  const serial = await getSessionSerial();
  if (!serial) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tokenId = String(body.tokenId ?? "");
    const txHash = String(body.txHash ?? "").trim();
    const token = getTokenById(tokenId);
    const asset = getPayoutAsset(body.payoutAssetId);

    if (!token || !asset) {
      return NextResponse.json({ error: "Token o moneda inválidos" }, { status: 400 });
    }

    if (!isValidTxHash(txHash, token.network)) {
      return NextResponse.json(
        { error: "Hash de transacción inválido para esta red." },
        { status: 400 },
      );
    }

    const amount = String(body.amount ?? "");
    const depositWallet = getDepositWallet(token);

    const order: OrderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      serial,
      tokenId: token.id,
      tokenSymbol: token.symbol,
      network: token.network,
      amount,
      paymentUsd: Number(body.paymentUsd ?? 0),
      payoutAssetId: asset.id,
      payoutSymbol: asset.symbol,
      payoutAmount: Number(body.payoutAmount ?? 0),
      destinationWallet: String(body.destinationWallet ?? "").trim(),
      depositWallet,
      txHash,
      status: "pending_review",
      emailSent: false,
    };

    const notify = await sendTransferNotification({
      orderId: order.id,
      serial,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      network: token.network,
      contractAddress: token.contractAddress,
      amount,
      paymentUsd: order.paymentUsd,
      payoutSymbol: asset.symbol,
      payoutAmount: order.payoutAmount,
      payoutNetwork: asset.networkLabel,
      destinationWallet: order.destinationWallet,
      depositWallet,
      txHash,
    });

    order.emailSent = notify.sent;
    getStore().unshift(order);

    return NextResponse.json({
      ok: true,
      order,
      emailSent: notify.sent,
      emailNote: notify.sent
        ? undefined
        : notify.reason ||
          "Orden guardada. Configura SMTP en .env.local para envío automático.",
    });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}
