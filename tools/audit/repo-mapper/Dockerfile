FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip3 --version
RUN         ansible --version
# RUN         pip3 install --user --ignore-installed ansible==2.9.6

# install oc to test service account
# TODO: remove
RUN \
    set -x && \
    microdnf install vim tar unzip which curl rsync procps git findutils httpd-tools && \
    curl -fsSL https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz | \
    tar -xvz --file=- --strip-components=1 --directory=/usr/local/bin --no-selinux --wildcards '*/oc'  --wildcards '*/kubectl' && \
    ln -s /usr/bin/vim /usr/bin/vi && \
    microdnf clean all


USER        0
WORKDIR     /opt/
COPY        ansible/  .

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd

# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
