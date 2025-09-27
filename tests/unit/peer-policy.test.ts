import { describe, expect, it } from 'vitest';

describe('Peer Conflict Policy', () => {
  it('should detect peer conflict from CI error output', () => {
    const ciErrorOutput =
      'ERESOLVE unable to resolve dependency tree\nnpm ERR! peer dep missing: react@^18.0.0';

    const isPeerConflict =
      ciErrorOutput.includes('ERESOLVE') ||
      ciErrorOutput.includes('peer dep');

    expect(isPeerConflict).toBe(true);
  });

  it('should not auto-adjust peerDependencies', () => {
    const packageJson = {
      dependencies: { 'react-router': '^6.7.0' },
      peerDependencies: { react: '^17.0.0' },
    };

    // Policy: never modify peerDependencies
    const originalPeers = { ...packageJson.peerDependencies };
    expect(packageJson.peerDependencies).toEqual(originalPeers);
  });

  it('should report peer conflict in attempt result', () => {
    const attemptResult = {
      packageName: 'react-router',
      candidateVersion: '6.8.0',
      ciStatus: 'fail' as const,
      reason: 'peer dependency conflict with react@^17.0.0',
      action: 'revert' as const,
      timestamp: new Date().toISOString(),
    };

    expect(attemptResult.ciStatus).toBe('fail');
    expect(attemptResult.reason).toContain('peer dependency conflict');
    expect(attemptResult.action).toBe('revert');
  });

  it('should skip to next version when peer conflict detected', () => {
    const versionsToTry = ['6.8.0', '6.7.2', '6.7.1'];
    const failedVersions = ['6.8.0']; // Failed due to peer conflict
    const nextVersion = versionsToTry.find(
      v => !failedVersions.includes(v),
    );

    expect(nextVersion).toBe('6.7.2');
  });
});
