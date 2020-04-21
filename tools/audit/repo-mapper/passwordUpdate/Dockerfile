FROM caddy/caddy:alpine

USER        1001
WORKDIR     /opt/
# install curl 
RUN apk --no-cache add curl
# install oc cli tools
RUN         curl -L --silent -o oc.tar.gz https://github.com/openshift/origin/releases/download/${OC_VERSION}/${OC_RELEASE}.tar.gz && \
            tar -xzf oc.tar.gz --strip 1 && \
            chmod +x oc && \
            mv oc /usr/bin/

COPY . .

ENTRYPOINT  ["./entrypoint.sh"]