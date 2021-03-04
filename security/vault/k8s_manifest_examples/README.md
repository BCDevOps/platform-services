# Examples of Kubernetes manifests

This directory outlines examples for specific Vault use cases.

- OpenShift route with reencrypt
- CronJob to run the Vault backup

## OpenShift route with reencrypt

This will be implemented in the initial Vault deployment code. The YAML file here serves as an example.

Inside the `spec:` change these sections accordingly.

The `host:` line specifies the fully qualified domain name for the OpenShift route.

The `caCertificate:` is the CA certificate that issued the external certificate (Entrust CA).

The `certificate:` and `key:` sections are for the externally reachable part of the OpenShift route
issued by a public certificate authority (CA).

The `destinationCACertificate:` section is the manually self-created CA (e.g., created with `consul` binary) that signs the server
certificates used by the Vault pods.

```yaml
...
spec:
  host: <Insert_FQDN>
  port:
    targetPort: 8200
...
  tls:
    termination: reencrypt
    insecureEdgeTerminationPolicy: Redirect
    caCertificate: |-
      -----BEGIN CERTIFICATE-----
      -----END CERTIFICATE-----
    certificate: |-
      -----BEGIN CERTIFICATE-----
      -----END CERTIFICATE-----
    key: |-
      -----BEGIN RSA PRIVATE KEY-----
      -----END RSA PRIVATE KEY-----
    destinationCACertificate: |-
      -----BEGIN CERTIFICATE-----
      -----END CERTIFICATE-----
  to:
    kind: Service
    name: vault-active
    weight: 100
  wildcardPolicy: None
...
```

## CronJob

The CronJob runs with the OpenSource Vault container image pulled from the Docker registry.

It is scheduled to run every 30 minutes.
