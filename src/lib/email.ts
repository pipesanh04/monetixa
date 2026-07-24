export type TransferNotification = {
  orderId: string;
  serial: string;
  tokenSymbol: string;
  tokenName: string;
  network: string;
  contractAddress: string;
  amount: string;
  paymentUsd: number;
  payoutSymbol: string;
  payoutAmount: number;
  payoutNetwork: string;
  destinationWallet: string;
  depositWallet: string | null;
  txHash: string;
};

export function getNotifyEmail(): string {
  return (
    process.env.NOTIFY_EMAIL?.trim() || "gladiusfinance.org@gmail.com"
  );
}

export async function sendTransferNotification(
  data: TransferNotification,
): Promise<{ sent: boolean; reason?: string }> {
  const to = getNotifyEmail();
  const subject = `[Monetixa] Nueva transferencia — ${data.tokenSymbol} — ${data.orderId}`;
  const body = [
    "Nueva operación de buyback registrada",
    "",
    `Orden: ${data.orderId}`,
    `Serial: ${data.serial}`,
    `Fecha: ${new Date().toISOString()}`,
    "",
    "── Token enviado ──",
    `Token: ${data.tokenSymbol} (${data.tokenName})`,
    `Red: ${data.network}`,
    `Contrato: ${data.contractAddress || "nativo"}`,
    `Cantidad: ${data.amount}`,
    `Pago Total USD: $${data.paymentUsd.toFixed(2)}`,
    `TX Hash: ${data.txHash}`,
    `Wallet depósito: ${data.depositWallet || "—"}`,
    "",
    "── Pago al cliente ──",
    `Moneda: ${data.payoutSymbol}`,
    `Red cobro: ${data.payoutNetwork}`,
    `Cantidad: ${data.payoutAmount}`,
    `Wallet destino: ${data.destinationWallet}`,
    "",
    "— Monetixa",
  ].join("\n");

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);

  if (!user || !pass) {
    console.log("[notify] SMTP no configurado. Correo pendiente:\n", body);
    return { sent: false, reason: "SMTP no configurado" };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM?.trim() || user,
      to,
      subject,
      text: body,
    });

    return { sent: true };
  } catch (err) {
    console.error("[notify] error enviando correo", err);
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Error SMTP",
    };
  }
}
