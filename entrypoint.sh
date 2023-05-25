#!/bin/sh
sleep 30
node /usr/src/app/migrate.js
node /usr/src/app/api.js
