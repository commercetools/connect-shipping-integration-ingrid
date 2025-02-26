import { RequestContextProvider, type ContextProvider, type RequestContextData } from '../fastify/context';
import { appLogger } from '../logger';
import { SessionHeaderAuthenticationHook } from './hooks';
import { DefaultAuthorizationService, DefaultSessionService } from './services';
import { SessionHeaderAuthenticationManager } from './authentications';

export class SessionHeaderAuthInitializer {
	private sessionHeaderAuthHookFn: SessionHeaderAuthenticationHook;

	constructor(opts: {
		clientId: string;
		clientSecret: string;
		authUrl: string;
		projectKey: string;
		sessionUrl: string;
		getContextFn: () => RequestContextData;
		updateContextFn: (ctx: Partial<RequestContextData>) => void;
		logger: typeof appLogger;
	}) {
		this.sessionHeaderAuthHookFn = createSessionHeaderAuthHook(opts);
	}

	public getSessionHeaderAuthHookFn() {
		return this.sessionHeaderAuthHookFn;
	}
}

const createSessionHeaderAuthHook = (opts: {
	sessionUrl: string;
	authUrl: string;
	clientId: string;
	clientSecret: string;
	projectKey: string;
	logger: typeof appLogger;
	getContextFn: () => RequestContextData;
	updateContextFn: (ctx: Partial<RequestContextData>) => void;
}) => {
	const contextProvider: ContextProvider<RequestContextData> = new RequestContextProvider({
		getContextFn: opts.getContextFn,
		updateContextFn: opts.updateContextFn,
	});
	const ctAuthorizationService = new DefaultAuthorizationService({
		authUrl: opts.authUrl,
		clientId: opts.clientId,
		clientSecret: opts.clientSecret,
		logger: opts.logger,
	});
	const sessionService = new DefaultSessionService({
		authorizationService: ctAuthorizationService,
		sessionUrl: opts.sessionUrl,
		projectKey: opts.projectKey,
		logger: opts.logger,
	});
	const sessionHeaderAuthenticationManager = new SessionHeaderAuthenticationManager({
		sessionService,
		logger: opts.logger,
	});
	const sessionHeaderAuthHookFn = new SessionHeaderAuthenticationHook({
		authenticationManager: sessionHeaderAuthenticationManager,
		contextProvider: contextProvider,
		logger: opts.logger,
	});
	return sessionHeaderAuthHookFn;
};
