FROM quay.io/operator-framework/ansible-operator:v0.19.0

ENV PATH="/opt/ansible/.local/bin:${PATH}"

USER 0 

RUN dnf remove -y python36
RUN dnf install -y python38


USER 1001
RUN pip3 install sdcclient sdccli --user


COPY watches.yaml ${HOME}/watches.yaml

COPY roles/ ${HOME}/roles/
COPY *.yml ${HOME}/
