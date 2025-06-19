resource "null_resource" "cinder_csi_plugin" {
  count = var.setup_mongo ? 1 : 0
  
  depends_on = [
    null_resource.local_setup
  ]

  provisioner "local-exec" {
    command = "kubectl apply -f ${path.module}/kube/manifests/cinder-csi-plugin/"
  }
}

resource "helm_release" "mongodb_sharded" {
  count      = var.setup_mongo ? 1 : 0
  name       = "mongodb-sharded"
  repository = null
  chart      = "${path.module}/kube/mongo-sharded-cluster"
  namespace  = "default"
  values     = [file("${path.module}/values.prod.yaml")]

  depends_on = [
    null_resource.local_setup,
    null_resource.cinder_csi_plugin[0]
  ]
}
