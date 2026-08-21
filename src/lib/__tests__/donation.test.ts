import { describe, expect, it } from 'vitest';

import {
  DONATION_ASSETS,
  DONATION_PRESETS,
  NETWORK_FEE_XLM,
  estimateFee,
  isDonationAsset,
  parseAmount,
  resolveActivePreset,
} from '../donation';

describe('donation assets', () => {
  it('offers exactly XLM, USDC and AQUA', () => {
    expect(DONATION_ASSETS.map((asset) => asset.id)).toEqual([
      'XLM',
      'USDC',
      'AQUA',
    ]);
  });

  it('recognizes valid assets and rejects others', () => {
    expect(isDonationAsset('XLM')).toBe(true);
    expect(isDonationAsset('AQUA')).toBe(true);
    expect(isDonationAsset('ETH')).toBe(false);
    expect(isDonationAsset(null)).toBe(false);
  });
});

describe('parseAmount', () => {
  it('parses positive decimal amounts', () => {
    expect(parseAmount('10')).toBe(10);
    expect(parseAmount('12.5')).toBe(12.5);
    expect(parseAmount(' 25 ')).toBe(25);
  });

  it('rejects empty, malformed and non-positive amounts', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('NaN')).toBeNull();
    expect(parseAmount('Infinity')).toBeNull();
  });
});

describe('resolveActivePreset', () => {
  it('returns the matching preset index', () => {
    DONATION_PRESETS.forEach((preset, index) => {
      expect(resolveActivePreset(preset)).toBe(index);
    });
  });

  it('returns -1 for custom or missing amounts', () => {
    expect(resolveActivePreset(12.5)).toBe(-1);
    expect(resolveActivePreset(null)).toBe(-1);
  });
});

describe('estimateFee', () => {
  it('adds the network fee to the total when paying in XLM', () => {
    const estimate = estimateFee(25, 'XLM');

    expect(estimate.amount).toBe(25);
    expect(estimate.networkFeeXlm).toBe(NETWORK_FEE_XLM);
    expect(estimate.total).toBe(25 + NETWORK_FEE_XLM);
    expect(estimate.totalAsset).toBe('XLM');
  });

  it('keeps the donated asset out of the XLM network fee for other assets', () => {
    const estimate = estimateFee(50, 'USDC');

    expect(estimate.networkFeeXlm).toBe(NETWORK_FEE_XLM);
    expect(estimate.total).toBe(50);
    expect(estimate.totalAsset).toBe('USDC');
  });
});
