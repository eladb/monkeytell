#!/bin/bash
git reset --hard && git pull --rebase origin && npm install && sudo initctl reload-configuration && sudo init monkeytell

