# CBDT Project - Full-Stack Cloud Infrastructure Project

A comprehensive cloud-native application demonstrating modern infrastructure patterns using OpenStack, Kubernetes (K3s), MongoDB sharding, and a Next.js social media application with automated CI/CD deployment.

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
│                 │    │ • Twutter       │    │ • Load Testing  │
│                 │    │   Deployment    │    │ • Search        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────┐
                    │   GitLab CI/CD  │
                    │                 │
                    │ • Auto Build    │
                    │ • Container Reg │
                    │ • Auto Deploy   │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- OpenStack cloud access with admin credentials
- SSH key pair (`~/cluster.key` and `~/cluster.key.pub`)
- Terraform installed
- kubectl installed
- Docker installed
- **GitLab access token** for Terraform state management

### 1. Infrastructure Deployment (Fully Automated)
```bash
# Initialize Terraform (use gitlab terraform state)
terraform init

# Deploy entire infrastructure (OpenStack + K3s + MongoDB + Twutter)
terraform apply

# The deployment automatically:
# - Creates OpenStack infrastructure
# - Bootstraps K3s cluster
# - Deploys CSI plugin for storage
# - Deploys MongoDB sharded cluster
# - Deploys Twutter application from GitLab
# - Configures kubectl access
```

### 2. Access Your Applications
```bash
# Get node IPs
kubectl get nodes -o wide

# Access Twutter application
curl http://<node-ip>:30006

# Access MongoDB (via mongos)
mongosh --host <node-ip> --port 30007 --username mongoadmin --password securepassword
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
  - Test: `m1.large` (4 vCPU, 8GB RAM)
  - Production: `m1.xlarge` (8 vCPU, 16GB RAM)

#### K3s Provisioning (`provisioner-k3s.tf`)
- **Master Node**: First instance becomes K3s master with cluster-init
- **Worker Nodes**: Remaining instances join the cluster
- **Kubeconfig**: Automatically configures local kubectl access

#### Automated MongoDB Deployment (`provisioner-mongodb.tf`)
- **CSI Plugin**: Automatically deploys OpenStack Cinder CSI plugin
- **Helm Chart**: Deploys MongoDB sharded cluster using production values
- **Dependencies**: Ensures proper deployment order

#### Automated Twutter Deployment (`provisioner-twutter.tf`)
- **GitLab Integration**: Automatically deploys from GitLab Container Registry
- **Latest Image**: Uses `gitlab.reutlingen-university.de:5050/doebele/cbdt-projekt-3:latest`
- **CI/CD Pipeline**: Integrated with GitLab automated deployment workflow
- **Database Integration**: Pre-configured with MongoDB sharded cluster

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
- **Containerization**: Docker with multi-stage builds
- **Deployment**: Kubernetes with Kustomize

#### Application Features
- **Social Media Platform**: Twitter-like interface with posts, comments, and users
- **Real-time Search**: Search across posts and users with instant results
- **Load Testing Interface**: Built-in performance testing at `/load-test`
- **Responsive Design**: Mobile and desktop optimized
- **Dark Mode**: Modern UI with dark/light theme support
- **User Management**: Create and manage user profiles
- **Post Interactions**: Create posts with character limits and engagement

#### Database Schema
```typescript
// Users collection (sharded by _id)
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  createdAt: Date;
  followers: string[];
  following: string[];
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
- `POST /api/posts/bulk` - Create multiple posts efficiently
- `GET /api/users` - Fetch users with search
- `POST /api/users` - Create new users
- `GET /api/search` - Search posts and users
- `POST /api/posts/comments` - Create comments on posts

#### Load Testing Capabilities
- **Built-in Interface**: Access at `/load-test`
- **Post Generation**: Create 1-3000 posts simultaneously
- **Bulk API Testing**: Test bulk vs individual API performance
- **Database Performance**: Measure query performance across shards
- **Real-time Metrics**: Success rates, timing, and throughput analysis

#### Database Connection (`src/lib/mongodb.ts`)
- Connection pooling with global caching
- Automatic reconnection handling
- Environment-based configuration
- Flexible connection string building

#### Kubernetes Deployment (`kube/twutter/`)
- **Deployment**: 3 replicas for high availability
- **Service**: NodePort service on port 30006
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: CPU and memory constraints
- **Secrets**: MongoDB credentials management
- **ConfigMap**: Database connection configuration

### 5. GitLab CI/CD Integration

#### Automated Deployment Pipeline
- **Container Registry**: Images stored in GitLab Container Registry
- **Auto Build**: Automatic builds on code changes
- **Latest Image**: Always deploys latest `:latest` tag
- **Zero Downtime**: Rolling updates with health checks
- **State Management**: Terraform state managed in GitLab

#### Deployment Workflow
1. **Code Push**: Triggers GitLab CI/CD pipeline
2. **Build**: Creates Docker image with Next.js application
3. **Registry**: Pushes to GitLab Container Registry
4. **Deploy**: Kubernetes automatically pulls latest image
5. **Health Check**: Verifies application is running correctly

## 🔧 Configuration

### Environment Variables
```bash
# MongoDB connection string
MONGODB_URI="mongodb://admin:password@localhost:30007/twutter?authSource=admin"

# Alternative: Individual parameters
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_USERNAME=twutter
MONGODB_PASSWORD=x
MONGODB_DATABASE=twutter

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

### Kubernetes Configuration
```yaml
# Twutter deployment resources
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Health checks
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
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
# - Deploys Twutter application from GitLab
# - Configures kubectl access
```

### 2. Verify Deployment
```bash
# Check cluster nodes
kubectl get nodes -o wide

# Check MongoDB pods
kubectl get pods -l app.kubernetes.io/name=mongodb

# Check Twutter application
kubectl get pods -l app=twutter-app
kubectl get svc twutter-service

# Check CSI plugin
kubectl get pods -n kube-system | grep csi

# Test MongoDB connection
kubectl port-forward svc/mongo-mongos 30007:27017
```

### 3. Application Access
```bash
# Get node IPs
kubectl get nodes -o wide

# Access Twutter application
curl http://<node-ip>:30006

# Access load testing interface
curl http://<node-ip>:30006/load-test

# Test API endpoints
curl http://<node-ip>:30006/api/users
curl http://<node-ip>:30006/api/posts
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

# Check Twutter application
kubectl get pods -l app=twutter-app
kubectl logs -l app=twutter-app
```

### Database Operations
```bash
# Connect to MongoDB
kubectl port-forward svc/mongo-mongos 30007:27017

# Check sharding status
mongosh --port 30007 --eval "sh.status()"

# Check collection distribution
mongosh --port 30007 --eval "db.posts.getShardDistribution()"

# Check Twutter database
mongosh --port 30007 --eval "use twutter; db.users.find().limit(5)"
```

### Application Monitoring
```bash
# Check Twutter service
kubectl describe service twutter-service

# Monitor resource usage
kubectl top pods -l app=twutter-app

# Check application logs
kubectl logs -f deployment/twutter-app

# Test application health
kubectl exec -it twutter-app-xxxx -- curl http://localhost:3000/
```

### Load Testing
```bash
# Access load testing interface
curl http://<node-ip>:30006/load-test

# Generate test data via API
curl -X POST http://<node-ip>:30006/api/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"content":"Test post 1","author":"user1"},{"content":"Test post 2","author":"user2"}]}'

# Monitor performance metrics
kubectl logs -l app=twutter-app | grep -i "performance\|load"
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

# Test search functionality
curl "http://localhost:3000/api/search?q=hello&type=all"

# Test bulk operations
curl -X POST http://localhost:3000/api/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"content":"Bulk post 1","author":"user1"},{"content":"Bulk post 2","author":"user2"}]}'
```

### Docker Development
```bash
# Build Docker image
cd twutter && docker build -t twutter:dev .

# Run with Docker
docker run -p 3000:3000 -e MONGODB_URI="mongodb://host.docker.internal:27017/twutter" twutter:dev
```

## 🔒 Security Considerations

### Production Hardening
- **Network Security**: Restrict security group rules to specific ports
- **Authentication**: Use strong passwords and key-based authentication
- **TLS**: Enable TLS for MongoDB connections
- **RBAC**: Configure proper Kubernetes RBAC
- **Secrets**: Use Kubernetes secrets for sensitive data
- **Monitoring**: Implement proper logging and monitoring
- **Application Security**: Non-root user, resource limits, health checks

### Current Security (Development)
- Open security group (allows all traffic)
- Basic authentication
- No TLS encryption
- Default Kubernetes RBAC
- Application runs with non-root user

## 📊 Performance and Scaling

### Horizontal Scaling
- **MongoDB Shards**: Add more shards for increased write capacity
- **Mongos Instances**: Scale mongos for increased query capacity
- **Kubernetes Nodes**: Add more worker nodes
- **Application**: Scale Twutter instances with `kubectl scale deployment twutter-app --replicas=5`

### Vertical Scaling
- **Instance Sizes**: Upgrade from `m1.large` to `m1.xlarge`
- **Storage**: Increase volume sizes in values.yaml
- **Resources**: Adjust CPU/memory limits in deployment

### Performance Optimization
- **Connection Pooling**: Mongoose connection caching
- **Indexing**: Proper database indexes for queries
- **Caching**: React Query for client-side caching
- **CDN**: Static asset delivery optimization
- **Load Testing**: Built-in performance testing interface
- **Bulk Operations**: Efficient batch processing APIs

## 🗑️ Cleanup

### Destroy Infrastructure
```bash
# Remove Twutter application
kubectl delete -k kube/twutter/

# Remove MongoDB cluster
helm uninstall mongo-sharded-cluster

# Remove CSI plugin
kubectl delete -f kube/manifests/cinder-csi-plugin/

# Destroy Terraform infrastructure
terraform destroy
```

## 📚 Additional Resources

### Documentation
- [K3s Documentation](https://docs.k3s.io/)
- [MongoDB Sharding Guide](https://docs.mongodb.com/manual/sharding/)
- [OpenStack CSI Plugin](https://github.com/kubernetes/cloud-provider-openstack)
- [Next.js Documentation](https://nextjs.org/docs)
- [Terraform OpenStack Provider](https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs)
- [GitLab Terraform State](https://docs.gitlab.com/ee/user/infrastructure/terraform_state.html)

### Project Documentation
- [Terraform Infrastructure](docs/01_Terraform.md) - Complete infrastructure setup
- [Kubernetes Deployment](docs/02_Kubernetes.md) - K8s and application deployment
- [MongoDB Configuration](docs/03_MongoDB.md) - Database setup and sharding
- [Twutter Application](docs/04_Twutter.md) - Application architecture and features

### Key Features
- **Full Automation**: One-command deployment of entire infrastructure
- **GitLab Integration**: Automated CI/CD with container registry
- **Load Testing**: Built-in performance testing interface
- **MongoDB Sharding**: Production-ready database scaling
- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Cloud Native**: Kubernetes, OpenStack, containerization
- **Monitoring**: Comprehensive health checks and logging
- **Scalability**: Horizontal and vertical scaling capabilities
