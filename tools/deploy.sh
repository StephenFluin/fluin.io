#!/bin/bash

ng build -prod --named-chunks && yarn run gfp && firebase deploy
