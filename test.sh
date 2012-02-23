#!/bin/bash
source ./test/dev.sh
killall node
rm haraka/queue/*
(node main.js &) && (sleep 2) && (test/sendmail.sh) && (killall node)
