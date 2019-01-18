import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOtherSpecialDynamicContentComponent } from './my-other-special-dynamic-content.component';

@NgModule({
  declarations: [MyOtherSpecialDynamicContentComponent],
  imports: [CommonModule],
  entryComponents: [MyOtherSpecialDynamicContentComponent]
})
export class MyOtherSpecialDynamicContentModule {}
