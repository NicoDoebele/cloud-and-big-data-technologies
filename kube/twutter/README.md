# Twutter Application Deployment

This directory contains Kubernetes manifests for deploying the Twutter application from the image `gitlab.reutlingen-university.de:5050/doebele/cbdt-projekt-3:latest`.

## Components

- **deployment.yaml**: Stateless deployment with 3 replicas and MongoDB environment variables
- **service.yaml**: NodePort service exposing port 30006
- **secret.yaml**: Kubernetes secret for MongoDB credentials (username, password, database)
- **kustomization.yaml**: Kustomize configuration for managing all resources

## Setup

### 1. Update MongoDB Credentials
Edit `secret.yaml` and replace the base64 encoded values with your actual MongoDB credentials:
```bash
echo -n "username" | base64
echo -n "password" | base64
echo -n "database" | base64
```

### 2. Create MongoDB ConfigMap
Create the configmap with kubectl command:
```bash
kubectl create configmap mongodb-config \
  --from-literal=host=127.0.0.1 \
  --from-literal=port=27017 \
  --labels=app=twutter-app
```

## Deployment

### Using kubectl directly:
```bash
kubectl apply -f secret.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Using kustomize:
```bash
kubectl apply -k .
```

## Configuration

- **Replicas**: 3 (for high availability)
- **Port**: 3000 (container) → 80 (service) → 30006 (nodePort)
- **Resources**: 128Mi-512Mi memory, 100m-500m CPU
- **Health checks**: Liveness and readiness probes on `/`
- **NodePort**: 30006 (accessible on any node IP)
- **Environment Variables**: MongoDB connection details from secrets and configmap

## Access

The application will be accessible on any cluster node at port 30006:
```
http://<node-ip>:30006
```

## Scaling

```bash
kubectl scale deployment twutter-app --replicas=5
```

## Monitoring

```bash
kubectl get pods -l app: twutter-app
kubectl logs -l app: twutter-app
kubectl describe service twutter-service
kubectl get secrets mongodb-secret
kubectl get configmap mongodb-config
kubectl get pods -l app=twutter-app -o jsonpath='{.items[0].spec.containers[0].env[?(@.name=="MONGODB_HOST")]}'
``` 