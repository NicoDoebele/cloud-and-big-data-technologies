resource "openstack_compute_keypair_v2" "cluster_keypair" {
  name       = "cluster-key"
  public_key = file(pathexpand("~/cluster.key.pub"))
}

resource "openstack_compute_instance_v2" "cluster_nodes" {
  count = var.node_count

  name            = "cluster-node-${format("%02d", count.index + 1)}"
  image_name      = var.image_name
  flavor_name     = var.production ? var.production_flavor_name : var.test_flavor_name
  key_pair        = openstack_compute_keypair_v2.cluster_keypair.name
  security_groups = [openstack_compute_secgroup_v2.cluster_secgroup.name]

  network {
    name = openstack_networking_network_v2.cluster_network.name
  }
  
  depends_on = [openstack_networking_subnet_v2.cluster_subnet]
}

resource "openstack_compute_floatingip_v2" "floatips" {
  count = var.node_count

  pool = "Public-Network"
}

resource "openstack_compute_floatingip_associate_v2" "fips" {
  count = var.node_count

  floating_ip = openstack_compute_floatingip_v2.floatips[count.index].address
  instance_id = openstack_compute_instance_v2.cluster_nodes[count.index].id
}

