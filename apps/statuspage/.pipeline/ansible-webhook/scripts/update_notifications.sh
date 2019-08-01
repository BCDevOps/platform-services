#!/bin/bash

# Set branch name from ref payload
#export BRANCH=$(echo $2 | awk -F '/' '{print $3}')

# Clone repo and branch
git clone -b status-page https://github.com/BCDevOps/platform-services

## Execute playbook
cd platform-services/apps/statuspage/ansible
ansible-playbook -i prod -e activity=configure -e env=dev statuspage.yml

#ansible-playbook playbook.yml -e repo_url=$1 -e branch=$2 -e pull_request_number=$3 -e repo_owner=$4 -e pull_request_url=$5 -e gh_token=$TOKEN