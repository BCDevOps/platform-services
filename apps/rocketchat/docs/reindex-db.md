# Re-index collections

## current collection vs index size:
```shell
db.<collection_name>.stats()
```
- rooms collection: 3299236 vs 831488
- message collection: 480347019 vs 153632768


## To re-index all replicas:
1. bring up a forth replica, make primary
  ```shell
  # set priority
  rs.reconfig({_id: "rs0", version: 2, members: [
       { _id: 0, host : "mongodb-0.mongodb-internal.<namespace_name>.svc.cluster.local:27017", priority : 0.5 },
       { _id: 1, host : "mongodb-1.mongodb-internal.<namespace_name>.svc.cluster.local:27017", priority : 0.5 },
       { _id: 2, host : "mongodb-2.mongodb-internal.<namespace_name>.svc.cluster.local:27017", priority : 0.5 },
       { _id: 3, host : "mongodb-3.mongodb-internal.<namespace_name>.svc.cluster.local:27017", priority : 1 }
  ]}, {force:true});
  ```
  - if there's not enough pool connection
  ```shell
  # double check on connections available:
  db.runCommand( { "connPoolStats" : 1 } )
  # remove one replica to start the re-indexing
  ```
2. do the following for all three origin replicas:
    - `rs.remove("mongodb-<id>.mongodb-internal.<namespace_name>.svc.cluster.local:27017")` remove replica from rs
    - go to the standalone pod and connect to db `mongo admin -u admin -p $MONGODB_ADMIN_PASSWORD`
    - `rs.slaveOk()` to allow queries on secondary nodes
    - `use rocketdb` switch to the rocketchat database
    - `db.rocketchat_message.stats()` to get collection stats
    - reindex all collections, this usually takes 10-15 mins:
      ```
      db.getCollectionNames().forEach(function(coll_name) {
        var coll = db.getCollection(coll_name);
        coll.reIndex();
      });
      ```
    - `db.rocketchat_message.stats()` to get collection NEW stats to confirm improvement
    - `rs.add("mongodb-<id>.mongodb-internal.<namespace_name>.svc.cluster.local:27017") ` to rejoin the rs
3. once all done, adjust priority and stepdown the forth, scale done back to 3
