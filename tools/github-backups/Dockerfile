FROM registry.access.redhat.com/ubi8/ubi
RUN yum -y update && yum -y install git jq nmap-ncat python38-pip unzip && pip3 install github-backup && mkdir /scripts /backups
RUN curl "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /usr/local/bin/mc && chmod +x /usr/local/bin/mc
COPY scripts/* /scripts/
