import { afterAll, afterEach, beforeAll, beforeEach, describe, test, jest, expect } from '@jest/globals';
import { setupServer } from 'msw/node';
import { appLogger } from '../../../../src/libs/logger';
import { mockRequest } from '../../../mock/mock-utils';
import { DefaultAuthorizationService } from '../../../../src/libs/auth/services';
import { GeneralError } from '../../../../src/libs/fastify/errors';
import { mockAccessToken, mockAccessTokenInvalidClient, ErrorPrivateFields } from '../../../mock/mock-authorization';

describe('ct-session.service', () => {
	const mockServer = setupServer();

	beforeAll(() => {
		mockServer.listen({
			onUnhandledRequest: 'bypass',
		});
	});

	beforeEach(() => {
		jest.setTimeout(10000);
		jest.resetAllMocks();
	});

	afterAll(() => {
		mockServer.close();
	});

	afterEach(() => {
		mockServer.resetHandlers();
	});

	const mockAuthUrl = 'https://auth.commercetools.com';
	test('getAccessToken() OK', async () => {
		const authorizationServiceOpt = {
			authUrl: mockAuthUrl,
			clientId: 'dummy-client-id',
			clientSecret: 'dummy-client-secret',
			logger: appLogger,
		};
		const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);

		mockServer.use(mockRequest(mockAuthUrl, `/oauth/token`, 200, mockAccessToken));

		const resp = await authorizationService.getAccessToken();
		expect(resp).toBeDefined();
		expect(resp).toEqual(mockAccessToken);
	});
	test('getAccessToken() failed', async () => {
		const authorizationServiceOpt = {
			authUrl: mockAuthUrl,
			clientId: 'dummy-client-id',
			clientSecret: 'dummy-client-secret',
			logger: appLogger,
		};
		const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);

		mockServer.use(mockRequest(mockAuthUrl, `/oauth/token`, 401, mockAccessTokenInvalidClient));
		try {
			await authorizationService.getAccessToken();
		} catch (error) {
			expect(error).toBeDefined();
			expect(error instanceof GeneralError).toBeTruthy();
			const privateMessage = (error as GeneralError).privateMessage;
			const privateFields: ErrorPrivateFields = (error as GeneralError).privateFields as ErrorPrivateFields;
			expect(privateMessage).toBeDefined();
			expect(privateMessage).toEqual('Failed to get auth token');
			expect(privateFields).toBeDefined();
			expect(privateFields?.responseStatus).toEqual(401);
		}
	});
});
