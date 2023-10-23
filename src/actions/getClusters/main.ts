import * as core from '@actions/core'
import * as k8s from '@kubernetes/client-node'
import { K8sApi } from '../../lib/k8sApi'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const config = new k8s.KubeConfig()
  config.loadFromDefault()

  const api = new K8sApi(config)

  const cluster = core.getInput('cluster_type', { required: false })

  return api
    .getClusters(cluster)
    .then(clusters => core.setOutput('clusters', clusters))
    .catch(error => {
      if (error instanceof Error) core.setFailed(error.message)
    })
}
