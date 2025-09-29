# Spécification de Fonctionnalité : Gestion Améliorée de l'État des ### ENF2 : Performance

- La capture d'état des dépendances DOIT se terminer en moins de 5 secondes
  pour des projets typiques
- Les opérations de rollback DOIT se terminer en moins de 30 secondes

### ENF4 : Observabilité

- Le système DOIT fournir des logs détaillés en temps réel avec étapes
  spécifiques pour toutes les opérations
- Une barre de progression avec pourcentage DOIT être affichée pendant les
  opérations longues (capture d'état, rollback)
- Les messages de progression DOIVENT inclure l'étape actuelle et le temps
  estimé restantndances et Rollback

**ID de Fonctionnalité** : 002-spec-validate-bullet  
**Priorité** : Élevée  
**Statut** : Brouillon  
**Date** : 2025-09-28

## Vue d'Ensemble

Cette fonctionnalité améliore l'outil upgrade-npm-package avec une gestion
avancée de l'état des dépendances, des capacités de rollback et une
exécution de scripts configurable. Le système suivra les versions des
dépendances avec leurs signes semver, fournira une fonctionnalité de
rollback en cas d'échec des mises à niveau, et supportera des scripts de
test/build configurables.

## Histoires Utilisateur

### Histoire Utilisateur Principale

En tant que développeur utilisant l'outil de mise à niveau, je veux que le
système restaure automatiquement les dépendances à leur état précédent si
le script admin échoue, afin que mon projet reste dans un état fonctionnel.

### Histoires Utilisateur de Support

1. En tant que développeur, je veux que l'outil se souvienne de l'état
   initial de toutes les dépendances (version + signe semver) avant toute
   mise à niveau
2. En tant que développeur, je veux configurer des scripts personnalisés de
   test et de build pour la validation
3. En tant que développeur, je veux que l'outil effectue des mises à jour
   incrémentielles plutôt que des sauts de version majeure
4. En tant que développeur, je veux un support pour différents
   gestionnaires de paquets (npm, yarn, pnpm, bun)

## Exigences Fonctionnelles

### EF1 : Suivi de l'État des Dépendances

- **REQ-001** : Le système DOIT capturer l'état initial de toutes les
  dépendances incluant :
  - Nom du paquet
  - Version actuelle
  - Signe semver ("^", "~", ou exact)
- **REQ-002** : Le suivi d'état DOIT se produire avant toute opération de
  mise à niveau
- **REQ-003** : L'état DOIT être stocké en mémoire pendant le processus de
  mise à niveau

### EF2 : Mécanisme de Rollback

- **REQ-004** : Lorsque le script admin échoue, le système DOIT restaurer
  toutes les dépendances à leur état initial
- **REQ-005** : Le processus de rollback DOIT :
  1. Écrire les dépendances dans package.json sans signes semver
  2. Exécuter la commande d'installation/ajout du gestionnaire de paquets
  3. Ajouter manuellement les signes semver originaux
  4. Exécuter à nouveau l'installation du gestionnaire de paquets pour
     appliquer les signes

### EF3 : Configuration des Scripts

- **REQ-006** : Le système DOIT accepter exactement 3 scripts internes
  requis :
  - Script de test (pour validation)
  - Script de build (pour compilation/bundling)
  - Script d'installation (pour installation des dépendances)
- **REQ-007** : Des scripts optionnels supplémentaires PEUVENT être fournis
  en tant que paramètre tableau
- **REQ-008** : Chaque script DOIT spécifier :
  - Type de script : "npm", "yarn", "pnpm", "bun", ou "shell"
  - Commande de script : la commande réelle à exécuter

### EF4 : Mises à Jour Incrémentielles

- **REQ-009** : Le système DOIT effectuer des mises à jour décrementielles
  (mineure/patch avant majeure)
- **REQ-010** : La récupération des versions DOIT être faite depuis le
  registre du gestionnaire de paquets
- **REQ-011** : Les mises à jour DOIVENT respecter les contraintes semver

## Exigences Non-Fonctionnelles

### ENF1 : Fiabilité

- Le système DOIT garantir la capacité de rollback en cas d'échecs
- Tous les changements d'état DOIVENT être atomiques (réussir complètement
  ou rollback complètement)

### ENF2 : Performance

- La capture d'état des dépendances DOIT se terminer en moins de 5 secondes
  pour des projets typiques
- Les opérations de rollback DOIVENT se terminer en moins de 30 secondes
- Pour les projets avec 100+ dépendances, la capture d'état DOIT utiliser
  un traitement en parallèle par chunks de 10 dépendances pour optimiser
  les performances
- Le système DOIT maintenir la précision même avec l'optimisation en
  parallèle

### ENF3 : Compatibilité

- DOIT supporter les gestionnaires de paquets npm, yarn, pnpm et bun
- DOIT fonctionner avec Node.js >= 20
- DOIT maintenir la compatibilité ascendante avec l'interface CLI existante

### ENF4 : Gestion des Interruptions

- Le système DOIT capturer les signaux d'interruption (SIGINT/Ctrl+C)
  pendant les opérations
- Avant d'effectuer un rollback suite à une interruption, le système DOIT
  demander confirmation à l'utilisateur
- L'utilisateur DOIT pouvoir choisir entre rollback immédiat ou sauvegarde
  de l'état partiel

### ENF5 : Logging et Diagnostic

- Le système DOIT loguer l'état complet des dépendances avant chaque étape
  de mise à niveau
- L'état complet des dépendances DOIT être loggué après chaque étape de
  mise à niveau
- Les logs DOIVENT inclure : nom du paquet, version avant/après, signe
  semver, et timestamp
- En cas d'échec, un rapport détaillé comparant l'état initial vs l'état au
  moment de l'échec DOIT être généré

## Contraintes Techniques

### CT1 : Intégration du Gestionnaire de Paquets

- DOIT s'intégrer avec les commandes natives du gestionnaire de paquets
- DOIT gérer les différences de syntaxe spécifiques au gestionnaire de
  paquets
- DOIT supporter les configurations d'espace de travail

### CT3 : Gestion de la Connectivité Registre

- Le système DOIT vérifier la connectivité au registre de paquets avant de
  commencer les opérations
- En cas d'indisponibilité du registre, utiliser le cache local des
  versions si disponible (une tentative)
- Si le cache local échoue également, effectuer un rollback automatique
  vers l'état initial
- Fournir des messages d'erreur clairs indiquant la cause de l'échec
  (connectivité vs cache)

### CT2 : Gestion d'État

- Le stockage d'état DOIT être en mémoire (pas de fichiers persistants)
- L'état DOIT être collecté par le garbage collector après achèvement
  réussi
- DOIT gérer les modifications simultanées des dépendances

## Critères de Succès

### CS1 : Gestion d'État

- [ ] Le système capture avec succès l'état des dépendances pour des
      projets avec 100+ dépendances
- [ ] Le rollback restaure l'état précédent exact dans 100% des cas de test
- [ ] Aucune dérive de version de dépendance après les opérations de
      rollback

### CS2 : Exécution des Scripts

- [ ] Tous les types de scripts (npm, yarn, pnpm, bun, shell) s'exécutent
      correctement
- [ ] Les échecs de scripts déclenchent les mécanismes de rollback
      appropriés
- [ ] Les configurations de scripts personnalisés fonctionnent sur
      différents types de projets

### CS3 : Intégration

- [ ] L'interface CLI existante reste inchangée pour l'utilisation de base
- [ ] Les nouvelles fonctionnalités s'intègrent de manière transparente
      avec le flux de mise à niveau actuel
- [ ] Impact sur les performances < 10% pour les opérations de mise à
      niveau standard

## Critères d'Acceptation

### CA1 : Chemin Heureux

```gherkin
Étant donné un projet avec des dépendances mixtes et des signes semver
Lorsque je lance la commande de mise à niveau en mode admin
Et que le script admin passe
Alors toutes les dépendances sont mises à niveau selon les contraintes semver
Et aucun rollback n'est effectué
```

### CA2 : Chemin de Rollback

```gherkin
Étant donné un projet avec des dépendances mixtes et des signes semver
Lorsque je lance la commande de mise à niveau en mode admin
Et que le script admin échoue
Alors toutes les dépendances sont restaurées à leur état initial exact
Et le package.json contient les signes semver originaux
Et le projet est dans le même état qu'avant la mise à niveau
```

### CA3 : Configuration des Scripts

```gherkin
Étant donné que je configure des scripts personnalisés de test et de build
Lorsque le processus de mise à niveau s'exécute
Alors les scripts personnalisés sont utilisés au lieu des valeurs par défaut
Et les échecs de scripts sont correctement gérés
```

## Changements d'API

### Interface UpgradeOrchestrator Améliorée

```typescript
interface DependencyState {
  packageName: string;
  version: string;
  semverSign: '^' | '~' | 'exact';
}

interface ScriptConfig {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell';
  command: string;
}

interface UpgradeOptions {
  testScript: ScriptConfig; // Requis
  buildScript: ScriptConfig; // Requis
  installScript: ScriptConfig; // Requis
  additionalScripts?: ScriptConfig[];
  workingDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
}
```

## Dépendances

### Dépendances Externes

- Utilitaires de détection du gestionnaire de paquets actuel
- Bibliothèques d'analyse et de manipulation semver
- Utilitaires d'exécution de processus (execa)

### Dépendances Internes

- Service UpgradeOrchestrator existant
- CiRunnerService pour l'exécution de scripts
- Services de registre pour la récupération de versions

## Risques et Mitigations

### Risque 1 : Échecs de Rollback

**Risque** : Le processus de rollback lui-même pourrait échouer, laissant
le projet dans un état cassé  
**Mitigation** : Implémenter un stockage d'état de sauvegarde et une
vérification de rollback en plusieurs étapes

### Risque 2 : Différences entre Gestionnaires de Paquets

**Risque** : Différents gestionnaires de paquets gèrent les signes semver
différemment  
**Mitigation** : Créer des adaptateurs spécifiques au gestionnaire de
paquets avec des tests complets

### Risque 3 : Modifications Simultanées

**Risque** : Processus externes modifiant les dépendances pendant la mise à
niveau  
**Mitigation** : Surveillance du système de fichiers et détection de
conflits

## Hors de Portée

- Stockage d'état persistant entre sessions
- Interface GUI pour la configuration des scripts
- Intégration avec des systèmes CI/CD au-delà des capacités actuelles
- Support pour des gestionnaires de paquets autres que npm, yarn, pnpm, bun

## Clarifications

### Session 1 : Détails de Configuration des Scripts

**Q** : Comment les tableaux de scripts devraient-ils être passés au CLI
?  
**R** : Les 3 scripts requis devraient être configurables via des flags CLI
avec syntaxe JSON :
`--test-script='{"type":"npm","command":"test"}' --build-script='{"type":"npm","command":"build"}' --install-script='{"type":"npm","command":"install"}'`

**Q** : L'outil devrait-il auto-détecter les patterns de scripts courants
?  
**R** : Oui, détecter les scripts standard depuis package.json (test,
build, lint) comme fallbacks lorsque des scripts personnalisés ne sont pas
fournis

**Q** : Comment gérer les timeouts de scripts ?  
**R** : Chaque type de script devrait avoir un timeout configurable (par
défaut 5 minutes), avec terminaison gracieuse et rollback sur timeout

### Session 2 : Détails du Mécanisme de Rollback

**Q** : Que se passe-t-il si package.json est modifié extérieurement
pendant la mise à niveau ?  
**R** : Implémenter une surveillance de fichiers pour détecter les
changements externes et annuler avec un message d'erreur clair

**Q** : Le rollback devrait-il inclure devDependencies et
optionalDependencies ?  
**R** : Oui, tous les types de dépendances devraient être suivis et
rollbackés pour maintenir l'état complet du projet

**Q** : Comment gérer les dépendances qui ont été ajoutées/supprimées
pendant la mise à niveau ?  
**R** : Suivre les ajouts/suppressions séparément et inverser ces
opérations pendant le rollback

### Session 3 : 2025-09-29

- Q: Pendant les opérations longues (capture d'état, rollback), comment
  l'utilisateur devrait-il être informé du progrès ? → A: Logs détaillés en
  temps réel avec étapes spécifiques ET barre de progression simple avec
  pourcentage
- Q: Que devrait faire le système si l'utilisateur interrompt le processus
  (Ctrl+C) pendant une mise à niveau en cours ? → A: Demander confirmation
  avant rollback
- Q: Comment le système devrait-il gérer les cas où le registre de paquets
  (npm registry, etc.) est indisponible pendant une mise à niveau ? → A:
  Vérifier la connexion avant, utiliser cache local si disponible une fois,
  et si pas réussi rollback
- Q: Quelles informations de diagnostic le système devrait-il loguer pour
  faciliter le débogage des échecs de mise à niveau ? → A: État complet des
  dépendances avant/après chaque étape
- Q: Pour les projets avec de nombreuses dépendances (100+), comment
  optimiser les performances de capture d'état tout en maintenant la
  précision ? → A: Traitement en parallèle par chunks de 10 dépendances
