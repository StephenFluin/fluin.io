#!/bin/bash
ng build -prod
ng build -prod --app=1 --output-hashing=none
mv dist/index.html functions/index.html
tsc -p server/tsconfig.json
firebase serve --only functions,hosting
