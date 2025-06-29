# Testing Documentation

## Overview

This testing documentation covers the comprehensive testing capabilities of the MongoDB sharded cluster infrastructure and Twutter application. The testing framework includes monitoring scripts for shard performance, built-in load testing interfaces, and tools for validating load balancer functionality across the distributed system.

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING FRAMEWORK                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   MONITORING    │    │   LOAD TESTING  │    │   LOAD BALANCER │         │
│  │   SCRIPTS       │    │   INTERFACE     │    │   VALIDATION    │         │
│  │                 │    │                 │    │                 │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │ monitor_    │ │    │ │ Twutter     │ │    │ │ Mongos      │ │         │
│  │ │ shards.sh   │ │    │ │ Load Test   │ │    │ │ Router      │ │         │
│  │ │             │ │    │ │ Page        │ │    │ │ Distribution│ │         │
│  │ │ • Real-time │ │    │ │             │ │    │ │             │ │         │
│  │ │   monitoring│ │    │ │ • 1-3000    │ │    │ │ • Query     │ │         │
│  │ │ • Shard     │ │    │ │   posts     │ │    │ │   routing   │ │         │
│  │ │   status    │ │    │ │ • Bulk API  │ │    │ │ • Load      │ │         │
│  │ │ • Data      │ │    │ │ • Individual│ │    │ │   balancing │ │         │
│  │ │   distribution│ │    │ │   API calls │ │    │ │ • Failover  │ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           TESTING COMPONENTS                                │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   check_shards  │    │   data_example  │    │   Twutter API   │         │
│  │   .sh           │    │   .json         │    │   Endpoints     │         │
│  │                 │    │                 │    │                 │         │
│  │ • One-time      │    │ • Sample        │    │ • /api/posts    │         │
│  │   status check  │    │   shard data    │    │ • /api/users    │         │
│  │ • JSON output   │    │ • Expected      │    │ • /api/search   │         │
│  │ • Formatted     │    │   distribution  │    │ • /api/posts/   │         │
│  │   display       │    │   patterns      │    │   bulk          │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Monitoring Scripts

### 1. Real-time Shard Monitoring (`monitor_shards.sh`)

**Purpose**: Continuously monitor MongoDB sharded cluster status and data distribution in real-time.

**Key Features**:
- **Continuous Monitoring**: Updates every second with `clear` screen refresh
- **Shard Status**: Shows active/inactive status for each shard
- **Data Distribution**: Displays document counts and sizes per collection per shard
- **JSON Parsing**: Uses `jq` for structured data extraction
- **Graceful Exit**: Handles Ctrl+C interruption

**Usage**:
```bash
# Start real-time monitoring
./monitor_scripts/monitor_shards.sh

# Expected output format:
# --- Shard Status ---
# [active] rsShard1    rsShard1/mongo-shard1-0...:27017
# [active] rsShard2    rsShard2/mongo-shard2-0...:27017
#
# --- Data Distribution ---
# twutter.posts
#   Shard: rsShard1
#   Documents: 5062
#   Size: 860540 bytes
# twutter.posts
#   Shard: rsShard2
#   Documents: 5098
#   Size: 6652890 bytes
```

**Configuration**:
```bash
IP=134.103.195.210          # MongoDB cluster IP
PORT=30007                  # NodePort service port
USERNAME=mongoadmin         # Admin username
PASSWORD=securepassword     # Admin password
AUTHENTICATION_DATABASE=admin
```

### 2. One-time Shard Check (`check_shards.sh`)

**Purpose**: Perform a single status check of the MongoDB sharded cluster.

**Key Features**:
- **Single Execution**: One-time status check without continuous monitoring
- **Same Output Format**: Consistent with monitor script for comparison
- **Scriptable**: Can be used in automation and CI/CD pipelines
- **JSON Processing**: Structured data extraction for programmatic use

**Usage**:
```bash
# Perform one-time check
./monitor_scripts/check_shards.sh

# Use in automation
./monitor_scripts/check_shards.sh > shard_status.json
```

### 3. Sample Data Reference (`data_example.json`)

**Purpose**: Provides expected data structure and distribution patterns for validation.

**Key Data Points**:
- **Shard Configuration**: Expected shard names and hostnames
- **Collection Distribution**: How data should be distributed across shards
- **Document Counts**: Expected document counts per collection per shard
- **Size Metrics**: Expected storage usage patterns
- **Balancer Status**: Current balancer configuration and migration history

**Sample Structure**:
```json
{
  "value": {
    "shards": [
      {
        "_id": "rsShard1",
        "host": "rsShard1/mongo-shard1-0...:27017",
        "state": { "$numberInt": "1" }
      }
    ],
    "shardedDataDistribution": [
      {
        "ns": "twutter.posts",
        "shards": [
          {
            "shardName": "rsShard1",
            "numOwnedDocuments": { "$numberInt": "5062" },
            "ownedSizeBytes": { "$numberInt": "860540" }
          }
        ]
      }
    ]
  }
}
```

## Twutter Load Testing Interface

### Built-in Load Testing Page (`/load-test`)

**Purpose**: Comprehensive load testing interface integrated into the Twutter application for testing system performance and load balancer functionality.

**Key Features**:

#### 1. Post Generation Testing
- **Scale**: Generate 1-3000 posts simultaneously
- **Methods**: Choose between bulk API or individual API calls
- **Performance Metrics**: Real-time success/failure tracking
- **User Creation**: Automatic user generation for testing

#### 2. Database Fetch Performance Testing
- **Query Performance**: Measure query performance across shards
- **Throughput Metrics**: Posts per second calculation
- **Response Times**: Average response time per post
- **Optimization Insights**: Database performance analysis

#### 3. Performance Metrics Interface
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

**Usage**:
```bash
# Access load testing interface
http://<node-ip>:30006/load-test

# Test scenarios:
# 1. Generate 100 posts using bulk API
# 2. Generate 1000 posts using individual API calls
# 3. Test database fetch performance
# 4. Compare bulk vs individual performance
```

## Expected Results and Validation

### Load Balancer Performance Metrics

#### Data Distribution
- **Even Distribution**: Data should be distributed across shards based on shard key
- **Collection Balance**: Each collection should utilize multiple shards
- **Size Balance**: Storage usage should be relatively balanced across shards

#### Query Performance
- **Response Time**: Should remain consistent under varying load
- **Throughput**: Posts per second should scale with cluster size
- **Parallel Execution**: Queries should execute in parallel across shards

#### Failover Behavior
- **Automatic Recovery**: Failed shards should automatically recover
- **Service Continuity**: Application should remain functional during failures
- **Data Integrity**: No data loss during failover scenarios

## Key Takeaways

### Load Balancer Benefits Demonstrated
1. **Query Distribution**: Automatic routing to appropriate shards
2. **Performance Scaling**: Improved throughput with multiple shards
3. **High Availability**: Fault tolerance through replica sets
4. **Transparent Operation**: Application unaware of underlying distribution

### Testing Benefits
1. **Comprehensive Coverage**: End-to-end testing of distributed system
2. **Real-time Monitoring**: Continuous visibility into system behavior
3. **Performance Validation**: Quantifiable metrics for optimization
4. **Reliability Assurance**: Failover and recovery testing
5. **Scalability Verification**: Horizontal scaling validation

### Real-World Applicability
- **Production Systems**: Validates production-ready load balancing
- **Performance Tuning**: Identifies bottlenecks and optimization opportunities
- **Capacity Planning**: Helps determine resource requirements
- **Disaster Recovery**: Ensures system resilience under failure conditions
- **Continuous Monitoring**: Provides ongoing system health validation
