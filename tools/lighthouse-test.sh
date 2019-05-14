#!/bin/bash
set -ev

firebase deploy --only=hosting --token="$FIREBASE_TOKEN" --project fluinio-ci
./node_modules/.bin/lighthouse-ci https://fluinio-ci.firebaseapp.com