"use client";

import { create } from "zustand";
import type { Network } from "@/lib/tokens";
import type { PayoutAssetId } from "@/lib/payout";

export type WizardStep =
  | "token"
  | "payout"
  | "destination"
  | "confirm"
  | "done";

export type WizardFlow = "buyback" | "release";

type BuybackState = {
  step: WizardStep;
  flow: WizardFlow;
  network: Network;
  tokenId: string | null;
  amount: string;
  payoutAssetId: PayoutAssetId | null;
  destinationWallet: string;
  paymentUsd: number;
  payoutAmount: number;
  lastOrderId: string | null;
  lastTxHash: string | null;
  demo: boolean;
  setStep: (step: WizardStep) => void;
  setFlow: (flow: WizardFlow) => void;
  setNetwork: (network: Network) => void;
  setTokenId: (id: string | null) => void;
  setAmount: (amount: string) => void;
  setPayoutAssetId: (id: PayoutAssetId | null) => void;
  setDestinationWallet: (w: string) => void;
  setQuote: (paymentUsd: number, payoutAmount: number) => void;
  setResult: (orderId: string, txHash: string | null, demo: boolean) => void;
  startRelease: (tokenId: string, network: Network, quota: number) => void;
  reset: () => void;
};

const initial = {
  step: "token" as WizardStep,
  flow: "buyback" as WizardFlow,
  network: "bsc" as Network,
  tokenId: null as string | null,
  amount: "",
  payoutAssetId: null as PayoutAssetId | null,
  destinationWallet: "",
  paymentUsd: 0,
  payoutAmount: 0,
  lastOrderId: null as string | null,
  lastTxHash: null as string | null,
  demo: false,
};

export const useBuybackStore = create<BuybackState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setFlow: (flow) => set({ flow }),
  setNetwork: (network) => set({ network, tokenId: null, flow: "buyback" }),
  setTokenId: (tokenId) => set({ tokenId }),
  setAmount: (amount) => set({ amount }),
  setPayoutAssetId: (payoutAssetId) => set({ payoutAssetId }),
  setDestinationWallet: (destinationWallet) => set({ destinationWallet }),
  setQuote: (paymentUsd, payoutAmount) => set({ paymentUsd, payoutAmount }),
  setResult: (lastOrderId, lastTxHash, demo) =>
    set({ lastOrderId, lastTxHash, demo, step: "done" }),
  startRelease: (tokenId, network, quota) =>
    set({
      ...initial,
      flow: "release",
      step: "token",
      network,
      tokenId,
      amount: String(quota),
    }),
  reset: () => set({ ...initial }),
}));
