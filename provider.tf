terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "1.53.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "3.2.2"
    }
    external = {
      source  = "hashicorp/external"
      version = "2.3.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "openstack" {
  cloud = var.cloud_name
}

provider "kubernetes" {
  config_path = "/home/rocky/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "/home/rocky/.kube/config"
  }
}