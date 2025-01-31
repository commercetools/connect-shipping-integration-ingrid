import * as dotenv from 'dotenv';
import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postDeploy(_properties: Map<string, unknown>) {
  // TODO: Implement post deployment scripts if any
  await checkIfIngridCustomTypeExists();
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

// TODO: this needs to be refactored, currently as of development, logic is inside service
export async function checkIfIngridCustomTypeExists() {
  const sdk = new CommercetoolsApiClient({
    clientId: process.env.CT_CLIENT_ID!,
    clientSecret: process.env.CT_CLIENT_SECRET!,
    authUrl: process.env.CT_AUTH_URL!,
    apiUrl: process.env.CT_API_URL!,
    projectKey: process.env.CT_PROJECT_KEY!,
    sessionUrl: process.env.CT_SESSION_URL!,
    jwksUrl: process.env.CT_JWKS_URL!,
    jwtIssuer: process.env.CT_JWT_ISSUER!,
  });
  const client = sdk.client.ctAPI.client;
  try {
    const response = await client.types().withKey({ key: 'ingrid-session-id' }).get().execute();

    if (response.statusCode !== 200) {
      console.info('Ingrid custom type does not exist, creating it');
      try {
        const res = await client
          .types()
          .post({
            body: {
              key: 'ingrid-session-id',
              name: {
                en: 'Ingrid Session ID',
              },
              resourceTypeIds: ['cart'],
              fieldDefinitions: [
                {
                  name: 'ingridSessionId',
                  label: {
                    en: 'Ingrid Session ID',
                  },
                  type: {
                    name: 'String',
                  },
                  required: false,
                },
              ],
            },
          })
          .execute();
        const curstomType = res.body;
        console.log('Ingrid custom type created', curstomType);
      } catch (error) {
        console.error('Error creating Ingrid custom type', error);
      }
    }
    const customType = response.body;
    console.log('Ingrid custom type created', customType);
  } catch (error) {
    console.error('Error checking if Ingrid custom type exists', error);
  }
  return;
}

run();
