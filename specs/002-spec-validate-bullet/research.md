# Recherche : Gestion améliorée de l'état des dépendances et rollback

**Date** : 2025-09-28  
**Fonctionnalité** : Gestion améliorée de l'état des dépendances avec
capacités de rollback

## Résultats de la recherche

### Architecture de configuration des scripts

**Décision** : Configuration étendue à trois scripts avec commandes
d'installation auto-générées  
**Raison** :

- Ajout du script lint requis par l'utilisateur pour améliorer la qualité
  du code
- Charge cognitive utilisateur raisonnablement faible avec seulement 3
  scripts obligatoires (test, build, lint)
- Les scripts d'installation restent hautement prévisibles en fonction du
  type de gestionnaire de packages
- Élimine les erreurs de configuration dues à des commandes d'installation
  incompatibles
- Suit le principe de "convention plutôt que configuration" avec validation
  de qualité renforcée

**Alternatives envisagées** :

- Configuration à deux scripts uniquement (test, build) - Rejetée : besoin
  utilisateur explicite pour lint
- Configuration zéro avec détection package.json - Rejetée : flexibilité
  insuffisante pour les projets complexes
- Configuration complète de tableau de scripts - Rejetée : sur-ingénierie
  pour les cas d'usage courants

**Approche d'implémentation** :

```typescript
// Auto-générer les commandes d'installation en fonction du gestionnaire de packages
const INSTALL_COMMANDS = {
  npm: 'npm install',
  yarn: 'yarn install',
  pnpm: 'pnpm install',
  bun: 'bun install',
} as const;
```

### Positionnement des scripts supplémentaires

**Décision** : Scripts supplémentaires pour les tests d'intégration, pas
pour l'interface de configuration  
**Raison** :

- Les scripts supplémentaires doivent valider la compatibilité de la mise à
  niveau, pas préparer l'environnement
- Le positionnement après les tentatives de mise à niveau permet de tester
  les changements réels des dépendances
- S'aligne avec la stratégie de rollback - tester l'intégration avant de
  valider les changements
- Fournit une extensibilité pour la validation spécifique au domaine (par
  exemple, tests de navigateur, vérifications de performance)

**Alternatives envisagées** :

- Scripts de configuration pré-mise à niveau - Rejetés : ne teste pas
  l'impact réel de la mise à niveau
- Scripts de nettoyage post-rollback - Rejetés : complexité inutile
- Exécution parallèle de scripts - Rejetée : l'exécution séquentielle
  fournit une attribution d'échec plus claire

**Approche d'implémentation** :

```typescript
// Dans la méthode upgradeWithRollback, après les changements de dépendances mais avant la validation
if (options?.additionalScripts?.length > 0) {
  for (const script of options.additionalScripts) {
    const result = await this.scriptExecutionService.executeScript(
      script,
      this.workingDir,
    );
    if (!result.success) {
      // Déclencher le rollback avec attribution d'échec claire
      throw new Error(
        `Test d'intégration échoué : ${script.command} - ${result.stderr}`,
      );
    }
  }
}
```

### Gestion de l'état des dépendances avec préservation semver

**Décision** : DependencyStateManager amélioré avec suivi complet des
signes semver  
**Raison** :

- Les opérateurs semver (^, ~, exact) codent des intentions de
  compatibilité importantes
- Le rollback doit restaurer l'état original exact, y compris les
  préférences d'opérateurs
- L'incrémentation de version doit préserver la sémantique des opérateurs
  pendant les mises à niveau
- Critique pour maintenir la stratégie de résolution des dépendances du
  projet

**Alternatives envisagées** :

- Stockage simple de chaînes de version - Rejeté : perd les informations
  sémantiques des opérateurs
- Stockage séparé opérateur/version - Rejeté : augmente inutilement la
  complexité de l'état
- Rollback uniquement via lockfile du gestionnaire de packages - Rejeté :
  ne gère pas les changements package.json

**Approche d'implémentation** :

```typescript
interface DependencyState {
  packageName: string;
  version: string; // Version propre sans opérateur
  semverSign: '^' | '~' | 'exact';
  dependencyType:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies';
}
```

### Abstraction du gestionnaire de packages

**Décision** : Adaptateur de gestionnaire de packages basé sur un type
union de chaînes  
**Raison** :

- Exigence constitutionnelle pour les unions de chaînes plutôt que les
  enums
- Meilleure expérience de sérialisation JSON et de débogage
- Comportement d'exécution plus propre avec vérification de type simplifiée
- Extensible pour le support futur de gestionnaires de packages

**Alternatives envisagées** :

- Types basés sur enum - Rejetés : violent le principe constitutionnel VIII
- Pattern d'adaptateur basé sur classe - Rejeté : sur-ingénierie pour un
  mappage de commandes simple
- Détection uniquement à l'exécution - Rejetée : insuffisante pour la
  configuration explicite de l'utilisateur

**Approche d'implémentation** :

```typescript
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const PACKAGE_MANAGER_COMMANDS = {
  npm: { install: 'npm install', run: 'npm run' },
  yarn: { install: 'yarn install', run: 'yarn' },
  pnpm: { install: 'pnpm install', run: 'pnpm run' },
  bun: { install: 'bun install', run: 'bun run' },
} as const;
```

### Opérations atomiques et stratégie de rollback

**Décision** : Capture d'état avant toute modification avec rollback
automatique  
**Raison** :

- Le principe constitutionnel VII exige des opérations atomiques avec
  sécurité de rollback
- La capture d'état précoce assure une capacité de récupération complète
- Le rollback automatique en cas d'échec empêche les états de mise à niveau
  partiels
- Le suivi d'erreur de rollback séparé fournit des diagnostics d'échec
  complets

**Alternatives envisagées** :

- Suivi d'état incrémental - Rejeté : les états partiels augmentent la
  complexité du rollback
- Déclencheurs de rollback manuels - Rejetés : violent le principe
  d'opération atomique
- Rollback au mieux - Rejeté : garantie de sécurité insuffisante

**Approche d'implémentation** :

```typescript
// Capturer l'état initial complet avant toute modification
const initialState = await this.stateManager.captureInitialState();

try {
  // Effectuer les mises à niveau...
} catch (error) {
  // Rollback automatique avec ségrégation d'erreur
  if (options?.rollbackOnFailure !== false) {
    try {
      await this.stateManager.rollbackToState(initialState);
      rollbackPerformed = true;
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError.message);
    }
  }
}
```

## Prêt pour l'implémentation

Toutes les recherches terminées. Aucun inconnu technique non résolu ne
subsiste. L'approche de conception s'aligne avec les principes
constitutionnels et répond à toutes les exigences fonctionnelles de la
spécification de fonctionnalité.

**Décisions techniques clés prises** :

1. ✅ Configuration à deux scripts (test + build) avec commandes
   d'installation auto-générées
2. ✅ Scripts supplémentaires pour les tests d'intégration post-mise à
   niveau
3. ✅ Gestion améliorée de l'état des dépendances avec préservation des
   signes semver
4. ✅ Abstraction de gestionnaire de packages basée sur union de chaînes
5. ✅ Opérations atomiques avec sécurité de rollback obligatoire

**Prêt pour la Phase 1 : Conception et contrats**

### Nouveaux services requis

- **DependencyStateManager** : Fonctionnalité de gestion d'état centrale
- **PackageManagerAdapter** : Abstraction des différences de gestionnaire
  de packages
- **RollbackService** : Logique de rollback spécialisée et vérification

## Atténuations des risques identifiées

1. **Modifications simultanées** : Surveillance du système de fichiers
   pendant le processus de mise à niveau
2. **Cas particuliers de gestionnaire de packages** : Couverture de test
   complète pour chaque GP
3. **Variations des signes semver** : Logique explicite d'analyse et de
   validation
4. **Échecs de rollback** : Gestion d'erreur multi-niveaux avec guides de
   récupération manuelle
5. **Gestion des délais d'expiration de scripts** : Délais configurables
   avec terminaison gracieuse

## Analyse des dépendances

### Aucune nouvelle dépendance d'exécution requise

- Analyse semver : Utiliser les utilitaires intégrés Node.js ou existants
  du projet
- Opérations système de fichiers : Module fs de Node.js
- Exécution de processus : Intégration execa existante
- Analyse JSON : Intégrée à Node.js

### DevDependencies améliorées

- Fixtures de test supplémentaires pour divers scénarios de gestionnaire de
  packages
- Utilitaires de simulation pour la simulation de commandes de gestionnaire
  de packages

## Considérations de performance

- Capture d'état : O(n) où n = nombre de dépendances
- Opérations de rollback : O(n) pour la restauration + temps d'installation
  du gestionnaire de packages
- Utilisation mémoire : Minimale - seules les métadonnées de dépendances
  stockées
- Opérations I/O : Limitées à la lecture/écriture package.json + commandes
  de gestionnaire de packages

## Prochaines étapes

Recherche terminée. Prêt pour la conception et la génération de contrats de
la Phase 1.
