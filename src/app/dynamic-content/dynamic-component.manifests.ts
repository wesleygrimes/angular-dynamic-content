import { DynamicComponentManifest } from 'src/app/_models/dynamic-component-manifest';

export const DynamicComponentManifests: DynamicComponentManifest[] = [
  {
    path: 'MySpecialDynamicContent',
    loadChildren:
      'src/app/my-special-dynamic-content/my-special-dynamic-content.module#MySpecialDynamicContentModule',
    componentName: 'MySpecialDynamicContentComponent'
  }
];
