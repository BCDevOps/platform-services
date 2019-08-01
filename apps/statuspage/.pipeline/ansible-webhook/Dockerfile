FROM        quay.io/operator-framework/ansible-operator:v0.8.1
ENV         WEBHOOK_VERSION 2.6.9
USER        0
WORKDIR     /opt/

## Install necessary tools
RUN         yum install -y git

## Install webhook
RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar -xzf webhook.tar.gz --strip 1 && \
            chmod +x webhook 

COPY        scripts/  .

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd 

VOLUME      ["/etc/webhook"]
EXPOSE      9000
ENTRYPOINT  ["./entrypoint.sh"]