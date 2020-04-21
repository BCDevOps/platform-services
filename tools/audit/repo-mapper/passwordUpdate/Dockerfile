FROM caddy/caddy:alpine

WORKDIR     /opt/
# install curl 
RUN apk --no-cache add curl
# install tar
RUN apk --no-cache add tar
# install gzip
RUN apk --no-cache add gzip
# install oc cli tools
RUN         curl -L --silent -o oc.tar.gz https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz && \
            tar -xzf oc.tar.gz --strip 1 && \
            cp oc /usr/bin/ && \
            chmod +x oc

RUN         cp oc /usr/bin/

COPY . .

ENTRYPOINT  ["./entrypoint.sh"]