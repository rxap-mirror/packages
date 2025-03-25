import type {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Minio implements ICredentialType {
	name = 'minio';

	displayName = 'Minio';

	properties: INodeProperties[] = [
		{
			displayName: 'Minio Endpoint',
			name: 'endPoint',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 9000,
		},
		{
			displayName: 'Use SSL',
			name: 'useSSL',
			type: 'boolean',
			default: true,
		},
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		}
	];
}
