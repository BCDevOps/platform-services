'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼

  //Secrets for Patroni
  //First call will create/generate default values and a template
  oc.createIfMissing(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db-secrets.yaml`, {
    param:{
      NAME: `template.${phases[phase].name}-patroni`,
      SUFFIX: '',
      APP_DB_USERNAME: 'documize',
      APP_DB_NAME: 'documize'
    }
  }))

  //Second call will create the required object using their respective template (default ones generated above)
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db-secrets.yaml`, {
    param:{
      NAME: `${phases[phase].name}-patroni`,
      SUFFIX: phases[phase].suffix,
      APP_DB_USERNAME: 'documize',
      APP_DB_NAME: 'documize'
    }
  }))

  /**
   * Statefulset - patroni pg:
   */
  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/patroni-deployment.yml`, {
      param: {
        NAME: `${phases[phase].name}-patroni`,
        SECRET_NAME: `${phases[phase].name}-patroni`,
        SUFFIX: phases[phase].suffix,
      },
    }),
  );

  // Conversion - api:
  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/conversion-dc.yml`, {
      param: {
        NAME: `${phases[phase].name}-conversion`,
        SUFFIX: phases[phase].suffix,
        HOST_VALUE: phases[phase].apiHost,
      },
    }),
  );

  /**
   * Documize app:
   * - deployment config
   * - route
   * - service
   */
  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/dc.yml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST_VALUE: phases[phase].appHost,
        DB_SECRET_NAME: `${phases[phase].name}-patroni`,
        PATRONI_SERVICE: `${phases[phase].name}-patroni-master`,
      },
    }),
  );

  oc.applyRecommendedLabels(
    objects,
    phases[phase].name,
    phase,
    `${changeId}`,
    phases[phase].instance,
  );
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  oc.applyAndDeploy(objects, phases[phase].instance);
};
