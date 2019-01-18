import { CommonModule } from '@angular/common';
import {
  NgModule,
  NgModuleFactoryLoader,
  SystemJsNgModuleLoader
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { DynamicContentOutletErrorComponent } from './dynamic-content-outlet-error.component';
import { DynamicContentOutletComponent } from './dynamic-content-outlet.component';
import { DynamicContentOutletGuard } from './dynamic-content-outlet.guard';
import { DynamicContentOutletMappings } from './dynamic-content-outlet.mappings';
import { DynamicContentOutletService } from './dynamic-content-outlet.service';

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(DynamicContentOutletMappings)],
  declarations: [
    DynamicContentOutletComponent,
    DynamicContentOutletErrorComponent
  ],
  exports: [DynamicContentOutletComponent],
  providers: [
    {
      provide: NgModuleFactoryLoader,
      useClass: SystemJsNgModuleLoader
    },
    DynamicContentOutletGuard,
    DynamicContentOutletService
  ]
})
export class DynamicContentOutletModule {}
