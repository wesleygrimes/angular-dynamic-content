import { MyOtherSpecialDynamicContentComponent } from 'src/app/my-other-special-dynamic-content/my-other-special-dynamic-content.component';
import { MySpecialDynamicContentComponent } from 'src/app/my-special-dynamic-content/my-special-dynamic-content.component';

interface RegistryItem {
  componentType: any;
  componentName: string;
  modulePath: string;
  moduleName: string;
}

/**
 * A mapping of Component Name to Component Type
 * that must be updated with each new component
 * that you wish to load dynamically.
 */
export const DynamicContentOutletRegistry: RegistryItem[] = [
  {
    componentName: 'MySpecialDynamicContentComponent',
    componentType: MySpecialDynamicContentComponent,
    modulePath:
      'src/app/my-special-dynamic-content/my-special-dynamic-content.module',
    moduleName: 'MySpecialDynamicContentModule'
  },
  {
    componentName: 'MyOtherSpecialDynamicContentComponent',
    componentType: MyOtherSpecialDynamicContentComponent,
    modulePath:
      'src/app/my-other-special-dynamic-content/my-other-special-dynamic-content.module',
    moduleName: 'MyOtherSpecialDynamicContentModule'
  }
];
