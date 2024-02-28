import { OperationParameter } from './add-operation-to-controller';

export const TABLE_QUERY_LIST: OperationParameter[] = [
  {
    name: 'pageIndex',
    type: 'number',
    defaultValue: '0',
  },
  {
    name: 'pageSize',
    type: 'number',
    defaultValue: '5',
  },
  {
    name: 'sortDirection',
    type: 'string',
    defaultValue: w => w.quote('desc'),
  },
  {
    name: 'sortBy',
    type: 'string',
    defaultValue: w => w.quote('__updatedAt'),
  },
  {
    name: 'filter',
    type: {
      name: 'FilterQuery',
      moduleSpecifier: '@rxap/nest-utilities',
    },
    isArray: true,
    pipeList: [ {
      name: 'new FilterQueryPipe()',
      namedImport: 'FilterQueryPipe',
      moduleSpecifier: '@rxap/nest-utilities',
    } ],
    // the FilterQueryPipe will set the default value to an empty array
    hasQuestionToken: false,
  },
];
