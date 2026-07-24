import type { Network } from "./tokens";

export type BankPartner = {
  id: "dbs" | "cumberland" | "b2c2" | "galaxy" | "falconx" | "wintermute";
  name: string;
  networks: Network[];
  status: "active" | "processing";
};

/**
 * Instituciones / desks reales de liquidez OTC e institucional.
 * Referencia de mercado (no implica partnership con Monetixa).
 */
export const BANKS: BankPartner[] = [
  {
    id: "dbs",
    name: "DBS Digital Exchange",
    networks: ["ethereum", "bsc", "solana"],
    status: "active",
  },
  {
    id: "cumberland",
    name: "Cumberland",
    networks: ["ethereum", "bsc", "solana"],
    status: "active",
  },
  {
    id: "b2c2",
    name: "B2C2",
    networks: ["ethereum", "bsc"],
    status: "active",
  },
  {
    id: "galaxy",
    name: "Galaxy Digital",
    networks: ["ethereum", "bsc", "solana"],
    status: "active",
  },
  {
    id: "falconx",
    name: "FalconX",
    networks: ["ethereum", "bsc", "solana"],
    status: "active",
  },
  {
    id: "wintermute",
    name: "Wintermute",
    networks: ["ethereum", "bsc", "solana"],
    status: "active",
  },
];
