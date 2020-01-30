FROM quay.io/operator-framework/ansible-operator:v0.15.0

USER 0

ENV OC_FILE openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit
RUN curl -L -o ${OC_FILE}.tar.gz https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz \
  && tar xzvf ${OC_FILE}.tar.gz \
  && mv ${OC_FILE}/oc /usr/local/bin/ \
  && mv ${OC_FILE}/kubectl /usr/local/bin/ \
  && rm -rf ${OC_FILE}.tar.gz ${OC_FILE}

RUN yum -y update \
  && yum -y install git \
  && yum clean all \
  && rm -rf /var/cache/yum

COPY entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh \
  && chgrp 0 /usr/local/bin/entrypoint.sh

COPY oclogin /usr/local/bin/
RUN chmod 755 /usr/local/bin/oclogin \
  && chgrp 0 /usr/local/bin/oclogin

RUN chgrp -R 0 /opt \
  && chmod -R g+rwX /opt

WORKDIR /opt/

VOLUME [ "/opt" ]
ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
# CMD [ "sleep", "infinity"]
