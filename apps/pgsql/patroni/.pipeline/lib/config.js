'use strict';
const options= require('pipeline-cli').Util.parseArguments()
const changeId = options.pr //aka pull-request
const version = '10.0'
const name = 'patroni'

const phases = {
  build: {namespace:'bcgov-tools' , name: `${name}`, phase: 'build', changeId:changeId, suffix: `-build-${changeId}`, instance: `${name}-build-${changeId}`, version:`${version}-${changeId}`, tag:`v${version}-${changeId}`},
   test: {namespace:`bcgov`,        name: `${name}`, phase: 'test' , changeId:changeId, suffix: '-test'             , instance: `${name}-test`             , version:`${version}-${changeId}`, tag:`v${version}-latest`},
   prod: {namespace:`bcgov`,        name: `${name}`, phase: 'prod' , changeId:changeId, suffix: ''                  , instance: `${name}-prod`             , version:`${version}-${changeId}`, tag:`v${version}-stable`}
}

module.exports = exports = phases
