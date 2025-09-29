# Modèle de données : Gestion améliorée de l'état des dépendances

**Date** : 2025-09-28  
**Fonctionnalité** : 002-spec-validate-bullet

## Types principaux

### DependencyState

Représente l'état d'une seule dépendance à un moment donné.

```typescript
interface DependencyState {
  packageName: string; // ex. : "lodash"
  version: string; // ex. : "4.17.21" (sans signe semver)
  semverSign: '^' | '~' | 'exact';
  dependencyType:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies';
}
```

**Règles de validation** :

- `packageName` : Doit être une chaîne non vide correspondant au format de
  nom de package npm
- `version` : Doit être une chaîne de version semver valide
- `semverSign` : Doit être l'un des préfixes semver autorisés
- `dependencyType` : Doit correspondre à une section de dépendances de
  package.json

### ScriptConfig

Configuration pour les scripts exécutables pendant le processus de mise à
niveau.

```typescript
interface ScriptConfig {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell';
  command: string; // Commande à exécuter
  timeout?: number; // Timeout optionnel en millisecondes (défaut : 300000)
}
```

### UpgradeOptions

Configuration améliorée pour les opérations de mise à niveau.

```typescript
interface UpgradeOptions {
  // Options existantes
  workingDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
  admin?: boolean;

  // Scripts fournis par l'utilisateur requis (3 obligatoires)
  testScript: ScriptConfig;
  buildScript: ScriptConfig;
  lintScript: ScriptConfig;

  // Script généré automatiquement (l'utilisateur ne peut pas le remplacer)
  installScript?: ScriptConfig; // Généré à partir du type packageManager

  // Configuration du gestionnaire de packages
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  // Scripts supplémentaires optionnels (pour les tests d'intégration)
  additionalScripts?: ScriptConfig[];
  rollbackOnFailure?: boolean; // Défaut : true
}
```

**Règles de validation** :

- `workingDir` : Doit être un chemin de répertoire valide si fourni
- Configurations de scripts : Doivent passer la validation ScriptConfig
- `rollbackOnFailure` : Indicateur booléen pour le comportement de rollback

### UpgradeResult

Objet résultat amélioré avec informations de rollback.

```typescript
interface UpgradeResult {
  // Champs existants
  upgraded: PackageUpgrade[];
  warnings: string[];
  errors: string[];

  // Nouveaux champs pour cette fonctionnalité
  rollbackPerformed?: boolean;
  initialState?: DependencyState[];
  rollbackErrors?: string[];
}

interface PackageUpgrade {
  packageName: string;
  oldVersion: string;
  newVersion: string;
  rollbackAvailable: boolean; // Nouveau champ
}
```

### ExecutionResult

Résultat de l'exécution de commande.

```typescript
interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}
```

## Relations clés

- `UpgradeOrchestrator` gère l'état des dépendances et orchestre le
  processus de mise à niveau
- `ScriptConfig` définit les commandes exécutables pour la validation
- `DependencyState` suit les versions des packages et les signes semver
- `UpgradeResult` contient le résultat et les informations de rollback

## Gestion des erreurs

### UpgradeError

```typescript
interface UpgradeError {
  type:
    | 'STATE_CAPTURE_FAILED'
    | 'SCRIPT_EXECUTION_FAILED'
    | 'ROLLBACK_FAILED'
    | 'VALIDATION_FAILED'
    | 'PACKAGE_MANAGER_ERROR';
  message: string;
  details?: any;
  rollbackAvailable: boolean;
}
```

## Règles de validation principales

- Tous les états de dépendances doivent avoir des versions semver valides
- Les signes semver doivent être appliqués de manière cohérente
- Les noms de packages doivent être des identifiants npm valides
- L'état initial doit être capturé avant toute modification
- L'exécution des scripts doit respecter les contraintes de timeout
- Le rollback doit restaurer l'état initial exact
