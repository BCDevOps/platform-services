FROM        quay.io/operator-framework/ansible-operator:v0.8.1

# Upgrade ansible version:
USER        1001
RUN         pip install --user --upgrade pip
RUN         pip install --user --ignore-installed ansible==2.8.3
RUN         ansible --version

# Install openshift
RUN         pip install --user --ignore-installed openshift

# Install webhook
ENV         WEBHOOK_VERSION 2.6.9
USER        0
WORKDIR     /opt/
RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar -xzf webhook.tar.gz --strip 1 && \
            chmod +x webhook 

COPY        ansible/  .

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd 

VOLUME      ["/etc/webhook"]
EXPOSE      9000
# Need to source the script for env var to be available
ENTRYPOINT  ["echo 123"]
