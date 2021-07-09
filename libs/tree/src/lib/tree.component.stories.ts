import {
  moduleMetadata,
  Story,
  componentWrapperDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '@rxap/config';
import '@angular/localize/init';
import {
  TreeComponentModule,
  TreeComponent,
  TreeDataSource
} from '@rxap/tree';
import { WithChildren } from '@rxap/utilities';
import { v4 as uuid } from 'uuid';
import {
  ToMethod,
  Node
} from '@rxap/utilities/rxjs';

ConfigService.Config = {
  navigation: {
    collapsed: true
  }
};

export default {
  title:      'TreeComponent',
  component:  TreeComponent,
  decorators: [
    moduleMetadata({
      imports:   [
        // with navigation config is overwrite by navigation.component.stories.ts
        TreeComponentModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: []
    }),
    //👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em; border: 1px solid black">${story}</div>`)
  ]
};

export interface Item extends WithChildren {
  id: string;
  name: string;
}

const rootRemoteMethod     = ToMethod<Item[], void>(() => [
  { id: uuid(), name: 'Root1', hasChildren: true },
  { id: uuid(), name: 'Root2', hasChildren: true },
  { id: uuid(), name: 'Root3', hasChildren: true }
]);
const childrenRemoteMethod = ToMethod<Item[], Node<Item>>(node => [
  { id: uuid(), name: 'Sub1' },
  { id: uuid(), name: 'Sub2', hasChildren: true },
  { id: uuid(), name: 'Sub3' }
]);
const treeDataSource       = new TreeDataSource(
  rootRemoteMethod,
  childrenRemoteMethod,
  { id: 'storybook' }
);

const Template: Story<TreeComponent<Item>> = args => ({
  props: {
    ...args,
    dataSource: treeDataSource,
    toDisplay:  (item: Item) => item.name
  }
});

export const Default = Template.bind({});
