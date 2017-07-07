#!/bin/bash

ng build -prod && yarn run gfp && firebase deploy
