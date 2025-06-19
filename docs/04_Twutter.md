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

## Application Features

### Core Functionality
- **User Management**: Create user profiles with username, email, display name, and bio
- **Post Creation**: Create posts with content and author association
- **Post Display**: View all posts with author information and timestamps
- **Comment System**: Posts can have associated comments (data structure ready)
- **Real-time Updates**: React Query for efficient data fetching and caching

### User Interface
- **Modern Design**: Clean, responsive interface with dark mode support
- **Form Validation**: Client-side validation for user input
- **Loading States**: Proper loading indicators and error handling
- **Responsive Layout**: Works on desktop and mobile devices

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

## API Endpoints

### Users API (`/api/users`)
```typescript
// GET /api/users - Retrieve users with pagination
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
// GET /api/posts - Retrieve posts with comments
GET /api/posts?author=johndoe&limit=100&skip=0

// POST /api/posts - Create new post
POST /api/posts
{
  "content": "Hello, world!",
  "author": "johndoe"
}
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

### Real-World Applicability
- **Social Media Platforms**: Similar to Twitter, Facebook, Instagram
- **Content Management**: Blogs, forums, news sites
- **E-commerce**: Product catalogs, user reviews, orders
- **Analytics**: Log data, metrics, time-series data

This application serves as a practical demonstration of how MongoDB sharding can be implemented in a real-world scenario, providing both educational value and a foundation for building scalable applications.
