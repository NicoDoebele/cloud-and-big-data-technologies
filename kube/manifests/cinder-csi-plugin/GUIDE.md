Create a *cloud.conf* file in this directory with the following information:

```
[Global]
username = YOUR_USER
password = YOUR_PASSWORD
domain-name = default
auth-url = https://YOUR_DU_URL/keystone/v3
tenant-id = YOUR_TENANT_ID
region = YOUR_REGION
```

Get the base64 version of the secret and replace the content of the current *csi-secret-cinderplugin* file. Note: The current string will not work, it is a placeholder.

```bash
cat manifests/cinder-csi-plugin/cloud.conf | base64 | tr -d '\n'
```

Create the kubernetes secret

```bash
kubectl create -f manifests/cinder-csi-plugin/csi-secret-cinderplugin.yaml
```

Apply the rest of the plugin

```bash
kubectl -f manifests/cinder-csi-plugin/ apply
```

Check if the plugin is working as expected

```bash
$ kubectl get pods -n kube-system
csi-cinder-controllerplugin-0             6/6     Running     6          8d
csi-cinder-nodeplugin-4w6w6               3/3     Running     3          8d
csi-cinder-nodeplugin-gk5nf               3/3     Running     3          8d
```

```bash
$ kubectl get csidrivers.storage.k8s.io
NAME                       CREATED AT
cinder.csi.openstack.org   2025-06-12T10:54:40Z
```

Delete

```bash
kubectl delete -f manifests/cinder-csi-plugin/
```