#!/bin/bash	
echo sending mail to $MONKEYSERVER
swaks -h monkeytell.com --from elad.benisrael@gmail.com --to all@monkeytell.com --server $MONKEYSERVER
