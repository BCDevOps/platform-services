# Examples of Kubernetes manifests

This directory outlines examples for specific Vault use cases.

- OpenShift route with reencrypt
- CronJob to run the Vault backup

## OpenShift route with reencrypt

This will be implemented in the initial Vault deployment code. The YAML file here serves as an example.

Inside the `spec:` change these sections accordingly.

The `host:` line specifies the fully qualified domain name for the OpenShift route.

The `certificate:` and `key:` sections are for the externally reachable part of the OpenShift route
issued by a public certificate authority (CA).

The `destinationCACertificate:` section is the manually self-created CA that signs the server
certificates used by the Vault pods.

```yaml
...
  host: <Insert_FQDN>
...
  tls:
    termination: reencrypt
    insecureEdgeTerminationPolicy: Redirect
    certificate: |-
      -----BEGIN CERTIFICATE-----
      -----END CERTIFICATE-----
    key: |-
      -----BEGIN RSA PRIVATE KEY-----
      -----END RSA PRIVATE KEY-----
    destinationCACertificate: |-
      -----BEGIN CERTIFICATE-----
      -----END CERTIFICATE-----
...
```

## CronJob

The CronJob runs with the OpenSource Vault container image pulled from the Docker registry.

It is scheduled to run every 30 minutes.
