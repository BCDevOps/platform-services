# The Name
Is to be chnaged down the road. 


# Diagrams / Assets
[Draw.io Initial Architecture Diagram](https://drive.google.com/file/d/1tMS2AXWfBy4oQ6eWhOS7ByuPrN2LJznF/view?usp=sharing)


# Technical Pre-Analysis Notes
Components are not yet fully assessed. This is a rough page of notes for different tools to consider; 

### Webhook / API Front End
We need a Webhook receiver that can take the payload from multiple sources and translate them into NATS messages to be picked up by the business logic function. 

For webhook receiver security, we likely need a function to automate the webhook creation: 
- generage a unique webhook url endpoint
- create / build the argo webhook CR 
- generate SSL certs for security

#### Gloo
Looked at Gloo and it's pretty heavyweight for what we need... challenges to get it running on OCP **easily** makes me think it might not be the right fit for a mock-up. It does, however, promise a method of connecting to NATS.

#### Argo-Events
Argo events has an interesting kube-native way of building a webhook listener and passing those events into sensors, also ensuring that dependencies are met. 
- Pretty easy to get going for testing
- It likely "too" feature filled, but this may help down the road with new unknown feature requests
  - Many different event sources (ie. schedules), not just wehbooks
- Ties into NATS 
- Can also be a subscriber to NATS and can run jobs based on events in the message queue


#### Resgate
Is an option to build a REST API in front of NATS. Haven't spent much more time looking into this. 

#### JS Wehbook
We've used a javascript based wehbook server to kick off ansible jobs (the status page uses this). It's really lightweight and simple (ie. receive webhook, run script). I suspect that any additional feature requests down the road may limit the functionality of this. 

- [webhook code](https://github.com/adnanh/webhook)
- [status page example](https://github.com/BCDevOps/platform-services/tree/master/apps/statuspage/.pipeline/ansible-webhook)

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
