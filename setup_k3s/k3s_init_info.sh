#!/bin/bash

eval "$(jq -r '@sh "IP_ADDRESS=\(.ip_address) PRIVATE_KEY=\(.private_key)"')"

token=$(/usr/bin/ssh rocky@$IP_ADDRESS -o "IdentityFile $PRIVATE_KEY" -o 'StrictHostKeyChecking no' -o 'UserKnownHostsFile /dev/null' "sudo cat /var/lib/rancher/k3s/server/token")
jq -n --arg token "$token" '{"token":$token}'