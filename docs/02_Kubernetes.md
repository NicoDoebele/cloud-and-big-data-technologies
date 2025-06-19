# Kubernetes Infrastructure Documentation

## Overview

This Kubernetes setup deploys a complete MongoDB sharded cluster on K3s using Helm charts and custom manifests. The infrastructure includes Cinder CSI plugin for OpenStack storage integration, MongoDB config servers, shards, and mongos routers.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KUBERNETES CLUSTER (K3s)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   MASTER NODE   │    │  WORKER NODE 1  │    │  WORKER NODE 2  │         │
│  │                 │    │                 │    │                 │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │   K3s API   │ │    │ │   K3s Agent │ │    │ │   K3s Agent │ │         │
│  │ │   Server    │ │    │ │             │ │    │ │             │ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           STORAGE LAYER                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CINDER CSI PLUGIN                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │   Controller    │  │   Node Plugin   │  │   Node Plugin   │     │   │
│  │  │   (Master)      │  │   (Worker 1)    │  │   (Worker 2)    │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    OPENSTACK CINDER                                 │   │
│  │                    (Block Storage)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                        MONGODB SHARDED CLUSTER                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CONFIG SERVERS (3 replicas)                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Config    │  │   Config    │  │   Config    │                 │   │
│  │  │   Server 0  │  │   Server 1  │  │   Server 2  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SHARDS (2 clusters, 3 replicas each)             │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Shard 1    │  │  Shard 1    │  │  Shard 1    │                 │   │
│  │  │  Primary    │  │  Secondary  │  │  Secondary  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Shard 2    │  │  Shard 2    │  │  Shard 2    │                 │   │
│  │  │  Primary    │  │  Secondary  │  │  Secondary  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MONGOS ROUTERS (2 instances)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐                                  │   │
│  │  │   Mongos    │  │   Mongos    │                                  │   │
│  │  │   Router 1  │  │   Router 2  │                                  │   │
│  │  └─────────────┘  └─────────────┘                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL ACCESS                                  │   │
│  │                    NodePort: 30007                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
kube/
├── Makefile                    # Helm deployment automation
├── HELP.md                     # Quick deployment guide
├── HELM_HELPERS.md             # Detailed Helm commands and MongoDB operations
├── manifests/                  # Kubernetes manifests
│   ├── cinder-csi-plugin/      # OpenStack storage integration
│   │   ├── GUIDE.md           # CSI plugin setup guide
│   │   ├── csi-secret-cinderplugin.yaml
│   │   ├── cinder-csi-controllerplugin.yaml
│   │   ├── cinder-csi-controllerplugin-rbac.yaml
│   │   ├── cinder-csi-nodeplugin.yaml
│   │   ├── cinder-csi-nodeplugin-rbac.yaml
│   │   └── csi-cinder-driver.yaml
│   └── SOURCES.md
└── mongo-sharded-cluster/      # Custom Helm chart
    ├── Chart.yaml             # Chart metadata
    ├── values.yaml            # Default configuration
    ├── scripts/
    │   └── auto-shard.sh      # Automatic sharding setup
    └── templates/             # Kubernetes resource templates
        ├── _helpers.tpl       # Helm template helpers
        ├── storage.yaml       # Storage class definition
        ├── add-shards-rbac.yaml
        ├── configmaps/
        │   └── scripts.yaml   # MongoDB initialization scripts
        ├── configserver/      # Config server resources
        │   ├── headless-svc.yaml
        │   └── statefulset.yaml
        ├── secrets/           # MongoDB authentication
        │   ├── mongodb-admin.yaml
        │   └── mongodb-keyfile.yaml
        ├── shards/            # Shard resources
        │   └── shard.yaml
        ├── mongos/            # Mongos router resources
        │   ├── deployment.yaml
        │   └── service.yaml
        └── jobs/              # Initialization jobs
            └── add-shards-job.yaml
```

## Deployment Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TERRAFORM     │    │   K3s CLUSTER   │    │   KUBERNETES    │
│   INFRASTRUCTURE│    │   SETUP         │    │   DEPLOYMENT    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Network       │    │ • Master node   │    │ • Cinder CSI    │
│ • Security      │    │   bootstrap     │    │   plugin        │
│ • Instances     │    │ • Worker nodes  │    │ • MongoDB       │
│ • Floating IPs  │    │   join cluster  │    │   sharded       │
│                 │    │ • Local kubeconfig│  │   cluster       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Components

### 1. Cinder CSI Plugin (`manifests/cinder-csi-plugin/`)

**Purpose**: Enables Kubernetes to provision and manage OpenStack Cinder block storage volumes.

**Components**:
- **Controller Plugin**: Runs on master node, handles volume provisioning
- **Node Plugin**: Runs on each worker node, handles volume mounting
- **RBAC**: Service accounts and permissions for CSI operations
- **Secret**: OpenStack authentication credentials

**Deployment**:
```bash
# Create OpenStack credentials secret
kubectl create -f manifests/cinder-csi-plugin/csi-secret-cinderplugin.yaml

# Deploy CSI plugin
kubectl -f manifests/cinder-csi-plugin/ apply
```

### 2. MongoDB Sharded Cluster (`mongo-sharded-cluster/`)

**Architecture**:
- **Config Servers**: 3-replica set storing cluster metadata
- **Shards**: 2 clusters, each with 3 replicas (primary + secondaries)
- **Mongos Routers**: 2 instances for query routing
- **Storage**: Persistent volumes via Cinder CSI

**Key Features**:
- **StatefulSets**: Ensures stable network identities and storage
- **Headless Services**: Internal cluster communication
- **NodePort Service**: External access on port 30007
- **Auto-sharding**: Automatic collection sharding via init scripts

### 3. Automation Scripts

**Makefile Commands**:
```bash
make install      # Deploy MongoDB cluster
make upgrade      # Update existing deployment
make uninstall    # Remove MongoDB cluster
make clean        # Remove cluster and all PVCs
make template     # Generate YAML without deployment
make cinder       # Deploy Cinder CSI plugin
make mongos       # Connect to mongos shell
```

**Auto-sharding Script** (`scripts/auto-shard.sh`):
- Enables sharding for `twutter` database
- Creates hashed indexes on `_id` fields
- Shards collections: `users`, `posts`, `comments`
- Creates application user with read/write permissions

## Dependencies and Prerequisites

### Infrastructure Dependencies
1. **OpenStack Cloud**: Configured in `~/.config/openstack/clouds.yaml`
2. **SSH Key Pair**: Located at `~/cluster.key` and `~/cluster.key.pub`
3. **Terraform**: For infrastructure provisioning
4. **K3s Cluster**: Running with proper networking

### Kubernetes Dependencies
1. **Cinder CSI Plugin**: Must be deployed before MongoDB
2. **Storage Class**: `mongo-volume-xfs` for persistent volumes
3. **RBAC**: Service accounts and permissions for MongoDB operations
4. **Secrets**: MongoDB authentication and replication keyfile

### Application Dependencies
1. **MongoDB 8.0.9**: Container image for all components
2. **Init Scripts**: MongoDB cluster initialization and sharding setup
3. **Network Policies**: Internal communication between components

## Deployment Process

### Phase 1: Infrastructure Setup
```bash
# Deploy OpenStack infrastructure
terraform apply

# Verify K3s cluster
kubectl get nodes
```

### Phase 2: Storage Integration
```bash
# Deploy Cinder CSI plugin
make cinder

# Verify CSI plugin
kubectl get pods -n kube-system | grep cinder
kubectl get csidrivers.storage.k8s.io
```

### Phase 3: MongoDB Deployment
```bash
# Deploy MongoDB sharded cluster
make install

# Monitor deployment
kubectl get pods -w
kubectl get pvc
```

### Phase 4: Verification
```bash
# Check cluster status
make deployment-status

# Connect to mongos
make mongos

# Verify sharding
sh.status()
```

## Configuration Management

### Values File (`values.yaml`)
- **Replica Counts**: Config servers (3), shards (2), mongos (2)
- **Storage**: Volume sizes and storage class
- **Resources**: CPU/memory limits and requests
- **Networking**: Service types and ports
- **Authentication**: Admin credentials and keyfile

### Environment-Specific Configs
- **Test Mode**: Smaller resource allocations
- **Production Mode**: Larger instances and storage
- **Custom Values**: Override via `-f` flag with Helm

## Monitoring and Operations

### Health Checks
```bash
# Pod status
kubectl get pods -l app=mongo

# Service endpoints
kubectl get endpoints

# Persistent volumes
kubectl get pvc,pv
```

### Logs and Debugging
```bash
# Pod logs
kubectl logs mongo-csrs-0
kubectl logs mongo-shard1-0
kubectl logs -l app=mongo-mongos

# Exec into containers
kubectl exec -it mongo-csrs-0 -- mongosh
kubectl exec -it mongo-shard1-0 -- mongosh
```

### Scaling and Maintenance
```bash
# Scale mongos routers
kubectl scale deployment mongo-mongos --replicas=3

# Update configuration
helm upgrade mongo ./mongo-sharded-cluster -f values.yaml
```

## Security Considerations

### Network Security
- **Internal Communication**: Headless services for cluster communication
- **External Access**: NodePort service with controlled access
- **Pod-to-Pod**: Network policies for component isolation

### Authentication
- **MongoDB Admin**: Centralized admin user for cluster management
- **Application Users**: Database-specific users with limited permissions
- **Replication**: Keyfile-based authentication for replica sets

### Storage Security
- **Volume Encryption**: OpenStack Cinder encryption at rest
- **Access Control**: RBAC for CSI plugin operations
- **Secret Management**: Kubernetes secrets for sensitive data

## Troubleshooting

### Common Issues
1. **CSI Plugin Failures**: Check OpenStack credentials and network connectivity
2. **MongoDB Init Failures**: Verify replica set configuration and networking
3. **Storage Issues**: Check PVC status and Cinder volume provisioning
4. **Sharding Problems**: Verify config server connectivity and shard registration

### Debug Commands
```bash
# CSI plugin status
kubectl describe csidriver cinder.csi.openstack.org
kubectl get events --sort-by='.lastTimestamp'

# MongoDB cluster status
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.status()"
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "sh.status()"

# Network connectivity
kubectl exec -it mongo-csrs-0 -- nslookup mongo-csrs-1.mongo-csrs-headless
```

This Kubernetes setup provides a production-ready MongoDB sharded cluster with automated deployment, monitoring, and maintenance capabilities, fully integrated with OpenStack infrastructure.
