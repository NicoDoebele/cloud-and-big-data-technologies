
resource "null_resource" "master_setup" {
  
  # depends_on = [openstack_compute_floatingip_associate_v2.fips] 
  
  depends_on = [ openstack_compute_instance_v2.cluster_nodes ]

  connection {
    host        = openstack_compute_floatingip_v2.floatips[0].address
    user        = "rocky"
    type        = "ssh"
    private_key = file(pathexpand("~/cluster.key"))
    timeout     = "2m"
  }

  provisioner "file" {
    source      = "setup_k3s/bootstrap_master.sh"
    destination = "/tmp/bootstrap_master.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/bootstrap_master.sh",
      "/tmp/bootstrap_master.sh ${openstack_compute_floatingip_v2.floatips[0].address}",
    ]
  }

}

data "external" "k3s_token" {
  
  depends_on = [null_resource.master_setup]

  program = [
    "bash", "setup_k3s/k3s_init_info.sh",
  ]

  query = {
    ip_address  = openstack_compute_floatingip_v2.floatips[0].address
    private_key = pathexpand("~/cluster.key")
  }

}

resource "null_resource" "worker_setup" {
  
  count = var.node_count - 1

  connection {
    host        = openstack_compute_floatingip_v2.floatips[count.index+1].address
    user        = "rocky"
    type        = "ssh"
    private_key = file(pathexpand("~/cluster.key"))
    timeout     = "2m"
  }

  provisioner "file" {
    source      = "setup_k3s/add_node.sh"
    destination = "/tmp/add_node.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/add_node.sh",
      "/tmp/add_node.sh '${data.external.k3s_token.result.token}' '${openstack_compute_floatingip_v2.floatips[count.index+1].address}' 'https://${openstack_compute_instance_v2.cluster_nodes[0].network[0].fixed_ip_v4}' ",
    ]
  }

}

resource "null_resource" "local_setup" {

depends_on = [null_resource.worker_setup]

  provisioner "local-exec" {
    command = "[ ! -f ~/.kube/config ] || mv ~/.kube/config ~/.kube/config.old"
  }

  provisioner "local-exec" {
    command = "ssh -i ~/cluster.key rocky@${openstack_compute_floatingip_v2.floatips[0].address} -o 'StrictHostKeyChecking no' -o 'UserKnownHostsFile /dev/null' 'sudo cat /etc/rancher/k3s/k3s.yaml' > ~/.kube/config"
  }

  provisioner "local-exec" {
    command = "sed -i.bak 's/127.0.0.1/${openstack_compute_floatingip_v2.floatips[0].address}/g' ~/.kube/config"
  }

  provisioner "local-exec" {
    command = "rm ~/.kube/config"
    when    = destroy
  }

}
