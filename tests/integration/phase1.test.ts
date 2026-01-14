/**
 * Phase 1: Foundation Verification Tests
 *
 * Run with: DATABASE_URL="..." npx vitest run tests/integration/phase1.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:10000';

describe('Phase 1: Foundation', () => {

  it('should return health check with status ok', async () => {
    const response = await fetch(`${API_BASE}/health`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('should show database connected in health check', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    expect(data.config.database).toBe(true);
    expect(data.database).toBe('connected');
  });

  it('should authenticate API requests (status endpoint)', async () => {
    const response = await fetch(`${API_BASE}/api/status`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.version).toBeDefined();
  });

  it('should retrieve Anti-Bullying example from knowledge API', async () => {
    const response = await fetch(`${API_BASE}/api/knowledge/examples/Anti-Bullying`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.example).toBeDefined();
    expect(data.example.title).toBe('Anti-Bullying');
    expect(data.example.design_spec).toBeDefined();
    expect(data.example.design_spec.topics).toBeDefined();
    expect(data.example.design_spec.topics.length).toBeGreaterThan(0);
  });

  it('should list example courses', async () => {
    const response = await fetch(`${API_BASE}/api/knowledge/examples`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.examples).toBeDefined();
    expect(data.examples.length).toBeGreaterThan(0);

    const antiBullying = data.examples.find((e: any) => e.title === 'Anti-Bullying');
    expect(antiBullying).toBeDefined();
  });

  it('Anti-Bullying example should have complete design spec structure', async () => {
    const response = await fetch(`${API_BASE}/api/knowledge/examples/Anti-Bullying`);
    const data = await response.json();
    const designSpec = data.example.design_spec;

    // Verify metadata
    expect(designSpec.metadata).toBeDefined();
    expect(designSpec.metadata.title).toBe('Anti-Bullying');
    expect(designSpec.metadata.duration).toBe(15);

    // Verify topics and objectives
    expect(designSpec.topics.length).toBe(2);

    const topic1 = designSpec.topics[0];
    expect(topic1.title).toBe('Defining Bullying');
    expect(topic1.objectives.length).toBe(5);

    // Verify objectives have required fields
    topic1.objectives.forEach((obj: any) => {
      expect(obj.id).toBeDefined();
      expect(obj.text).toBeDefined();
      expect(obj.bloomLevel).toBeDefined();
    });
  });

});
