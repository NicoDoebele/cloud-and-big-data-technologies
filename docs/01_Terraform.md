# Terraform Infrastructure Documentation

## Overview

This Terraform configuration deploys a complete Kubernetes cluster on OpenStack with K3s and MongoDB sharded cluster. The infrastructure includes networking, compute instances, K3s cluster setup, and MongoDB deployment with persistent storage.

## Architecture

```
OpenStack Infrastructure
├── Network Layer
│   ├── Cluster Network (192.168.1.0/24)
│   ├── Router with External Connectivity
│   └── Security Group (All ports open)
├── Compute Layer
│   ├── K3s Master Node
│   ├── K3s Worker Nodes (configurable count)
│   └── Floating IPs for external access
├── Kubernetes Layer
│   ├── K3s v1.32.3+k3s1 Cluster
│   └── Cinder CSI Plugin for Storage
└── Application Layer
    └── MongoDB Sharded Cluster
        ├── Config Servers (3 replicas)
        ├── Shards (2 clusters, 3 replicas each)
        └── Mongos Routers (2 instances)
```

## File Structure

### Core Terraform Files

- **`backend.tf`** - Terraform state backend configuration (HTTP backend)
- **`provider.tf`** - Provider configurations and versions
- **`variables.tf`** - Input variable definitions
- **`terraform.tfvars`** - Variable values for current deployment
- **`outputs.tf`** - Output values (public IP addresses)

### Infrastructure Components

- **`network.tf`** - OpenStack networking resources
- **`instances.tf`** - Compute instances and floating IPs
- **`provisioner-k3s.tf`** - K3s cluster setup and configuration
- **`provisioner-mongodb.tf`** - MongoDB deployment via Helm

### Supporting Files

- **`setup_k3s/`** - K3s installation and configuration scripts
- **`kube/manifests/`** - Kubernetes manifests for Cinder CSI
- **`kube/mongo-sharded-cluster/`** - Helm chart for MongoDB
- **`values.prod.yaml`** - MongoDB configuration values

## Configuration Details

### Providers

```hcl
# Required providers with pinned versions
openstack = "1.53.0"      # OpenStack infrastructure
null = "3.2.2"           # Null resources for provisioning
external = "2.3.2"       # External data sources
kubernetes = "~> 2.0"    # Kubernetes resources
helm = "~> 2.0"          # Helm chart deployments
```

### Variables

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `cloud_name` | string | OpenStack cloud name from `~/.config/openstack/clouds.yaml` | - |
| `node_count` | number | Total number of cluster nodes (master + workers) | - |
| `image_name` | string | OS image name for instances | - |
| `test_flavor_name` | string | Instance flavor for testing | - |
| `production_flavor_name` | string | Instance flavor for production | - |
| `production` | bool | Switch between test/production modes | - |

### Current Configuration (`terraform.tfvars`)

```hcl
cloud_name             = "openstack"
node_count             = 3                    # 1 master + 2 workers
production             = false               # Test mode
image_name             = "Rocky Linux 9.4"
test_flavor_name       = "m1.large"
production_flavor_name = "m1.xlarge"
```

## Infrastructure Components

### Networking (`network.tf`)

**Network Configuration:**
- **Network**: `cluster-network` with admin state up
- **Subnet**: `192.168.1.0/24` (IPv4)
- **Router**: Connected to external network `e6cb7f2a-b9a8-436b-a7e1-7556202ec045`
- **Security Group**: `cluster-secgroup` with all ports open (TCP/UDP/ICMP)

**Security Group Rules:**
- TCP: 1-65535 (all ports)
- UDP: 1-65535 (all ports)  
- ICMP: All types (ping)

### Compute Instances (`instances.tf`)

**Key Pair:**
- Uses SSH key from `~/cluster.key.pub`

**Instance Configuration:**
- **Count**: Configurable via `node_count` variable
- **Naming**: `cluster-node-01`, `cluster-node-02`, etc.
- **OS**: Rocky Linux 9.4
- **Flavor**: `m1.large` (test) or `m1.xlarge` (production)
- **Network**: Connected to cluster network
- **Security**: Uses cluster security group

**Floating IPs:**
- Each node gets a floating IP from `Public-Network` pool
- Enables external access to all nodes

### K3s Cluster Setup (`provisioner-k3s.tf`)

**Master Node Setup:**
1. Uploads `bootstrap_master.sh` script
2. Installs K3s v1.32.3+k3s1 with cluster-init
3. Configures TLS SAN with floating IP
4. Retrieves join token via external data source

**Worker Node Setup:**
1. Uploads `add_node.sh` script to each worker
2. Joins workers to cluster using master's token
3. Configures TLS SAN with worker's floating IP
4. Connects to master via internal IP

**Local Configuration:**
1. Backs up existing kubeconfig
2. Downloads kubeconfig from master
3. Updates server address to master's floating IP
4. Cleans up on destroy

### MongoDB Deployment (`provisioner-mongodb.tf`)

**Prerequisites:**
1. Deploys Cinder CSI plugin for persistent storage
2. Uses local Helm chart from `kube/mongo-sharded-cluster/`

**MongoDB Configuration (`values.prod.yaml`):**
- **Config Servers**: 3 replicas, 30Gi storage each
- **Shards**: 2 clusters, 3 replicas each, 50Gi storage each
- **Mongos**: 2 instances, NodePort service on port 30007
- **Resources**: 500m CPU, 1Gi memory per pod
- **Storage Class**: `mongo-volume-xfs`
- **MongoDB Version**: 8.0.9

## Deployment Process

### Prerequisites

1. **OpenStack Access:**
   - Configured cloud in `~/.config/openstack/clouds.yaml`
   - SSH key pair at `~/cluster.key` and `~/cluster.key.pub`

2. **Terraform Setup:**
   ```bash
   terraform init
   terraform plan
   ```

### Deployment Steps

1. **Infrastructure Creation:**
   ```bash
   terraform apply
   ```

2. **Automatic Provisioning:**
   - Network and security groups created
   - Instances launched with floating IPs
   - K3s master node configured
   - Worker nodes joined to cluster
   - Local kubeconfig configured
   - Cinder CSI plugin deployed
   - MongoDB sharded cluster deployed

3. **Verification:**
   ```bash
   kubectl get nodes
   kubectl get pods -A
   ```

### Outputs

- **Public IP Addresses**: List of all node floating IPs for external access

## Security Considerations

### Current Configuration
- **Open Security Group**: All ports open (0.0.0.0/0)
- **SSH Key Authentication**: Required for node access
- **K3s TLS**: Configured with floating IPs as SANs

### Recommendations
- Restrict security group rules to specific ports
- Use private networks where possible
- Implement network policies in Kubernetes
- Regular security updates for K3s and MongoDB

## Scaling and Maintenance

### Adding Nodes
1. Update `node_count` variable
2. Run `terraform apply`
3. New nodes automatically join cluster

### Production Mode
1. Set `production = true` in `terraform.tfvars`
2. Uses larger instance flavors (`m1.xlarge`)
3. May require storage class adjustments

### MongoDB Scaling
- Modify `values.prod.yaml` for shard/replica counts
- Update storage sizes as needed
- Consider resource limits for production workloads

## Troubleshooting

### Common Issues

1. **SSH Connection Failures:**
   - Verify SSH key permissions
   - Check floating IP assignment
   - Ensure security group allows SSH

2. **K3s Join Failures:**
   - Verify master node is ready
   - Check token retrieval
   - Ensure network connectivity between nodes

3. **MongoDB Deployment Issues:**
   - Verify Cinder CSI plugin is running
   - Check storage class availability
   - Review resource limits

### Debug Commands

```bash
# Check node status
kubectl get nodes -o wide

# Check pod status
kubectl get pods -A

# Check storage classes
kubectl get storageclass

# Check MongoDB services
kubectl get svc -l app=mongodb
```

## Cost Optimization

### Test Environment
- Use `m1.large` flavors
- Reduce storage sizes in `values.prod.yaml`
- Consider fewer MongoDB replicas

### Production Environment
- Use `m1.xlarge` flavors for better performance
- Increase storage sizes as needed
- Monitor resource usage and scale accordingly

## Backup and Recovery

### Terraform State
- Backend configured for remote state storage via HTTP backend
- State managed through GitLab
- Consider using Terraform Cloud or similar for team collaboration

### Data Backup
- MongoDB data stored in persistent volumes
- Implement regular MongoDB backups
- Consider volume snapshots for disaster recovery

## Future Enhancements

### Potential Improvements
- Implement proper network segmentation
- Add monitoring and logging stack
- Configure automated backups
- Implement CI/CD pipeline integration
- Add load balancer for external access
- Consider multi-zone deployment for high availability
