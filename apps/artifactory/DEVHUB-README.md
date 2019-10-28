# Using Artifactory

Artifactory can be found here: https://artifacts.developer.gov.bc.ca

Sign in with Keycloak.

## Notes About Logging in from the CLI/API

In order to use your personal credentials to log into the Artifactory API, you must have logged in via the GUI at least once first (in order to create your credentials through Keycloak).
You must go to your user profile and generate an API key to use. Your idir/github password will not work.

### NPM

You cannot login to Artifactory with
``` npm login ```
due to the use of the @ sign in usernames assigned by Keycloak.

As such, in order to use NPM, you must run the following command:
``` bash
curl --user <username>:<api_key> https://artifacts.pathfinder.gov.bc.ca/artifactory/api/npm/auth
```
Your username should be of the form user@idir or user@github. It will return three lines of information which you can then paste into your ~/.npmrc file to use instead of basic authentication.
