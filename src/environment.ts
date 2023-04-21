import { development, production } from '../config';

const getEnvironment = (): 'development' | 'production' => {
  // Define your logic to determine the environment
  // For example, using a query parameter or window location
  return 'development'; // Replace this with your logic
};

const environment = getEnvironment();
const envConfig = environment === 'development' ? development : production;

if (!envConfig) {
  throw new Error(`Invalid environment: ${environment}`);
}

export default envConfig;
