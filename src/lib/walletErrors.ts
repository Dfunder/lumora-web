// ---------------------------------------------------------------------------
// Wallet connection error model & development-only demo mode.
//
// These are pure helpers (no React, no store) so the connection logic can be
// reasoned about and unit-tested in isolation. They give the UI two things the
// wallet flow previously lacked:
//
//   1. A clear *source* for every failure (browser / wallet / backend), so the
//      user is told whether to install a wallet, act in their wallet, or retry
//      because the server was unreachable.
//   2. A single, explicit gate for the demo login path so it can never run — or
//      masquerade as a real wallet session — outside development.
// ---------------------------------------------------------------------------

/** Where a wallet-connection failure originated. */
export type WalletErrorSource = "browser" | "wallet" | "backend" | "unknown";

export interface ClassifiedWalletError {
  /** Which layer failed, so the UI can give a precise next step. */
  source: WalletErrorSource;
  /** A user-facing, actionable message. */
  message: string;
}

/**
 * Sentinel error message thrown when the browser exposes no injected wallet
 * provider (and the demo path is not enabled). Kept as a stable string so it can
 * be recognised by {@link classifyWalletError} across module boundaries.
 */
export const NO_WALLET_DETECTED = "NO_WALLET_DETECTED";

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

/**
 * Classify an arbitrary wallet-connection error into a {@link WalletErrorSource}
 * and a friendly message. The matching is intentionally message-based so it
 * works with the errors thrown by the wallet provider, the store, and the API
 * layer alike.
 */
export function classifyWalletError(error: unknown): ClassifiedWalletError {
  const raw = rawMessage(error);

  // -- Browser: the environment itself cannot provide a wallet ---------------
  if (raw.includes(NO_WALLET_DETECTED) || raw.includes("No wallet detected")) {
    return {
      source: "browser",
      message:
        "No wallet was detected in this browser. Install a wallet extension such as MetaMask, then try again.",
    };
  }

  // -- Wallet: the wallet app rejected or could not fulfil the request -------
  if (raw.includes("No accounts found")) {
    return {
      source: "wallet",
      message:
        "No wallet accounts are available. Unlock your wallet, select an account, and try again.",
    };
  }
  if (raw.includes("rejected")) {
    return {
      source: "wallet",
      message:
        "The request was rejected in your wallet. Approve the connection and signature to continue.",
    };
  }

  // -- Backend: the server rejected the signature or was unreachable ----------
  if (raw.includes("Signature verification failed")) {
    return {
      source: "backend",
      message:
        "The server could not verify your wallet signature. Please try connecting again.",
    };
  }
  if (
    raw.includes("Could not start wallet") ||
    raw.includes("Could not verify") ||
    raw.includes("Network Error") ||
    raw.includes("timeout")
  ) {
    return {
      source: "backend",
      message:
        "We couldn't reach the authentication server. Check your connection and try again.",
    };
  }

  return {
    source: "unknown",
    message:
      "Something went wrong while connecting your wallet. Please try again.",
  };
}

/** Short, human label for an error source — for badges / inline hints. */
export function walletErrorSourceLabel(source: WalletErrorSource): string {
  switch (source) {
    case "browser":
      return "Browser";
    case "wallet":
      return "Wallet";
    case "backend":
      return "Server";
    default:
      return "Error";
  }
}

// ---------------------------------------------------------------------------
// Development-only demo login
// ---------------------------------------------------------------------------

/**
 * Fixed address used by the demo login path. It is not a real user wallet; the
 * demo session is always visibly badged and only ever available when
 * {@link isDemoWalletEnabled} returns `true`.
 */
export const DEMO_WALLET_ADDRESS = "0x742d35Cc6434Bb0532C4457A88B95935F72C0770";

/** Deterministic, clearly-fake signature for the demo path. */
export function buildDemoSignature(challenge: string): string {
  return `0xdemo${btoa(challenge)}`;
}

/**
 * Whether the demo wallet login is enabled. Demo login is a development-only
 * convenience that fabricates a signature instead of using a real wallet, so it
 * is gated behind an explicit opt-in **and** is never available in production.
 *
 * Enable it locally with `NEXT_PUBLIC_ENABLE_DEMO_WALLET=true`. The `override`
 * parameter exists only for unit tests; production code passes nothing and the
 * values are read from `process.env` (inlined by Next at build time).
 */
export function isDemoWalletEnabled(override?: {
  nodeEnv?: string;
  flag?: string;
}): boolean {
  const nodeEnv = override?.nodeEnv ?? process.env.NODE_ENV;
  const flag = override?.flag ?? process.env.NEXT_PUBLIC_ENABLE_DEMO_WALLET;
  return nodeEnv !== "production" && flag === "true";
}
