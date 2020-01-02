FROM quay.io/operator-framework/ansible-operator:v0.13.0

USER 0

ARG GITHUB_ORG=BCDevOps
ENV LC_ALL=

RUN yum install -y openssl

RUN curl -sL https://download.aporeto.com/apoctl/linux/apoctl \
    -o /usr/local/bin/apoctl && \
    chmod 755 /usr/local/bin/apoctl

RUN curl -sL https://get.aquasec.com/aquactl/stable/aquactl \
    -o /usr/local/bin/aquactl && \
    chmod 755 /usr/local/bin/aquactl


RUN chgrp -R 0 /opt/ansible && \
    chmod -R g=u /opt/ansible


USER 1001

COPY watches.yaml ${HOME}/watches.yaml
COPY templates/ ${HOME}/templates/
COPY roles/ ${HOME}/roles/
COPY *.yaml ${HOME}/