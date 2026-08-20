import { describe, expect, it } from 'vitest';

import {
  buildDemoSignature,
  classifyWalletError,
  DEMO_WALLET_ADDRESS,
  isDemoWalletEnabled,
  NO_WALLET_DETECTED,
  walletErrorSourceLabel,
} from '../walletErrors';

describe('classifyWalletError', () => {
  it('flags a missing provider as a browser-level problem', () => {
    const result = classifyWalletError(new Error(NO_WALLET_DETECTED));
    expect(result.source).toBe('browser');
    expect(result.message).toMatch(/install a wallet/i);
  });

  it('treats a locked wallet (no accounts) as a wallet-level problem', () => {
    const result = classifyWalletError(
      new Error('No accounts found. Please unlock MetaMask.'),
    );
    expect(result.source).toBe('wallet');
  });

  it('treats a rejected request as a wallet-level problem', () => {
    const result = classifyWalletError(
      new Error('Connection was rejected. Please approve the request.'),
    );
    expect(result.source).toBe('wallet');
    expect(result.message).toMatch(/approve/i);
  });

  it('treats a failed signature verification as a backend problem', () => {
    const result = classifyWalletError(
      new Error('Signature verification failed. Please try again.'),
    );
    expect(result.source).toBe('backend');
  });

  it('treats an unreachable challenge/verify endpoint as a backend problem', () => {
    expect(
      classifyWalletError(new Error('Could not start wallet authentication.'))
        .source,
    ).toBe('backend');
    expect(
      classifyWalletError(new Error('Network Error')).source,
    ).toBe('backend');
  });

  it('falls back to "unknown" for unrecognised errors, never leaking raw text', () => {
    const result = classifyWalletError({ weird: true });
    expect(result.source).toBe('unknown');
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('accepts plain string errors', () => {
    expect(classifyWalletError('User rejected the request').source).toBe(
      'wallet',
    );
  });
});

describe('walletErrorSourceLabel', () => {
  it('maps each source to a human label', () => {
    expect(walletErrorSourceLabel('browser')).toBe('Browser');
    expect(walletErrorSourceLabel('wallet')).toBe('Wallet');
    expect(walletErrorSourceLabel('backend')).toBe('Server');
    expect(walletErrorSourceLabel('unknown')).toBe('Error');
  });
});

describe('isDemoWalletEnabled', () => {
  it('is enabled only when explicitly opted in outside production', () => {
    expect(
      isDemoWalletEnabled({ nodeEnv: 'development', flag: 'true' }),
    ).toBe(true);
  });

  it('is disabled when the flag is not set', () => {
    expect(
      isDemoWalletEnabled({ nodeEnv: 'development', flag: undefined }),
    ).toBe(false);
    expect(isDemoWalletEnabled({ nodeEnv: 'development', flag: 'false' })).toBe(
      false,
    );
  });

  it('is never enabled in production, even with the flag set', () => {
    expect(isDemoWalletEnabled({ nodeEnv: 'production', flag: 'true' })).toBe(
      false,
    );
  });
});

describe('buildDemoSignature', () => {
  it('produces a deterministic, clearly-fake signature', () => {
    const sig = buildDemoSignature('challenge-123');
    expect(sig).toBe(buildDemoSignature('challenge-123'));
    expect(sig.startsWith('0xdemo')).toBe(true);
  });

  it('exposes a stable, non-empty demo address', () => {
    expect(DEMO_WALLET_ADDRESS).toMatch(/^0x[0-9a-fA-F]+$/);
  });
});
