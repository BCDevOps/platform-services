# FROM image-registry.openshift-image-registry.svc:5000/openshift/cli
# Use this when building off cluster
FROM registry.redhat.io/openshift4/ose-cli:v4.5

LABEL maintainer="Shelly Han <Shelly.Han@gov.bc.ca>" \
      io.k8s.display-name="Cerberus Monitoring" \
      io.k8s.description="Cluster monitoring that serves a go/no-go signal for Uptime Robot."

# Copy entitlements
COPY ./etc-pki-entitlement /etc/pki/entitlement

# Copy subscription manager configurations
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

RUN INSTALL_PKGS="python36 python3-pip gcc python3-devel" && \
    # Initialize /etc/yum.repos.d/redhat.repo
    # See https://access.redhat.com/solutions/1443553
    rm /etc/rhsm-host && \
    yum repolist --disablerepo='*' && \
    # python3-devel is avaible from rhel-7-server-optional-rpms
    subscription-manager repos --enable "rhel-7-server-optional-rpms" && \
    yum install -y --setopt=tsflags=nodocs $INSTALL_PKGS && \
    yum -y clean all --enablerepo='*' && \
    rm -rf /var/cache/yum && \
    # Remove entitlements and Subscription Manager configs
    rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm

RUN pip3 install cerberus-client && \
    # # to get rid of the need for privileged user:
    mkdir /root/cerberus && \
    touch /root/cerberus/cerberus.report && \
    touch /root/cerberus/history && \
    chmod -R 775 /root/cerberus/cerberus.report && \
    chmod -R 775 /root/cerberus/history

USER 1001

WORKDIR /root/cerberus

ENTRYPOINT cerberus_client --config=config/config.yaml
