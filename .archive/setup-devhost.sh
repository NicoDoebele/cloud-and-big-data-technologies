#!/bin/bash

GIT_CONF_NAME="Vorname Name" 
GIT_CONF_EMAIL="Vorname.Name@Reutlingen-University.de" 

# Set timezone
sudo ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime

# Install Software
sudo dnf makecache -y
sudo dnf update -y
sudo dnf check-update -y
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y nano
sudo dnf install -y unzip
sudo dnf install -y git

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO https://releases.hashicorp.com/terraform/1.11.4/terraform_1.11.4_linux_amd64.zip
unzip terraform_1.11.4_linux_amd64.zip
curl -LO https://get.helm.sh/helm-v3.17.3-linux-amd64.tar.gz
tar xzf helm-v3.17.3-linux-amd64.tar.gz 

sudo mv kubectl /usr/local/bin
sudo mv terraform /usr/local/bin
sudo mv linux-amd64/helm /usr/local/bin
sudo chown root:root /usr/local/bin/kubectl
sudo chown root:root /usr/local/bin/terraform
sudo chown root:root /usr/local/bin/helm
sudo chmod +x /usr/local/bin/kubectl
sudo chmod +x /usr/local/bin/terraform
sudo chmod +x /usr/local/bin/helm

rm helm-v3.17.3-linux-amd64.tar.gz
rm terraform_1.11.4_linux_amd64.zip
rm LICENSE.txt
rm -r linux-amd64

mkdir .kube
mkdir .config
mkdir .config/openstack

# Configure git
git config --global user.name "$GIT_CONF_NAME"
git config --global user.email "$GIT_CONF_EMAIL"