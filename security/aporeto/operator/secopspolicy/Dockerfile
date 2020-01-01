FROM quay.io/operator-framework/ansible-operator:v0.13

USER 0

ARG GITHUB_ORG=BCDevOps
ARG OPERATOR_SDK_VERSION=0.10.1
ARG ANSIBLE_VERSION=2.7.10
ENV SUMMARY="Operator Controller v${OPERATOR_VERSION}"  \
    DESCRIPTION="Operator Controller SDK v${OPERATOR_SDK_VERSION}, Ansible v${ANSIBLE_VERSION}"

LABEL summary="$SUMMARY" \
      description="$DESCRIPTION" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="operator-controller-v${OPERATOR_SDK_VERSION}" \
      io.openshift.expose-services="" \
      io.openshift.tags="operator,ansible,aporeto,aqua,secops,operator-sdk-v${OPERATOR_SDK_VERSION}" \
      release="1"

ENV PATH=$HOME/.local/bin/:$PATH \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 

# RUN yes | yum update && \
#     yes | yum install git && \
#     yum clean all -y && \
#     rm -rf /var/cache/yum

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