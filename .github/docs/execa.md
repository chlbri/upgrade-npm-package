# Execa Documentation

Execa est une bibliothèque moderne pour l'exécution de processus en
Node.js, conçue pour remplacer les outils traditionnels comme `shelljs`
avec une API plus sûre et plus performante.

## Installation

```bash
npm install execa
```

## Avantages par rapport à shelljs

1. **Sécurité** : Pas de risque d'injection de shell, pas d'échappement
   nécessaire
2. **Performance** : Optimisé pour l'usage programmatique
3. **Promises natives** : Support moderne async/await
4. **Gestion d'erreurs** : Erreurs détaillées avec contexte
5. **Streaming** : Support avancé des streams Node.js et Web
6. **Cross-platform** : Meilleur support Windows avec PATHEXT et shebangs

## Usage de base

### Syntaxe simple avec template strings

```typescript
import { execa } from 'execa';

// Exécution basique
const { stdout } = await execa`npm run build`;
console.log(stdout);

// Avec arguments dynamiques
const branch = 'main';
await execa`git checkout ${branch}`;
```

### Syntaxe script (recommandée pour les scripts)

```typescript
import { $ } from 'execa';

const { stdout: name } = await $`cat package.json`.pipe`grep name`;
console.log(name);

const branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;
```

### Syntaxe array (pour un contrôle précis)

```typescript
import { execa } from 'execa';

const result = await execa('npm', ['run', 'build'], {
  cwd: '/path/to/project',
  env: { NODE_ENV: 'production' },
});
```

## Options principales

### Options d'exécution

```typescript
const result = await execa('node', ['script.js'], {
  cwd: '/working/directory', // Répertoire de travail
  env: { NODE_ENV: 'production' }, // Variables d'environnement
  timeout: 30000, // Timeout en ms
  preferLocal: true, // Binaires locaux en priorité
  cleanup: true, // Nettoyer les processus à la sortie
});
```

### Options d'entrée/sortie

```typescript
const result = await execa('command', {
  input: 'text input', // Entrée texte
  stdin: 'pipe', // 'pipe', 'inherit', 'ignore'
  stdout: 'pipe', // Même options que stdin
  stderr: 'pipe', // Même options que stdin
  all: true, // Combiner stdout/stderr
  encoding: 'utf8', // Encodage des chaînes
  lines: true, // Découper en lignes
});
```

### Gestion des erreurs

```typescript
import { execa, ExecaError } from 'execa';

try {
  await execa`unknown-command`;
} catch (error) {
  if (error instanceof ExecaError) {
    console.log('Command:', error.command);
    console.log('Exit code:', error.exitCode);
    console.log('Signal:', error.signal);
    console.log('Stdout:', error.stdout);
    console.log('Stderr:', error.stderr);
    console.log('Duration:', error.durationMs, 'ms');
  }
}
```

## Cas d'usage pour CI/CD

### Exécution de commandes CI

```typescript
import { $ } from 'execa';

// Fonction utilitaire pour CI
export async function runCi(command: string, options = {}) {
  try {
    const result = await $({
      stdout: ['pipe', 'inherit'], // Afficher et capturer
      stderr: ['pipe', 'inherit'],
      verbose: 'short', // Logging de la commande
      ...options,
    })`${command}`;

    return {
      success: true,
      exitCode: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    return {
      success: false,
      exitCode: error.exitCode || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
    };
  }
}

// Usage
const result = await runCi('pnpm run test');
if (!result.success) {
  console.error('Tests failed:', result.stderr);
  process.exit(1);
}
```

### Avec timeout et annulation

```typescript
import { $ } from 'execa';

export async function runWithTimeout(command: string, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await $({
      cancelSignal: controller.signal,
      timeout: timeoutMs,
    })`${command}`;

    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.isCanceled || error.timedOut) {
      throw new Error(
        `Command timed out after ${timeoutMs}ms: ${command}`,
      );
    }
    throw error;
  }
}
```

## Streaming et transformation

### Itération sur les lignes

```typescript
for await (const line of execa`npm run build`) {
  if (line.includes('ERROR')) {
    console.error('Build error:', line);
  } else if (line.includes('WARN')) {
    console.warn('Build warning:', line);
  }
}
```

### Transformation des données

```typescript
const transform = function* (line) {
  if (!line.includes('debug')) {
    yield `[${new Date().toISOString()}] ${line}`;
  }
};

await execa({
  stdout: transform,
})`npm run build`;
```

## Migration depuis shelljs

### Avant (shelljs)

```typescript
import shell from 'shelljs';

const result = shell.exec('npm run build', { silent: true });
if (result.code !== 0) {
  console.error('Build failed:', result.stderr);
  process.exit(1);
}
console.log(result.stdout);
```

### Après (execa)

```typescript
import { $ } from 'execa';

try {
  const result = await $`npm run build`;
  console.log(result.stdout);
} catch (error) {
  console.error('Build failed:', error.stderr);
  process.exit(1);
}
```

## Interface TypeScript

```typescript
interface ExecaResult {
  stdout: string;
  stderr: string;
  all?: string;
  command: string;
  escapedCommand: string;
  exitCode: number;
  failed: boolean;
  timedOut: boolean;
  isCanceled: boolean;
  killed: boolean;
  signal?: string;
  signalDescription?: string;
  durationMs: number;
  pipedFrom?: ExecaResult[];
}

interface ExecaError extends Error, ExecaResult {
  shortMessage: string;
  originalMessage?: string;
  cause?: unknown;
  isMaxBuffer: boolean;
  isTerminated: boolean;
  isForcefullyTerminated: boolean;
  isGracefullyCanceled: boolean;
}
```

## Bonnes pratiques

1. **Utilisez `$` pour les scripts** : Syntaxe plus concise et options par
   défaut adaptées
2. **Gérez les erreurs** : Toujours wrapper dans try/catch ou utiliser
   `.catch()`
3. **Timeout approprié** : Définissez un timeout pour éviter les blocages
4. **Logs verbeux** : Utilisez `verbose: 'short'` pour le debugging
5. **Préférez les binaires locaux** : `preferLocal: true` pour npm packages
6. **Évitez le shell** : N'utilisez `shell: true` que si absolument
   nécessaire

## Exemples complets

### Service CI Runner

```typescript
import { $ } from 'execa';

export interface CiResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export class CiRunnerService {
  constructor(private workingDir: string = process.cwd()) {}

  async runCommand(command: string): Promise<CiResult> {
    const startTime = Date.now();

    try {
      const result = await $({
        cwd: this.workingDir,
        stdout: 'pipe',
        stderr: 'pipe',
        verbose: process.env.UPGRADE_VERBOSE === 'true' ? 'short' : 'none',
        timeout: 300000, // 5 minutes
      })`${command}`;

      return {
        success: true,
        exitCode: 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        exitCode: error.exitCode || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  async runCi(): Promise<CiResult> {
    return this.runCommand('pnpm run ci');
  }

  async runCiAdmin(): Promise<CiResult> {
    return this.runCommand('pnpm run ci:admin');
  }
}
```

## Ressources

- [Documentation officielle](https://github.com/sindresorhus/execa)
- [API Reference](https://github.com/sindresorhus/execa/blob/main/docs/api.md)
- [Différences avec Bash](https://github.com/sindresorhus/execa/blob/main/docs/bash.md)
- [Guide de migration](https://github.com/sindresorhus/execa/blob/main/docs/execution.md)
