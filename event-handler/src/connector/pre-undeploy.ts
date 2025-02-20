import dotenv from 'dotenv';
import { createApiRoot } from '../client/commercetools/create.client';
import { assertError } from '../utils/assert.utils';
import { deleteOrderCreateSubscription } from './actions';

dotenv.config();

async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteOrderCreateSubscription(apiRoot);
}

async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
