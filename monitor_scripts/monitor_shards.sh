#!/bin/bash

IP=134.103.195.210
PORT=30007
USERNAME=mongoadmin
PASSWORD=securepassword
AUTHENTICATION_DATABASE=admin

echo "Monitoring mongodb"
trap 'echo "Monitoring stopped"; exit 0' INT TERM

while true; do
  result=$(mongosh --host $IP --port $PORT --username $USERNAME --password $PASSWORD --authenticationDatabase $AUTHENTICATION_DATABASE --eval "sh.status()" --quiet --json)

  clear

  echo -e"--- Shard Status ---\n"
  echo "$result" | jq -r '.value.shards[]? | (if .state["$numberInt"] == "1" then "[active]" else "[inactive]" end) + " " + .["_id"] + "\t" + .host'

  echo -e "\n--- Data Distribution ---\n"
  
  echo "$result" | jq -r '
    # Define the desired order of collections
    ["twutter.posts", "twutter.users", "twutter.comments"] as $ordered_collections |
    .value.shardedDataDistribution as $all_collections |
    # Iterate through the ordered list of collections
    $ordered_collections[] as $collection_name |
    # Find the matching collection data
    ($all_collections[] | select(.ns == $collection_name)) | 
    # For each collection, format the output for its shards
    .ns as $ns | 
    # Sort the shards array by shardName before expanding it
    (.shards | sort_by(.shardName)[]) |
    "\($ns)\n  Shard: \(.shardName)\n  Documents: \(.numOwnedDocuments["$numberInt"])\n  Size: \(.ownedSizeBytes["$numberInt"]) bytes\n"
  '

  echo "Press Ctrl+C to stop"
  sleep 1
done