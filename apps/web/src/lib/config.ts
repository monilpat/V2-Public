// Ensure API_BASE doesn't have trailing slash to prevent URL duplication issues
const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;
