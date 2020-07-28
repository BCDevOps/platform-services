
data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "vault-lab" {
  name     = "vault-lab"
  location = "CanadaCentral"
}

resource "azurerm_key_vault" "vault-lab-kv" {
  name                        = "vault-lab-kv"
  location                    = azurerm_resource_group.vault-lab.location
  resource_group_name         = azurerm_resource_group.vault-lab.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  # tenant_id                   = var.tenant_id
  soft_delete_enabled         = true
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id

    #object_id = "${var.object_id}"
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "get",
      "list",
      "create",
      "delete",
      "update",
      "wrapKey",
      "unwrapKey",
    ]
  }

  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }

  tags = {
    environment = "vault-lab"
  }
}

resource "azurerm_key_vault_key" "generated" {
  name         = var.key_name
  key_vault_id = azurerm_key_vault.vault-lab-kv.id
  key_type     = "RSA"
  key_size     = 2048

  key_opts = [
    "decrypt",
    "encrypt",
    "sign",
    "unwrapKey",
    "verify",
    "wrapKey",
  ]
}

output "key_vault_name" {
  value = azurerm_key_vault.vault-lab-kv.name
}