FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip3 --version
# RUN         pip3 install --user --ignore-installed ansible==2.9.6
RUN         ansible --version

# Install openshift
# RUN         pip3 install --user --ignore-installed openshift

COPY        ansible/  .

# Need to source the script for env var to be available
ENTRYPOINT  ["echo 123"]
