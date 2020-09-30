terraform {
  backend "remote" {
    organization = "bcgov"

    workspaces {
      name = "vault-prod"
    }
  }
}
