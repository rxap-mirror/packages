import {
  type IExecuteFunctions,
  type INodeType,
  type INodeTypeDescription,
  type ITriggerFunctions,
  type ITriggerResponse,
  NodeConnectionType,
} from 'n8n-workflow';

export class ExecuteWorkflowTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Execute Workflow Trigger',
		name: 'developmentExecuteWorkflowTrigger',
		icon: 'fa:hourglass',
		group: ['trigger'],
		version: 1,
		description:
			'Helpers for calling other n8n workflows. Used for designing modular, microservice-like workflows.',
		eventTriggerDescription: '',
		maxNodes: 1,
		defaults: {
			name: 'Execute Workflow Trigger',
			color: '#ff6d5a',
		},

		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				name: 'input',
				displayName: 'Input',
				description: 'The input data send on manual trigger',
				type: 'json',
				default: '',
				required: false,
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'hidden',
				noDataExpression: true,
				options: [
					{
						name: 'Workflow Call',
						value: 'worklfow_call',
						description: 'When called by another workflow using Execute Workflow Trigger',
						action: 'When Called by Another Workflow',
					},
				],
				default: 'worklfow_call',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const manualTriggerFunction = async () => {
			this.emit([this.helpers.returnJsonArray([JSON.parse(this.getNodeParameter('input') as string)])]);
		};

		return {
			manualTriggerFunction,
		};
	}

	async execute(this: IExecuteFunctions) {
		if (this.getMode() === 'manual') {
			return [[{ json: JSON.parse(this.getNodeParameter('input', 0) as string) }]]
		}
		return [this.getInputData()];
	}
}
