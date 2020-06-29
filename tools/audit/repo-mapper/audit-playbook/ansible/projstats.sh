rm $OUTPUT_PATH/project-stats.csv;
echo "sep=;" >> $OUTPUT_PATH/project-stats.csv
echo "\"Namespace\";\"Display Name\";\"Product Lead\";\"Product Owner\";\"Environment\";\"Product\";\"Project Type\";\"Team\";\"CPU Usage\";\"CPU Requests\";\"CPU Limits\";\"CPU Requests %\";\"CPU Limits %\"" >> $OUTPUT_PATH/project-stats.csv
# for NS in $(oc get -o=custom-columns=NAME:.metadata.name --no-headers projects); do
for NS in $(oc get -o=custom-columns=NAME:.metadata.name --no-headers projects -l name=devhub); do
  NS_DATA=$(oc get ns -o json "${NS}")
  DISPLAY_NAME=$(echo "${NS_DATA}" | ./jq -r '.metadata.annotations."openshift.io/display-name"')
  PRODUCT_LEAD=$(echo "${NS_DATA}" | ./jq -r '.metadata.annotations."product-lead"')
  PRODUCT_OWNER=$(echo "${NS_DATA}" | ./jq -r '.metadata.annotations."product-owner"')
  NS_ENVIRONMENT=$(echo "${NS_DATA}" | ./jq -r '.metadata.labels.environment')
  PRODUCT=$(echo "${NS_DATA}" | ./jq -r '.metadata.labels.product')
  PROJECT_TYPE=$(echo "${NS_DATA}" | ./jq -r '.metadata.labels.project_type')
  TEAM=$(echo "${NS_DATA}" | ./jq -r '.metadata.labels.team')
  CPU_USAGE=$(curl -sk -H "Authorization: Bearer $(oc -n devhub-tools sa get-token cluster-view-sa)" "https://prometheus-k8s-openshift-monitoring.pathfinder.gov.bc.ca/api/v1/query?query=sum%20by(namespace)%20(label_replace(label_replace(rate(container_cpu_usage_seconds_total%7Bnamespace%3D%22${NS}%22%7D%5B5m%5D)%2C%22pod%22%2C%22%241%22%2C%22pod_name%22%2C%22(.*)%22)%2C%20%22container%22%2C%20%22%241%22%2C%20%22container_name%22%2C%20%22(.*)%22)%20*%20ON(namespace%2Cpod%2Ccontainer%2Cnode)%20group_left()%20kube_pod_container_status_running%20*%20ON(namespace%2Cpod)%20group_left(node)%20kube_pod_info%20*%20ON(node)%20group_left()%20count(kube_node_labels%7Blabel_region%3D%22app%22%7D)%20by%20(node))" | ./jq -r '.data.result[0].value[1]')
  CPU_REQUEST=$(curl -sk -H "Authorization: Bearer $(oc -n devhub-tools sa get-token cluster-view-sa)" "https://prometheus-k8s-openshift-monitoring.pathfinder.gov.bc.ca/api/v1/query?query=sum(kube_pod_container_resource_requests_cpu_cores%7Bnamespace%3D%22${NS}%22%7D%20*%20ON(node)%20group_left()%20count(kube_node_labels%7Blabel_region%3D%22app%22%7D)%20by%20(node)%20*%20ON(namespace%2Cpod%2Ccontainer)%20kube_pod_container_status_running%20%3E%200)%20by%20(namespace)" | ./jq -r '.data.result[0].value[1]')
  CPU_LIMITS=$(curl -sk -H "Authorization: Bearer $(oc -n devhub-tools sa get-token cluster-view-sa)" "https://prometheus-k8s-openshift-monitoring.pathfinder.gov.bc.ca/api/v1/query?query=sum(kube_pod_container_resource_limits_cpu_cores%7Bnamespace%3D%22${NS}%22%7D%20*%20ON(node)%20group_left()%20count(kube_node_labels%7Blabel_region%3D%22app%22%7D)%20by%20(node)%20*%20ON(namespace%2Cpod%2Ccontainer)%20kube_pod_container_status_running%20%3E%200)%20by%20(namespace)" | ./jq -r '.data.result[0].value[1]')

  # Echo data
  echo "\"${NS}\";\"${DISPLAY_NAME}\";\"${PRODUCT_LEAD}\";\"${PRODUCT_OWNER}\";\"${NS_ENVIRONMENT}\";\"${PRODUCT}\";\"${PROJECT_TYPE}\";\"${TEAM}\";\"${CPU_USAGE}\";\"${CPU_REQUEST}\";\"${CPU_LIMITS}\"" >> $OUTPUT_PATH/project-stats.csv
done
