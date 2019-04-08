
## Deployment Steps
- Create daemonset
```
kubectl create -f aporeto-daemonset.yml
```

- Label all nodes
```
oc label nodes --all=true aporeto-enforcer=true
```

- Verify
```
 oc get daemonset
NAME               DESIRED   CURRENT   READY     UP-TO-DATE   AVAILABLE   NODE SELECTOR           AGE
aporeto-enforcer   12        12        12        12           12          aporeto-enforcer=true   66d
```