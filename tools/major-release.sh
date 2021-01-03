#!/bin/bash

if [ -z "$1" ]
then
  echo "The new major release version is not defined"
  exit 1
else
  if [ -z "$GL_TOKEN" ]
  then
    echo "The gitlab api key is not defined"
    exit 1
  else
    lerna version $1 --create-release gitlab --force-publish
    node tools/update-dependencies.js
    git commit -am "chore: update project local peer dependencies"
    lerna publish from-package
  fi
fi


