output "Public_IP_Addresses" {
  value = openstack_compute_floatingip_associate_v2.fips[*].floating_ip
}

