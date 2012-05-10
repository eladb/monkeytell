#!/bin/bash
ssh -i ~/monkeytell.pem ubuntu@listzz.com /var/deploy/sync
source ./testprod.sh
