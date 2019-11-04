# The Name
Is to be chnaged down the road. 


# Diagrams / Assets
[Draw.io Initial Architecture Diagram](https://drive.google.com/file/d/1tMS2AXWfBy4oQ6eWhOS7ByuPrN2LJznF/view?usp=sharing)


# Technical Pre-Analysis Notes
Components are not yet fully assessed. This is a rough page of notes for different tools to consider; 

### Webhook / API Front End
We need a Webhook receiver that can take the payload from multiple sources and translate them into NATS messages to be picked up by the business logic function. 

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

### Messaging

#### NATS
So far we are looking at NATS. Easy to start with in a single image, also has an **operator to easily manage clusters**. The thought is that it would be the persistence and scale layer to help handle the amount of security events that may get pumped into the system. 



