#!/bin/bash
[ $PROD ] || {
    echo 'Running in non-production environment (PROD=0)';
    exit 2;
}

git reset --hard || exit 1
git pull --rebase origin || exit 1
[ -e /etc/init/monkeytell.conf ] || sudo ln -s $PWD/monkeytell.conf /etc/init
sudo initctl reload-configuration
sudo stop monkeytell
sudo start monkeytell
