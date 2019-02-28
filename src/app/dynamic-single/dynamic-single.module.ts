import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicSingleOneComponent } from './dynamic-single-one.component';

@NgModule({
  declarations: [DynamicSingleOneComponent],
  imports: [CommonModule],
  entryComponents: [DynamicSingleOneComponent]
})
export class DynamicSingleModule {
  static dynamicComponentsMap = {
    DynamicSingleOneComponent
  };
}
