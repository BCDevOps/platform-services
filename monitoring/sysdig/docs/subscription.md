# Subscription
There is a limit on how many Sysdig agents we can have in total across all OpenShift clusters.

Under our deployment strategy using daemondset, it requires one agent per node. At the moment, we have 99 nodes in total (worker/infra/master):
- silver: 53
- klab: 10
- clab: 10
- gold: 13
- golddr: 13

There is 100 limit on preserved agents, if we are increasing out nodes later on, there are ways to resolve:
- remove Sysdig from CLAB (leaving KLAB for testing is sufficient)
- buy on-demand agents from Sysdig (more details to come)

## Reference:
https://docs.sysdig.com/en/subscription.html
