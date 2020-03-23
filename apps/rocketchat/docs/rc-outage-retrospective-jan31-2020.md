- [Topic](#topic)
  - [Description](#description)
  - [Persons](#persons)
- [General Questions](#general-questions)
- [Key Takeaways](#key-takeaways)

# Topic

Rocket Chat 2.4.1 Upgrade Failure & Outage

## Description

On Jan 22, 2020 an attempt to upgrade Rocket Chat to 2.4.1 took place. The image version was changed in the Rocket Chat deployment in the production Rocket Chat namespace in the Pathfinder OpenShift cluster. 

The change in image version trigger a rolling update in OCP. The new pods came up with the updated image version and attempted to update the mongo DB schema. Several errors showed up in the RC pod logs as they schema updates were failing due to not being able to lock the DB as the current running pods were still connected and communicating with the database. The new pods eventually came up with a few errors and the old pods destroyed. Noticing these errors it was decided that another attempt at the upgrade should take place, this time with a recreate deployment strategy. This would be an outage to Rocket Chat but would free the DBs of connections allowing the schema update to take place. It was decided a next day at 5PM outage would work for this.

During the the evening of the 22nd it was noticed one of the RC pods was in a crash loop, Rocket Chat was still operational as 2 other pods were serving. Then during the day on the 23rd the remainder of the RC pods failed and started to crash loop. While RC was down we proceeded with the re-create deployment. We also changed the prod Rocket Chat route to point to the dev environment where a recent backup/restore was live. This was done so we could get Rocket Chat operational and notify what was happening.

The recreate deployment needed to be modified a bit as the health checks were causing the deployment to fail. Once the health check times were modified the deployment was able to upgrade properly and come online. 


## Persons

- Shelly Han
- Cailey Jones
- Phil Thomson

# General Questions

**What went well?**

- Team communication, jumped on shared call quickly to discuss plan of attack
- The upgrade was finalized 
- Troubleshooting went quickly as we had a plan to upgrade later in the day
- Back up plan in place to allow access to RC quickly 
- External communication to teams went well, no one in the dark for too long. Maybe took longer to restore but good to notify.
- Outage window wasn't too long, around an hour
- We had a backup!

**What didn't go so well?**

- Upgrade planning lacking in a few areas
- Testing upgrade without load in lower environments 
- Lack of understanding or no reading the release notes for the new version to understand what was happening
- Bad timining due to larger network issues causing confusion about what was down

**What have we learned?**
- Seemed low impact or easy process to start
- Lower environments dev/test should be more prod like and have load testing options
- Better planning for outage window
- Reading the release notes! Checking if DB changes
- Plan for failure have a backup plan ready to switch 
- More testing! Having someone double check/review

**What is still confusing?**
- Rocket Chat upgrade process and documentation 


# Key Takeaways

**Keep doing**
- Communication internal team quick meetings
- External communication to teams
- Have backup in place 

**Improvement Areas**
- More testing! 
- More formal maintenance plans/process, having roll back plan

**Actions**
- Status page for Rocket Chat - DONE!
- Setting up JMeter for load testing in dev/test
- Automating upgrade process and testing
- Reading Rocket Chat release/upgrade notes
- formal upgrade plan, step 1 take backup
- PR for upgrade plan so team can review process
