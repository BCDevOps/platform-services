'use strict';
const {OpenShiftClientX} = require('pipeline-cli')
const phases = require('./config')

module.exports = (settings)=>{
  const oc=new OpenShiftClientX({'namespace':phases.build.namespace});
  
  for (var k in phases){
    if (phases.hasOwnProperty(k) && k != 'prod') {
      const phase=phases[k]
      oc.raw('delete', ['all'], {selector:`app-name=${phase.name},env-id=${phase.changeId},env-name!=prod,!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`, namespace:phase.namespace})
      oc.raw('delete', ['pvc,Secret,configmap,endpoints,RoleBinding,role,ServiceAccount'], {selector:`app-name=${phase.name},env-id=${phase.changeId},env-name!=prod,!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`, namespace:phase.namespace})
    }
  }
}