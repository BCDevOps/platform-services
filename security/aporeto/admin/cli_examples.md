# CLI Examples
The `apoctl` commandline tool can be useful for interacting with the API via the CLI. This page provides some sample usage. 

- This example lists all Processing Units (PU's) that don't belong to a specific enforcer and specifies the table column output
```
$ apoctl api list pu -n /bcgov-devex/lab-test-ns --recursive --filter 'unreachable == true and enforcerID != 5d680e2a3561e0000189e853' -o table -c nativeContextID,name,namespace,operationalStatus,enforcementStatus,enforcerID



  enforcementStatus |        enforcerID        |                     name                     |                         namespace                         |           nativeContextID            | operationalStatus
--------------------+--------------------------+----------------------------------------------+-----------------------------------------------------------+--------------------------------------+--------------------
  Active            | 5d680dd03561e0000189e836 | enforcerd-dz9tr                              | /bcgov-devex/lab-test-ns                                  | cd3fe2ca313b                         | Running
  Active            | 5d680e283561e0000189e852 | enforcerd-pgn76                              | /bcgov-devex/lab-test-ns                                  | d4683b9f39d6                         | Running
  Active            | 5d680dcf9b26e20001755fba | enforcerd-x57bp                              | /bcgov-devex/lab-test-ns                                  | c926e03f36b3                         | Running
  Active            | 5d680e2a9b26e20001755fe0 | enforcerd-xdr6l                              | /bcgov-devex/lab-test-ns                                  | 991e12c5ee47                         | Running
  Active            | 5d680dcf9b26e20001755fba | ark-b6f684f55-wxmgg                          | /bcgov-devex/lab-test-ns/advsol-ark                       | de8d006d0d58                         | Running
  Active            | 5d680dcf9b26e20001755fba | minio-1-6rm4h                                | /bcgov-devex/lab-test-ns/advsol-ark                       | 4f590c25cd47                         | Running
  Inactive          | 5d680e283561e0000189e852 | cronjob-registry-soft-prune-1567108800-wbj5n | /bcgov-devex/lab-test-ns/advsol-ops                       | 99c749e1-ca97-11e9-9387-00505683394a | Stopped
  Active            | 5d680dcf9b26e20001755fba | jenkins-2-pkxwk                              | /bcgov-devex/lab-test-ns/advsol-ops                       | 952eeb8f1c70                         | Running
  Active            | 5d680e2a9b26e20001755fe0 | patroni-001-0                                | /bcgov-devex/lab-test-ns/cailey-dev                       | 49b16e149e4d                         | Running
  Active            | 5d680e283561e0000189e852 | docker-registry-634-2zhwj                    | /bcgov-devex/lab-test-ns/default                          | 3e25b352b4a1                         | Running
  Active            | 5d680dd03561e0000189e836 | docker-registry-634-44thk                    | /bcgov-devex/lab-test-ns/default                          | 1a076f74f134                         | Running
  ```