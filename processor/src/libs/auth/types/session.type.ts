export type Session = {
	id: string;
	version: number;
	createdAt: string;
	lastModifiedAt: string;
	state: 'ACTIVE' | 'EXPIRED';
	activeCart?: {
		cartRef: {
			id: string;
		};
	};
	metadata?: {
		[key: string]: unknown;
	};
};

export interface SessionService {
	verifySession(sessionId: string): Promise<Session>;
	getCartFromSession(session: Session): string;
	getProcessorUrlFromSession(session: Session): string;
	getCorrelationIdFromSession(session: Session): string | undefined;
}
