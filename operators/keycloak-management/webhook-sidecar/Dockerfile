# FROM        golang:alpine 
# ENV         WEBHOOK_VERSION 2.6.9
# RUN         apk add --update -t build-deps curl libc-dev gcc libgcc
# WORKDIR     /opt/
# RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
#             tar -xzf webhook.tar.gz --strip 1 && \
#             chmod +x webhook 

# VOLUME      ["/etc/webhook"]
# EXPOSE      9000
# ENTRYPOINT  ["./webhook"]

FROM        quay.io/operator-framework/ansible-operator:v0.8.1
ENV         WEBHOOK_VERSION 2.6.9
#RUN         apk add --update -t build-deps curl libc-dev gcc libgcc
USER        0
RUN         yum install -y curl
WORKDIR     /opt/
RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar -xzf webhook.tar.gz --strip 1 && \
            chmod +x webhook 

COPY        entrypoint.sh scripts/ .
COPY        hooks.json /etc/webhook/hooks.json		

# Set permissions for OpenShift
RUN chgrp -R 0 /opt && \
    chmod -R g+rwX /opt && \
    chmod 664 /etc/passwd 

VOLUME      ["/etc/webhook"]
EXPOSE      9000
ENTRYPOINT  ["./entrypoint.sh"]