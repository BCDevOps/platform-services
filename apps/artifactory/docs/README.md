
# Artifact Repositories

- Description of on-prem artifact repositories, the why and what.

## Private Repositories

### Requesting

To request creation of a private repository, a request in the devops-requests channel needs to be made of the form:

''' yaml
Artifact Repository Request
Project Shortname: projectSet shortname (example: {shortname}-[tools|dev|test|prod])
Repository Type: [docker|maven|npm| ... ] (full list of supported repsitories TBD)
Repository Locator: [local|virtual]
Repository Description: "Descriptive information about repository"

[virtual only]
Repository List: "comma separated list of existing repositories to merge, must all be of same type"
'''

Once your repository has been provisioned, you will be given a service-account and Token that can be used to access your repository.  (better secret distribution TBD)

### Managing additional access for your repository:

To add additional named access to your repository, the user must already exist.  Once you have the username, the following curl command can add that user:

*TBD*

## Using Caching repositories
- Current Authentication model
no anonymous access as we do not lock down remote access to the repository by location, and the tool is meant for cluster use.

this means that in order to effectively use the caching repositories, a service account will be required.  This is currently created with a private repository.

## Merging Private repositories with caching repositories

to merge multiple repositories into a single virtual repository, you can request a private repository of type "virtual".
