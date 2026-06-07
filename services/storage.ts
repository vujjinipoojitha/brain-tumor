import { Scan } from '../types';

const SCANS_KEY = 'tumornot_scans';
const MAX_SCANS = 20; // prevent localStorage quota exceeded

export const getScans = (): Scan[] => {
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveScan = (scan: Scan): void => {
  try {
    const existing = getScans();
    const updated = [scan, ...existing].slice(0, MAX_SCANS);
    // Strip large base64 image data from older scans to save space
    const compressed = updated.map((s, i) => ({
      ...s,
      mriUrl: i < 3 ? s.mriUrl : ''
    }));
    localStorage.setItem(SCANS_KEY, JSON.stringify(compressed));
  } catch {
    // If quota still exceeded, wipe and save just this one (no image)
    try {
      localStorage.removeItem(SCANS_KEY);
      localStorage.setItem(SCANS_KEY, JSON.stringify([{ ...scan, mriUrl: '' }]));
    } catch {
      console.warn('localStorage unavailable — scan not saved locally');
    }
  }
};

export const clearScans = (): void => {
  localStorage.removeItem(SCANS_KEY);
};

export const generateCaseId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `TMR-${dateStr}-${rand}`;
};