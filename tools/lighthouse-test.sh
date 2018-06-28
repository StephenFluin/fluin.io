#!/bin/bash
set -ev

firebase use ci
firebase deploy --only=hosting --token="$FIREBASE_TOKEN"
./node_modules/.bin/lighthouse-ci https://fluinio-ci.firebaseapp.com