import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

describe('OpenAPI Contract', () => {
  it('should have valid openapi.yaml structure', () => {
    const contractPath = join(
      __dirname,
      '../../specs/001-this-lib-will/contracts/openapi.yaml',
    );
    const content = readFileSync(contractPath, 'utf8');
    const spec = parseYaml(content);

    // Basic OpenAPI structure validation
    expect(spec).toBeDefined();
    expect(spec.openapi).toBeDefined();
    expect(typeof spec.openapi).toBe('string');
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBeDefined();
    expect(spec.info.version).toBeDefined();
  });
});
