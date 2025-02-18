import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class CommandTrigger implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: '',
      defaults: { name: 'CommandTrigger' },
      name: 'cqrsCommandTrigger',
      inputs: [],
      triggerPanel: {
        header: '',
        executionsHelp: {
          inactive: '<b>While building your workflow</b>, click the \'listen\' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you\'re happy with your workflow</b>, <a data-key=\'activate\'>activate</a> it. Then every time a change is detected, the workflow will execute. These executions will show up in the <a data-key=\'executions\'>executions list</a>, but not in the editor.',
          active: '<b>While building your workflow</b>, click the \'listen\' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it\'s activated. Every time a change is detected, this node will trigger an execution. These executions will show up in the <a data-key=\'executions\'>executions list</a>, but not in the editor.'
        },
        activationHint: 'Once you’ve finished building your workflow, <a data-key=\'activate\'>activate</a> it to have it also listen continuously (you just won’t see those executions here).'
      },
      outputs: [ NodeConnectionType.Main ],
      displayName: 'CommandTrigger',
      group: ['trigger'],
      icon: 'file:Command.svg',
      properties: []
    };
}
