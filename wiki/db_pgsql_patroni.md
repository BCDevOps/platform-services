## Validating the cluster
The `patronictl` utility, in each image, can be used to validate the cluster status: 

```
postgres@patroni-persistent-2:/home/postgres$ patronictl  list
+--------------------+----------------------+---------------+--------+---------+-----------+
|      Cluster       |        Member        |      Host     |  Role  |  State  | Lag in MB |
+--------------------+----------------------+---------------+--------+---------+-----------+
| patroni-persistent | patroni-persistent-0 |  10.131.22.98 | Leader | running |         0 |
| patroni-persistent | patroni-persistent-1 |  10.131.23.45 |        | running |         0 |
| patroni-persistent | patroni-persistent-2 | 10.131.22.101 |        | running |         0 |
+--------------------+----------------------+---------------+--------+---------+-----------+
postgres@patroni-persistent-2:/home/postgres$
```