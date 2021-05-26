#!/bin/sh
#
# github_backup.sh
#
# Back up GitHub repositories and copy them to an S3 bucket.
# * repos to back up are defined in a ConfigMap
# * S3 creds are in a Secret
# ----------------------------------------------------------

BUCKET=github-backup
BASEDIR=/backups

DATE=`date "+%Y-%m-%d"`
LOGDIR="${BASEDIR}/logs"
LOGFILE="${LOGDIR}/github_backup_${DATE}"
ARCHIVE_DIR="${BASEDIR}/archive"
BACKUP_DIR="${BASEDIR}/owners"

# Process any command line arguments
#   -i	Incremental backup
#   -d	Dry run - do not do backup or copy to S3
# ----------------------------------------------
while getopts id arg; do
  case "$arg" in
    i) INCREMENTAL="--incremental";;
    d) DRYRUN="true";;
    *) INCREMENTAL=""
       DRYRUN=""
       ;;
  esac
done

# Ensure that our directories exist
# ---------------------------------
if [ ! -d $ARCHIVE_DIR ]; then mkdir -p $ARCHIVE_DIR; fi
if [ ! -d $LOGDIR ]; then mkdir -p $LOGDIR; fi

# Read the repo list and S3 credentials
# -------------------------------------
source /etc/github-repos-to-back-up/github-repos-to-back-up.sh

log() {
  echo "--> $1"
  echo "--> $1" >> ${LOGFILE}
}

do_backup() {
  ITEM=$1
  TYPE=$2

  OWNER_REPO=`echo $ITEM | cut -d ":" -f 1`
  MODE=`echo $ITEM | cut -d ":" -f 2`
  OWNER=`echo $OWNER_REPO | cut -d "/" -f 1`
  REPO=`echo $OWNER_REPO | cut -d "/" -f 2`

  if [ "$TYPE" == "user" ]; then TYPEARG=""; else TYPEARG="--organization"; fi
  if [ "$MODE" == "full" ]; then QUALIFIER="--all"; else QUALIFIER="--repositories"; MODE="partial"; fi

  log "Starting $MODE backup of $REPO"

  # Make the backup
  # ---------------
  log "github-backup -t \$REPO_TOKEN $OWNER $TYPEARG --output-directory $BACKUP_DIR $QUALIFIER --private --repository $REPO $INCREMENTAL"
  if [ -z "$DRYRUN" ]; then
    github-backup -t $REPO_TOKEN $OWNER $TYPEARG --output-directory $BACKUP_DIR $QUALIFIER --private --repository $REPO $INCREMENTAL
  else
    log "* (dry run - no backup)"
  fi

  log ""
}

# Record start time
# -----------------
START_TIME=`date "+%H:%M:%S"`
log "Start time: $START_TIME"

# Do the backups
# --------------
for ITEM in ${ORG_REPOS_TO_BACK_UP[@]}; do
  do_backup "$ITEM" "org"
done

for ITEM in ${USER_REPOS_TO_BACK_UP[@]}; do
  do_backup "$ITEM" "user"
done

# Make compressed archives
# ------------------------
cd ${BASEDIR}/owners/
for OWNER in `ls`; do
  log "archiving $OWNER"
  if [ ! -d ${ARCHIVE_DIR}/${OWNER} ]; then mkdir ${ARCHIVE_DIR}/${OWNER}; fi
  if [ -z "$DRYRUN" ]; then
    tar czfp ${ARCHIVE_DIR}/${OWNER}/${OWNER}-${DATE}.tar.gz $OWNER
  fi
done

# Initialize minio and synchronize with the S3 bucket
# ---------------------------------------------------
log "Configuring mc for S3"
/usr/local/bin/mc --config-dir $BASEDIR/.mc alias set s3 $S3_URL $S3_ID $S3_SECRET
log ""
log "Mirroring to S3..."
if [ -z "$DRYRUN" ]; then
  mc --config-dir $BASEDIR/.mc mirror --overwrite $ARCHIVE_DIR/ s3/$BUCKET
fi
log ""

# Record end time
# ---------------
END_TIME=`date "+%H:%M:%S"`
log "End time: $END_TIME"
log "Done"
