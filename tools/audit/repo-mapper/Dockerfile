FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip3 --version
# RUN         pip3 install --user --ignore-installed ansible==2.9.6
RUN         ansible --version

# Install openshift
# RUN         pip3 install --user --ignore-installed openshift

COPY        ansible/  .

# # Make Ansible happy with arbitrary UID/GID in OpenShift.
# RUN         chmod g=u /etc/passwd /etc/group
# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd

# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
