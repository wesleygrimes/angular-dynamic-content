import { MyOtherSpecialDynamicContentComponent } from 'src/app/my-other-special-dynamic-content/my-other-special-dynamic-content.component';
import { MySpecialDynamicContentComponent } from 'src/app/my-special-dynamic-content/my-special-dynamic-content.component';

/**
 * A mapping of Component Name to Component Type
 * that must be updated with each new component
 * that you wish to load dynamically.
 */
export const DynamicContentOutletRegistry = {
  MySpecialDynamicContentComponent: MySpecialDynamicContentComponent,
  MyOtherSpecialDynamicContentComponent: MyOtherSpecialDynamicContentComponent
};
