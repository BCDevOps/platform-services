#!/bin/bash

# Set variables
repo=platform-services
repourl=https://github.com/BCDevOps/platform-services
branch=feature/statuspage_sysdig_dashboards   # update this

# Check if this PR has any changes for this app
#file_list=$(curl $1/files | grep filename | grep "apps/statuspage")


# Clone repo and branch
if [ -d $repo ]; then (cd $repo && git pull); else git clone -b $branch $repourl;fi

## Execute playbook with a timeout of 240 seconds
## If dev succeeds, apply the same in test, and then in prod
## Todo; Replace this shell script with a more generic ansible playbook
cd platform-services/apps/statuspage/ansible

if (timeout --preserve-status 240 ansible-playbook -i prod -e activity=uninstall -e env=dev statuspage.yml -e rc_notify="no")
then 
  echo "Dev Removed - Reinstalling..."
  if (timeout --preserve-status 240 ansible-playbook -i prod -e activity=install -e env=dev statuspage.yml )
  then 
    echo "Dev Installed - Configuring..."
    if (timeout --preserve-status 240 ansible-playbook -i prod -e activity=configure -e env=dev statuspage.yml -e rc_notify="no")
    then
      echo "Configured Dev"
      if (timeout --preserve-status 240 ansible-playbook -i prod -e activity=install -e env=test statuspage.yml)
      then 
        echo "Configuring Test"
        timeout --preserve-status 240 ansible-playbook -i prod -e activity=configure -e env=test statuspage.yml -e rc_notify="no"
        if (timeout --preserve-status 240 ansible-playbook -i prod -e activity=install -e env=prod statuspage.yml)
        then 
          echo "Configuring prod"
          timeout --preserve-status 240 ansible-playbook -i prod -e activity=configure -e env=prod statuspage.yml -e rc_notify="no"
        else
          echo "Failed to configure prod"
        fi
      else
        echo "Failed to configure test"
      fi
    else
      echo "Failed to Configure Dev"
    fi
  else
    echo "Failed to Install dev"
  fi
else
  echo "Failed to delete dev"
fi
