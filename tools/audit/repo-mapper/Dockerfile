FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip3 --version
RUN         ansible --version
# RUN         pip3 install --user --ignore-installed ansible==2.9.6

# test out oc command:
# specify the version string of the oc release
ENV OC_VERSION "v3.11.0"
ENV OC_RELEASE "openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit"
USER        0
WORKDIR     /opt/
# install the oc client tools
RUN         curl -L --silent -o /opt/oc/release.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar --strip-components=1 -xzvf  /opt/oc/release.tar.gz -C /opt/oc/ && \
            mv /opt/oc/oc /usr/bin/ && \
            rm -rf /opt/oc

# copy playbook
COPY        ansible/  .

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd

# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
