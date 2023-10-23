import * as k8s from '@kubernetes/client-node'

const LUCID_SYSTEM = 'lucid-system'

interface Cluster {
  metadata: {
    name: string
  }
}

export class K8sApi {
  protected customObjectsApi: k8s.CustomObjectsApi
  protected coreV1Api: k8s.CoreV1Api

  constructor(config: k8s.KubeConfig) {
    this.customObjectsApi = config.makeApiClient(k8s.CustomObjectsApi)
    this.coreV1Api = config.makeApiClient(k8s.CoreV1Api)
  }

  async getClusters(name: string): Promise<string[]> {
    try {
      const clusters = await this.customObjectsApi
        .listNamespacedCustomObject(
          'cluster.x-k8s.io',
          'v1beta1',
          LUCID_SYSTEM,
          'clusters'
        )
        .then(resp => (<{ items: Cluster[] }>resp.body).items)
        .then(clusters =>
          clusters
            .filter(c => c.metadata.name.includes(name))
            .map(c => c.metadata.name)
        )

      return Promise.resolve(clusters)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getSecret(cluster_name: string): Promise<string> {
    try {
      const secret = await this.coreV1Api
        .readNamespacedSecret(`${cluster_name}-kubeconfig`, LUCID_SYSTEM)
        .then(resp => resp.body.data?.value)

      if (!secret) {
        return Promise.reject(
          new Error(`K8s AI returned empty data for secret ${cluster_name}`)
        )
      }

      const b = Buffer.from(secret, 'base64')
      return Promise.resolve(b.toString())
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
