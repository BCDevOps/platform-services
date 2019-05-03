FROM postgres:10
MAINTAINER Alexander Kukushkin <alexander.kukushkin@zalando.de>

ARG PGHOME=/home/postgres
ARG YUM_REPOS=rhel-7-server-rpms,rhel-7-server-optional-rpms,rhel-server-rhscl-7-rpms,rhel-7-server-extras-rpms
ARG VENV_DIR=$APP_ROOT/patroni

USER 0

RUN set -x && \
    #yum repolist all && \
    yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && \
    #yum "--enablerepo=$YUM_REPOS" list available && \
    yum "--enablerepo=$YUM_REPOS" install -y gettext curl jq locales hostname rh-git29 rh-python36 rh-python36-python-pip && \
    #scl enable rh-python36 'pip3 freeze' && \
    yum "--enablerepo=$YUM_REPOS" install -y rh-python36-python-wheel rh-python36-python-setuptools rh-postgresql10-postgresql-devel && \
    yum "--enablerepo=$YUM_REPOS" "--disablerepo=epel" --setopt=group_package_types=mandatory groupinstall -y "Development Tools" && \
    scl --list && \
    chgrp -R 0 /usr/local/bin && \
    chmod -R g=u /usr/local/bin && \
    scl --list && \
    source scl_source enable "rh-git29" "rh-python36" "rh-postgresql10" && \
    mkdir -p $VENV_DIR && \
    virtualenv $VENV_DIR && \
    $VENV_DIR/bin/pip --isolated --no-cache-dir install -U pipenv && \
    $VENV_DIR/bin/pip --isolated --no-cache-dir install -U 'requests==2.21.0' && \
    $VENV_DIR/bin/pip --isolated --no-cache-dir install 'patroni[kubernetes]==1.5.6' && \
    mkdir -p $APP_ROOT/bin && \
    ln -s $VENV_DIR/bin/patroni $APP_ROOT/bin/patroni && \
    ln -s $VENV_DIR/bin/patroni_wale_restore $APP_ROOT/bin/patroni_wale_restore && \
    ln -s $VENV_DIR/bin/patronictl $APP_ROOT/bin/patronictl && \
    $VENV_DIR/bin/pip --isolated freeze && \
    fix-permissions $APP_ROOT && \
    yum '--enablerepo=*' clean all

COPY contrib/root /

RUN chgrp -R 0 /usr/bin/run-* && \
    chmod -R g=u /usr/bin/run-*

EXPOSE 5432 8008
ENV LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
ENV ENABLED_COLLECTIONS="rh-postgresql10 rh-python36"
USER 26
CMD ["run-patroni"]