resource "null_resource" "twutter" {
  count = var.setup_mongo && var.setup_twutter ? 1 : 0
  
  depends_on = [
    null_resource.cinder_csi_plugin[0],
    helm_release.mongodb_sharded[0]
  ]

  provisioner "local-exec" {
    command = <<-EOT
      kubectl create configmap mongodb-config \
        --from-literal=host=${openstack_compute_floatingip_associate_v2.fips[0].floating_ip} \
        --from-literal=port=30007
      
      # Apply twutter manifests using kustomize
      kubectl apply -k ${path.module}/kube/twutter/
    EOT
  }
}
