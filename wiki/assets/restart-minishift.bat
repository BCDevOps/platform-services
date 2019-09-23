minishift start 
minishift ssh -- sudo subscription-manager refresh
minishift ssh -- sudo subscription-manager list --available
minishift ssh -- sudo subscription-manager attach --pool=<ENTER YOUR POOL ID HERE>
minishift ssh -- sudo subscription-manager repos --list | findstr "scl"
minishift ssh -- sudo subscription-manager repos --enable=rhel-server-rhscl-7-rpms
minishift ssh -- "sudo bash -c ""echo 172.30.1.1 docker-registry.default.svc ^>^> /etc/hosts"""
pause

