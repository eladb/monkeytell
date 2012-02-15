#!/bin/bash
[ $PROD ] || {
    echo 'Running in non-production environment (PROD=0)';
    exit 2;
}

echo 'pulling new code from git'
git reset --hard || exit 1
git pull --rebase origin || exit 1

echo 'installing and reload upstart configuration'
[ -e /etc/init/monkeytell.conf ] || sudo ln -s $PWD/monkeytell.conf /etc/init
sudo initctl reload-configuration

echo 'kill the process. this will cause a restart by 'upstart''
sudo start monkeytell
sudo kill `cat /var/run/monkeytell.pid`
