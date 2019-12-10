# Deleting operator

Find all existing CR's
`oc get <cr plural> --all-namespaces`

then delete all the CRs.

Delete the cluster role(s) associated with the CRD
1. delete any clusterrolebinding of role(s)
2. delete clusterrole(s)

Delete operator deployment

Delete CRD

Delete deploymentconfig utility-pod
