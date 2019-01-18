import { Routes } from '@angular/router';
import { DynamicContentOutletGuard } from './dynamic-content-outlet.guard';

/**
 * A list of pseudo-routes or outlets linking Component to module
 * that must be updated with each new component that you wish
 * to load dynamically. This must be of type Routes so that
 * the Angular AOT compiler picks these up and chunks them
 * for runtime loading.
 *
 *
 * path: This should match exactly the name of the Component
 *       you wish to load dynamically.
 *
 * loadChildren: absolute path to the module containing the
 *  component you wish to load dynamically. This follows the
 *  same syntax as lazy-loaded routes in Angular.
 *
 * canActivate: Make sure to include the DynamicContentOutletGuard
 *  to prevent accidental navigation.
 */
export const DynamicContentOutletMappings: Routes = [
  {
    path: 'MySpecialDynamicContentComponent',
    loadChildren:
      'src/app/my-special-dynamic-content/my-special-dynamic-content.module#MySpecialDynamicContentModule',
    canActivate: [DynamicContentOutletGuard]
  },
  {
    path: 'MyOtherSpecialDynamicContentComponent',
    loadChildren:
      'src/app/my-other-special-dynamic-content/my-other-special-dynamic-content.module#MyOtherSpecialDynamicContentModule',
    canActivate: [DynamicContentOutletGuard]
  }
];
