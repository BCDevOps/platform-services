# Azure Key Vault
Azure Key Vault is configured to store the auto-unseal keys for the vault configuration. 

A few configuration details that apply here: 
- terraform cloud us used as remove back end with CLI based runs
- `vault-lab` and `vault-prod` workspaces exist in terraform cloud 
- access to terraform cloud is provided by the cloud pathfinder team

**Usage**
- Login with the cli [tutorial here](https://learn.hashicorp.com/terraform/tfc/tfc_login?utm_source=WEBSITE&utm_medium=WEB_IO&utm_offer=ARTICLE_PAGE&utm_content=DOCS)

```
$ terraform login
Terraform will request an API token for app.terraform.io using your browser.

If login is successful, Terraform will store the token in plain text in
the following file for use by subsequent commands:
    /Users/username/.terraform.d/credentials.tfrc.json

Do you want to proceed? (y/n)
```

- Login to the Azure CLI

```
export USERNAME=[username]
export TENANT=[tenant]
export SUBSCRIPTION=[subscription]
az login --username $USERNAME -t $TENANT
```

- Using Remote State and Execution with Terraform, set the following ENV vars in the workspace

```
ARM_CLIENT_ID
ARM_CLIENT_SECRET
ARM_SUBSCRIPTION_ID
ARM_TENANT_ID
```