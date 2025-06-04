# Main HELM commands

Install

```bash
helm install mongo ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml
```

Uninstall

```bash
helm uninstall mongo
```

Show templates with values

```bash
helm template ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml
```

## For testing

Get all pods

```bash
kubectl get pods
```

Delete all volumes

```bash
kubectl delete pvc --all
```

Describe pod

```bash
kubectl describe pod mongo-csrs-1
```

Get pod logs

```bash
kubectl logs mongo-csrs-1
```

Exec into node with mongosh / shell

```bash
kubectl exec -it mongo-csrs-0 -- mongosh

kubectl exec -it mongo-csrs-1 -- mongosh

kubectl exec -it mongo-csrs-2 -- mongosh

kubectl exec -it mongo-csrs-1 -- mongosh --host mongo-csrs-2.mongo-csrs-headless.default.svc.cluster.local:27017

kubectl exec -it mongo-csrs-1 -- mongosh --host mongo-csrs-2.mongo-csrs-headless.default.svc.cluster.local:27017 --username mongoadmin --password securepassword

kubectl exec -it mongo-shard1-0 -- mongosh --host mongo-shard1-1.mongo-shard1-headless.default.svc.cluster.local:27017

kubectl exec -it mongo-csrs-0 -- sh

kubectl exec -it mongo-shard1-1 -- mongosh
```

## Manual stuff

Exec into mongos mongosh

```bash
kubectl get pods -l app=mongo-mongos
kubectl exec -it mongo-mongos-xxxx -- mongosh --username mongoadmin --password securepassword --authenticationDatabase admin
```

Set up shards

```bash
sh.addShard("rsShard1/mongo-shard1-0.mongo-shard1-headless.default.svc.cluster.local:27017");
sh.addShard("rsShard2/mongo-shard2-0.mongo-shard2-headless.default.svc.cluster.local:27017");
sh.status()
```

Shard twutter

```bash
sh.enableSharding("twutter");
use twutter;

db.users.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.users", { "_id": "hashed" });

db.posts.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });
```