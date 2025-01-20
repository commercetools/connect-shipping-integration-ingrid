import * as dotenv from 'dotenv';
import { doSomeAction } from './actions';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postDeploy(_properties: Map<string, unknown>) {
  // TODO: Implement post deployment scripts if any
  await doSomeAction();
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    }
    process.exitCode = 1;
  }
}

run();
