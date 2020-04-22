FROM caddy/caddy:alpine

WORKDIR     /opt/
# install curl 
RUN apk --no-cache add curl
# install tar
RUN apk --no-cache add tar
# install gzip
RUN apk --no-cache add gzip
ENV         OC_VERSION v3.11.0
ENV         OC_RELEASE openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit
USER        0
# install the oc client tools
RUN         curl -L --silent -o oc.tar.gz https://github.com/openshift/origin/releases/download/${OC_VERSION}/${OC_RELEASE}.tar.gz && \
            tar -xzf oc.tar.gz --strip 1 && \
            chmod +x oc && \
            mv oc /usr/bin/
# install oc cli tools
RUN         curl -L --silent -o oc.tar.gz https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz && \
            tar -xzf oc.tar.gz --strip 1 && \
            cp oc /usr/bin/ && \
            chmod +x oc

RUN         cp oc /usr/bin/

COPY ./entrypoint.sh .

CMD  ["/bin/sh", "./entrypoint.sh"]