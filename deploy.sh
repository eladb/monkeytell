#!/bin/bash
ssh ubuntu@staging.listzz.com /var/deploy/sync

TESTED_URL=http://listzz.com
export TESTED_URL
nodeunit test/rest-tests.js


