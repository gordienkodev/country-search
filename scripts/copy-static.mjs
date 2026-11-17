import { URL } from 'node:url';
import { copyFileSync } from 'node:fs';

for (const file of ['index.html', 'style.css']) {
  copyFileSync(
    new URL(`../src/${file}`, import.meta.url),
    new URL(`../dist/${file}`, import.meta.url),
  );
}
