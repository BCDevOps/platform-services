#!/bin/bash

cd apps/statuspage/ansible
ansible-playbook  -i prod statuspage.yml  -e activity=uninstall -e env=dev
