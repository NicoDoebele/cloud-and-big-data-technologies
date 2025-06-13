sh.enableSharding("twutter");
db = db.getSiblingDB("twutter");

db.users.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.users", { "_id": "hashed" });

db.posts.createIndex({ "_id": "hashed" });
sh.shardCollection("twutter.posts", { "_id": "hashed" });

db.comments.createIndex({ "post_id": 1 });
sh.shardCollection("twutter.comments", { "post_id": 1 });

db.createUser({user: "twutter", pwd: "x", roles: [{ role: "readWrite", db: "twutter" }]});