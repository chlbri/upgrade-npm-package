import { NPM_REGISTRY_URL } from './registry';

await fetch(`${NPM_REGISTRY_URL}/${'@eslint/js'}`)
  .then(res => res.json())
  .then(data => {
    console.log(data.versions);
  });
