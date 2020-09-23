FROM quay.io/operator-framework/ansible-operator:v0.19.0

COPY requirements.yml ${HOME}/requirements.yml
RUN ansible-galaxy collection install -r ${HOME}/requirements.yml \
 && chmod -R ug+rwx ${HOME}/.ansible

USER 1001
RUN pip3 install sdcclient sdccli==0.4.0 --user


COPY watches.yaml ${HOME}/watches.yaml

COPY roles/ ${HOME}/roles/
COPY *.yml ${HOME}/
