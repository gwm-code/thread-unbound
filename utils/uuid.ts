/**
 * UUID generation utility with mobile browser compatibility
 * crypto.randomUUID() requires HTTPS on mobile, so we provide a fallback
 */

export const generateUUID = (): string => {
  // Try native crypto.randomUUID() first (works on localhost and HTTPS)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Falls through to fallback
    }
  }

  // Fallback for non-secure contexts (HTTP on mobile browsers)
  // RFC4122 version 4 compliant UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
