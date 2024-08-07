import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Neo4jBasicAuthCredentials implements ICredentialType {
  name = 'neo4j-basic-auth';
  displayName = 'Neo4j Basic Auth';
  properties: INodeProperties[] = [
    {
      displayName: 'URI',
      name: 'uri',
      type: 'string',
      default: 'neo4j://localhost',
    },
    {
      displayName: 'User',
      name: 'user',
      type: 'string',
      default: 'neo4j',
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      default: '',
      typeOptions: {
        password: true,
      },
    },
  ];
}
