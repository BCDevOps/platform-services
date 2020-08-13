FROM quay.io/operator-framework/ansible-operator:v1.0.0

USER 0

RUN curl -sL https://download.aporeto.com/apoctl/linux/apoctl \
  -o /usr/local/bin/apoctl && \
  chmod 755 /usr/local/bin/apoctl

USER 1001

COPY requirements.yml ${HOME}/requirements.yml
RUN ansible-galaxy collection install -r ${HOME}/requirements.yml \
 && chmod -R ug+rwx ${HOME}/.ansible

COPY watches.yaml ${HOME}/watches.yaml
COPY roles/ ${HOME}/roles/
COPY playbooks/ ${HOME}/playbooks/
