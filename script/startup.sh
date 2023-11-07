#!/bin/sh

export LANG=C.UTF-8 

#echo "set env vars..."
#rm -rf /app/.env
#aws s3 cp s3://bkt-ufsmgo-api-variables/variables.env /app/.env
#cat /app/.env

echo "Starting Server..."
yarn server