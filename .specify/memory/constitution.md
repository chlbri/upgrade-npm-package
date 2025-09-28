<!--
Sync Impact Report
- Version change: 1.2.0 → 1.3.0
- Modified principles: Principe VII (CLI Requirements - Configuration Simplifiée des Scripts)
- Added sections: Principe IX (Configuration Simplifiée des Scripts)
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ updated to reference Constitution v1.3.0
  - .specify/templates/spec-template.md: ✅ reviewed (no constitution-version reference)
  - .specify/templates/tasks-template.md: ✅ reviewed (enforces simplified script approach)
  - .specify/templates/agent-file-template.md: ✅ reviewed (no changes required)
- Follow-up TODOs: none
-->

# Constitution upgrade-npm-package

## Principes Fondamentaux

### I. Bibliothèque pnpm-first, Node 20+, ESM-first

Ce package est construit et maintenu comme une bibliothèque npm utilisant
pnpm. L'environnement d'exécution DOIT supporter Node.js >= 20. La base de
code est ESM-first (package.json "type":"module"), avec une sortie CJS
fournie pour la compatibilité selon les besoins de la construction.

Justification : Assure des fonctionnalités de langage modernes, des
installations plus rapides, et la compatibilité avec les outils actuels
tout en gardant les consommateurs non bloqués.

### II. Dépendances d'exécution minimales, valeurs par défaut zéro-coût

Les dépendances d'exécution DOIVENT être maintenues minimales ou nulles
quand possible. Préférer devDependencies pour les outils et fonctionnalités
de build. Les fonctionnalités optionnelles PEUVENT utiliser
optionalDependencies, mais DOIVENT se dégrader gracieusement quand elles ne
sont pas présentes.

Justification : Réduit la surface d'attaque, améliore la vitesse
d'installation, et simplifie la maintenance.

### III. Mises à jour automatisées, incluant les dépendances optionnelles

Le script `upgrade` utilise `pnpm upgrade --latest` et DOIT mettre à jour
toutes les dépendances déclarées, incluant `optionalDependencies` quand
présentes. Après toute mise à jour, CI DOIT passer (lint, tests,
size-limit) avant fusion.

Justification : Maintient la bibliothèque à jour et sécurisée sans dérive ;
les fonctionnalités optionnelles restent compatibles.

### IV. Discipline de test, lint, et taille

Tous les changements DOIVENT inclure des tests (Vitest). Le formatage
ESLint + Prettier DOIT passer. Les artefacts construits DOIVENT respecter
le budget de limite de taille (actuellement 10 KB par fichier de sortie)
imposé par size-limit. Les changements dépassant le budget nécessitent une
justification explicite et une tâche d'optimisation de suivi avant la
publication.

Justification : Protège la qualité, la sécurité de régression, et les
performances pour les consommateurs.

### V. Stabilité de l'API et versioning sémantique

Les changements d'API publique suivent semver. Les changements cassants
nécessitent un bump MAJOR et des notes de migration. Les ajouts de
fonctionnalités sont MINOR, et les corrections/tâches sont PATCH.

Justification : Publications prévisibles pour les consommateurs.

### VI. Développement Piloté par les Tests (NON-NÉGOCIABLE)

Tout nouveau comportement ou changé DOIT être implémenté en utilisant TDD :

- Écrire d'abord des tests qui échouent et capturent le comportement
  souhaité.
- Implémenter le code minimal pour faire passer ces tests (Rouge → Vert).
- Refactoriser en sécurité avec des tests protégeant le comportement
  (Refactorisation).
- Aucun travail de fonctionnalité n'est accepté sans tests
  d'accompagnement.

Justification : TDD améliore la conception, prévient les régressions, et
assure que les exigences sont exécutables et vérifiables.

### VII. Sécurité de Rollback et Opérations Atomiques

Toutes les opérations qui changent l'état DOIVENT être atomiques avec des
capacités complètes de rollback :

- Capturer l'état initial avant toute modification en utilisant
  DependencyStateManager.
- Chaque opération de mise à jour DOIT être réversible via
  rollbackToState().
- Les opérations échouées DOIVENT automatiquement déclencher un rollback
  (rollbackOnFailure: true par défaut).
- Les modifications d'état sont considérées comme des unités atomiques -
  soit réussir complètement soit revenir complètement.
- Les erreurs de rollback DOIVENT être capturées et rapportées séparément
  des erreurs d'opération.

Justification : Assure la stabilité du projet et prévient les états
partiels de mise à jour qui pourraient laisser la base de code dans un état
incohérent ou cassé.

### VIII. Types Union String plutôt qu'Enums

Les définitions de types DOIVENT utiliser des types union string au lieu
des enums TypeScript :

- Utiliser `'npm' | 'yarn' | 'pnpm' | 'bun' ` au lieu de enum
  PackageManagerType.
- Utiliser `'dependencies' | 'devDependencies' | 'optionalDependencies'` au
  lieu de enum DependencyType.
- Les unions string fournissent une meilleure sérialisation JSON, un
  débogage plus simple, et un comportement runtime plus propre.
- Exception : Les enums basés sur des nombres sont acceptables quand ils
  représentent de vraies constantes numériques.

Justification : Simplifie le comportement runtime, améliore
l'interopérabilité JSON, et réduit la taille du bundle tout en maintenant
la sécurité de type.

### IX. Configuration Simplifiée des Scripts

L'architecture de configuration des scripts DOIT suivre le principe de
"convention over configuration" :

- Les utilisateurs ne fournissent que DEUX scripts : --test-script et
  --build-script
- Les scripts d'installation DOIVENT être auto-générés basés sur le type de
  gestionnaire de packages détecté
- La détection automatique des gestionnaires de packages se base sur les
  fichiers de lock présents
- Les scripts additionnels sont positionnés pour les tests d'intégration,
  PAS pour la configuration initiale
- Le mode enhanced nécessite seulement les deux scripts utilisateur,
  l'installation étant auto-configurée

Justification : Réduit la charge cognitive utilisateur, élimine les erreurs
de configuration, et suit le principe de convention over configuration tout
en maintenant la flexibilité nécessaire.

## Contraintes du Projet

- Gestionnaire de Packages : pnpm
- Langage/Module : TypeScript, ESM-first avec compatibilité CJS via Rollup
- Moteur Node : >= 20 (imposé via package.json engines)
- Build : Configuration Rollup dans `rollup.config.mjs`
- Tests : Vitest (unit et coverage) avec helpers de `@bemedev/*`
- Lint/Format : ESLint + Prettier
- Budget de Taille : size-limit plafonné à 10 KB par sortie de bundle
- Scripts de référence :
  - `build` : nettoyer `lib/` puis bundler avec Rollup
  - `ci` : installation offline, lint, test, format, pretty-quick
  - `upgrade` : `pnpm upgrade --latest` (DOIT inclure optionalDependencies
    quand présentes)
  - `rinit`/`rinit:off` : workflows de réinstallation/reset
- Exigences CLI :
  - Le mode enhanced nécessite SEULEMENT deux scripts obligatoires :
    --test-script, --build-script
  - Les scripts d'installation sont auto-générés basés sur le gestionnaire
    de packages détecté
  - Le mécanisme de rollback DOIT être activé par défaut (--rollback=true)
  - Le type de gestionnaire de packages DOIT être configurable (npm, yarn,
    pnpm, bun, shell)
  - L'exécution de scripts DOIT supporter des timeouts configurables
    (défaut : 300000ms)

## Workflow de Développement et Portails de Qualité

0. TDD : Écrire d'abord des tests qui échouent ; suivre
   Rouge-Vert-Refactorisation avant fusion.
1. Brancher, implémenter, et garder les changements délimités et testés.
2. Exécuter `pnpm run ci` localement ; corriger lint, tests, et formatage.
3. S'assurer que size-limit passe ; sinon, justifier et planifier
   l'optimisation avant la publication.
4. Ouvrir une PR. Les reviewers DOIVENT vérifier la conformité avec tous
   les Principes Fondamentaux et Contraintes.
5. Pour les mises à jour de dépendances (incluant optionnelles), s'assurer
   qu'il n'y a pas de régressions. Si une régression est trouvée, épingler
   ou revenir avec une justification claire et des tâches de suivi.

## Gouvernance

- Autorité : Cette Constitution supersède les pratiques ad-hoc pour ce
  dépôt.
- Amendements : Proposés via PR. Chaque amendement DOIT inclure une
  justification, une évaluation d'impact, et, si les principes changent, un
  bump de version selon la politique ci-dessous.
- Versioning (constitution) :
  - MAJOR : Suppressions ou redéfinitions de gouvernance/principes
    incompatibles en arrière.
  - MINOR : Nouveau principe/section ajouté ou guidance matériellement
    étendue.
  - PATCH : Clarifications, formulation, corrections de fautes de frappe,
    affinements non-sémantiques.
- Conformité : Toutes les PRs DOIVENT inclure une checklist référençant les
  Principes Fondamentaux. CI DOIT être vert. Les violations nécessitent une
  justification explicite et un suivi.

**Version** : 1.3.0 | **Ratifiée** : 2025-09-27 | **Dernière Modification**
: 2025-09-28
