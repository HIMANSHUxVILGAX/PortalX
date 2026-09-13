/**
 * Format seconds into MM:SS display string.
 */
export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a pseudo-random device fingerprint for session binding.
 */
export function generateDeviceFingerprint(): string {
  const chars = 'abcdef0123456789';
  let fp = 'hdev_';
  for (let i = 0; i < 32; i++) {
    fp += chars[Math.floor(Math.random() * chars.length)];
  }
  return fp;
}

