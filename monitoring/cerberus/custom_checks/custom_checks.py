import logging
import subprocess
import httplib2
import cerberus.invoke.command as runcommand

# placeholder for global var
cluster_api_url = "https://10.98.0.1:443"

def check_nodes():
    logging.info("Check if Ready nodes are more than 80 percent of all nodes.")

    # get nodes
    total_node_count = subprocess.check_output("oc get nodes | wc -l", shell=True, universal_newlines=True)
    node_count = subprocess.check_output("oc get nodes | grep Ready | wc -l", shell=True, universal_newlines=True)

    up_ratio = int(node_count)/int(total_node_count)

    return True if up_ratio > 0.8 else False

def check_cluster_readyz():
    logging.info("Check cluster readyz endpoint.")

    # readyz state
    api_server_readyz_url = cluster_api_url.split(" ")[-1].strip() + "/readyz"
    (resp, content) = h.request(api_server_readyz_url, "GET")
    
    return True if "ok" in str(content) else False

def check_image_registry():
    logging.info("Check Image Registry API.")

    return True

def main():
    # set http client:
    global h
    h = httplib2.Http(disable_ssl_certificate_validation=True)

    # get cluster API url:
    global cluster_api_url
    cluster_api_url = runcommand.invoke("kubectl cluster-info | awk 'NR==1' | sed -r " "'s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g'")

    check1 = check_nodes()
    check2 = check_cluster_readyz()
    check3 = check_image_registry()

    return check1 & check2 & check3
