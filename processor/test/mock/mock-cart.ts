import { Cart } from '@commercetools/platform-sdk';
export const cart: Cart = {
	id: '4fb3a311-c4b6-4287-a3a8-6b15f039c0c5',
	version: 6,
	createdAt: '2025-02-03T14:01:58.252Z',
	lastModifiedAt: '2025-02-03T14:05:58.925Z',
	locale: 'de-DE',
	lineItems: [
		{
			id: 'a3226f9c-329a-4555-8d60-f83f1f6b6a4b',
			productId: 'fee662eb-6434-4b47-8ccb-e1717caa9608',
			productKey: 'luxe-pillow-cover',
			name: {
				'en-US': 'Luxe Pillow Cover',
				'en-GB': 'Luxe Pillow Cover',
				'de-DE': 'Luxe Kissenbezug',
			},
			productType: {
				typeId: 'product-type',
				id: 'd4c73e8d-de13-4eb4-aaf2-bdd04ab70f8a',
			},
			productSlug: {
				'en-US': 'luxe-pillow-cover',
				'en-GB': 'luxe-pillow-cover',
				'de-DE': 'luxuriser-kissenbezug',
			},
			variant: {
				id: 1,
				sku: 'LPC-011',
				key: 'luxePillowCover01',
				prices: [
					{
						id: '1c525cec-cfca-4cf1-af37-95245375aee0',
						value: {
							type: 'centPrecision',
							currencyCode: 'EUR',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599EUR',
						country: 'DE',
					},
					{
						id: 'b995f9eb-f9bb-43d1-ad6b-1a45a65efe6b',
						value: {
							type: 'centPrecision',
							currencyCode: 'GBP',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599GBP',
						country: 'GB',
					},
					{
						id: '48e79518-0fd8-4f07-9ac5-01f0c20dbd34',
						value: {
							type: 'centPrecision',
							currencyCode: 'USD',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599USD',
						country: 'US',
					},
				],
				images: [
					{
						url: 'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Luxe_Pillow_Cover-1.1.jpeg',
						dimensions: {
							w: 6123,
							h: 4082,
						},
					},
				],
				attributes: [
					{
						name: 'color',
						value: { 'en-GB': 'Black:#000000', 'de-DE': 'Schwarz:#000000', 'en-US': 'Black:#000000' },
					},
					{
						name: 'productspec',
						value: {
							'en-GB': '- Machine washable\n- Pillow not included',
							'de-DE': '- Waschmaschinenfest\n- Kissen nicht im Lieferumfang enthalten',
							'en-US': '- Machine washable\n- Pillow not included',
						},
					},
				],
				assets: [],
				availability: {
					isOnStock: true,
					availableQuantity: 100,
					version: 1,
					id: '680f9c81-0ce5-41bf-a420-8b772233dc20',
				},
			},
			price: {
				id: '1c525cec-cfca-4cf1-af37-95245375aee0',
				value: {
					type: 'centPrecision',
					currencyCode: 'EUR',
					centAmount: 2599,
					fractionDigits: 2,
				},
				key: '2599EUR',
				country: 'DE',
			},
			quantity: 1,
			discountedPricePerQuantity: [],
			perMethodTaxRate: [],
			addedAt: '2025-02-03T14:01:58.412Z',
			lastModifiedAt: '2025-02-03T14:01:58.412Z',
			state: [
				{
					quantity: 1,
					state: {
						typeId: 'state',
						id: 'c60af218-7304-4e94-8171-72e93ad64a3f',
					},
				},
			],
			priceMode: 'Platform',
			lineItemMode: 'Standard',
			totalPrice: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 2599,
				fractionDigits: 2,
			},
			taxedPricePortions: [],
		},
	],
	cartState: 'Active',
	totalPrice: {
		type: 'centPrecision',
		currencyCode: 'EUR',
		centAmount: 2599,
		fractionDigits: 2,
	},
	country: 'DE',
	shippingMode: 'Single',
	shipping: [],
	customLineItems: [],
	discountCodes: [],
	directDiscounts: [],
	custom: {
		type: { typeId: 'type', id: 'ingrid-session-type-id' },
		fields: { ingridSessionId: 'ingrid-session-id' },
	},
	inventoryMode: 'None',
	taxMode: 'Platform',
	taxRoundingMode: 'HalfEven',
	taxCalculationMode: 'LineItemLevel',
	deleteDaysAfterLastModification: 90,
	refusedGifts: [],
	origin: 'Customer',
	itemShippingAddresses: [],
	totalLineItemQuantity: 1,
};

export const cartWithAdditionalCustomType: Cart = {
	id: '4fb3a311-c4b6-4287-a3a8-6b15f039c0c5',
	version: 6,
	createdAt: '2025-02-03T14:01:58.252Z',
	lastModifiedAt: '2025-02-03T14:05:58.925Z',
	locale: 'de-DE',
	lineItems: [
		{
			id: 'a3226f9c-329a-4555-8d60-f83f1f6b6a4b',
			productId: 'fee662eb-6434-4b47-8ccb-e1717caa9608',
			productKey: 'luxe-pillow-cover',
			name: {
				'en-US': 'Luxe Pillow Cover',
				'en-GB': 'Luxe Pillow Cover',
				'de-DE': 'Luxe Kissenbezug',
			},
			productType: {
				typeId: 'product-type',
				id: 'd4c73e8d-de13-4eb4-aaf2-bdd04ab70f8a',
			},
			productSlug: {
				'en-US': 'luxe-pillow-cover',
				'en-GB': 'luxe-pillow-cover',
				'de-DE': 'luxuriser-kissenbezug',
			},
			variant: {
				id: 1,
				sku: 'LPC-011',
				key: 'luxePillowCover01',
				prices: [
					{
						id: '1c525cec-cfca-4cf1-af37-95245375aee0',
						value: {
							type: 'centPrecision',
							currencyCode: 'EUR',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599EUR',
						country: 'DE',
					},
					{
						id: 'b995f9eb-f9bb-43d1-ad6b-1a45a65efe6b',
						value: {
							type: 'centPrecision',
							currencyCode: 'GBP',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599GBP',
						country: 'GB',
					},
					{
						id: '48e79518-0fd8-4f07-9ac5-01f0c20dbd34',
						value: {
							type: 'centPrecision',
							currencyCode: 'USD',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599USD',
						country: 'US',
					},
				],
				images: [
					{
						url: 'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Luxe_Pillow_Cover-1.1.jpeg',
						dimensions: {
							w: 6123,
							h: 4082,
						},
					},
				],
				attributes: [
					{
						name: 'color',
						value: { 'en-GB': 'Black:#000000', 'de-DE': 'Schwarz:#000000', 'en-US': 'Black:#000000' },
					},
					{
						name: 'productspec',
						value: {
							'en-GB': '- Machine washable\n- Pillow not included',
							'de-DE': '- Waschmaschinenfest\n- Kissen nicht im Lieferumfang enthalten',
							'en-US': '- Machine washable\n- Pillow not included',
						},
					},
				],
				assets: [],
				availability: {
					isOnStock: true,
					availableQuantity: 100,
					version: 1,
					id: '680f9c81-0ce5-41bf-a420-8b772233dc20',
				},
			},
			price: {
				id: '1c525cec-cfca-4cf1-af37-95245375aee0',
				value: {
					type: 'centPrecision',
					currencyCode: 'EUR',
					centAmount: 2599,
					fractionDigits: 2,
				},
				key: '2599EUR',
				country: 'DE',
			},
			quantity: 1,
			discountedPricePerQuantity: [],
			perMethodTaxRate: [],
			addedAt: '2025-02-03T14:01:58.412Z',
			lastModifiedAt: '2025-02-03T14:01:58.412Z',
			state: [
				{
					quantity: 1,
					state: {
						typeId: 'state',
						id: 'c60af218-7304-4e94-8171-72e93ad64a3f',
					},
				},
			],
			priceMode: 'Platform',
			lineItemMode: 'Standard',
			totalPrice: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 2599,
				fractionDigits: 2,
			},
			taxedPricePortions: [],
		},
	],
	cartState: 'Active',
	totalPrice: {
		type: 'centPrecision',
		currencyCode: 'EUR',
		centAmount: 2599,
		fractionDigits: 2,
	},
	country: 'DE',
	shippingMode: 'Single',
	shipping: [],
	customLineItems: [],
	discountCodes: [],
	directDiscounts: [],
	custom: {
		type: { typeId: 'type', id: 'dummy-type-id' },
		fields: { ingridSessionId: 'dummy-id' },
	},
	inventoryMode: 'None',
	taxMode: 'Platform',
	taxRoundingMode: 'HalfEven',
	taxCalculationMode: 'LineItemLevel',
	deleteDaysAfterLastModification: 90,
	refusedGifts: [],
	origin: 'Customer',
	itemShippingAddresses: [],
	totalLineItemQuantity: 1,
};

export const cartWithoutCustomType: Cart = {
	id: '4fb3a311-c4b6-4287-a3a8-6b15f039c0c5',
	version: 6,
	createdAt: '2025-02-03T14:01:58.252Z',
	lastModifiedAt: '2025-02-03T14:05:58.925Z',
	locale: 'de-DE',
	lineItems: [
		{
			id: 'a3226f9c-329a-4555-8d60-f83f1f6b6a4b',
			productId: 'fee662eb-6434-4b47-8ccb-e1717caa9608',
			productKey: 'luxe-pillow-cover',
			name: {
				'en-US': 'Luxe Pillow Cover',
				'en-GB': 'Luxe Pillow Cover',
				'de-DE': 'Luxe Kissenbezug',
			},
			productType: {
				typeId: 'product-type',
				id: 'd4c73e8d-de13-4eb4-aaf2-bdd04ab70f8a',
			},
			productSlug: {
				'en-US': 'luxe-pillow-cover',
				'en-GB': 'luxe-pillow-cover',
				'de-DE': 'luxuriser-kissenbezug',
			},
			variant: {
				id: 1,
				sku: 'LPC-011',
				key: 'luxePillowCover01',
				prices: [
					{
						id: '1c525cec-cfca-4cf1-af37-95245375aee0',
						value: {
							type: 'centPrecision',
							currencyCode: 'EUR',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599EUR',
						country: 'DE',
					},
					{
						id: 'b995f9eb-f9bb-43d1-ad6b-1a45a65efe6b',
						value: {
							type: 'centPrecision',
							currencyCode: 'GBP',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599GBP',
						country: 'GB',
					},
					{
						id: '48e79518-0fd8-4f07-9ac5-01f0c20dbd34',
						value: {
							type: 'centPrecision',
							currencyCode: 'USD',
							centAmount: 2599,
							fractionDigits: 2,
						},
						key: '2599USD',
						country: 'US',
					},
				],
				images: [
					{
						url: 'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Luxe_Pillow_Cover-1.1.jpeg',
						dimensions: {
							w: 6123,
							h: 4082,
						},
					},
				],
				attributes: [
					{
						name: 'color',
						value: { 'en-GB': 'Black:#000000', 'de-DE': 'Schwarz:#000000', 'en-US': 'Black:#000000' },
					},
					{
						name: 'productspec',
						value: {
							'en-GB': '- Machine washable\n- Pillow not included',
							'de-DE': '- Waschmaschinenfest\n- Kissen nicht im Lieferumfang enthalten',
							'en-US': '- Machine washable\n- Pillow not included',
						},
					},
				],
				assets: [],
				availability: {
					isOnStock: true,
					availableQuantity: 100,
					version: 1,
					id: '680f9c81-0ce5-41bf-a420-8b772233dc20',
				},
			},
			price: {
				id: '1c525cec-cfca-4cf1-af37-95245375aee0',
				value: {
					type: 'centPrecision',
					currencyCode: 'EUR',
					centAmount: 2599,
					fractionDigits: 2,
				},
				key: '2599EUR',
				country: 'DE',
			},
			quantity: 1,
			discountedPricePerQuantity: [],
			perMethodTaxRate: [],
			addedAt: '2025-02-03T14:01:58.412Z',
			lastModifiedAt: '2025-02-03T14:01:58.412Z',
			state: [
				{
					quantity: 1,
					state: {
						typeId: 'state',
						id: 'c60af218-7304-4e94-8171-72e93ad64a3f',
					},
				},
			],
			priceMode: 'Platform',
			lineItemMode: 'Standard',
			totalPrice: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 2599,
				fractionDigits: 2,
			},
			taxedPricePortions: [],
		},
	],
	cartState: 'Active',
	totalPrice: {
		type: 'centPrecision',
		currencyCode: 'EUR',
		centAmount: 2599,
		fractionDigits: 2,
	},
	country: 'DE',
	shippingMode: 'Single',
	shipping: [],
	customLineItems: [],
	discountCodes: [],
	directDiscounts: [],
	inventoryMode: 'None',
	taxMode: 'Platform',
	taxRoundingMode: 'HalfEven',
	taxCalculationMode: 'LineItemLevel',
	deleteDaysAfterLastModification: 90,
	refusedGifts: [],
	origin: 'Customer',
	itemShippingAddresses: [],
	totalLineItemQuantity: 1,
};

export const setCustomFieldFailureResponse = {
	statusCode: 400,
	message: 'This resource has no custom type set - please use setCustomType first to set the type of the custom fields',
	errors: [
		{
			code: 'InvalidOperation',
			message:
				'This resource has no custom type set - please use setCustomType first to set the type of the custom fields',
			action: {
				action: 'setCustomField',
				name: 'ingridSessionId',
				value: '1234567890',
			},
			actionIndex: 1,
		},
	],
};
