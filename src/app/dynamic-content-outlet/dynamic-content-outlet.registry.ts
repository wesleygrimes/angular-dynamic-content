interface RegistryItem {
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
    modulePath: 'src/app/dynamic-single/dynamic-single.module',
    moduleName: 'DynamicSingleModule'
  },
  {
    componentName: 'DynamicMultipleOneComponent',
    modulePath: 'src/app/dynamic-multiple/dynamic-multiple.module',
    moduleName: 'DynamicMultipleModule'
  },
  {
    componentName: 'DynamicMultipleTwoComponent',
    modulePath: 'src/app/dynamic-multiple/dynamic-multiple.module',
    moduleName: 'DynamicMultipleModule'
  }
];
