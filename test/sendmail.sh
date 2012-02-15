#!/bin/bash	
[ $PROD ] && SERVER=23.21.238.73
[ $PROD ] || SERVER=localhost
echo sending mail to $SERVER
swaks -h monkeytell.com --from elad.benisrael@gmail.com --to all@monkeytell.com --server $SERVER
