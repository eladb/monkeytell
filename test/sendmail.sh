#!/bin/bash	
echo sending mail to $MONKEYSERVER
swaks -h monkeytell.com --from elad.benisrael@gmail.com --to another@monkeytell.com,nonmonkeytell@gmail.com,all@monkeytell.com --server $MONKEYSERVER
