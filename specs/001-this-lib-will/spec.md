# Spécification de fonctionnalité : Outil sûr de mise à niveau des dépendances avec fallback

**Branche de fonctionnalité** : `001-this-lib-will`  
**Créé** : 2025-09-27  
**Statut** : Brouillon  
**Entrée** : Description utilisateur : "Cette bibliothèque utilisera le
package edit-json-file. Elle a deux parties. D'abord, lister pour tous les
paquets installés toutes les versions plus récentes disponibles sur le
registre npm. Ensuite, à partir de la version la plus récente, effectuer
les mises à jour de chaque dépendance en commençant par la version la plus
récente et en descendant jusqu'à la dernière version plus récente que celle
installée. Après chaque itération, exécuter le script \"ci\" et, si ce
script échoue, revenir à la version précédente et continuer. Troisièmement,
la première commande exécute d'abord le script \"ci:admin\" et si celui-ci
réussit, aucun autre itération n'est nécessaire."

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Lignes directrices rapides

- ✅ Se concentrer sur CE QUE les utilisateurs attendent et POURQUOI
- ❌ Éviter le COMMENT implémenter (pas de stack technique, APIs, structure
  de code)
- 👥 Rédigé pour des parties prenantes métier, pas pour des développeurs

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question]
   for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login
   system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the
   "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Histoire utilisateur principale

En tant que mainteneur, je veux un outil qui liste les versions plus
récentes pour toutes les dépendances installées et les mette à jour en
toute sécurité en exécutant la CI après chaque tentative, afin de pouvoir
maintenir le projet à jour sans casser la build.

### Acceptance Scenarios

1. Given a project with a passing CI and outdated dependencies, When I run
   the “admin” mode (ci:admin first), Then if `pnpm run ci:admin` passes,
   the process finishes with updated deps and no per-version iteration.
2. Given a project with a passing CI and outdated dependencies, When I run
   the iterative upgrade mode, Then the tool lists all available newer
   versions for each installed package from the npm registry.
3. Given the iterative mode and a package with multiple newer versions,
   When the tool tries the newest version first and runs `pnpm run ci`,
   Then if CI fails, it automatically downgrades to the next lower version
   and repeats until a passing version is found or none remain.
4. Given the project has optionalDependencies, When the tool upgrades
   dependencies, Then optionalDependencies are treated the same way as
   normal dependencies (listed, attempted from newest to oldest newer, with
   CI after each attempt).

### Cas limites

- Pas de versions plus récentes disponibles : le flux itératif doit
  indiquer « à jour » et sortir.
- Les pré-versions sont exclues : la liste et les tentatives DOIVENT
  ignorer les versions préliminaires sauf si une option dédiée est ajoutée.
- Contraintes de peer dependency : si la CI échoue à cause d'un conflit de
  peer, l'outil DOIT ignorer cette version et essayer la suivante ; il DOIT
  NE PAS modifier automatiquement les peerDependencies.
- Politique du registre : utiliser uniquement npmjs.org ; ignorer les
  registres personnalisés définis dans .npmrc pour cette opération et
  émettre un avertissement si détecté.
- Échecs réseau lors de la récupération des versions : l'outil doit
  retenter avec backoff et remonter une erreur claire si le problème
  persiste.
- Portée : uniquement les dépendances directes ; pas de mises à jour
  transitive forcées. Les changements incidentels du lockfile sont
  acceptables, mais aucune résolution/override n'est appliquée.

## Requirements _(mandatory)_

### Exigences fonctionnelles

- **FR-001** : Le système DOIT lister, pour chaque dépendance installée
  (dependencies, devDependencies, optionalDependencies), toutes les
  versions plus récentes disponibles sur le registre npm par rapport à la
  version actuellement installée/déclarée.
- **FR-002** : Le système DOIT supporter un chemin rapide « admin » :
  exécuter la commande d'upgrade globaleen premier ; si celui-ci réussit,
  garder l'état résultant et sortir sans itération par version.
- **FR-003** : En mode itératif, pour chaque dépendance ayant des versions
  plus récentes, le système DOIT tenter les mises à jour en commençant par
  la version la plus récente et en descendant jusqu'à la version la plus
  ancienne qui est toujours plus récente que celle installée.
- **FR-004** : Après chaque tentative de mise à jour, le système DOIT
  exécuter `pnpm run ci`. Si la CI passe, la mise à jour est acceptée ; si
  elle échoue, le système DOIT revenir à l'état précédent pour ce package
  et essayer la version suivante.
- **FR-005** : Le système DOIT persister les mises à jour acceptées dans
  `package.json` et le lockfile ; si toutes les versions plus récentes
  échouent en CI, la dépendance DOIT rester inchangée et être clairement
  rapportée.
- **FR-006** : Le système DOIT utiliser `edit-json-file` pour appliquer les
  modifications JSON à `package.json` de façon atomique et fiable.
- **FR-007** : Le système DEVRAIT afficher un rapport récapitulatif :
  paquets mis à jour, paquets ignorés (avec raisons), et paquets encore
  obsolètes.
- **FR-008** : Le système DOIT respecter le gestionnaire de paquets du
  projet (pnpm) et exécuter les installations nécessaires pour synchroniser
  le lockfile avant d'exécuter la CI.
- **FR-009** : Le système DOIT exclure les versions pré-release de la liste
  et des tentatives itératives (politique stable uniquement), sauf si une
  option dédiée est introduite pour autoriser les pré-releases.
- **FR-010** : Le système DOIT interroger et mettre à jour à partir du
  registre npm par défaut (npmjs.org) uniquement, en ignorant les registres
  personnalisés dans .npmrc pour le périmètre de cette opération ; si un
  registre personnalisé est détecté, le système DOIT émettre un
  avertissement dans le rapport récapitulatif.
- **FR-011** : En cas d'échec de la CI dû à des contraintes de peer
  dependency, le système DOIT annuler la mise à jour tentée et essayer la
  version inférieure suivante ; il DOIT NE PAS modifier automatiquement les
  peerDependencies et DOIT rapporter le conflit.
- **FR-012** : Lors d'une mise à jour acceptée, le système DOIT préserver
  l'opérateur semver existant dans package.json (ex. ^ ou ~) et mettre à
  jour la version minimale en conséquence ; il NE DOIT PAS épingler des
  versions exactes sauf si configuré explicitement par une option future.
- **FR-013** : La portée de la mise à jour DOIT être limitée aux
  dépendances directes listées dans package.json (dependencies,
  devDependencies, optionalDependencies). L'outil NE DOIT PAS forcer des
  mises à jour transitives via overrides/resolutions. Les mises à jour
  transitives incidentelles dues au rafraîchissement du lockfile sont
  acceptables.

### Exigences non fonctionnelles

- **NFR-001** : Les modifications DOIVENT être conformes à la Constitution
  du dépôt (pnpm en premier, dépendances minimales, tests/lint/limite de
  taille réussis).
- **NFR-002** : Les journaux DOIVENT être clairs et actionnables ; les
  échecs doivent inclure la dépendance et la version qui a échoué.
- **NFR-003** : L'outil DOIT être idempotent : relancer après une mise à
  niveau réussie ne doit pas retenter les versions déjà acceptées.

### Entités clés _(inclure si la fonctionnalité implique des données)_

- **Dépendance** : nom, section (dep/dev/optionnel), version actuelle,
  versions plus récentes disponibles [v_plus_récente … v_moins_récente].
- **Résultat de tentative** : nom du package, version candidate, statutCI
  (réussi/échoué), raison d'échec (ex. conflit de pair, échec de test),
  action choisie (accepter/annuler).

---

## Clarifications

### Session 2025-09-27

- Q: Policy for prereleases during listing and upgrades? → A: A
  (stable-only; exclude prereleases)
- Q: Registry policy for listing and upgrades? → A: A (npmjs.org only)
- Q: Handling of peer dependency conflicts? → A: A (skip to next lower; do
  not auto-adjust peers)
- Q: Version operator policy for accepted upgrades? → A: A (keep operator;
  bump minimal version)
- Q: Upgrade scope for dependencies? → A: A (direct dependencies only)

## Liste de vérification de révision et d'acceptation

_PORTE : Vérifications automatisées exécutées pendant l'exécution de
main()_

### Qualité du contenu

- [ ] Aucun détail d'implémentation (langages, frameworks, APIs)
- [ ] Concentré sur la valeur utilisateur et les besoins métier
- [ ] Rédigé pour les parties prenantes non techniques
- [ ] Toutes les sections obligatoires complétées

### Exhaustivité des exigences

- [ ] Aucun marqueur [NEEDS CLARIFICATION] restant
- [ ] Les exigences sont testables et non ambiguës
- [ ] Les critères de succès sont mesurables
- [ ] La portée est clairement délimitée
- [ ] Dépendances et hypothèses identifiées

---

## Statut d'exécution

_Mis à jour par main() pendant le traitement_

- [ ] Description utilisateur analysée
- [ ] Concepts clés extraits
- [ ] Ambiguïtés marquées
- [ ] Scénarios utilisateur définis
- [ ] Exigences générées
- [ ] Entités identifiées
- [ ] Liste de vérification de révision passée

---
