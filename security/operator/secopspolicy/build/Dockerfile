FROM quay.io/operator-framework/ansible-operator:v0.8.1

USER 0

ARG OPERATOR_SDK_VERSION=0.8.1
ARG ANSIBLE_VERSION=2.7.10
ARG APORETO_CLI_VERSION=3.9.2
ARG AQUA_CLI_VERSION=1.0.b119
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

RUN yes | yum update && \
    yum clean all -y && \
    rm -rf /var/cache/yum

RUN curl -sL https://download.aporeto.com/releases/release-${APORETO_CLI_VERSION}/apoctl/linux/apoctl \
    -o /usr/local/bin/apoctl && \
    chmod 755 /usr/local/bin/apoctl

RUN curl -sL https://get.aquasec.com/aquactl/stable/aquactl \
    -o /usr/local/bin/aquactl && \
    chmod 755 /usr/local/bin/aquactl

USER 1001

COPY watches.yaml ${HOME}/watches.yaml
COPY roles/ ${HOME}/roles/
COPY playbook.yml ${HOME}/playbook.yml
