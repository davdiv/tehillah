#!/bin/bash

if ! [ -d node_modules/hashspace ] ; then
   mkdir -p node_modules &&
   git clone https://github.com/divdavem/hashspace.git node_modules/hashspace --depth 1 &&
   (  cd node_modules/hashspace && 
      npm install grunt-cli && 
      npm_config_production=false npm install &&
      ./node_modules/.bin/grunt package
   )
fi
