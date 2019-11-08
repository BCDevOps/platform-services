FROM registry.access.redhat.com/rhel7:latest

ARG GITHUB_ORG=BCDevOps
ARG APORETO_CLI_VERSION=3.9.2
ARG AQUA_CLI_VERSION=1.0.b119
ARG ANSIBLE_VERSION=2.6.0
ARG ANSIBLE_RUNNER_VERSION=1.1.0
ARG ANSIBLE_RUNNER_HTTP_VERSION=1.0.0
ENV SUMMARY="Ansible DevSecOps Utility Image"  \
    DESCRIPTION="Ansible DevSecOps image with Aporeto CLI v${APORETO_CLI_VERSION}, Aqua CLI v${AQUA_CLI_VERSION}, Ansible v${ANSIBLE_VERSION}"

LABEL summary="$SUMMARY" \
      description="$DESCRIPTION" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="devsecops-ansible.v${ANSIBLE_VERSION}" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="builder,azure,devops,Aporeto-v${APORETO_CLI_VERSION},Aqua-v${AQUA_CLI_VERSION},Ansible-v${ANSIBLE_VERSION}" \
      release="1"

ENV PATH=$HOME/.local/bin/:$PATH \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 

# We need to call 2 (!) yum commands before being able to enable repositories properly
# This is a workaround for https://bugzilla.redhat.com/show_bug.cgi?id=1479388
RUN yum repolist > /dev/null && \
    yum install -y yum-utils && \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    yum-config-manager --enable rhel-7-server-ose-3.11-rpms && \
    yum-config-manager --enable rhel-server-devtools-7-rpms && \
    INSTALL_PKGS="nss_wrapper libtool-ltdl httpd24-libcurl rh-git29 \
        scl-utils atomic-openshift-clients openssh python27 python27-python-pip \
        gcc openssl-devel python-devel" && \
    yum install -y --setopt=tsflags=nodocs $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS

RUN scl enable python27 bash

# Update environment variables

ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib:/opt/rh/httpd24/root/usr/lib64:/opt/rh/python27/root/usr/lib64 \
    PYTHONPATH=/usr/lib/python2.7/site-packages/:$PYTHONPATH \
    PATH=$PATH:/opt/rh/python27/root/usr/bin:/opt/rh/rh-git29/root/usr/bin:/opt/az/agent/bin:/usr/local/git/bin \
    HOME=/runner

# In OpenShift, container will run as a random uid number and gid 0. Make sure things
# are writeable by the root group.
RUN mkdir -p /runner/inventory /runner/project /runner/artifacts \
    /runner/.ansible/tmp /etc/ansible && \
	chmod -R g+w /runner && \
  chgrp -R root /runner && \
	chmod g+w /etc/passwd

# Install 3rd-party tools

RUN pip install --upgrade pip \
    ansible==${ANSIBLE_VERSION} \
    ansible-runner==${ANSIBLE_RUNNER_VERSION} \
    ansible-runner-http==${ANSIBLE_RUNNER_HTTP_VERSION} && \
    echo "[local]" >> /etc/ansible/hosts && \
    echo "localhost" >> /etc/ansible/hosts

RUN REMOVE_PKGS="gcc openssl-devel python-devel" && \
    yum remove -y $REMOVE_PKGS && \
    yum clean all -y && \
    rm -rf /var/cache/yum

RUN curl -sL https://download.aporeto.com/releases/release-${APORETO_CLI_VERSION}/apoctl/linux/apoctl \
    -o /usr/local/bin/apoctl && \
    chmod 755 /usr/local/bin/apoctl

RUN curl -sL https://get.aquasec.com/aquactl/stable/aquactl \
    -o /usr/local/bin/aquactl && \
    chmod 755 /usr/local/bin/aquactl

# Fetch playbook(s)

ADD entrypoint.sh .
ADD playbooks/ .
RUN cp playbooks/*.yml /runner



# RUN git clone https://github.com/${GITHUB_ORG}/platform-services.git \
#     --depth 1 \
#     --branch master \
#     --single-branch /tmp/platform-services && \
#     cp /tmp/platform-services/security/aporeto/scripts/*.yaml /runner && \
#     cp /tmp/platform-services/security/aporeto/scripts/openshift/entrypoint.sh /usr/local/bin/entrypoint.sh && \
#     rm -rf /tmp/platform-services

# Container Init

WORKDIR /runner

USER 1001

ENTRYPOINT ["/entrypoint.sh"]
