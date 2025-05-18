resource "openstack_networking_network_v2" "cluster_network" {
  name           = "cluster-network"
  admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "cluster_subnet" {
  name       = "cluster-subnet"
  network_id = openstack_networking_network_v2.cluster_network.id
  ip_version = 4
  cidr       = "192.168.1.0/24"
}

resource "openstack_networking_router_v2" "cluster_router" {
  name                = "cluster-router"
  admin_state_up      = true
  external_network_id = "e6cb7f2a-b9a8-436b-a7e1-7556202ec045"
}

resource "openstack_networking_router_interface_v2" "cluster_router_interface" {
  router_id = openstack_networking_router_v2.cluster_router.id
  subnet_id = openstack_networking_subnet_v2.cluster_subnet.id
}

resource "openstack_compute_secgroup_v2" "cluster_secgroup" {
  name        = "cluster-secgroup"
  description = "my security group"

  rule {
    from_port   = 1
    to_port     = 65535
    ip_protocol = "tcp"
    cidr        = "0.0.0.0/0"
  }

  rule {
    from_port   = 1
    to_port     = 65535
    ip_protocol = "udp"
    cidr        = "0.0.0.0/0"
  }

  rule {
    from_port   = -1
    to_port     = -1
    ip_protocol = "icmp"
    cidr        = "0.0.0.0/0"
  }
}
