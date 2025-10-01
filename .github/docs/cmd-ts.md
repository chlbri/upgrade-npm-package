# cmd-ts Documentation

## Vue d'ensemble

`cmd-ts` est un parseur d'arguments de ligne de commande écrit en
TypeScript, axé sur les types. Il fournit une expérience utilisateur
supérieure en permettant des types personnalisés et une gestion d'erreur
contextuelle.

## Installation

```bash
npm install cmd-ts
```

## Utilisation de base

```typescript
import { command, run, string, number, positional, option } from 'cmd-ts';

const cmd = command({
  name: 'my-command',
  description: 'affiche quelque chose à l'écran',
  version: '1.0.0',
  args: {
    number: positional({ type: number, displayName: 'num' }),
    message: option({
      long: 'greeting',
      type: string,
    }),
  },
  handler: (args) => {
    args.message; // string
    args.number; // number
    console.log(args);
  },
});

run(cmd, process.argv.slice(2));
```

## Fonctionnalités principales

### Types personnalisés

`cmd-ts` permet de décoder des types personnalisés à partir de chaînes avec
gestion d'erreur :

```typescript
import { Type } from 'cmd-ts';
import fs from 'fs';

// Type<string, Stream> lit comme "Un type de string vers Stream"
const ReadStream: Type<string, Stream> = {
  async from(str) {
    if (!fs.existsSync(str)) {
      throw new Error('Fichier non trouvé');
    }
    return fs.createReadStream(str);
  },
};
```

### Avantages

- **Sécurité de type** : Vérification statique et runtime des types
- **Gestion d'erreur contextuelle** : Erreurs précises indiquant où et quoi
  corriger
- **API composable** : Petits parseurs extensibles
- **Sous-commandes imbriquées** : Structure hiérarchique des commandes
- **Autocomplétion** : Support pour l'autocomplétion

## Inspiration

Le projet était initialement appelé `clio-ts` et était basé sur `io-ts`,
mais a évolué pour réduire les dépendances.

## Ressources

- [Site officiel](https://cmd-ts.now.sh/)
- [Dépôt GitHub](https://github.com/ewanru/cmd-ts)
- [Package npm](https://www.npmjs.com/package/cmd-ts)

## Exemples d'utilisation

### Commande avec options et positionnels

```typescript
const app = command({
  name: 'greet',
  description: 'Salue quelqu'un',
  args: {
    name: positional({ type: string, displayName: 'nom' }),
    count: option({
      long: 'count',
      short: 'c',
      type: number,
      defaultValue: () => 1,
      description: 'Nombre de salutations'
    }),
  },
  handler: ({ name, count }) => {
    for (let i = 0; i < count; i++) {
      console.log(`Hello, ${name}!`);
    }
  },
});
```

### Types personnalisés avancés

```typescript
// Type pour un fichier existant
const ExistingFile: Type<string, string> = {
  async from(str) {
    if (!fs.existsSync(str)) {
      throw new Error(`Le fichier '${str}' n'existe pas`);
    }
    if (!fs.statSync(str).isFile()) {
      throw new Error(`'${str}' n'est pas un fichier`);
    }
    return str;
  },
};
```
