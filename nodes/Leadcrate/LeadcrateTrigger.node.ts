import {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription, IWebhookFunctions, IWebhookResponseData
} from "n8n-workflow";
import { leadcrateApiRequest } from "./generic.functions";


export class LeadcrateTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Leadcrate Trigger',
		name: 'leadcrateTrigger',
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Leadcrate events occur',
		icon: 'file:leadcrate.svg',
		group: [ 'trigger' ],
		version: 1,
		defaults: {
			name: 'Leadcrate trigger',
		},
		inputs: [],
		outputs: [ 'main' ],
		credentials: [
			{
				name: 'leadcrateApi',
				required: true,
				displayOptions: {
					show: {
						authentication: [ 'accessToken' ],
					},
				},
			}
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
				],
				default: 'accessToken',
			},
			{
				displayName: 'Organization Name or ID',
				name: 'organization',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				required: true,
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					{
						name: 'Lead Archived',
						value: 'lead.archived',
						description: 'Triggers when a lead has been archived',
						action: 'On lead archived',
					},
					{
						name: 'Lead Created',
						value: 'lead.created',
						description: 'Triggers when a new lead is created',
						action: 'On lead created',
					},
					{
						name: 'Lead Marked As Read',
						value: 'lead.read',
						description: 'Triggers when a lead has been marked as read',
						action: 'On lead marked as read',
					},
					{
						name: 'Lead Note Added',
						value: 'lead.note-added',
						description: 'Triggers when a note has been added to a lead',
						action: 'On lead note added',
					},
					{
						name: 'Lead Score Changed',
						value: 'lead.score-changed',
						description: 'Triggers when a lead\'s score has changed',
						action: 'On lead score change',
					},
					{
						name: 'Lead Status Changed',
						value: 'lead.status-changed',
						description: 'Triggers when a lead status has been changed',
						action: 'On lead status change',
					}
				],
			},
		]
	};

	methods = {
		loadOptions: {
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await leadcrateApiRequest.call(this, 'GET', 'organization');
				return response.map((organization: any) => ({name: organization.name, value: organization.id}));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (!webhookData.webhookId) {
					return false;
				}

				const webhooks = (await leadcrateApiRequest.call(this, 'GET', 'webhook')) as any[];
				return !!webhooks.find((webhook) => webhook.id === webhookData.webhookId);
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const organizationId = this.getNodeParameter('organization') as string;
				const events = this.getNodeParameter('events') as string[];

				const response = await leadcrateApiRequest.call(this, 'POST', 'webhook', {
					organizationId: organizationId,
					name: 'N8N created webhook',
					url: webhookUrl,
					events: events
				});

				webhookData.webhookId = response.id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const endpoint = `webhook/${ webhookData.webhookId }`;

				try {
					await leadcrateApiRequest.call(this, 'DELETE', endpoint);
				} catch (error) {
					return false;
				}
				delete webhookData.webhookId;
				return true;
			},
		}
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const headerData = this.getHeaderData() as IDataObject;
		const req = this.getRequestObject();

		return {
			workflowData: [ this.helpers.returnJsonArray(req.body as IDataObject) ],
		};
	}
}
