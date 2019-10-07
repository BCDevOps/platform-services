'use strict';
const options = require('pipeline-cli').Util.parseArguments();
const changeId = options.pr; //aka pull-request
const version = '1.0.0';
const name = 'documize';

const phases = {
  build: {
    namespace: 'hmg6pw-tools',
    name: `${name}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: `build-${version}-${changeId}`,
  },
  dev: {
    namespace: 'hmg6pw-dev',
    name: `${name}`,
    phase: 'dev',
    changeId: changeId,
    suffix: `-dev-${changeId}`,
    instance: `${name}-dev-${changeId}`,
    version: `${version}-${changeId}`,
    tag: `dev-${version}-${changeId}`,
    appHost: `docs-dev-${changeId}.pathfinder.gov.bc.ca`,
    apiHost: `api-documize-dev-${changeId}.pathfinder.gov.bc.ca`,
  },
  test: {
    namespace: 'hmg6pw-test',
    name: `${name}`,
    phase: 'test',
    changeId: changeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    appHost: `docs-test-${changeId}.pathfinder.gov.bc.ca`,
    apiHost: `api-documize-test-${changeId}.pathfinder.gov.bc.ca`,
  },
  prod: {
    namespace: 'hmg6pw-prod',
    name: `${name}`,
    phase: 'prod',
    changeId: changeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    appHost: `docs.pathfinder.gov.bc.ca`,
    apiHost: `api-documize.pathfinder.gov.bc.ca`,
  },
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', reason => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = { phases, options };
