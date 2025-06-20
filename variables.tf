# Input variables of project

variable "cloud_name" {
    type = string
    description = "Name of OpenStack cloud given in file ~/.config/openstack/clouds.yaml"
}   

variable "node_count" {
    type = number
    description = "Number of cluster nodes (master + workers)"
}

variable "image_name" {
    type = string
    description = "OS image name"
}

variable "test_flavor_name" {
    type = string
    default = "Instance flavor name for testing setup"
}

variable "production_flavor_name" {
    type = string
    default = "Instance flavor name for production setup"
}

variable "production" {
    type = bool
    description = "Switch between production setup (value: true) and testing setup (value: false)"
}

variable "setup_mongo" {
    type = bool
    description = "Whether to deploy MongoDB sharded cluster automatically"
    default = false
}

variable "setup_twutter" {
    type = bool
    description = "Whether to deploy Twutter application automatically"
    default = false
}
