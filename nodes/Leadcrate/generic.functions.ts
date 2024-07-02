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
		url: uri || `https://api.leadcrate.io/public/${ resource }`,
		json: true,
	};

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'leadcrateApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

