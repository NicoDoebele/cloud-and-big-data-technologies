# Kubernetes Infrastructure Documentation

## Overview

This Kubernetes setup deploys a complete MongoDB sharded cluster on K3s using Helm charts and custom manifests, along with the Twutter social media application. The infrastructure includes Cinder CSI plugin for OpenStack storage integration, MongoDB config servers, shards, mongos routers, and the Twutter application deployment.

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
│  │                    TWUTTER APPLICATION                              │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Twutter   │  │   Twutter   │  │   Twutter   │                 │   │
│  │  │   Pod 1     │  │   Pod 2     │  │   Pod 3     │                 │   │
│  │  │   (Port 3000)│  │   (Port 3000)│  │   (Port 3000)│                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │                                    │                               │   │
│  │  ┌─────────────────────────────────┴─────────────────────────────┐ │   │
│  │  │                    TWUTTER SERVICE                            │ │   │
│  │  │                    NodePort: 30006                            │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL ACCESS                                  │   │
│  │                    MongoDB: NodePort 30007                          │   │
│  │                    Twutter: NodePort 30006                          │   │
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
├── mongo-sharded-cluster/      # Custom Helm chart
│   ├── Chart.yaml             # Chart metadata
│   ├── values.yaml            # Default configuration
│   ├── scripts/
│   │   └── auto-shard.sh      # Automatic sharding setup
│   └── templates/             # Kubernetes resource templates
│       ├── _helpers.tpl       # Helm template helpers
│       ├── storage.yaml       # Storage class definition
│       ├── add-shards-rbac.yaml
│       ├── configmaps/
│       │   └── scripts.yaml   # MongoDB initialization scripts
│       ├── configserver/      # Config server resources
│       │   ├── headless-svc.yaml
│       │   └── statefulset.yaml
│       ├── secrets/           # MongoDB authentication
│       │   ├── mongodb-admin.yaml
│       │   └── mongodb-keyfile.yaml
│       ├── shards/            # Shard resources
│       │   └── shard.yaml
│       ├── mongos/            # Mongos router resources
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── jobs/              # Initialization jobs
│           └── add-shards-job.yaml
└── twutter/                   # Twutter application deployment
    ├── README.md              # Twutter deployment guide
    ├── kustomization.yaml     # Kustomize configuration
    ├── deployment.yaml        # Twutter application deployment
    ├── service.yaml           # Twutter service configuration
    └── secret.yaml            # MongoDB credentials for Twutter
```

## Deployment Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TERRAFORM     │    │   K3s CLUSTER   │    │   KUBERNETES    │    │   TWUTTER       │
│   INFRASTRUCTURE│    │   SETUP         │    │   DEPLOYMENT    │    │   APPLICATION   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │                      │
          ▼                      ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Network       │    │ • Master node   │    │ • Cinder CSI    │    │ • Twutter       │
│ • Security      │    │   bootstrap     │    │   plugin        │    │   deployment    │
│ • Instances     │    │ • Worker nodes  │    │ • MongoDB       │    │ • Service       │
│ • Floating IPs  │    │   join cluster  │    │   sharded       │    │ • Configuration │
│                 │    │ • Local kubeconfig│  │   cluster       │    │ • Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    │   connection    │
                                                                     └─────────────────┘
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

### 3. Twutter Application (`twutter/`)

**Architecture**:
- **Deployment**: 3 replicas for high availability
- **Service**: NodePort service exposing port 30006
- **Secrets**: MongoDB credentials for database connection
- **ConfigMap**: MongoDB connection configuration

**Key Features**:
- **Stateless Deployment**: Horizontal scaling capability
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: CPU and memory constraints
- **Environment Variables**: Database connection configuration

**Components**:
```yaml
# kube/twutter/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: twutter-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: twutter-app
  template:
    spec:
      containers:
      - name: twutter-app
        image: gitlab.reutlingen-university.de:5050/doebele/cbdt-projekt-3:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: username
        - name: MONGODB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        - name: MONGODB_HOST
          valueFrom:
            configMapKeyRef:
              name: mongodb-config
              key: host
        - name: MONGODB_PORT
          valueFrom:
            configMapKeyRef:
              name: mongodb-config
              key: port
        - name: MONGODB_DATABASE
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: database
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Service Configuration**:
```yaml
# kube/twutter/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: twutter-service
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 3000
    nodePort: 30006
    protocol: TCP
    name: http
  selector:
    app: twutter-app
```

**Secrets Management**:
```yaml
# kube/twutter/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
type: Opaque
data:
  username: dHd1dHRlcg==  # twutter
  password: eA==  # x
  database: dHd1dHRlcg==  # twutter
```

### 4. Automation Scripts

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

**Kustomize Configuration**:
```yaml
# kube/twutter/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

metadata:
  name: twutter-app

resources:
- deployment.yaml
- service.yaml
- secret.yaml

labels:
- pairs:
    app: twutter-app
```

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
4. **Twutter Image**: Container image from GitLab registry

### Twutter Application Dependencies
1. **MongoDB Cluster**: Running and accessible via mongos router
2. **Database Credentials**: Username, password, and database name
3. **Network Connectivity**: Access to MongoDB service on port 30007
4. **ConfigMap**: MongoDB connection configuration

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

### Phase 4: MongoDB Configuration
```bash
# Create MongoDB configmap for Twutter
kubectl create configmap mongodb-config \
  --from-literal=host=127.0.0.1 \
  --from-literal=port=27017

# Verify MongoDB cluster status
make deployment-status

# Connect to mongos
make mongos

# Verify sharding
sh.status()
```

### Phase 5: Twutter Application Deployment
```bash
# Udr kustomize
kubectl apply -k kube/twutter/

# Monitor Twutter deployment
kubectl get pods -l app=twutter-app
kubectl get service twutter-service
```

### Phase 6: Verification
```bash
# Check all components
kubectl get pods
kubectl get services
kubectl get secrets

# Test Twutter application
curl http://<node-ip>:30006

# Check MongoDB connectivity from Twutter
kubectl logs -l app=twutter-app
```

## Configuration Management

### MongoDB Values File (`mongo-sharded-cluster/values.yaml`)
- **Replica Counts**: Config servers (3), shards (2), mongos (2)
- **Storage**: Volume sizes and storage class
- **Resources**: CPU/memory limits and requests
- **Networking**: Service types and ports
- **Authentication**: Admin credentials and keyfile

### Twutter Configuration
- **Replicas**: 3 for high availability
- **Resources**: 128Mi-512Mi memory, 100m-500m CPU
- **Ports**: Container 3000 → Service 80 → NodePort 30006
- **Health Checks**: Liveness and readiness probes on `/`
- **Environment Variables**: MongoDB connection details

### Environment-Specific Configs
- **Test Mode**: Smaller resource allocations
- **Production Mode**: Larger instances and storage
- **Custom Values**: Override via `-f` flag with Helm

## Monitoring and Operations

### Health Checks
```bash
# Pod status
kubectl get pods -l app=mongo
kubectl get pods -l app=twutter-app

# Service endpoints
kubectl get endpoints

# Persistent volumes
kubectl get pvc,pv
```

### Logs and Debugging
```bash
# MongoDB logs
kubectl logs mongo-csrs-0
kubectl logs mongo-shard1-0
kubectl logs -l app=mongo-mongos

# Twutter logs
kubectl logs -l app=twutter-app
kubectl logs twutter-app-xxxx

# Exec into containers
kubectl exec -it mongo-csrs-0 -- mongosh
kubectl exec -it mongo-shard1-0 -- mongosh
kubectl exec -it twutter-app-xxxx -- sh
```

### Scaling and Maintenance
```bash
# Scale mongos routers
kubectl scale deployment mongo-mongos --replicas=3

# Scale Twutter application
kubectl scale deployment twutter-app --replicas=5

# Update MongoDB configuration
helm upgrade mongo ./mongo-sharded-cluster -f values.yaml

# Update Twutter deployment
kubectl rollout restart deployment twutter-app
```

### Application Monitoring
```bash
# Check Twutter service
kubectl describe service twutter-service

# Test application health
kubectl exec -it twutter-app-xxxx -- curl http://localhost:3000/

# Monitor resource usage
kubectl top pods -l app=twutter-app
kubectl top pods -l app=mongo
```

## Security Considerations

### Network Security
- **Internal Communication**: Headless services for cluster communication
- **External Access**: NodePort services with controlled access
- **Pod-to-Pod**: Network policies for component isolation
- **Application Security**: Twutter runs with non-root user

### Authentication
- **MongoDB Admin**: Centralized admin user for cluster management
- **Application Users**: Database-specific users with limited permissions
- **Replication**: Keyfile-based authentication for replica sets
- **Twutter Credentials**: Kubernetes secrets for database access

### Storage Security
- **Volume Encryption**: OpenStack Cinder encryption at rest
- **Access Control**: RBAC for CSI plugin operations
- **Secret Management**: Kubernetes secrets for sensitive data
- **ConfigMap**: Non-sensitive configuration data

## Troubleshooting

### Common Issues
1. **CSI Plugin Failures**: Check OpenStack credentials and network connectivity
2. **MongoDB Init Failures**: Verify replica set configuration and networking
3. **Storage Issues**: Check PVC status and Cinder volume provisioning
4. **Sharding Problems**: Verify config server connectivity and shard registration
5. **Twutter Connection Issues**: Check MongoDB credentials and network connectivity
6. **Application Failures**: Verify environment variables and resource limits

### Debug Commands
```bash
# CSI plugin status
kubectl describe csidriver cinder.csi.openstack.org
kubectl get events --sort-by='.lastTimestamp'

# MongoDB cluster status
kubectl exec -it mongo-csrs-0 -- mongosh --eval "rs.status()"
kubectl exec -it mongo-mongos-xxxx -- mongosh --eval "sh.status()"

# Twutter application status
kubectl describe pod twutter-app-xxxx
kubectl get events --field-selector involvedObject.name=twutter-app-xxxx

# Network connectivity
kubectl exec -it mongo-csrs-0 -- nslookup mongo-csrs-1.mongo-csrs-headless
kubectl exec -it twutter-app-xxxx -- nslookup mongo-mongos-service

# Database connectivity from Twutter
kubectl exec -it twutter-app-xxxx -- env | grep MONGODB
kubectl exec -it twutter-app-xxxx -- curl http://mongo-mongos-service:27017
```

### Application-Specific Troubleshooting
```bash
# Check Twutter environment variables
kubectl exec -it twutter-app-xxxx -- env | grep MONGODB

# Verify MongoDB connection from Twutter
kubectl exec -it twutter-app-xxxx -- mongosh --host $MONGODB_HOST --port $MONGODB_PORT --username $MONGODB_USERNAME --password $MONGODB_PASSWORD --authenticationDatabase $MONGODB_DATABASE

# Check application logs for database errors
kubectl logs -l app=twutter-app | grep -i "mongodb\|database\|connection"

# Test application endpoints
kubectl port-forward service/twutter-service 8080:80
curl http://localhost:8080/api/users
curl http://localhost:8080/api/posts
```

## Access and Usage

### External Access
```bash
# MongoDB access (via mongos)
kubectl get nodes -o wide
mongosh --host <node-ip> --port 30007 --username mongoadmin --password securepassword

# Twutter application access
curl http://<node-ip>:30006
curl http://<node-ip>:30006/api/users
curl http://<node-ip>:30006/api/posts
```

### Load Testing
```bash
# Access Twutter load testing interface
curl http://<node-ip>:30006/load-test

# Generate test data
curl -X POST http://<node-ip>:30006/api/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"content":"Test post 1","author":"user1"},{"content":"Test post 2","author":"user2"}]}'
```

This Kubernetes setup provides a production-ready MongoDB sharded cluster with the Twutter social media application, featuring automated deployment, monitoring, and maintenance capabilities, fully integrated with OpenStack infrastructure and comprehensive load testing capabilities.
