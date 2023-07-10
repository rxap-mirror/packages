import {componentWrapperDecorator, moduleMetadata, Story} from '@storybook/angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {ConfigService} from '@rxap/config';
import '@angular/localize/init';
import {TreeComponent} from './tree.component';
import {TreeDataSource} from './tree.data-source';
import {GenerateRandomString, WithChildren} from '@rxap/utilities';
import {Node} from '@rxap/data-structure-tree';
import {ToMethod} from '@rxap/pattern';

ConfigService.Config = {
  navigation: {
    collapsed: true,
  },
};

export default {
  title: 'TreeComponent',
  component: TreeComponent,
  decorators: [
    moduleMetadata({
      imports: [
        // with navigation config is overwrite by navigation.component.stories.ts
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      providers: [],
    }),
    //👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em; border: 1px solid black">${story}</div>`),
  ],
};

export interface Item extends WithChildren {
  id: string;
  name: string;
}

const rootRemoteMethod = ToMethod<Item[], void>(() => [
  {id: GenerateRandomString(), name: 'Root1', hasChildren: true},
  {id: GenerateRandomString(), name: 'Root2', hasChildren: true},
  {id: GenerateRandomString(), name: 'Root3', hasChildren: true},
]);
const childrenRemoteMethod = ToMethod<Item[], Node<Item>>(node => [
  {id: GenerateRandomString(), name: 'Sub1'},
  {id: GenerateRandomString(), name: 'Sub2', hasChildren: true},
  {id: GenerateRandomString(), name: 'Sub3'},
]);
const treeDataSource = new TreeDataSource(
  rootRemoteMethod,
  childrenRemoteMethod,
  {id: 'storybook'},
);

const Template: Story<TreeComponent<Item>> = args => ({
  props: {
    ...args,
    dataSource: treeDataSource,
    toDisplay: (item: Item) => item.name,
  },
});

export const Default = Template.bind({});
