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
  // Conversion - api:
  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/conversion-dc.yml`, {
      param: {
        NAME: 'documize-conversion',
        SUFFIX: phases[phase].suffix,
        HOST_VALUE: phases[phase].apiHost,
      },
    }),
  );

  // Documize app:
  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/dc.yml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST_VALUE: phases[phase].appHost,
      },
    }),
  );

  // TODO: statefulset

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
