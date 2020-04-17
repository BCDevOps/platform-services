FROM        quay.io/operator-framework/ansible-operator:v0.15.2

# Upgrade ansible version:
USER        1001
RUN         pip3 --version
RUN         ansible --version
# RUN         pip3 install --user --ignore-installed ansible==2.9.6

USER        0
WORKDIR     /opt/
COPY        ansible/  .

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd

# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
