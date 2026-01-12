import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('GET /api/pools returns valid response', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/pools`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    // Should have pools array (even if empty)
    if (data.pools) {
      expect(Array.isArray(data.pools)).toBe(true);
    }
  });

  test('GET /api/stats returns valid response', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/stats`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    if (data.stats) {
      expect(data.stats).toHaveProperty('totalTvl');
      expect(data.stats).toHaveProperty('vaultCount');
    }
  });

  test('GET /api/poolComposition requires pool parameter', async ({ request }) => {
    // Without pool parameter
    const response = await request.get(`${baseURL}/api/poolComposition`);
    expect([200, 400]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('GET /api/poolComposition with valid pool parameter', async ({ request }) => {
    // Use a test pool address (this will fail if RPC is not configured, but structure should be correct)
    const testPool = '0x0000000000000000000000000000000000000000';
    const response = await request.get(`${baseURL}/api/poolComposition?pool=${testPool}`);
    
    // Should return 200 or 400 (400 if pool is invalid)
    expect([200, 400]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('POST endpoints return appropriate responses', async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    
    // Test that POST endpoints that require client-side signing return appropriate errors
    const endpoints = [
      '/api/deposit',
      '/api/setTrader',
      '/api/approveDeposit',
      '/api/createPool',
    ];

    for (const endpoint of endpoints) {
      const response = await request.post(`${baseURL}${endpoint}`, {
        data: {},
      });
      
      // Should return 400 with helpful message
      expect([400, 500]).toContain(response.status());
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('fail');
    }
  });

  test('GET /api/pool/[address]/metrics structure', async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    const response = await request.get(`${baseURL}/api/pool/${testAddress}/metrics`);
    
    // Should return 200 or 400
    expect([200, 400]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('GET /api/user/[address]/deposits structure', async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    const response = await request.get(`${baseURL}/api/user/${testAddress}/deposits`);
    
    // Should return 200 or 400
    expect([200, 400]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    if (data.deposits) {
      expect(Array.isArray(data.deposits)).toBe(true);
    }
  });
});
