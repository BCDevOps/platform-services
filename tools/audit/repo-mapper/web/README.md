## Repo Mapper Web

This is a simple front end that presents a download link

## Getting Started

You will require Node versions > 10.15.3

### Running Locally

1. change into the `web` directory
2. `npm install`
3. `cp .env.local.example .env.local` and fill in the details
4. `npm start`

### Running on Openshift

There are build and deploy infra code stored `../openshift/web.build.yml` and `../openshift/web.deployment.yml`.
1. Make sure there is the output file that caddy will be serving in the mounted volume
2. Process the templates against the param file and apply 
```
oc process --ignore-unknown-parameters=true -f web.build.yml --param-file=local.param | oc apply -f -
# Deploy:
oc process --ignore-unknown-parameters=true -f web.deployment.yml --param-file=local.param | oc apply -f -
```

