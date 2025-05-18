#!/bin/bash

sudo mkdir -p /etc/rancher/k3s/
sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--tls-san $1" sh -s - server --cluster-init 
