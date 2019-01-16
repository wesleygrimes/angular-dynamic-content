import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicContentComponent } from './dynamic-content/dynamic-content.component';
import { UnknownDynamicContentComponent } from './unknown-dynamic-content/unknown-dynamic-content.component';

@NgModule({
  declarations: [DynamicContentComponent, UnknownDynamicContentComponent],
  imports: [CommonModule],
  exports: [DynamicContentComponent, UnknownDynamicContentComponent],
  entryComponents: [UnknownDynamicContentComponent]
})
export class DynamicContentModule {}
