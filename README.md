# CBDT Project - Full-Stack Cloud Infrastructure Project

A comprehensive cloud-native application demonstrating modern infrastructure patterns using OpenStack, Kubernetes (K3s), MongoDB sharding, and a Next.js social media application.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OpenStack     │    │   Kubernetes    │    │   Application   │
│   Infrastructure│    │   (K3s)         │    │   (Twutter)     │
│                 │    │                 │    │                 │
│ • Network       │───▶│ • Master Node   │───▶│ • Next.js App   │
│ • Security      │    │ • Worker Nodes  │    │ • MongoDB       │
│ • Instances     │    │ • CSI Plugin    │    │ • API Routes    │
│ • Floating IPs  │    │ • Helm Charts   │    │ • React UI      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- OpenStack cloud access with admin credentials
- SSH key pair (`~/cluster.key` and `~/cluster.key.pub`)
- Terraform installed
- kubectl installed
- Docker installed
- **GitLab access token** for Terraform state management

### 1. Infrastructure Deployment (Automated)
```bash
# Initialize Terraform (use gitlab terraform state)
terraform init

# Deploy entire infrastructure (OpenStack + K3s + MongoDB + CSI Plugin)
terraform apply

# The deployment automatically:
# - Creates OpenStack infrastructure
# - Bootstraps K3s cluster
# - Deploys CSI plugin for storage
# - Deploys MongoDB sharded cluster
# - Configures kubectl access
```

### 2. Deploy MongoDB Sharded Cluster (happens automatically)
```bash
cd kube/mongo-sharded-cluster

# Create required secrets first
kubectl create secret generic mongo-keyfile --from-file=mongodb-keyfile
kubectl create secret generic mongo-cluster-admin-password \
  --from-literal=username=admin \
  --from-literal=password=your-secure-password

# Deploy MongoDB cluster
helm install mongo-sharded-cluster . -n default
```

### 3. Deploy Twutter Application
```bash
cd twutter

# Set environment variables
export MONGODB_URI="mongodb://admin:your-secure-password@localhost:30007/twutter?authSource=admin"

# Install dependencies and run
npm install
npm run dev
```

## 📋 Detailed Architecture

### 1. OpenStack Infrastructure (`terraform/`)

#### Network Layer (`network.tf`)
- **Private Network**: `192.168.1.0/24` subnet for cluster communication
- **Router**: Connects private network to external network for internet access
- **Security Group**: Permits all TCP/UDP/ICMP traffic (development setup)

#### Compute Layer (`instances.tf`)
- **Key Pair**: SSH authentication using `~/cluster.key.pub`
- **Instances**: Configurable number of Rocky Linux 9.4 VMs
- **Floating IPs**: Public IPs for external access
- **Resource Sizing**: 
  - Test: `m1.large` (2 vCPU, 4GB RAM)
  - Production: `m1.xlarge` (4 vCPU, 8GB RAM)

#### K3s Provisioning (`provisioner-k3s.tf`)
- **Master Node**: First instance becomes K3s master with cluster-init
- **Worker Nodes**: Remaining instances join the cluster
- **Kubeconfig**: Automatically configures local kubectl access

#### Automated MongoDB Deployment (`provisioner-mongodb.tf`)
- **CSI Plugin**: Automatically deploys OpenStack Cinder CSI plugin
- **Helm Chart**: Deploys MongoDB sharded cluster using production values
- **Dependencies**: Ensures proper deployment order

### 2. Kubernetes Cluster (K3s)

#### Cluster Setup (`setup_k3s/`)
- **Bootstrap Script**: Installs K3s v1.32.3 on master node
- **Node Join**: Worker nodes join using cluster token
- **TLS Configuration**: Proper SAN configuration for floating IPs

#### CSI Plugin Integration (`kube/manifests/cinder-csi-plugin/`)
- **Controller Plugin**: Manages volume provisioning and attachment
- **Node Plugin**: Runs on each node for volume operations
- **Cloud Config**: OpenStack authentication via Kubernetes secret
- **Storage Classes**: Enables dynamic volume provisioning

### 3. MongoDB Sharded Cluster (`kube/mongo-sharded-cluster/`)

#### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Config Server │    │   Shard 1       │    │   Shard 2       │
│   Replica Set   │    │   Replica Set   │    │   Replica Set   │
│   (3 nodes)     │    │   (3 nodes)     │    │   (3 nodes)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Mongos        │
                    │   (2 instances) │
                    └─────────────────┘
```

#### Components

**Config Server (`configserver/`)**
- 3-node replica set for cluster metadata
- Persistent storage via OpenStack Cinder volumes (30Gi production)
- Headless service for internal communication

**Shards (`shards/`)**
- 2 shards, each with 3-node replica sets
- Automatic shard key distribution
- Horizontal scaling capability
- Persistent storage via OpenStack Cinder volumes (50Gi production)

**Mongos (`mongos/`)**
- 2 instances for high availability
- NodePort service (port 30007) for external access
- Routes queries to appropriate shards

**Auto-Sharding (`scripts/auto-shard.sh`)**
```bash
# Enables sharding for twutter database
sh.enableSharding("twutter");

# Shards collections with hashed _id
sh.shardCollection("twutter.users", { "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });
sh.shardCollection("twutter.comments", { "post_id": 1 });
```

#### Deployment Process
1. **Config Server**: Deploys first, waits for replica set initialization
2. **Shards**: Deploy in parallel, each initializes its replica set
3. **Mongos**: Waits for config server, then starts routing
4. **Add Shards Job**: Automatically adds shards to cluster
5. **Auto-Shard Script**: Configures database and collection sharding

#### Production Configuration (`values.prod.yaml`)
- **Storage**: 30Gi for config servers, 50Gi for shards
- **Resources**: 500m CPU, 1Gi memory per instance
- **Storage Class**: Uses `mongo-volume-xfs` for OpenStack Cinder volumes

### 4. Twutter Application (`twutter/`)

#### Tech Stack
- **Frontend**: Next.js 15.3.2 with React 19
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **UI**: Tailwind CSS v4
- **State Management**: TanStack React Query
- **Validation**: Zod schema validation

#### Database Schema
```typescript
// Users collection
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  createdAt: Date;
}

// Posts collection (sharded by _id)
interface Post {
  _id: ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
}

// Comments collection (sharded by post_id)
interface Comment {
  _id: ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  post_id: ObjectId;
}
```

#### API Routes
- `GET /api/posts` - Fetch posts with pagination and filtering
- `POST /api/posts` - Create new posts
- `GET /api/users` - Fetch users
- `POST /api/users` - Create new users

#### Database Connection (`src/lib/mongodb.ts`)
- Connection pooling with global caching
- Automatic reconnection handling
- Environment-based configuration

## 🔧 Configuration

### Environment Variables
```bash
# MongoDB connection string
MONGODB_URI="mongodb://admin:password@localhost:30007/twutter?authSource=admin"

# OpenStack configuration (in cloud.conf)
username = admin
password = nomoresecret
domain-name = default
auth-url = http://134.103.195.5:5000
tenant-id = <project_id>
region = ""
```

### Terraform Variables (`terraform.tfvars`)
```hcl
cloud_name             = "openstack"
node_count             = 3
production             = false
image_name             = "Rocky Linux 9.4"
test_flavor_name       = "m1.large"
production_flavor_name = "m1.xlarge"
```

## 🚀 Deployment Workflow

### 1. Complete Automated Deployment
```bash
# Initialize with GitLab backend
terraform init

# Deploy everything in one command
terraform apply

# This automatically:
# - Creates OpenStack infrastructure
# - Bootstraps K3s cluster
# - Deploys CSI plugin
# - Deploys MongoDB sharded cluster
# - Configures kubectl access
```

### 2. Verify Deployment
```bash
# Check cluster nodes
kubectl get nodes -o wide

# Check MongoDB pods
kubectl get pods -l app.kubernetes.io/name=mongodb

# Check CSI plugin
kubectl get pods -n kube-system | grep csi

# Test MongoDB connection
kubectl port-forward svc/mongo-mongos 30007:27017
```

### 3. Application Deployment
```bash
# Set environment
export MONGODB_URI="mongodb://admin:secure-password@localhost:30007/twutter?authSource=admin"

# Run application
cd twutter && npm run dev
```

## 🔍 Monitoring and Debugging

### Cluster Health
```bash
# Check node status
kubectl get nodes

# Check pod status
kubectl get pods --all-namespaces

# Check MongoDB cluster status
kubectl exec -it deployment/mongo-mongos -- mongosh --eval "sh.status()"
```

### Database Operations
```bash
# Connect to MongoDB
kubectl port-forward svc/mongo-mongos 30007:27017

# Check sharding status
mongosh --port 30007 --eval "sh.status()"

# Check collection distribution
mongosh --port 30007 --eval "db.posts.getShardDistribution()"
```

### Application Logs
```bash
# Check application logs
kubectl logs -f deployment/twutter-app

# Check MongoDB logs
kubectl logs -f statefulset/mongo-shard1-0
```

## 🛠️ Development

### Local Development
```bash
# Start local MongoDB (for development)
docker run -d -p 27017:27017 --name mongodb mongo:8.0.9

# Set local MongoDB URI
export MONGODB_URI="mongodb://localhost:27017/twutter"

# Run application
cd twutter && npm run dev
```

### Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/posts
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World","author":"testuser"}'
```

## 🔒 Security Considerations

### Production Hardening
- **Network Security**: Restrict security group rules to specific ports
- **Authentication**: Use strong passwords and key-based authentication
- **TLS**: Enable TLS for MongoDB connections
- **RBAC**: Configure proper Kubernetes RBAC
- **Secrets**: Use Kubernetes secrets for sensitive data
- **Monitoring**: Implement proper logging and monitoring

### Current Security (Development)
- Open security group (allows all traffic)
- Basic authentication
- No TLS encryption
- Default Kubernetes RBAC

## 📊 Performance and Scaling

### Horizontal Scaling
- **MongoDB Shards**: Add more shards for increased write capacity
- **Mongos Instances**: Scale mongos for increased query capacity
- **Kubernetes Nodes**: Add more worker nodes
- **Application**: Scale Next.js instances

### Vertical Scaling
- **Instance Sizes**: Upgrade from `m1.large` to `m1.xlarge`
- **Storage**: Increase volume sizes in values.yaml
- **Resources**: Adjust CPU/memory limits

### Optimization
- **Connection Pooling**: Mongoose connection caching
- **Indexing**: Proper database indexes for queries
- **Caching**: React Query for client-side caching
- **CDN**: Static asset delivery optimization

## 🗑️ Cleanup

### Destroy Infrastructure
```bash
# Remove MongoDB cluster
helm uninstall mongo-sharded-cluster

# Remove CSI plugin
kubectl delete -f kube/manifests/cinder-csi-plugin/

# Destroy Terraform infrastructure
terraform destroy
```

## 📚 Additional Resources

- [K3s Documentation](https://docs.k3s.io/)
- [MongoDB Sharding Guide](https://docs.mongodb.com/manual/sharding/)
- [OpenStack CSI Plugin](https://github.com/kubernetes/cloud-provider-openstack)
- [Next.js Documentation](https://nextjs.org/docs)
- [Terraform OpenStack Provider](https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs)
- [GitLab Terraform State](https://docs.gitlab.com/ee/user/infrastructure/terraform_state.html)
