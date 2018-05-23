#!/bin/bash
cd functions && ./node_modules/.bin/tsc && cd ..
ng build --prod --named-chunks && yarn run gfp && firebase deploy
