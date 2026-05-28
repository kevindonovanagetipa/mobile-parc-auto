export const validateRequired = (v) => v !== undefined && v !== null && String(v).trim() !== '';
export const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));
export const validateNumber = (v) => !Number.isNaN(Number(v));
