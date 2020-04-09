FROM        quay.io/operator-framework/ansible-operator:v0.16.0

# Upgrade ansible version:
USER        1001
RUN         pip3 install --user --upgrade pip3
RUN         pip3 install --user --ignore-installed ansible==2.9.6
RUN         ansible --version

# Install openshift
RUN         pip3 install --user --ignore-installed openshift

# Need to source the script for env var to be available
ENTRYPOINT  ["echo 123"]
