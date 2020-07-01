# Use-Case 1 Multi-Tenancy with Namespaces <!-- omit in toc -->

## Table of contents <!-- omit in toc -->

- [Introduction](#introduction)
- [Onboarding a New Namespace](#onboarding-a-new-namespace)
  - [Enabling the LDAP Authentication Backend](#enabling-the-ldap-authentication-backend)
  - [Writing Base Policies](#writing-base-policies)
  - [Importing Policies into Vault](#importing-policies-into-vault)
  - [Attaching Policies to AD Groups](#attaching-policies-to-ad-groups)
- [Chargeback Strategy Recommendation](#chargeback-strategy-recommendation)
- [Day-2 Operations](#day-2-operations)
  - [Vault paths are confused with file system folders](#vault-paths-are-confused-with-file-system-folders)
  - [Analysis with Central Logging Solution](#analysis-with-central-logging-solution)
  - [Permission from users-policy.hcl](#permission-from-users-policyhcl)
  - [Deleting a namespace](#deleting-a-namespace)
  - [KV versus KV2 Secrets Engine](#kv-versus-kv2-secrets-engine)
    - [**KV Version 1**](#kv-version-1)
    - [**KV Version 2**](#kv-version-2)
    - [**When to use KV2**](#when-to-use-kv2)
  - [Detecting Root Token Login](#detecting-root-token-login)
  - [Education, Training, and Documentation](#education-training-and-documentation)

## Introduction

Within the HashiCorp Vault, the concept of multi-tenancy is realized with namespaces. Namespaces are isolated environments that functionally exist as "Vaults within a Vault”.

**Tenant Isolation** --
Frequently, teams within a Vault environment require strong isolation from other users in their policies, secrets, and identities. Tenant isolation is typically a result of compliance regulations such as General Data Protection Regulation (GDPR), though it may be necessitated by corporate or organizational infosec requirements.

**Self-Management** -- Namespaces are a set of features within Vault Enterprise that allow Vault environments to support Secure Multi-tenancy (or SMT) within a single Vault infrastructure. Through namespaces, Vault administrators can support tenant isolation for teams and individuals as well as empower delegated administrators to manage their tenant environment.

**Details of the Use-Case in this engagement** --
Here is the desired outcome of this use-case.

- Document Reference architecture and best practices (Policies, onboarding strategies, etc.)
- Chargeback strategy recommendation
- Document day-2 operations gotchas

## Onboarding a New Namespace

All namespaces in Vault are under the “/” namespace, which is also called “root” namespace. Upon receiving a namespace creation request from a different department or team, the Vault Organization Administrator creates the new namespace with the following naming convention.

**Naming Convention**:
The name of the namespace consists of three parts. The first part contains the name of the department or team, the second part is the “-” (dash-symbol) as a separator between the first and third parts, and finally, the third part is the four-digit cost center.

**Note:** The name of the namespace is case-sensitive.

```bash
<name_of_department_or_team>-<4-digit_costcenter>
```

The new namespace can be created through the Web User Interface (UI) or via the Vault API. The command to create a new namespace is as follows:

```bash
vault namespace create <name_of_department_or_team>-<4-digit_costcenter>
```

Once the new namespace is created, enable authentication backends for the new namespace.

### Enabling the LDAP Authentication Backend

To enable LDAP authentication to the new namespace, use the following commands. The first command enables the LDAP authentication backend in the new namespace. The second command configures the LDAP authentication method.

```bash
# Enable LDAP Authentication Backend
vault auth enable -namespace=<name_of_new_namespace> ldap
```

To configure the LDAP authentication method, the following parameters are required.

- **url**: LDAP URL to the Active Directory (AD), e.g., "ldap://ad01.company.com"
- **binddn**: An AD service account with which Vault binds to the AD server. Specify the full Distinguished Name (DN) for the AD service account.
- **bindpass**: The password for the above binddn.
- **userdn**: The AD DN of an Organizational Unit (OU) to look for user accounts. Specify the full DN to the OU.
- **userattr**: The AD attribute to match the user account with, commonly “sAMAccountName”
- **groupdn**: The AD DN of an OU to look for AD groups.
- **groupattr**: The AD group attribute to match the group with, commonly “cn” or “memberOf”
- **groupfilter**: Optional LDAP filter for filtering AD groups, e.g., “(&(objectClass=person)(sAMAccountName={{.Username}}))”
- **starttls**: Optional Boolean, defaults to false. If true, issues a StartTLS command after establishing an unencrypted connection. Depending on the exact AD configuration, please consult your LDAP administrator.
- **token_ttl**: Limit the lifetime of a token, e.g., “4h”. The incremental lifetime for generated tokens. This current value of this will be referenced at renewal time.
- **token_max_ttl**: Limit the lifetime of a token, e.g., “8h”. The maximum lifetime for generated tokens. This current value of this will be referenced at renewal time.
- **certificate**: CA certificate to use when verifying LDAP server certificate, must be x509 PEM encoded. Depending on the exact AD configuration, please consult your LDAP administrator.

Here is an example of the second command to configure the LDAP Authentication Method. Replace this with actual values from your AD. Add optional parameters as required (see above).

```bash
# Configuring the LDAP Authentication Method
vault write auth/ldap/config \
  url="ldap://ad01.domain.com" \
  binddn="CN=BindVault,OU=Service Accounts,DC=DOMAIN,DC=com" \
  bindpass="********" \
  userdn="OU=Global,DC=DOMAIN,DC=com" \
  userattr="sAMAccountName" \
  groupdn="DC=DOMAIN,DC=com" \
  groupattr="cn" \
  token_ttl="4h" \
  token_max_ttl="4h" \
  certificate=@ldap_ca_cert.pem
```

Once the above steps are completed, verify that a login into the new namespace with an AD account is possible. Since the namespace was just created, the Web UI will appear nearly empty. Verify that the namespace name shows up in the top-left of the Web UI, or alternatively, at the end of the URL in the web browser’s address bar (see screenshot below).

![Vault Namespace Login](pics/vault-namespace-login.png "Vault Namespace Login")

### Writing Base Policies

Everything in Vault is path-based, and policies are no exception. Policies provide a declarative way to grant or forbid access to specific paths and operations in Vault. This section discusses policy workflows and syntaxes.

Policies are **deny-by-default**, so an empty policy grants no permission in the system.

The following policies, written in the HashiCorp Configuration Language (HCL) format, cover the basic setup of the new namespace. Here is an overview of the policies:

- **root-ns-admin-policy.hcl**: Applicable to “/” (root) namespace only. This **allows** the root namespace Administrators to create new namespaces.
- **admin-policy.hcl**: This allows common administrative operations. It **does not** **allow** creating namespaces. This prevents the complexity of namespaces within namespaces.
- **default-policy.hcl**: For reference only. This policy is an implicit default policy by Vault; however, it must be attached to groups or users to be in effect. This policy enables basic operations for every user.
- **users-policy.hcl**: This policy covers two scenarios: it allows users to store their secrets under their `users/<username>` path, and it also allows every user access to the `shared/` path. Everyone has create and update permissions in the `shared/` path, but no delete permission. This reduces administrative overhead, and Vault administrators do not have to restore accidentally deleted secrets for consumers.

**root-ns-admin-policy.hcl**

```bash
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

# List, create, update, and delete key/value secrets
path "secret/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Manage secret engines
path "sys/mounts/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List existing secret engines.
path "sys/mounts"
{
 capabilities = ["read"]
}
 # Give the ability to revoke tokens.
path "sys/leases/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Read health checks
path "sys/health"
{
 capabilities = ["read", "sudo"]
}

# Need for Rotating
path "sys/rotate"
{
 capabilities = ["update", "sudo"]
}

# Need for Rotating
path "sys/key-status"
{
 capabilities = ["read", "sudo"]
}

# Read user info
path "users/*"
{
 capabilities = ["read", "create", "update", "delete", "list"]
}

# Only list namespaces below current namespace
path "sys/namespaces" {
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

path "sys/namespaces/*" {
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
```

**admin-policy.hcl**

```bash
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

# List, create, update, and delete key/value secrets
path "secret/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Manage secret engines
path "sys/mounts/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List existing secret engines.
path "sys/mounts"
{
 capabilities = ["read"]
}
 # Give the ability to revoke tokens.
path "sys/leases/*"
{
 capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Read health checks
path "sys/health"
{
 capabilities = ["read", "sudo"]
}

# Need for Rotating
path "sys/rotate"
{
 capabilities = ["update", "sudo"]
}

# Need for Rotating
path "sys/key-status"
{
 capabilities = ["read", "sudo"]
}

# Read user info
path "users/*"
{
 capabilities = ["read", "create", "update", "delete", "list"]
}
```

**default-policy.hcl** (for reference only - it's implicit and doesn't have to be imported)

```bash
# default policy read after Vault installation
# Allow tokens to look up their own properties
path "auth/token/lookup-self" {
   capabilities = ["read"]
}

# Allow tokens to renew themselves
path "auth/token/renew-self" {
   capabilities = ["update"]
}

# Allow tokens to revoke themselves
path "auth/token/revoke-self" {
   capabilities = ["update"]
}

# Allow a token to look up its own capabilities on a path
path "sys/capabilities-self" {
   capabilities = ["update"]
}

# Allow a token to look up its own entity by id or name
path "identity/entity/id/{{identity.entity.id}}" {
 capabilities = ["read"]
}
path "identity/entity/name/{{identity.entity.name}}" {
 capabilities = ["read"]
}

# Allow a token to look up its resultant ACL from all policies. This is useful
# for UIs. It is an internal path because the format may change at any time
# based on how the internal ACL features and capabilities change.
path "sys/internal/ui/resultant-acl" {
   capabilities = ["read"]
}

# Allow a token to renew a lease via lease_id in the request body; old path for
# old clients, new path for newer
path "sys/renew" {
   capabilities = ["update"]
}
path "sys/leases/renew" {
   capabilities = ["update"]
}

# Allow looking up lease properties. This requires knowing the lease ID ahead
# of time and does not divulge any sensitive information.
path "sys/leases/lookup" {
   capabilities = ["update"]
}

# Allow a token to manage its own cubbyhole
path "cubbyhole/*" {
   capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow a token to wrap arbitrary values in a response-wrapping token
path "sys/wrapping/wrap" {
   capabilities = ["update"]
}

# Allow a token to look up the creation time and TTL of a given
# response-wrapping token
path "sys/wrapping/lookup" {
   capabilities = ["update"]
}

# Allow a token to unwrap a response-wrapping token. This is a convenience to
# avoid client token swapping since this is also part of the response wrapping
# policy.
path "sys/wrapping/unwrap" {
   capabilities = ["update"]
}

# Allow general purpose tools
path "sys/tools/hash" {
   capabilities = ["update"]
}
path "sys/tools/hash/*" {
   capabilities = ["update"]
}

# Allow checking the status of a Control Group request if the user has the
# accessor
path "sys/control-group/request" {
   capabilities = ["update"]
}
```

**users-policy.hcl**

This assumes a Key/Value (KV) Version 2 Secrets Engine is mounted at the path `secrets/`. The expression to provide access to the user-specific path has to be changed according to the actual LDAP accessor. \
Replace `identity.entity.aliases.auth_ldap_68912064.name` with the LDAP accessor of the new namespace. You can find the LDAP accessor in the Web UI under Access (see screenshot below).

![Vault LDAP accessor](pics/vault-webui-ldap-accessor.png "Vault LDAP accessor")

```bash
# ==============================Shared=======================================
# List the user folders
path "secrets/metadata/" {
 capabilities = ["list"]
}

# Show the root folder in the secrets hierarchy (needed so the folder appears in the UI)
path "secrets/metadata/shared/*" {
 capabilities = ["read", "list"]
}

# Allow access to manage secrets and versions but NOT delete the secret entirely, which is done through the metadata endpoint
path "secrets/data/shared/*" {
 capabilities = ["create", "read", "list", "update"]
}

# ==============================secrets Users================================
# Full Access on your own path
path "secrets/data/users/{{identity.entity.aliases.auth_ldap_68912064.name}}/*" {
 capabilities = ["create", "read", "list", "update", "delete"]
}

# Delete any version
path "secrets/metadata/users/{{identity.entity.aliases.auth_ldap_68912064.name}}/*" {
 capabilities = ["read", "list", "delete"]
}

# Create your own folder
path "secrets/data/users/{{identity.entity.aliases.auth_ldap_68912064.name}}/" {
 capabilities = ["create"]
}

# List the user folders
path "secrets/metadata/users" {
 capabilities = ["list"]
}

# ==============================Tokens=======================================
path "auth/token/create" {
 capabilities = ["create", "update"]
}

# Policy Read
path "sys/policy/vault-users" {
 capabilities = ["read", "list"]
}

path "sys/policies/acl/vault-users" {
 capabilities = ["read", "list"]
}
```

### Importing Policies into Vault

Import the policies into the new Vault namespace through the Web UI or the Command-Line Interface (CLI) with the following command:

```bash
vault policy write -namespace="<name_of_new_namespace>" policy-name policy.hcl
```

### Attaching Policies to AD Groups

Once the LDAP Authentication Backend and the base policies are set up in the new namespace, the created policies must be tied to AD groups. The following command demonstrates how to tie a policy together with an AD group. Notice that the command includes the default policy for allowing basic operations. AD group names can be enclosed in double-quotes, which is necessary when the group names contain special characters.

Note that each command adds the default policy to allow the most basic operations:

```bash
vault write auth/ldap/groups/myadmins policies=default,admins
vault write auth/ldap/groups/"my users" policies=default,users
```

## Chargeback Strategy Recommendation

At this point, there are no easy means for chargeback analytics. We recommend defining three different consumer classes based on department or team size or consumption and allocate a fixed cost per month or year. To increase the acceptance for chargeback, we recommend to highlight what these costs include, for example, version upgrades, backup, maintenance, and support.

<table>
  <tr>
   <td><strong>Consumer class</strong>
   </td>
   <td><strong>Fixed cost per month or year</strong>
   </td>
  </tr>
  <tr>
   <td>small
   </td>
   <td>A
   </td>
  </tr>
  <tr>
   <td>medium
   </td>
   <td>B
   </td>
  </tr>
  <tr>
   <td>large
   </td>
   <td>C
   </td>
  </tr>
</table>

## Day-2 Operations

This section outlines common day-2 scenarios.

### Vault paths are confused with file system folders

The isolated namespaces or "Vaults within a Vault” can be compared to file systems in some ways, but have important differences. Different file systems do not share permissions. Similarly, different Vault namespaces do not share ACLs. While file systems allow a hierarchical folder structure, Vault realizes structure path-based. The Vault path-based structure seems just like file system folders, but it is impossible to create an empty path in Vault. This is a misconception commonly assumed by users.

### Analysis with Central Logging Solution

The name of the namespace is part of the log entries. Defining filters for each namespace is valuable for quicker diagnosis.

- Analysis and diagnosis of separate namespaces requires filtering in the central logging solution
  - Prepare views of Vault logs filtering on namespace

### Permission from users-policy.hcl

The users-policy allows each user full access to their users/&lt;username> path (see section Writing base policies); however, as mentioned in the first sub-section, users cannot create their path like a file system folder. Instead, they have to write a secret within their path. For example, the users can create a secret with the path users/username/hello.

The shared/ path is meant for a department or team to share common secrets and therefore does not allow the delete operation. Only namespace administrators can delete secrets under the shared/ path.

- Users have full access to their users/&lt;username> path
- Users have limited access to the shared/ path. They cannot delete secrets here.
  - Vault Namespace administrators can delete secrets

### Deleting a namespace

The delete operation on a namespace deletes the namespace irrevocably with everything it entails, i.e., Authentication Backends, Secrets Engines, Policies, all paths and its secrets.

Ensure that the customer created a formal request for namespace deletion to establish a proper “audit” trail in the IT service or ticketing system.

To delete a namespace, log in as a root (“/”) namespace administrator and delete the namespace.

### KV versus KV2 Secrets Engine

There are two different versions of the Key/Value (KV) Secrets Engine; however, KV2 cannot be thought of as an updated, newer, better version of the KV “one” Secrets Engine, as they have different properties. First, the two KV versions are introduced. Then, a recommendation for KV2 is made.

#### **KV Version 1**

When running the KV secrets backend non-versioned, only the most recently written value for a key will be preserved. The benefits of non-versioned KV is a reduced storage size for each key, since no additional metadata or history is stored. Additionally, requests going to a backend configured this way will be more performant. This is because for any given request, there will be fewer storage calls and no locking.

#### **KV Version 2**

When running v2 of the KV backend, a key can retain a configurable number of versions. This defaults to 10 versions. The older versions' metadata and data can be retrieved.

When a version is deleted, the underlying data is not removed. Instead, it is marked as deleted. Deleted versions can be undeleted. To permanently remove a version's data, the destroy command or API endpoint can be used. Additionally, all versions and metadata for a key can be deleted by deleting on the metadata command or API endpoint. Each of these operations can be ACL'ed differently, restricting who has permissions to soft delete, undelete, or fully remove data.

#### **When to use KV2**

The KV2 Secrets Engine and its versioning capabilities reduce administrative burden because an older or accidentally overwritten secret can still be retrieved. In the case of KV Secrets Engine, this secret would be irrevocably overwritten. This versioning of secrets is most useful for teams that use the Web UI to write and read secrets.

**Note**: Due to its advanced properties, using KV2 needs to be reflected in the policies that provide permissions on paths related to the KV2 Secrets Engine (../data/.. and ../metadata/..). See the **users-policy.hcl** within the **Writing Base Policies** section.

### Detecting Root Token Login

This subsection shows example entries when the root token logs into Vault. The Root Token should be used for the initial setup of Vault and then revoked. As the Root Token cannot be directly attributed to an individual, even the audit log entries may not be sufficient to detect who actually used the Root Token.

Below is an example of a Root Token login as an audit entry:

```json
{
    "auth": {
        "accessor": "hmac-sha256:67869871d870282745682c729d86cee81acb5346c3dbecb573b7d44ea5506d06",
        "client_token": "hmac-sha256:8fe52f85c93aad7df87c7203f864a9900d25451a1cc88c486ae0c951bd3a8936",
        "display_name": "root",
        "policies": [
            "root"
        ],
        "token_policies": [
            "root"
        ],
        "token_type": "service"
    },
    "request": {
        "client_token": "hmac-sha256:8fe52f85c93aad7df87c7203f864a9900d25451a1cc88c486ae0c951bd3a8936",
        "client_token_accessor": "hmac-sha256:67869871d870282745682c729d86cee81acb5346c3dbecb573b7d44ea5506d06",
        "id": "3ab2651a-899b-0a98-c626-73c405d89d02",
        "namespace": {
            "id": "root"
        },
        "operation": "read",
        "path": "auth/token/lookup-self",
        "remote_address": "10.0.0.70"
    },
    "response": {
        "data": {
            "accessor": "hmac-sha256:67869871d870282745682c729d86cee81acb5346c3dbecb573b7d44ea5506d06",
            "creation_time": 1576768685,
            "creation_ttl": 0,
            "display_name": "hmac-sha256:6b89bf27681e54af63afe4a0b936bbf618f8d9b17bcc68df8c11470f7328d745",
            "entity_id": "hmac-sha256:de212e047ea6043f736d83549f3dae8612c688af0d5a6b4d19a262473c5b8bea",
            "expire_time": null,
            "explicit_max_ttl": 0,
            "id": "hmac-sha256:8fe52f85c93aad7df87c7203f864a9900d25451a1cc88c486ae0c951bd3a8936",
            "meta": null,
            "num_uses": 0,
            "orphan": true,
            "path": "hmac-sha256:20039952cb073210bc9cb0fa1dc3dec3e49bcd8a72b5dd2a9f9ce415010c91a0",
            "policies": [
                "hmac-sha256:6b89bf27681e54af63afe4a0b936bbf618f8d9b17bcc68df8c11470f7328d745"
            ],
            "ttl": 0,
            "type": "hmac-sha256:05148f41a98c981f657d9a0cb0b647e1f32a764719da2e75f27a497485eb9b7a"
        }
    },
    "time": "2020-01-31T13:14:37.132982729Z",
    "type": "response"
}
```

Notice that the above audit entry in JSON formatting includes the remote_address field. This field shows the IP address of the client accessing Vault, but may not be sufficient to identify the individual.

Based on a combination of **auth.display_name, auth.policies, auth.token_policies, request.path, and type**, a search string can be created to filter within the Central Logging Solution.

### Education, Training, and Documentation

Initially, teams will rely on the Vault technology team to fill knowledge and operational gaps. You can reduce this reliance by focusing on:

- Education
- Training
- Documentation of
  - Standards and conventions
  - Templates
  - Processes

In-person or remote sessions to walk the customer through how Vault operates and explain its basic concepts goes a long way. Furthermore, it has proven valuable to provide brief video tutorials for explaining fundamental Vault concepts. Videos allow the customer to asynchronously consume the information and come back at their convenience.
