## Cinder CSI Plugin

Firstly, the *cinder-csi-plugin* in the *manifests* directory needs to be started. This process is described in the *GUIDE.md* file in the same directory.

Shorthand guide (if already set up):

```bash
kubectl create -f manifests/cinder-csi-plugin/csi-secret-cinderplugin.yaml

kubectl -f manifests/cinder-csi-plugin/ apply

kubectl get pods -n kube-system
```

## Applying the custom helm chart

At last, the helm chart can be applied. The easiest way is using:

```bash
make install
```