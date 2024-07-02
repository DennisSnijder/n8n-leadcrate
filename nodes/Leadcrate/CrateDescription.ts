import type { INodeProperties } from 'n8n-workflow';

export const crateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [ 'crate' ],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many crates',
				action: 'Get many crates',
			}
		],
		default: 'getMany',
	},
];
