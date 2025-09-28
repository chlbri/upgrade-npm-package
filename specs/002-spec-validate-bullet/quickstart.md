# Gestion améliorée de l'état des dépendances - Guide de démarrage rapide

**Fonctionnalité** : 002-spec-validate-bullet  
**Date** : 2025-09-28

Ce guide de démarrage rapide présente la gestion améliorée de l'état des dépendances avec une configuration simplifiée des scripts et une fonctionnalité de rollback automatique.

## Prérequis

- Node.js >= 22
- Gestionnaire de paquets : npm, yarn, pnpm ou bun
- Installation fonctionnelle de upgrade-npm-package
- Projet d'exemple avec des dépendances

## Concepts de base

### Configuration simplifiée des scripts

Le système nécessite désormais seulement **deux scripts fournis par l'utilisateur** :

- **Script de test** : La commande de test de votre projet
- **Script de build** : La commande de build de votre projet

Tous les autres scripts (installation, mises à niveau des dépendances) sont automatiquement générés en fonction du gestionnaire de paquets détecté.

### Détection automatique du gestionnaire de paquets

Le système détecte votre gestionnaire de paquets à partir de :

- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `bun.lockb` → bun
- `package-lock.json` → npm

## Utilisation de base

### Scénario 1 : Auto-détection avec scripts par défaut

**Configuration** :

```bash
# Créer un projet de test
mkdir test-upgrade-simplified
cd test-upgrade-simplified
pnpm init

# Ajouter des dépendances de test
pnpm add lodash@4.17.20 express@4.18.1
pnpm add -D typescript@4.9.0

# Ajouter seulement les scripts test et build
pnpm pkg set scripts.test="echo 'Tests passed'"
pnpm pkg set scripts.build="echo 'Build completed'"
```

**Exécution** :

```bash
# Auto-détecter le gestionnaire de paquets et utiliser les scripts par défaut
upgrade-npm-package

# Comportement attendu :
# 1. Détecte pnpm comme gestionnaire de paquets
# 2. Auto-génère : pnpm install --frozen-lockfile
# 3. Capture l'état initial (lodash@^4.17.20, express@^4.18.1, typescript@^4.9.0)
# 4. Lance le processus de mise à niveau avec validation test/build
# 5. Scripts supplémentaires utilisés uniquement pour les tests d'intégration
```

**Validation** :

- Vérifier que package.json affiche les versions mises à niveau avec préservation des signes semver
- Vérifier que node_modules contient les paquets mis à niveau
- Confirmer l'absence d'avertissements de rollback dans la sortie

### Scénario 2 : Configuration de scripts personnalisés

**Configuration** :

```bash
# Créer un projet de test avec scripts personnalisés
mkdir test-custom-scripts
cd test-custom-scripts
yarn init -y

# Ajouter des dépendances
yarn add lodash@4.17.20 express@4.18.1

# Ajouter des scripts personnalisés
yarn config set scripts.test "jest --passWithNoTests"
yarn config set scripts.build "./custom-build.sh"

# Créer un script de build personnalisé
echo '#!/bin/bash\necho "Custom build successful"' > custom-build.sh
chmod +x custom-build.sh
```

**Exécution** :

```bash
# Lancer avec configuration de scripts personnalisés
upgrade-npm-package \
  --test-script "jest --passWithNoTests" \
  --build-script "./custom-build.sh"

# Comportement attendu :
# 1. Détecte yarn comme gestionnaire de paquets
# 2. Auto-génère : yarn install --frozen-lockfile
# 3. Utilise les scripts test et build personnalisés
# 4. Scripts supplémentaires de mise à niveau des dépendances gérés en interne
```

### Scénario 3 : Mise à niveau échouée avec rollback automatique

**Configuration** :

```bash
# Créer un projet de test avec script de test échouant
mkdir test-upgrade-rollback
cd test-upgrade-rollback
npm init -y

# Ajouter des dépendances
npm install lodash@4.17.20 express@4.18.1

# Ajouter un script de test échouant
npm pkg set scripts.test="exit 1"
npm pkg set scripts.build="echo 'Build completed'"
```

**Exécution** :

```bash
# Lancer la mise à niveau (déclenchera le rollback)
upgrade-npm-package --test-script "npm test" --build-script "npm run build"

# Comportement attendu :
# 1. Capture l'état initial des dépendances
# 2. Auto-génère le script d'installation : npm ci
# 3. Tente les mises à niveau des dépendances
# 4. Le script de test échoue (exit 1)
# 5. Rollback automatique déclenché
# 6. Dépendances restaurées à l'état initial exact
```

**Validation** :

- Confirmer que package.json correspond exactement à l'état original
- Vérifier que node_modules est revenu aux versions originales
- Vérifier le message de succès du rollback dans la sortie
- S'assurer que le projet est dans un état fonctionnel

### Scénario 4 : Auto-détection du gestionnaire de paquets

**Tester différents gestionnaires de paquets** :

```bash
# Tester la détection NPM
mkdir test-npm && cd test-npm
npm init -y
npm install lodash@4.17.20
npm pkg set scripts.test="echo 'NPM test passed'"
npm pkg set scripts.build="echo 'NPM build completed'"

# Tester la détection Yarn
mkdir ../test-yarn && cd ../test-yarn
yarn init -y
yarn add lodash@4.17.20
yarn config set scripts.test "echo 'Yarn test passed'"
yarn config set scripts.build "echo 'Yarn build completed'"

# Tester la détection PNPM
mkdir ../test-pnpm && cd ../test-pnpm
pnpm init
pnpm add lodash@4.17.20
pnpm pkg set scripts.test="echo 'PNPM test passed'"
pnpm pkg set scripts.build="echo 'PNPM build completed'"
```

**Exécution** :

```bash
# Tester l'auto-détection pour chaque gestionnaire de paquets
cd test-npm && upgrade-npm-package
cd ../test-yarn && upgrade-npm-package
cd ../test-pnpm && upgrade-npm-package

# Comportement attendu :
# 1. NPM : Détecte package-lock.json → génère "npm ci"
# 2. Yarn : Détecte yarn.lock → génère "yarn install --frozen-lockfile"
# 3. PNPM : Détecte pnpm-lock.yaml → génère "pnpm install --frozen-lockfile"
```

### Scénario 5 : Workflow de tests d'intégration

**Configuration** :

```bash
# Créer un projet pour tester le positionnement des scripts supplémentaires
mkdir test-integration-scripts
cd test-integration-scripts
pnpm init
pnpm add lodash@4.17.20 express@4.18.1
pnpm add -D jest@29.0.0

# Ajouter seulement les scripts fournis par l'utilisateur
pnpm pkg set scripts.test="jest"
pnpm pkg set scripts.build="tsc && rollup -c"
```

**Exécution** :

```bash
# Lancer la mise à niveau pour voir les scripts supplémentaires dans la phase de tests d'intégration
upgrade-npm-package --verbose

# Comportement attendu :
# 1. Scripts utilisateur (test, build) utilisés pour la validation pendant la mise à niveau
# 2. Scripts supplémentaires de mise à niveau des dépendances exécutés pendant les tests d'intégration
# 3. Scripts supplémentaires NON utilisés au démarrage - seulement pour le workflow de test
```

**Validation** :

- Vérifier que les scripts utilisateur s'exécutent pendant la validation des dépendances
- Confirmer que les scripts supplémentaires s'exécutent dans la phase de tests d'intégration
- Vérifier que les scripts supplémentaires n'interfèrent pas avec le processus de démarrage

## Sorties attendues

### Mise à niveau réussie

```
🔍 Capture de l'état initial des dépendances...
✅ État capturé : 3 dépendances
🚀 Exécution de la vérification CI admin...
✅ Vérification CI admin réussie
📦 Mise à niveau des dépendances de manière incrémentielle...
  ✅ lodash : 4.17.20 → 4.17.21 (patch)
  ✅ express : 4.18.1 → 4.18.2 (patch)
  ✅ typescript : 4.9.0 → 4.9.5 (patch)
✅ Mise à niveau terminée avec succès
```

### Mise à niveau échouée avec rollback

```
🔍 Capture de l'état initial des dépendances...
✅ État capturé : 2 dépendances
🚀 Exécution de la vérification CI admin...
❌ Vérification CI admin échouée (code de sortie : 1)
🔄 Rollback vers l'état initial...
  📝 Restauration de package.json...
  📦 Exécution de l'installation du gestionnaire de paquets...
  🔧 Application des signes semver...
  ✅ Rollback terminé avec succès
⚠️  Mise à niveau échouée mais projet restauré à l'état fonctionnel
```

### Exécution de scripts personnalisés

```
🔍 Capture de l'état initial des dépendances...
✅ État capturé : 1 dépendance
🛠️  Exécution du script de test personnalisé (npm test)...
✅ Script de test terminé (200ms)
🛠️  Exécution du script de build personnalisé (shell ./custom-build.sh)...
✅ Script de build terminé (150ms)
📦 Mise à niveau des dépendances...
```

## Étapes de validation

Après l'exécution de chaque scénario :

1. **Cohérence d'état** : Vérifier que package.json et node_modules sont cohérents
2. **Intégrité du rollback** : Confirmer que les projets rollbackés correspondent exactement à l'état initial
3. **Exécution des scripts** : Vérifier que les scripts personnalisés s'exécutent avec les paramètres corrects
4. **Gestion des erreurs** : S'assurer que les échecs fournissent des messages d'erreur clairs et des étapes de récupération
5. **Performance** : Valider que les opérations se terminent dans les délais attendus

## Dépannage

### Problèmes courants

**Problème** : Échec de la capture d'état **Solution** : S'assurer qu'un package.json valide existe et que les dépendances sont installées

**Problème** : Échec du rollback **Solution** : Vérifier les permissions des fichiers et la disponibilité du gestionnaire de paquets

**Problème** : Échec des scripts personnalisés **Solution** : Vérifier la syntaxe de configuration des scripts et les permissions d'exécution

**Problème** : Gestionnaire de paquets non détecté **Solution** : S'assurer que les fichiers de verrouillage appropriés existent (package-lock.json, yarn.lock, pnpm-lock.yaml)

### Mode debug

```bash
# Activer la sortie debug pour un dépannage détaillé
DEBUG=upgrade-npm-package:* upgrade-npm-package --verbose --admin
```

## Critères de succès

- [ ] Tous les scénarios de test se terminent sans erreurs
- [ ] Le rollback restaure l'état initial exact en cas d'échec
- [ ] Les configurations de scripts personnalisés fonctionnent correctement
- [ ] Les mises à jour incrémentielles suivent les meilleures pratiques semver
- [ ] Tous les gestionnaires de paquets sont pris en charge et détectés correctement
- [ ] La performance atteint les objectifs spécifiés (< 5s capture d'état, < 30s rollback)

Ce guide de démarrage rapide valide la gestion améliorée complète de l'état des dépendances et la fonctionnalité de rollback à travers différents scénarios et configurations.

