FROM alpine:latest

ENV OPERATOR_SDK_VERSION 0.8.1
ENV APORETO_CLI_VERSION 3.9.2
ENV AQUA_CLI_VERSION 1.0.b119
ENV ANSIBLE_VERSION 2.6.0
ENV ANSIBLE_RUNNER_VERSION 1.1.0
ENV ANSIBLE_RUNNER_HTTP_VERSION 1.0.0
ENV KUBECTL_VERSION v1.11.10
ENV OPERATOR_SDK_VERSION v0.8.1
ENV KEY_ID 0CF50BEE7E4DF6445E08C0EA9AFDE59E90D2B445

RUN apk update && \
    apk upgrade && \
    apk --update add --virtual devpkgs gcc musl-dev \
        libffi-dev openssl-dev python-dev && \
    apk add --no-cache ca-certificates bash openssh-client openssh-keygen git gnupg curl \
        tar sshpass python py-boto py-dateutil py-httplib2 py-jinja2 py-paramiko py-pip py-yaml docker && \
    pip install --upgrade pip python-keyczar docker-py \
        ansible==${ANSIBLE_VERSION} \
        ansible-runner==${ANSIBLE_RUNNER_VERSION} \
        ansible-runner-http==${ANSIBLE_RUNNER_HTTP_VERSION} && \
    mkdir -p /etc/ansible /ansible && \
    echo "[local]" >> /etc/ansible/hosts && \
    echo "localhost" >> /etc/ansible/hosts && \
    apk del devpkgs && \
    rm -rf /var/cache/apk/*

RUN cd /tmp && \
    gpg --keyserver keyserver.ubuntu.com --recv-key $KEY_ID && \
    curl -OJL https://github.com/operator-framework/operator-sdk/releases/download/${OPERATOR_SDK_VERSION}/operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu && \
    curl -OJL https://github.com/operator-framework/operator-sdk/releases/download/${OPERATOR_SDK_VERSION}/operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu.asc && \
    gpg --verify operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu.asc && \
    chmod +x operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu && \
    cp operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu /usr/local/bin/operator-sdk && \
    rm operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu && \
    rm operator-sdk-${OPERATOR_SDK_VERSION}-x86_64-linux-gnu.asc && \
    mkdir -p /operator && \
    mkdir -p /opt/ansible

RUN cd /tmp && \
    curl -LO https://storage.googleapis.com/kubernetes-release/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl && \
    chmod +x ./kubectl && \
    mv ./kubectl /usr/local/bin/kubectl

RUN curl -sL https://download.aporeto.com/releases/release-${APORETO_CLI_VERSION}/apoctl/linux/apoctl \
    -o /usr/local/bin/apoctl && \
    chmod 755 /usr/local/bin/apoctl

RUN curl -sL https://get.aquasec.com/aquactl/stable/aquactl \
    -o /usr/local/bin/aquactl && \
    chmod 755 /usr/local/bin/aquactl

ENV ANSIBLE_GATHERING smart
ENV ANSIBLE_HOST_KEY_CHECKING false
ENV ANSIBLE_RETRY_FILES_ENABLED false
ENV ANSIBLE_ROLES_PATH /ansible/playbooks/roles
ENV ANSIBLE_SSH_PIPELINING True
ENV PYTHONPATH /ansible/lib
ENV PATH /ansible/bin:$PATH
ENV ANSIBLE_LIBRARY /ansible/library
 
# WORKDIR /ansible/playbooks
WORKDIR /operator

ENTRYPOINT ["bash"]
