
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
   Average Time: 289ms
➜  latency-test git:(latency-test) ✗ 
```

You do not need to keep the *.dat files in the `test` directory.
