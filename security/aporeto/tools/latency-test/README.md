# TL;DR

## The Plan

To run this test setup the Hipster Store with the quick-start network security policy in place. For lab testing, make sure the `loadgenerator` and `frontend` pods are on different nodes. 

Copy the test script in place:

```console
oc rsync test $(oc get pods -o name| grep loadgenerator):/tmp
```

Open a remote shell on the `loadgenerator` pod:

```console
oc rsh $(oc get pods -o name| grep loadgenerator)
```

The test has a 1sec delay between calls to the `frontend`. In the following example 1200 iterations will take approximatly 20min.

```console
cd /tmp/test && ./run.sh 1200 && exit
```

Fetch the results for processing
```console
oc rsync $(oc get pods -o name| grep loadgenerator):/tmp/test/ test
```

Analyse the results:

```
➜  latency-test git:(latency-test) ✗ node analize.js 
Reporting On loadgenerator-6b4664dd7-7q8kx.dat
    Sample Size: 1000
       Min Time: 18ms
       Max Time: 2791ms
    Median Time: 258ms
      Mean Time: 289ms
➜  latency-test git:(latency-test) ✗ 
```

You do not need to keep the *.dat files in the `test` directory.

## The Results - 2020-01-14

This test was run in the OCP 3.11 lab environment on 2020-01-14. We deployed the sample Hipster Store application to a test namespace and ensured that the `loadgenerator` component was on a different node to the front end; Due to server capacity, all of the store components started on `ociopf-t-322.dmz`.

Before starting the test we made sure all the all the components had one pod running in the READY state and they were on the appropriate node.

|NAME                                     |READY   |IP              |NODE            |
|:----------------------------------------|:-------|:---------------|:---------------|
|adservice-655ccdfc9-4pdlg                |1/1     |10.131.23.212   |ociopf-t-322.dmz|
|cartservice-698d86d5b4-rfjf8             |1/1     |10.131.23.203   |ociopf-t-322.dmz|
|checkoutservice-7c6d6f5c79-n8q9k         |1/1     |10.131.23.202   |ociopf-t-322.dmz|
|currencyservice-6bc7895789-c4ckt         |1/1     |10.131.23.205   |ociopf-t-322.dmz|
|emailservice-64cb7dccdc-lhrpn            |1/1     |10.131.23.201   |ociopf-t-322.dmz|
|frontend-794f4f65c9-knw9r                |1/1     |10.131.23.206   |ociopf-t-322.dmz|
|loadgenerator-56b4974444-q5hls           |1/1     |10.131.22.177   |ociopf-t-321.dmz|
|paymentservice-58565cc5d7-m6s7m          |1/1     |10.131.23.207   |ociopf-t-322.dmz|
|productcatalogservice-66596db955-zrrgb   |1/1     |10.131.23.209   |ociopf-t-322.dmz|
|recommendationservice-5585758bb7-n8wcs   |1/1     |10.131.23.204   |ociopf-t-322.dmz|
|redis-cart-fc9dfd764-rt8zl               |1/1     |10.131.23.210   |ociopf-t-322.dmz|
|shippingservice-75756bfd9f-n6wbn         |1/1     |10.131.23.208   |ociopf-t-322.dmz|

### Run 1: Enforcer on ociopf-t-321.dmz is down

Reporting On loadgenerator-56b4974444-q5hls-191213.dat
    Sample Size: 1200
       Min Time: 21ms
       Max Time: 2173ms
    Median Time: 161ms
      Mean Time: 175ms
 Std. Dev. Time: 190ms

### Run 2: Enforcer on ociopf-t-322.dmz is down

Reporting On loadgenerator-56b4974444-q5hls-202610.dat
    Sample Size: 1200
       Min Time: 20ms
       Max Time: 2696ms
    Median Time: 154ms
      Mean Time: 168ms
 Std. Dev. Time: 199ms

### Run 3: All enforcers up

Reporting On loadgenerator-56b4974444-q5hls-213151.dat
    Sample Size: 1200
       Min Time: 22ms
       Max Time: 2451ms
    Median Time: 160ms
      Mean Time: 181ms
 Std. Dev. Time: 202ms

### Run 4: All enforcers are down

Reporting On loadgenerator-56b4974444-q5hls-220309.dat
    Sample Size: 1200
       Min Time: 20ms
       Max Time: 1963ms
    Median Time: 154ms
      Mean Time: 161ms
 Std. Dev. Time: 167ms

### Conclusion

