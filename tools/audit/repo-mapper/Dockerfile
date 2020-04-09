FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip install --user --upgrade pip
# RUN         pip3 install --user --upgrade pip3
RUN         pip install --user --ignore-installed ansible==2.9.6
RUN         ansible --version

# Install openshift
RUN         pip install --user --ignore-installed openshift

# Need to source the script for env var to be available
ENTRYPOINT  ["echo 123"]
