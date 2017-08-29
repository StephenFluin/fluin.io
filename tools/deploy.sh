#!/bin/bash

ng build -prod --build-optimizer && yarn run gfp && firebase deploy
