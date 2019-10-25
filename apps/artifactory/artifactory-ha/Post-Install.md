# Post Installation notes

## Account/Access

Test SAML auth provider (backed by keycloak) or look for a post-user-login hook to help sync group access to keycloak.

Team Provisioned accounts named: {projectSet}-{user} (re-use these 3 for all repos for projectSet/Team):

User:

- builder: puller (deployment tokens)
- deployer: artifact push/edit
- admin: access control (to allow other accts access)

Artifactory Admin to create CustomResource object as needed, and then once provisioned accounts have been created (with associated secrets) will need to export/import the secrets from the artifactory namespace to the {projectSet}-tools namespace.

### Developer Setup

1. developer logs in via oauth login and has an account created.
2. request devops lead to use admin token to provision access to repos
3. developer creates token access for their account

## Repositories

Create external "cache" repositories to offer a pull-through target
Create local repositories by request (of form: {team/projectSet}-{env}-{repoType}-local where {env} is optional?)
Create virtual repositories by request (of form {team/projectSet}-{env}-{repoType}-virt when provided list of repos)

### List of cached repos from clecio:
maven:

- https://maven.atlassian.com/repository/public/
- http://repo.boundlessgeo.com/main/
- http://maven.geo-solutions.it/
- http://jasperreports.sourceforge.net/maven2
- http://jaspersoft.artifactoryonline.com/jaspersoft/jr-ce-releases/
- http://jaspersoft.artifactoryonline.com/jaspersoft/jrs-ce-releases/
- https://jaspersoft.artifactoryonline.com/jaspersoft/third-party-ce-artifacts/
- http://jcenter.bintray.com
- https://jfrog.bintray.com/artifactory/
- https://maven.oracle.com
- http://download.osgeo.org/webdav/geotools/
- http://repository.primefaces.org
- http://repo.jenkins-ci.org/public
- http://repo.jenkins-ci.org/releases
- https://repo1.maven.org/maven2
- http://mvn.vividsolutions.com/artifactory/repo
- http://maven-repository.windward.net/artifactory/libs-release

NPM:

- https://registry.npmjs.org

Generic:

- https://www.python.org
- https://updates.jenkins.io/download/
