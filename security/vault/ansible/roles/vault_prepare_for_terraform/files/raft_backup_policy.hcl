path "sys/storage/raft/snapshot" {
   capabilities = [ "update" , "read" ]
}

path "sys/storage/raft/snapshot-force" {
   capabilities = [ "update" ]
}

path "sys/storage/raft/snapshot-auto/config/" {
   capabilities = [ "create", "update", "sudo" ]
}

path "sys/storage/raft/snapshot-auto/*" {
   capabilities = [ "create", "read", "update", "delete", "list", "sudo" ]
}