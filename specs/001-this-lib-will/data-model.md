# Modèle de données : Outil sûr de mise à niveau des dépendances avec fallback

Basé sur la spécification de fonctionnalité et la recherche.

## Entités

### Dependency

- name : string
- section : 'dependencies' | 'devDependencies' | 'optionalDependencies'
- currentVersion : string (version minimale déclarée en préservant
  l'opérateur)
- availableNewer : string[] (trié du plus récent au plus ancien ;
  stable-only)

Validation :

- name non vide
- section doit être l'une des valeurs autorisées
- currentVersion doit être une plage semver valide

### AttemptResult

- packageName : string
- candidateVersion : string (version exacte tentée)
- ciStatus : 'pass' | 'fail'
- reason? : string (en cas d'échec ; ex. conflit de peer, échec de test)
- action : 'accept' | 'revert'
- timestamp : chaîne ISO

Validation :

- candidateVersion doit être une version semver valide (pas de pré-release
  sauf si autorisé)
- action doit corréler avec ciStatus (pass→accept, fail→revert)

### SummaryReport

- upgraded : Array<{ name: string; from: string; to: string }>
- skipped : Array<{ name: string; reason: string }>
- remainingOutdated : string[]
- warnings : string[] (ex. registre personnalisé détecté)

Relations :

- AttemptResult appartient à Dependency
- SummaryReport agrège les résultats pour toutes les dépendances

## Détails de conception additionnels (mise à jour Phase 1)

### Structures de données CLI (intégration cmd-ts)

- **UpgradeOptions** : Arguments ligne de commande parsés par cmd-ts
  - `adminOnly` : boolean (mode fast-path)
  - `dryRun` : boolean (mode prévisualisation sans modifications)
  - `verbose` : boolean (logs détaillés)
  - `workingDir` : string (répertoire cible, défaut : cwd)

### Interfaces de la couche de services

- **PackageJsonService** : wrapper edit-json-file avec backup/restore
- **RegistryService** : client API npm avec filtrage des versions stables
- **CiRunnerService** : wrapper shelljs pour l'exécution des commandes CI
- **UpgradeOrchestrator** : Coordination du workflow principal

### Gestion des erreurs

- **Dégradation gracieuse** : Continuer le traitement en cas d'échecs
  individuels
- **Opérations atomiques** : Mises à jour tout-ou-rien avec rollback
  automatique
- **Journalisation structurée** : Rapport clair de progression et d'échecs

---

Les contraintes non-fonctionnelles selon la Constitution v1.1.0 sont
satisfaites par conception. L'intégration cmd-ts fournit un parsing
d'arguments CLI typé comme demandé.
