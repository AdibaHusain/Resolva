import SLAConfig from '../models/SLAConfig.model.js';

// Default hours if no SLAConfig row exists
const FALLBACK = {
  critical: 2,
  high:     12,
  medium:   48,
  low:      120,
};

export const computeSLADeadline = async (category, priority) => {
  const config = await SLAConfig.findOne({ category, priority, isActive: true });
  const hours  = config ? config.resolutionHours : FALLBACK[priority] ?? 48;
  return new Date(Date.now() + hours * 3_600_000);
};