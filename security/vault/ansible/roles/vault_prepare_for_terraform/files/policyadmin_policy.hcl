# Manage auth methods broadly across Vaults
path "auth/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Create, update, and delete auth methods
path "sys/auth/*"
{
  capabilities = ["create", "update", "delete", "sudo"]
}

# List auth methods
path "sys/auth"
{
  capabilities = ["read"]
}

# Terraform issues itself a new token that is a child of the one given
path "auth/token/create"
{
  capabilities = ["create", "update", "delete"]
}

# List existing policies
path "sys/policies/acl"
{
  capabilities = ["list"]
}

# Create and manage ACL policies
path "sys/policies/acl/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Manage secrets engines
path "sys/mounts/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List existing secrets engines.
path "sys/mounts"
{
  capabilities = ["read"]
}

# List any KV folder/mount
path "+/metadata/"
{
  capabilities = ["list"]
}

# Manage secrets and versions on any KV folder/mount
path "+/data/*"
{
  capabilities = ["create", "read", "update", "delete", "list"]
}
