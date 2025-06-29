# Enable sharding for the twutter database
sh.enableSharding("twutter");
# Switch to the twutter database context
db = db.getSiblingDB("twutter");

# Create hashed index on _id field for users collection and enable sharding
# Hashed sharding distributes data evenly across shards based on _id hash
db.users.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.users", { "_id": "hashed" });

# Create hashed index on _id field for posts collection and enable sharding
# Posts will be distributed across shards based on _id hash
db.posts.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });

# Create index on post_id field for comments collection and enable sharding
# Comments will be sharded by post_id to keep related comments together
db.comments.createIndex({ "post_id": 1 });
sh.shardCollection("twutter.comments", { "post_id": 1 });

# Create application user with read/write permissions on twutter database
db.createUser({user: "twutter", pwd: "x", roles: [{ role: "readWrite", db: "twutter" }]});