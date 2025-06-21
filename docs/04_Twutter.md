# Twutter Application Documentation

## Overview

Twutter is a Next.js-based social media application that demonstrates MongoDB sharding capabilities. It's a simplified Twitter-like platform where users can create profiles, post messages, and interact with content. The application showcases how MongoDB sharding distributes data across multiple shards for improved performance and scalability.

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TWUTTER APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   FRONTEND      │    │   API ROUTES    │    │   MONGODB       │         │
│  │   (Next.js)     │    │   (Next.js)     │    │   SHARDED       │         │
│  │                 │    │                 │    │   CLUSTER       │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │         │
│  │ │   React     │ │    │ │   /api/     │ │    │ ┌─────────────┐ │         │
│  │ │ Components  │ │◄───┤ │   users     │ │◄───┤ │   Users     │ │         │
│  │ │             │ │    │ │             │ │    │ │ Collection  │ │         │
│  │ │ • CreateUser│ │    │ │ • GET       │ │    │ │ (Sharded)   │ │         │
│  │ │ • CreatePost│ │    │ │ • POST      │ │    │ └─────────────┘ │         │
│  │ │ • PostList  │ │    │ └─────────────┘ │    │                 │         │
│  │ └─────────────┘ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  └─────────────────┘    │ │   /api/     │ │◄───┤ │   Posts     │ │         │
│                         │ │   posts     │ │    │ │ Collection  │ │         │
│                         │ │             │ │    │ │ (Sharded)   │ │         │
│                         │ │ • GET       │ │    │ └─────────────┘ │         │
│                         │ │ • POST      │ │    │                 │         │
│                         │ └─────────────┘ │    │ ┌─────────────┐ │         │
│                         └─────────────────┘    │ │ Comments    │ │         │
│                                                  │ │ Collection  │ │         │
│                                                  │ │ (Sharded)   │ │         │
│                                                  │ └─────────────┘ │         │
│                                                  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15.3.2**: React framework with App Router
- **React 19.0.0**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **React Query (@tanstack/react-query)**: Data fetching and caching
- **Zod**: Runtime type validation

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Mongoose 8.15.1**: MongoDB ODM for Node.js
- **MongoDB**: Sharded database cluster

### Deployment
- **Docker**: Containerized application
- **Kubernetes**: Orchestration and scaling
- **GitLab Container Registry**: Image storage

## Application Features

### Core Functionality
- **User Management**: Create user profiles with username, email, display name, and bio
- **Post Creation**: Create posts with content and author association
- **Post Display**: View all posts with author information and timestamps
- **Comment System**: Posts can have associated comments with full CRUD operations
- **Search Functionality**: Search across posts and users with real-time results
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Load Testing**: Built-in load testing interface for performance validation

### User Interface
- **Modern Design**: Clean, responsive interface with dark mode support
- **Form Validation**: Client-side validation for user input
- **Loading States**: Proper loading indicators and error handling
- **Responsive Layout**: Works on desktop and mobile devices
- **Search Interface**: Real-time search with dropdown results
- **Interactive Components**: Like, comment, and share functionality

## Data Models

### User Schema
```typescript
interface User {
  _id: string;
  username: string;        // Unique identifier
  email: string;          // Unique email
  displayName: string;    // Display name
  bio: string;           // User biography
  avatar: string;        // Profile picture URL
  createdAt: Date;       // Account creation date
  followers: string[];   // Array of follower user IDs
  following: string[];   // Array of following user IDs
}
```

### Post Schema
```typescript
interface Post {
  _id: Types.ObjectId;
  content: string;        // Post content
  author: string;         // Username of author
  createdAt: Date;        // Post creation date
  likes: number;          // Number of likes
}
```

### Comment Schema
```typescript
interface Comment {
  _id: Types.ObjectId;
  content: string;        // Comment content
  author: string;         // Username of author
  createdAt: Date;        // Comment creation date
  post_id: Types.ObjectId; // Reference to parent post
}
```

## API Endpoints

### Users API (`/api/users`)
```typescript
// GET /api/users - Retrieve users with pagination and search
GET /api/users?username=john&limit=10&skip=0

// POST /api/users - Create new user
POST /api/users
{
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "bio": "Software developer"
}
```

### Posts API (`/api/posts`)
```typescript
// GET /api/posts - Retrieve posts with comments and pagination
GET /api/posts?author=johndoe&limit=100&skip=0

// POST /api/posts - Create new post
POST /api/posts
{
  "content": "Hello, world!",
  "author": "johndoe"
}
```

### Bulk Posts API (`/api/posts/bulk`)
```typescript
// POST /api/posts/bulk - Create multiple posts efficiently
POST /api/posts/bulk
{
  "posts": [
    {
      "content": "Post 1 content",
      "author": "user1"
    },
    {
      "content": "Post 2 content", 
      "author": "user2"
    }
  ]
}
```

### Comments API (`/api/posts/comments`)
```typescript
// POST /api/posts/comments - Create new comment
POST /api/posts/comments
{
  "content": "Great post!",
  "postId": "507f1f77bcf86cd799439011",
  "author": "johndoe"
}
```

### Search API (`/api/search`)
```typescript
// GET /api/search - Search posts and users
GET /api/search?q=react&type=all&limit=10
```

## Frontend Components

### Core Components
- **Header**: Navigation, search, and user controls
- **Sidebar**: Navigation menu and user profile
- **CreatePost**: Post creation form with character limit
- **PostList**: Display posts with comments and interactions
- **CommentSection**: Comment display and creation
- **Login**: User authentication interface
- **UserContext**: Global user state management
- **WhoToFollow**: User discovery component

### Specialized Components
- **LoadTestPage**: Performance testing interface
- **FloatingActionButton**: Mobile navigation helper
- **CapybaraImage**: Custom image component

## MongoDB Sharding Strategy

### Sharding Configuration
The application demonstrates MongoDB sharding with the following strategy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHARDING STRATEGY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   USERS         │    │   POSTS         │    │   COMMENTS      │         │
│  │   COLLECTION    │    │   COLLECTION    │    │   COLLECTION    │         │
│  │                 │    │                 │    │                 │         │
│  │ • Hashed        │    │ • Hashed        │    │ • Range         │         │
│  │   Sharding      │    │   Sharding      │    │   Sharding      │         │
│  │ • Shard Key:    │    │ • Shard Key:    │    │ • Shard Key:    │         │
│  │   _id           │    │   _id           │    │   post_id       │         │
│  │ • Distribution: │    │ • Distribution: │    │ • Locality:     │         │
│  │   Even          │    │   Even          │    │   Related       │         │
│  │                 │    │                 │    │   Comments      │         │
│  └─────────────────┘    └─────────────────┘    │   Together      │         │
│                                                  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sharding Benefits Demonstrated

**1. Users Collection - Hashed Sharding on `_id`**
```javascript
// Users are distributed evenly across shards
db.users.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.users", { "_id": "hashed" });
```
- **Benefit**: Even distribution of user data across shards
- **Use Case**: User registration and profile queries
- **Performance**: Balanced load across cluster

**2. Posts Collection - Hashed Sharding on `_id`**
```javascript
// Posts are distributed evenly across shards
db.posts.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });
```
- **Benefit**: Even distribution of post data across shards
- **Use Case**: Post creation and timeline queries
- **Performance**: Balanced write and read operations

**3. Comments Collection - Range Sharding on `post_id`**
```javascript
// Comments are grouped by their parent post
db.comments.createIndex({ "post_id": 1 });
sh.shardCollection("twutter.comments", { "post_id": 1 });
```
- **Benefit**: Comments for the same post are stored together
- **Use Case**: Loading comments for a specific post
- **Performance**: Efficient comment retrieval with post data

## Database Connection Management

### Connection Strategy
```typescript
// lib/mongodb.ts - Connection pooling and caching
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(buildMongoUri(), opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

### Environment Configuration
```typescript
// lib/env.ts - Flexible MongoDB connection configuration
export function buildMongoUri(): string {
  if (env.MONGODB_URI) {
    return env.MONGODB_URI;
  }

  const host = env.MONGODB_HOST || '127.0.0.1';
  const port = env.MONGODB_PORT || '27017';
  const username = env.MONGODB_USERNAME;
  const password = env.MONGODB_PASSWORD;
  const database = env.MONGODB_DATABASE || 'twutter';
  const authDatabase = env.MONGODB_AUTH_DATABASE || database;

  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authDatabase}`;
  }

  return `mongodb://${host}:${port}/${database}`;
}
```

## Load Testing and Performance

### Built-in Load Testing Interface
The application includes a comprehensive load testing page (`/load-test`) that provides:

**1. Post Generation Testing**
- Generate 1-3000 posts simultaneously
- Choose between bulk API or individual API calls
- Real-time performance metrics
- Success/failure rate tracking

**2. Database Fetch Performance Testing**
- Measure query performance across shards
- Posts per second calculation
- Average response time per post
- Database optimization insights

**3. Performance Metrics**
```typescript
interface LoadTestResults {
  success: number;           // Successful posts created
  failed: number;           // Failed post creations
  totalTime: number;        // Total execution time (ms)
  averageTime: number;      // Average time per post (ms)
  usersCreated: number;     // New users created
  postCount: number;        // Total posts attempted
  method: string;          // "Bulk API" or "Individual API Calls"
}

interface FetchTestResults {
  totalTime: number;        // Total fetch time (ms)
  postCount: number;        // Posts retrieved
  averageTimePerPost: number; // Average time per post (ms)
  postsPerSecond: number;   // Throughput metric
}
```

### Sample Data
The application includes pre-generated sample data:
- **1000+ users** with realistic profiles and relationships
- **1000+ posts** with varied content and engagement
- **1000+ comments** distributed across posts

## Deployment Configuration

### Docker Configuration
```dockerfile
# Multi-stage Docker build for production optimization
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; fi

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; fi

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### Kubernetes Deployment
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

### Kubernetes Service
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

### Kubernetes Secrets
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

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables
```bash
# Required for MongoDB connection
MONGODB_URI="mongodb://username:password@host:port/database?authSource=admin"

# Alternative: Individual connection parameters
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_USERNAME=twutter
MONGODB_PASSWORD=x
MONGODB_DATABASE=twutter
MONGODB_AUTH_DATABASE=twutter
```

### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',  // Optimized for Docker deployment
};

export default nextConfig;
```

## Sharding Demonstration

### How to Observe Sharding in Action

**1. Check Shard Distribution**
```bash
# Connect to mongos
kubectl exec -it mongo-mongos-xxxx -- mongosh --username mongoadmin --password securepassword

# Check shard status
sh.status()

# View shard distribution for collections
db.users.getShardDistribution()
db.posts.getShardDistribution()
db.comments.getShardDistribution()
```

**2. Monitor Query Routing**
```bash
# Enable query logging
db.setProfilingLevel(2)

# Perform operations and check which shards are accessed
db.users.find().explain("executionStats")
db.posts.find().explain("executionStats")
```

**3. Observe Data Distribution**
```bash
# Check data distribution across shards
db.runCommand({
  collStats: "users",
  scale: 1024
})

db.runCommand({
  collStats: "posts", 
  scale: 1024
})
```

### Performance Benefits

**1. Parallel Processing**
- Queries are distributed across multiple shards
- Each shard processes a portion of the data
- Results are aggregated by mongos

**2. Scalability**
- Add more shards to handle increased load
- Data automatically redistributed
- No application changes required

**3. High Availability**
- Replica sets provide fault tolerance
- Automatic failover within shards
- No single point of failure

## Application Setup

### Prerequisites
1. **MongoDB Cluster**: Running sharded cluster (see MongoDB documentation)
2. **Environment Variables**: `MONGODB_URI` pointing to mongos router
3. **Node.js**: Version 18+ for Next.js compatibility
4. **Docker**: For containerized deployment
5. **Kubernetes**: For orchestrated deployment

### Installation
```bash
# Navigate to twutter directory
cd twutter

# Install dependencies
npm install

# Set environment variable
export MONGODB_URI="mongodb://mongoadmin:securepassword@<node-ip>:30007/twutter?authSource=admin"

# Start development server
npm run dev
```

### Database Connection
The application connects to the MongoDB cluster through:
- **Mongos Router**: Single entry point for all operations
- **Authentication**: Uses admin credentials
- **Connection Pooling**: Mongoose handles connection management
- **Error Handling**: Graceful handling of connection failures
- **Caching**: Global connection cache for development hot reloads

## Testing Sharding

### Load Testing
```bash
# Create multiple users
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\",\"email\":\"user$i@example.com\",\"displayName\":\"User $i\"}"
done

# Create multiple posts
for i in {1..1000}; do
  curl -X POST http://localhost:3000/api/posts \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"Post $i content\",\"author\":\"user$((i % 10 + 1))\"}"
done

# Use bulk API for efficient creation
curl -X POST http://localhost:3000/api/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"content":"Bulk post 1","author":"user1"},{"content":"Bulk post 2","author":"user2"}]}'
```

### Monitoring Shard Usage
```bash
# Check shard statistics
db.runCommand({ serverStatus: 1 })

# Monitor query patterns
db.currentOp()

# Check collection statistics
db.users.stats()
db.posts.stats()
db.comments.stats()
```

### Built-in Load Testing
Access the load testing interface at `/load-test` to:
- Generate 1-3000 posts with performance metrics
- Test bulk vs individual API performance
- Measure database fetch performance
- Monitor success rates and timing
- Analyze throughput and optimization opportunities

## Key Takeaways

### Sharding Benefits Demonstrated
1. **Horizontal Scaling**: Data distributed across multiple nodes
2. **Performance**: Parallel query execution across shards
3. **Availability**: Fault tolerance through replica sets
4. **Flexibility**: Different sharding strategies for different collections

### Application Benefits
1. **Scalability**: Can handle millions of users and posts
2. **Performance**: Fast queries even with large datasets
3. **Reliability**: High availability through MongoDB clustering
4. **Maintainability**: Clean separation of concerns
5. **Testing**: Built-in load testing for performance validation
6. **Deployment**: Containerized and orchestrated deployment

### Real-World Applicability
- **Social Media Platforms**: Similar to Twitter, Facebook, Instagram
- **Content Management**: Blogs, forums, news sites
- **E-commerce**: Product catalogs, user reviews, orders
- **Analytics**: Log data, metrics, time-series data
- **Microservices**: Distributed data across multiple services

This application serves as a practical demonstration of how MongoDB sharding can be implemented in a real-world scenario, providing both educational value and a foundation for building scalable applications. The comprehensive load testing capabilities and production-ready deployment configuration make it an excellent reference for implementing sharded MongoDB solutions in production environments.
