import { development, production } from '../config'

const getEnvironment = (): 'development' | 'production' => {
  return 'development'
}

const environment = getEnvironment()
const envConfig = environment === 'development' ? development : production

if (!envConfig) {
  throw new Error(`Invalid environment: ${environment}`)
}

export default envConfig
