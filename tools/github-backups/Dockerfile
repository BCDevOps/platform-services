FROM registry.access.redhat.com/ubi8/ubi-init
RUN yum -y update && yum -y install bind-utils git jq mailx nmap-ncat postfix python38-pip rsync unzip && pip3 install github-backup && mkdir /scripts /backups
RUN curl "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /usr/local/bin/mc && chmod +x /usr/local/bin/mc
RUN curl "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz" -o oc.tar.gz && tar xzf oc.tar.gz && mv oc /usr/local/bin && chmod +x /usr/local/bin/oc && rm oc.tar.gz
COPY tools/github-backups/scripts/* /scripts/
