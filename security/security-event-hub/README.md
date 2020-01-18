# Security Event Hub
The Security Event Hub is a centralized system to process incoming security event details and to store this data in a database and provide overall "security health" information about an application or repository. 

# Quickstart for Developers
The below content provides some detail regarding the original review of tools and someof the ones we are continuing to invest time into. 
Please refer to [setup.md](setup.md) to set up a full stack for testing, which includes: 
- Argo-Events
- NATS Messaging Cluster
- Prometheus / Grafana for NATS Monitoring
- Optional Argo-Workflows

# Diagrams / Assets
[Draw.io Initial Architecture Diagram](https://drive.google.com/file/d/1tMS2AXWfBy4oQ6eWhOS7ByuPrN2LJznF/view?usp=sharing)


# Technical Pre-Analysis Notes
Components are not yet fully assessed. This is a rough page of notes for different tools/functions to consider; 

### Webhook / API Front End
We need a Webhook receiver that can take the payload from multiple sources and translate them into NATS messages to be picked up by the business logic function. 

For webhook receiver security, we likely need a function to automate the webhook creation: 
- generage a unique webhook url endpoint
- create / build the argo webhook CR 
- generate SSL certs for security


#### Argo-Events
Argo events has an interesting kube-native way of building a webhook listener and passing those events into sensors, also ensuring that dependencies are met. 
- Pretty easy to get going for testing
- It likely "too" feature filled, but this may help down the road with new unknown feature requests
  - Many different event sources (ie. schedules), not just wehbooks
- Ties into NATS 
- Can also be a subscriber to NATS and can run jobs based on events in the message queue

### Messaging

#### NATS
So far we are looking at NATS. Easy to start with in a single image, also has an **operator to easily manage clusters**. The thought is that it would be the persistence and scale layer to help handle the amount of security events that may get pumped into the system. 

* note: configuration reload isn't supported on kube 1.11. [link](https://github.com/nats-io/nats-operator#configuration-reload)


### Data Storage
Some form of data storage will be required in order to hold records that identify: 
  - repo-name
  - team-name
  - security score
  - items that affect the security score (ie. github notifications, aqua vulnerabilities, permissive network flows)

Currently we can look at MongoDB for this as a starting point. It has a flexible approach that allows us to start without a defined schema as our needs evolve. 
