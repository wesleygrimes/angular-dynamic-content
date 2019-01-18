import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DynamicContentErrorComponent } from './dynamic-content-error/dynamic-content-error.component';
import { DynamicContentGuard } from './dynamic-content.guard';
import { DynamicContentRoutes } from './dynamic-content.routes';
import { DynamicContentService } from './dynamic-content.service';
import { DynamicContentComponent } from './dynamic-content/dynamic-content.component';

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(DynamicContentRoutes)],
  declarations: [DynamicContentComponent, DynamicContentErrorComponent],
  exports: [DynamicContentComponent],
  entryComponents: [DynamicContentErrorComponent],
  providers: [DynamicContentGuard, DynamicContentService]
})
export class DynamicContentModule {}
