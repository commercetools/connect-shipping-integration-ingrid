
import {
  standardString,
  standardKey,
  region,
} from './helpers.validators';

/**
 * Create here your own validators
 */

const clientIdValidator : [string[], [[(o: object) => boolean, string, [object]]]] = standardString(
  ['clientId'],
  {
    code: 'InValidClientId',
    message: 'Client id should be 24 characters.',
    referencedBy: 'environmentVariables',
  },
  { min: 24, max: 24 }
)
const clientSecretValidator : [string[], [[(o: object) => boolean, string, [object]]]] = standardString(
  ['clientSecret'],
  {
    code: 'InvalidClientSecret',
    message: 'Client secret should be 32 characters.',
    referencedBy: 'environmentVariables',
  },
  { min: 32, max: 32 }
)
const projectKeyValidator = standardKey(['projectKey'], {
  code: 'InvalidProjectKey',
  message: 'Project key should be a valid string.',
  referencedBy: 'environmentVariables',
})
const regionValidator = region(['region'], {
  code: 'InvalidRegion',
  message: 'Not a valid region.',
  referencedBy: 'environmentVariables',
})

const scopeValidator = standardString(
  ['scope'],
  {
    code: 'InvalidScope',
    message: 'Scope should be at least 2 characters long.',
    referencedBy: 'environmentVariables',
  },
  { min: 2, max: undefined }
)

const envValidators = [
  clientIdValidator,
  clientSecretValidator,
  projectKeyValidator,
  regionValidator,
  scopeValidator
  
];

export default envValidators;
