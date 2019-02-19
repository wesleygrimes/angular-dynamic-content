import { DynamicMultipleOneComponent } from '../dynamic-multiple/dynamic-multiple-one.component';
import { DynamicMultipleTwoComponent } from '../dynamic-multiple/dynamic-multiple-two.component';
import { DynamicSingleOneComponent } from '../dynamic-single/dynamic-single-one.component';

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
    componentName: 'DynamicSingleOneComponent',
    componentType: DynamicSingleOneComponent,
    modulePath: 'src/app/dynamic-single/dynamic-single.module',
    moduleName: 'DynamicSingleModule'
  },
  {
    componentName: 'DynamicMultipleOneComponent',
    componentType: DynamicMultipleOneComponent,
    modulePath: 'src/app/dynamic-multiple/dynamic-multiple.module',
    moduleName: 'DynamicMultipleModule'
  },
  {
    componentName: 'DynamicMultipleTwoComponent',
    componentType: DynamicMultipleTwoComponent,
    modulePath: 'src/app/dynamic-multiple/dynamic-multiple.module',
    moduleName: 'DynamicMultipleModule'
  }
];
