# MongoDB Sharded Cluster Documentation

## Overview

This MongoDB sharded cluster deployment uses a custom Helm chart to orchestrate a production-ready MongoDB cluster with config servers, shards, and mongos routers. The deployment includes automatic initialization, replica set configuration, and shard registration.

## Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONGODB SHARDED CLUSTER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CONFIG SERVERS (3 replicas)                      │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Config    │  │   Config    │  │   Config    │                 │   │
│  │  │   Server 0  │◄─┤   Server 1  │◄─┤   Server 2  │                 │   │
│  │  │  (Primary)  │  │ (Secondary) │  │ (Secondary) │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │       │                   │                   │                     │   │
│  │       └───────────────────┼───────────────────┘                     │   │
│  │                           │                                         │   │
│  │                    rsConfig Replica Set                            │   │
│  └───────────────────────────┼─────────────────────────────────────────┘   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SHARDS (2 clusters, 3 replicas each)             │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Shard 1    │  │  Shard 1    │  │  Shard 1    │                 │   │
│  │  │  Primary    │◄─┤  Secondary  │◄─┤  Secondary  │                 │   │
│  │  │ (rsShard1)  │  │ (rsShard1)  │  │ (rsShard1)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Shard 2    │  │  Shard 2    │  │  Shard 2    │                 │   │
│  │  │  Primary    │◄─┤  Secondary  │◄─┤  Secondary  │                 │   │
│  │  │ (rsShard2)  │  │ (rsShard2)  │  │ (rsShard2)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MONGOS ROUTERS (2 instances)                     │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐                                  │   │
│  │  │   Mongos    │  │   Mongos    │                                  │   │
│  │  │   Router 1  │  │   Router 2  │                                  │   │
│  │  │ (Load Bal.) │  │ (Load Bal.) │                                  │   │
│  │  └─────────────┘  └─────────────┘                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL ACCESS                                  │   │
│  │                    NodePort: 30007                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Dependencies and Initialization Order

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PHASE 1       │    │   PHASE 2       │    │   PHASE 3       │
│   CONFIG        │    │   SHARDS        │    │   MONGOS        │
│   SERVERS       │    │   INIT          │    │   & SHARDING    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. Config       │    │ 1. Wait for     │    │ 1. Wait for     │
│    StatefulSet  │    │    config       │    │    config       │
│ 2. Init script  │    │    servers      │    │    servers      │
│    runs on      │    │ 2. Shard        │    │ 2. Mongos       │
│    mongo-csrs-0 │    │    StatefulSets │    │    deployment   │
│ 3. Replica set  │    │ 3. Init scripts │    │ 3. Add-shards   │
│    formation    │    │    run on       │    │    job          │
│ 4. Admin user   │    │    last replica │    │ 4. Auto-shard   │
│    creation     │    │ 4. Replica set  │    │    script       │
│                 │    │    formation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Initialization Process

### 1. Config Servers (`configserver/statefulset.yaml`)

**Initialization Flow**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   POD START     │    │   INIT SCRIPT   │    │   REPLICA SET   │
│                 │    │                 │    │   FORMATION     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Start mongod  │    │ • Check if      │    │ • mongo-csrs-0  │
│   --configsvr   │    │   replica set   │    │   initiates     │
│ • Load keyfile  │    │   exists        │    │   rsConfig      │
│ • Start auth    │    │ • If not, run   │    │ • Add members   │
│                 │    │   init logic    │    │ • Create admin  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Features**:
- **StatefulSet**: Ensures stable hostnames and storage
- **Init Script**: `init-configserver.sh` handles replica set formation
- **Leader Election**: Only `mongo-csrs-0` initiates the replica set
- **Member Addition**: Other pods add themselves to the replica set
- **Admin User**: Created after primary election

**Init Script Logic**:
```bash
# Check if replica set already exists
if mongosh --eval "rs.status().ok" | grep -q "1"; then
    echo "Replica set already initialized"
    exit 0
fi

# Only mongo-csrs-0 initiates the replica set
if [ "$HOSTNAME" == "mongo-csrs-0" ]; then
    # Initiate replica set with all members
    mongosh --eval 'rs.initiate({...})'
    
    # Wait for primary election
    until mongosh --eval "rs.isMaster().ismaster" | grep -q "true"; do
        sleep 5
    done
    
    # Create admin user
    mongosh --eval 'db.getSiblingDB("admin").createUser({...})'
else
    # Other pods add themselves to the replica set
    mongosh --host "$FULL_CONFIG_HOSTNAME" --eval "rs.add('$OWN_HOSTNAME')"
fi
```

### 2. Shards (`shards/shard.yaml`)

**Initialization Flow**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   INIT          │    │   POD START     │    │   REPLICA SET   │
│   CONTAINER     │    │                 │    │   FORMATION     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Wait for      │    │ • Start mongod  │    │ • Last replica  │
│   config        │    │   --shardsvr    │    │   runs init     │
│   servers       │    │ • Load keyfile  │    │   script        │
│ • Check rs      │    │ • Start auth    │    │ • Form replica  │
│   status        │    │                 │    │   set           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Features**:
- **Init Container**: Waits for config servers to be ready
- **StatefulSet**: Creates `mongo-shard1-0`, `mongo-shard1-1`, etc.
- **PostStart Hook**: Only the last replica (`mongo-shard1-2`) initializes the replica set
- **Replica Set Names**: `rsShard1`, `rsShard2` for each shard

**Dependency Check**:
```bash
# Init container waits for config servers
CONFIG_SVR_HOST="mongo-csrs-0.mongo-csrs-headless.default.svc.cluster.local:27017"

until mongosh --quiet --host "$CONFIG_SVR_HOST" \
    --eval 'rs.status().ok' \
    --username "$MONGO_USERNAME" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase "admin" | grep -q "1"; do
    sleep 10
done
```

**Replica Set Formation**:
```bash
# Only the last replica (index 2) initializes the replica set
if [ "$HOSTNAME" != "mongo-shard1-2" ]; then
    exit 0
fi

# Initialize replica set with all members (members generated dynamically)
mongosh --eval '
  rs.initiate({
    _id: "rsShard1",
    members: [
      { _id: 0, host: "mongo-shard1-0.mongo-shard1-headless.default.svc.cluster.local:27017" },
      { _id: 1, host: "mongo-shard1-1.mongo-shard1-headless.default.svc.cluster.local:27017" },
      { _id: 2, host: "mongo-shard1-2.mongo-shard1-headless.default.svc.cluster.local:27017" }
    ]
  });
'
```

### 3. Mongos Routers (`mongos/deployment.yaml`)

**Initialization Flow**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   INIT          │    │   POD START     │    │   CONFIG DB     │
│   CONTAINER     │    │                 │    │   CONNECTION    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Wait for      │    │ • Start mongos  │    │ • Connect to    │
│   config        │    │   --configdb    │    │   config        │
│   servers       │    │ • Load keyfile  │    │   servers       │
│ • Check rs      │    │ • Bind to port  │    │ • Route queries │
│   status        │    │                 │    │   to shards     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Features**:
- **Init Container**: Waits for config servers (same as shards)
- **ConfigDB String**: Dynamically generated from config server hosts
- **Load Balancing**: Multiple mongos instances for high availability

**ConfigDB String Generation** (`_helpers.tpl`):
```go
{{- define "mongodb.configDBString" -}}
{{- $rs := .Values.configServer.replicaSetName -}}
{{- $svc := .Values.configServer.headlessServiceName -}}
{{- $port := toString .Values.configServer.port -}}
{{- $ns := .Release.Namespace -}}
{{- $replicas := int .Values.replicaCount.configServers -}}
{{- $name := .Values.configServer.name -}}
{{- $hosts := list -}}
{{- range $i, $e := until $replicas -}}
{{- $host := printf "%s-%d.%s.%s.svc.cluster.local:%s" $name $i $svc $ns $port -}}
{{- $hosts = append $hosts $host -}}
{{- end -}}
{{- $result := printf "%s/%s" $rs (join "," $hosts) -}}
{{ $result -}}
{{- end -}}
```

**Generated ConfigDB String**:
```
rsConfig/mongo-csrs-0.mongo-csrs-headless.default.svc.cluster.local:27017,mongo-csrs-1.mongo-csrs-headless.default.svc.cluster.local:27017,mongo-csrs-2.mongo-csrs-headless.default.svc.cluster.local:27017
```

### 4. Shard Registration (`jobs/add-shards-job.yaml`)

**Job Execution Flow**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WAIT FOR      │    │   SHARD         │    │   AUTO-SHARD    │
│   MONGOS        │    │   REGISTRATION  │    │   CONFIG        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Wait for      │    │ • For each      │    │ • Enable        │
│   mongos pod    │    │   shard:        │    │   sharding      │
│ • Wait for      │    │ • Wait for      │    │ • Create        │
│   mongos        │    │   replica set   │    │   indexes       │
│   responsive    │    │ • Add shard     │    │ • Shard         │
│                 │    │   to cluster    │    │   collections   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Features**:
- **Helm Hook**: Runs after install/upgrade (`post-install,post-upgrade`)
- **Dependency Chain**: Waits for mongos and all shards to be ready
- **Idempotent**: Checks if shards already exist before adding
- **Auto-sharding**: Automatically configures sharding for the `twutter` database

**Shard Registration Process**:
```bash
# Wait for mongos to be ready
until kubectl get pods -l app=mongo-mongos -o jsonpath='{.items[0].status.phase}' | grep -q "Running"; do
    echo "Waiting for mongos pod to be ready..."
    sleep 5
done

# For each shard
for i in $(seq 1 $SHARD_COUNT); do
    # Wait for all replicas to be ready
    until {
        ACTUAL_PODS=$(kubectl get pods -l "app=mongo-shard$i" -o jsonpath='{.items}' | jq 'length')
        [ "$ACTUAL_PODS" -eq "$REPLICA_COUNT" ] && \
        kubectl get pods -l "app=mongo-shard$i" -o jsonpath="{.items[$LAST_REPLICA].status.phase}" | grep -q "Running"
    }; do
        echo "Waiting for last replica of shard $i to be ready..."
        sleep 5
    done

    # Wait for replica set to be initialized
    until kubectl exec mongo-shard$i-0 -- mongosh --quiet --eval "rs.status().ok" | grep -q "1"; do
        echo "Waiting for replica set of shard $i to be initialized..."
        sleep 5
    done

    # Wait for primary election
    until kubectl exec mongo-shard$i-0 -- mongosh --quiet --eval "rs.status().members.some(m => m.stateStr === 'PRIMARY')" | grep -q "true"; do
        echo "Waiting for primary in shard $i..."
        sleep 5
    done

    # Check if shard already exists
    SHARD_EXISTS=$(kubectl exec $MONGOS_POD -- mongosh --quiet --username $MONGO_USERNAME --password $MONGO_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('listShards').shards.some(s => s._id === 'rsShard$i')" --quiet)
    
    if [ "$SHARD_EXISTS" = "false" ]; then
        # Build shard host string
        SHARD_HOSTS="mongo-shard$i-0.mongo-shard$i-headless.default.svc.cluster.local:27017,mongo-shard$i-1.mongo-shard$i-headless.default.svc.cluster.local:27017,mongo-shard$i-2.mongo-shard$i-headless.default.svc.cluster.local:27017"
        
        # Add shard to cluster
        kubectl exec $MONGOS_POD -- mongosh --quiet --username $MONGO_USERNAME --password $MONGO_PASSWORD --authenticationDatabase admin --eval "sh.addShard(\"rsShard$i/$SHARD_HOSTS\")"
    fi
done
```

### 5. Auto-sharding Configuration (`scripts/auto-shard.sh`)

**Auto-sharding Process**:
```bash
# Enable sharding for twutter database
sh.enableSharding("twutter");

# Create hashed indexes on _id fields
db.users.createIndex({ "_id": "hashed" });
db.posts.createIndex({ "_id": "hashed" });
db.comments.createIndex({ "post_id": 1 });

# Shard collections
sh.shardCollection("twutter.users", { "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });
sh.shardCollection("twutter.comments", { "post_id": 1 });

# Create application user
db.createUser({
    user: "twutter", 
    pwd: "x", 
    roles: [{ role: "readWrite", db: "twutter" }]
});
```

**Sharding Strategy**:
- **Users Collection**: Hashed sharding on `_id` for even distribution
- **Posts Collection**: Hashed sharding on `_id` for even distribution  
- **Comments Collection**: Range sharding on `post_id` for locality

## Health Checks and Monitoring

### Startup Probes
```yaml
startupProbe:
  exec:
    command:
      - mongosh
      - --eval
      - db.adminCommand('ping').ok === 1
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30
```

### Readiness Probes
```yaml
readinessProbe:
  exec:
    command:
      - mongosh
      - --eval
      - db.adminCommand('ping').ok === 1
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Liveness Probes
```yaml
livenessProbe:
  exec:
    command:
      - mongosh
      - --eval
      - db.adminCommand('ping').ok === 1
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

## Configuration Values

### Key Configuration Parameters
```yaml
replicaCount:
  configServers: 3      # Config server replicas
  mongos: 2             # Mongos router instances

sharding:
  clusterCount: 2       # Number of shards
  replicasPerCluster: 3 # Replicas per shard

configServer:
  storage: 20Gi         # Storage per config server
  storageClassName: "mongo-volume-xfs"

sharding:
  storage: 40Gi         # Storage per shard replica
  storageClassName: "mongo-volume-xfs"

mongos:
  service:
    type: NodePort
    nodePort: 30007     # External access port
```

### Resource Allocation
```yaml
resources:
  requests:
    cpu: "500m"         # 0.5 CPU cores
    memory: "1Gi"       # 1GB RAM
  limits:
    cpu: "500m"         # 0.5 CPU cores
    memory: "1Gi"       # 1GB RAM
```

## Troubleshooting

### Common Issues and Solutions

**1. Config Server Initialization Failures**
```bash
# Check config server status
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.status()"

# Check replica set members
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.conf()"

# Check logs
kubectl logs mongo-csrs-0
```

**2. Shard Replica Set Issues**
```bash
# Check shard replica set status
kubectl exec -it mongo-shard1-0 -- mongosh --eval "rs.status()"

# Check primary election
kubectl exec -it mongo-shard1-0 -- mongosh --eval "rs.isMaster()"

# Check member connectivity
kubectl exec -it mongo-shard1-0 -- nslookup mongo-shard1-1.mongo-shard1-headless
```

**3. Mongos Connection Issues**
```bash
# Check mongos logs
kubectl logs -l app=mongo-mongos

# Check configDB connection
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "db.adminCommand('listShards')"

# Check shard registration
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "sh.status()"
```

**4. Add-shards Job Failures**
```bash
# Check job status
kubectl get jobs -l app=mongo-add-shards

# Check job logs
kubectl logs job/mongo-add-shards

# Check job events
kubectl describe job mongo-add-shards
```

### Debug Commands

**Cluster Status Verification**:
```bash
# Overall cluster status
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "sh.status()"

# Config server status
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.status()"

# Shard status
kubectl exec -it mongo-shard1-0 -- mongosh --eval "rs.status()"
kubectl exec -it mongo-shard2-0 -- mongosh --eval "rs.status()"

# Database sharding status
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "db.adminCommand('listDatabases')"
```

**Network Connectivity Tests**:
```bash
# Test config server connectivity
kubectl exec -it mongo-shard1-0 -- nslookup mongo-csrs-0.mongo-csrs-headless

# Test shard connectivity
kubectl exec -it mongo-mongos-xxxx -- nslookup mongo-shard1-0.mongo-shard1-headless

# Test inter-shard connectivity
kubectl exec -it mongo-shard1-0 -- nslookup mongo-shard2-0.mongo-shard2-headless
```

This MongoDB setup provides a fully automated, production-ready sharded cluster with proper initialization sequences, health monitoring, and troubleshooting capabilities.
