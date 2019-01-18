import { Routes } from '@angular/router';
import { DynamicContentGuard } from './dynamic-content.guard';

export const DynamicContentRoutes: Routes = [
  {
    path: 'MySpecialDynamicContentComponent',
    loadChildren:
      'src/app/dynamic-content/my-special-dynamic-content/my-special-dynamic-content.module#MySpecialDynamicContentModule',
    canActivate: [DynamicContentGuard]
  },
  {
    path: 'MyOtherSpecialDynamicContentComponent',
    loadChildren:
      'src/app/dynamic-content/my-other-special-dynamic-content/my-other-special-dynamic-content.module#MyOtherSpecialDynamicContentModule',
    canActivate: [DynamicContentGuard]
  }
];
