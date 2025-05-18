#!/bin/bash

sudo mkdir -p /etc/rancher/k3s/
# $1 token zum joinen, $2 fip des servers , $3 ip des masters (nicht fip)
sudo curl -sfL https://get.k3s.io | K3S_TOKEN=$1 INSTALL_K3S_EXEC="--tls-san $2" sh -s - server --server $3:6443
#sudo curl -sfL https://get.k3s.io | K3S_TOKEN=TF_VAR_K3S_TOKEN INSTALL_K3S_EXEC="--tls-san 134.103.195.151" sh -s - server --server https://192.168.1.245:6443