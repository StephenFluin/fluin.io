import 'angular2-universal-polyfills';
import 'zone.js/dist/zone-node.js'
import 'reflect-metadata';

import * as fs from 'fs';

import {CompilerOptions, COMPILER_OPTIONS, enableProdMode} from '@angular/core';
import {ResourceLoader} from '@angular/compiler';
import {platformUniversalDynamic, REQUEST_URL} from 'angular2-universal/node';
import {UniversalAppModule} from './universal.module';

declare var Zone;

export class FileResourceLoader implements ResourceLoader {
  get(path: string): Promise<string> {
      console.log("trying to read",path);
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => {
        if (!exists) {
          return reject(new Error(`Compilation failed. Resource file not found: ${path}`))
        }
        fs.readFile(path, 'utf8', (err, data) => {
          if (err) {
            return reject(new Error(`Compilation failed. Read error for file: ${path}: ${err}`));
          }
          return resolve(data);
        });
      });
    });
  }
}

export function genAppShell(document: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Zone.current.fork({
      name: 'universal',
      properties: {document}
    }).run(() => {
      enableProdMode();
      platformUniversalDynamic([{
        provide: COMPILER_OPTIONS,
        useValue: {
          providers: [{provide: ResourceLoader, useValue: new FileResourceLoader()}],
        } as CompilerOptions,
        multi: true,
      }])
        .serializeModule(UniversalAppModule, {
          preboot: false
        })
        .then(html => resolve(html), err => reject(err));
    });
  });
}