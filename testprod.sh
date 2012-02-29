#!/bin/bash
TESTED_URL=http://listzz.com
export TESTED_URL
nodeunit test/rest-tests.js


