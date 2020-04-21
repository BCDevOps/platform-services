FROM caddy/caddy:alpine

WORKDIR     /opt/
# install curl 
RUN apk --no-cache add curl
# install tar
RUN apk --no-cache add tar
# install gzip
RUN apk --no-cache add gzip
# install oc cli tools
RUN curl -L --silent -o oc.tar.gz https://github.com/openshift/origin/releases/download/${OC_VERSION}/${OC_RELEASE}.tar.gz && \
  tar -xzf oc.tar.gz --strip 1 && \
  chmod +x oc && \
  mv oc /usr/bin/

COPY . .

ENTRYPOINT  ["./entrypoint.sh"]