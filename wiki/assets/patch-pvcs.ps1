write-host **************************************************************************************
write-host To change storage classes on the PVs, we need to run oc patch with inline input.
write-host Due to escaping that is needed, the below commands need to be run from powershell.
write-host Reserve 10 pv0010 to pv0019 to gluster-file-db
pause
for ($i=10; $i -le 19; $i++) {oc patch "pv/pv00$i" -p "{\`"spec\`":{\`"storageClassName\`": \`"gluster-file-db\`"}}"}

write-host **************************************************************************************
write-host Reserve 10 pv0020 to pv0029 to gluster-block
pause
for ($i=20; $i -le 29; $i++) {oc patch "pv/pv00$i" -p "{\`"spec\`":{\`"storageClassName\`": \`"gluster-block\`"}}"}

write-host **************************************************************************************
write-host Reserve 10 pv0030 to pv0039 to gluster-file
pause
for ($i=30; $i -le 39; $i++) {oc patch "pv/pv00$i" -p "{\`"spec\`":{\`"storageClassName\`": \`"gluster-file\`"}}"}

write-host **************************************************************************************
write-host scrub from within minishift ssh. Run this from Powershell.
pause
for ($i=20; $i -le 29; $i++)
{
    minishift ssh -- rm -rf /var/lib/minishift/base/openshift.local.pv/pv00$i/*
    oc get pv/pv00$i -o json | jq "del(.spec.claimRef)" | oc replace -f -
}