# Démarrage rapide : Outil sûr de mise à niveau des dépendances avec fallback

Ce guide rapide décrit les scénarios de validation de bout en bout issus de
la spécification.

## Chemin rapide Admin

1. Vérifier que le projet possède les scripts `ci` et `ci:admin`.
2. Exécuter l'outil en mode admin.
3. Attendu : L'outil exécute `pnpm run ci:admin`. Si ce script réussit, les
   dépendances sont mises à jour selon la politique du projet et le
   processus se termine sans itération par version.
4. Sortie : Rapport récapitulatif avec paquets mis à jour/inchangés et
   éventuels avertissements (ex. registre personnalisé).

## Mode d'upgrade itératif

1. Exécuter l'outil en mode itératif.
2. L'outil liste toutes les dépendances directes (incluant
   optionalDependencies) et récupère les versions stables plus récentes
   depuis npmjs.org.
3. Pour chaque paquet ayant des versions plus récentes, l'outil tente les
   mises à jour du plus récent au plus ancien, en exécutant `pnpm run ci`
   après chaque tentative.
4. Si la CI passe : accepter la mise à jour (préserver l'opérateur semver,
   augmenter la version minimale), synchroniser le lockfile.
5. Si la CI échoue : revenir à l'état précédent de package.json/lockfile
   pour ce paquet et essayer la version suivante.
6. Après traitement de tous les paquets, l'outil affiche un rapport
   récapitulatif : mis à jour, ignorés (avec raisons), restant obsolètes,
   et avertissements (ex. registre personnalisé détecté).

## Cas limites

- Pas de versions plus récentes : l'outil indique « à jour » et sort.
- Les pré-releases sont exclues sauf si un flag futur est présent.
- Les conflits de peer entraînent un revert puis la poursuite ; pas
  d'ajustement automatique des peers.
- Seules les dépendances directes sont prises en compte.

---

Basé sur la Constitution v1.1.0

# Démarrage rapide (Phase 1)

1. S'assurer que Node >= 20 et pnpm est installé.
2. Exécuter le chemin rapide :
   - `pnpm run ci:admin`
   - Si vert, arrêter. Sinon passer au mode itératif.
3. Mode itératif :
   - Lister les versions stables plus récentes pour les dépendances
     directes (deps/dev/optional) depuis npmjs.org
   - Pour chaque dépendance : essayer du plus récent → au plus ancien
     - Après chaque bump : `pnpm run ci`
     - En cas d'échec : revert et essayer la version inférieure
     - En cas de succès : persister et continuer
4. Rapport récapitulatif : mis à jour, ignorés (avec raisons),
   avertissements.

## Utilisation CLI avec cmd-ts

```bash
# Utilisation de base
upgrade-npm-package

# Mode admin (chemin rapide)
upgrade-npm-package --admin

# Mode dry-run
upgrade-npm-package --dry-run

# Sortie verbeuse
upgrade-npm-package --verbose

# Spécifier le répertoire de travail
upgrade-npm-package --working-dir /chemin/vers/projet
```

**Fonctionnalités :**

- Parsing d'arguments typé via cmd-ts
- Messages d'erreur et aide clairs
- Reporting de progression pendant les opérations
- Sortie récapitulative structurée
