import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow";
import { crateOperations } from "./CrateDescription";
import { leadcrateApiRequest } from "./generic.functions";


export class Leadcrate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Leadcrate',
		name: 'leadcrate',
		icon: 'file:leadcrate.svg',
		group: [ 'output' ],
		version: 1,
		description: 'Consume the Leadcrate Api',
		defaults: {
			name: 'Leadcrate',
		},
		inputs: [ 'main' ],
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Crate',
						value: 'crate'
					}
				],
				default: 'crate'
			},

			...crateOperations
		]
	}


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		let responseData;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		if (resource === 'crate' && operation === 'getMany') {
			responseData = await leadcrateApiRequest.call(
				this,
				'GET',
				`crate`,
				{},
			);
		}

		returnData.push({
			json: responseData
		})

		return [ returnData ];
	}
}
