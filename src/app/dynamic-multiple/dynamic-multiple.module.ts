import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicMultipleOneComponent } from './dynamic-multiple-one.component';
import { DynamicMultipleTwoComponent } from './dynamic-multiple-two.component';

@NgModule({
  declarations: [DynamicMultipleOneComponent, DynamicMultipleTwoComponent],
  imports: [CommonModule],
  entryComponents: [DynamicMultipleOneComponent, DynamicMultipleTwoComponent]
})
export class DynamicMultipleModule {
  static dynamicComponentsMap = {
    DynamicMultipleOneComponent,
    DynamicMultipleTwoComponent
  };
}
