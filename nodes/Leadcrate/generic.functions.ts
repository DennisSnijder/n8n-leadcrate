import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
	IHttpRequestMethods,
	IHttpRequestOptions
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function leadcrateApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
	uri?: string,
	_option: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		url: uri || `${ await getBaseUrl.call(this) }/public/${ resource }`,
		json: true,
	};

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'leadcrateApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}


async function getBaseUrl(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
): Promise<string> {
	const credentials = await this.getCredentials('leadcrateApi');
	return ((credentials.baseUrl as string) || 'https://api.leadcrate.io').replace(/\/+$/, '');
}

/**
 * Fetches every page of a paginated Leadcrate endpoint ({ data, total, limit, offset }).
 */
export async function leadcrateApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const limit = 100;
	const items: any[] = [];
	let offset = 0;
	let total = Infinity;

	while (offset < total) {
		const response = await leadcrateApiRequest.call(this, method, resource, body, { ...qs, limit, offset });
		const page = (response?.data ?? []) as any[];

		items.push(...page);
		total = response?.total ?? items.length;
		offset += limit;

		if (page.length === 0) {
			break;
		}
	}

	return items;
}
