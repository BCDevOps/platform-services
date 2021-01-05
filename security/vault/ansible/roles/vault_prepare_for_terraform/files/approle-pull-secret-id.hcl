path "auth/approle/role/terraform/secret-id" {
  capabilities = [ "create", "update" ]
}

path "auth/token/lookup" {
  capabilities = [ "create", "update", "list", "read" ]
}
