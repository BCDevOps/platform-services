FROM        quay.io/operator-framework/ansible-operator:v0.8.1
ENV         WEBHOOK_VERSION=2.6.9
ENV         OC_URL=https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz

USER        0
WORKDIR     /opt/

## Install necessary tools
RUN         yum install -y git

## Install Grafyaml from source (latest pip version doesn't have all the features we need)
ADD         requirements.txt . 
RUN         pip install -r requirements.txt
RUN         git clone https://opendev.org/opendev/grafyaml.git \
            && cd grafyaml \
            && ./setup.py build \ 
            && ./setup.py install
ADD         ${OC_URL} .
RUN         tar -xvzf openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz --strip-components=1 \
            && mv oc /usr/local/bin/oc

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