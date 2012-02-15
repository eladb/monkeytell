#!/bin/bash	
echo sending mail to $MONKEYSERVER
swaks -h monkeytell.com --from elad.benisrael@gmail.com --to test+onlyelad@monkeytell.com,nonmonkeytell@gmail.com,notexist@monkeytell.com,test+onlyelad2@monkeytell.com --server $MONKEYSERVER
