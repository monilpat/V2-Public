// Use local API routes if API_URL is not set or points to same domain
// Otherwise use the provided API_URL (for separate API server)
const rawApiBase = process.env.NEXT_PUBLIC_API_URL;
let API_BASE: string;

if (!rawApiBase || rawApiBase.includes('vercel.app') || rawApiBase === 'v2-public.vercel.app') {
  // Use relative paths for Vercel API routes (same domain)
  API_BASE = '/api';
} else {
  // Use external API server
  API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;
}
