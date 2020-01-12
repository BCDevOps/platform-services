FROM quay.io/operator-framework/ansible-operator:v0.13.0


USER 1001

COPY watches.yaml ${HOME}/watches.yaml

COPY roles/ ${HOME}/roles/
COPY *.yml ${HOME}/

