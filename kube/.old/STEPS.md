Generate generic keyfile

```bash
kubectl create secret generic mongo-keyfile --from-file=mongo-keyfile=./secrets/mongo-keyfile-content.txt
```

Start kube

```bash
kubectl apply -f mongo-csrs-headless-svc.yaml
kubectl apply -f mongo-csrs-statefulset.yaml
```

Setup

```bash
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.initiate({ \
  _id: 'rsConfig', \
  configsvr: true, \
  members: [ \
    { _id: 0, host: 'mongo-csrs-0.mongo-csrs-headless.default.svc.cluster.local:27017' }, \
    { _id: 1, host: 'mongo-csrs-1.mongo-csrs-headless.default.svc.cluster.local:27017' }, \
    { _id: 2, host: 'mongo-csrs-2.mongo-csrs-headless.default.svc.cluster.local:27017' } \
  ] \
})"
```

Create admin user in config db

```bash
kubectl exec -it mongo-csrs-0 -- mongosh

use admin;
db.createUser({
  user: "clusterAdmin",
  pwd: passwordPrompt(),
  roles: [ { role: "root", db: "admin" } ]
});
exit;
```

Start shards1

```bash
kubectl apply -f mongo-shard1-headless-svc.yaml
kubectl apply -f mongo-shard1-statefulset.yaml
```

Setup

```bash
kubectl exec -it mongo-shard1-0 -- mongosh --eval "rs.initiate({ \
  _id: 'rsShard1', \
  members: [ \
    { _id: 0, host: 'mongo-shard1-0.mongo-shard1-headless.default.svc.cluster.local:27017' }, \
    { _id: 1, host: 'mongo-shard1-1.mongo-shard1-headless.default.svc.cluster.local:27017' }, \
    { _id: 2, host: 'mongo-shard1-2.mongo-shard1-headless.default.svc.cluster.local:27017' } \
  ] \
})"
```

Start shards2

```bash
kubectl apply -f mongo-shard2-headless-svc.yaml
kubectl apply -f mongo-shard2-statefulset.yaml
```

Setup

```bash
kubectl exec -it mongo-shard2-0 -- mongosh --eval "rs.initiate({ \
  _id: 'rsShard2', \
  members: [ \
    { _id: 0, host: 'mongo-shard2-0.mongo-shard2-headless.default.svc.cluster.local:27017' }, \
    { _id: 1, host: 'mongo-shard2-1.mongo-shard2-headless.default.svc.cluster.local:27017' }, \
    { _id: 2, host: 'mongo-shard2-2.mongo-shard2-headless.default.svc.cluster.local:27017' } \
  ] \
})"
```

Start router

```bash
kubectl apply -f mongo-mongos-svc.yaml
kubectl apply -f mongo-mongos-deployment.yaml
```

Mongo Setup

```bash
kubectl get pods -l app=mongo-mongos
kubectl exec -it mongo-mongos-xxxx -- mongosh \
  --username clusterAdmin \
  --authenticationDatabase admin
```

```bash
sh.addShard("rsShard1/mongo-shard1-0.mongo-shard1-headless.default.svc.cluster.local:27017");
sh.addShard("rsShard2/mongo-shard2-0.mongo-shard2-headless.default.svc.cluster.local:27017");
sh.status()
```

```bash
sh.enableSharding("twutter");
use twutter;

db.users.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.users", { "_id": "hashed" });

db.posts.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });
```

Check **mongodb://clusterAdmin:<password>@127.0.0.1:30007**
