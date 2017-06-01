#!/bin/bash

ng build -prod
node tools/generate-http2-push.js
firebase deploy
