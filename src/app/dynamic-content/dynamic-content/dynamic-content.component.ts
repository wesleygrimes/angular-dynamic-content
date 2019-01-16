import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  NgModuleFactory,
  NgModuleFactoryLoader,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { DynamicComponentManifest } from 'src/app/_models';
import { DynamicComponentManifests } from '../dynamic-component.manifests';
import { UnknownDynamicContentComponent } from '../unknown-dynamic-content/unknown-dynamic-content.component';

@Component({
  selector: 'app-dynamic-content',
  templateUrl: './dynamic-content.component.html',
  styleUrls: ['./dynamic-content.component.css']
})
export class DynamicContentComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input() type: string;

  private componentRef: ComponentRef<{}>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private moduleFactoryLoader: NgModuleFactoryLoader,
    private injector: Injector
  ) {}

  ngOnInit() {
    if (this.type) {
      const sectionName = this.type;
      const componentManifest: DynamicComponentManifest = DynamicComponentManifests.find(
        function(manifest) {
          return manifest.path === sectionName;
        }
      );

      if (!componentManifest) {
        this.dynamicComponentError(
          `'${sectionName}' is not found in the DynamicComponentManifest.`
        );
        return;
      }

      this.moduleFactoryLoader
        .load(componentManifest.loadChildren)
        .then((moduleFactory: NgModuleFactory<any>) => {
          console.log(moduleFactory);
          const moduleRef = moduleFactory.create(this.injector);
          const entryComponentType = moduleRef.injector.get(
            componentManifest.componentName
          );
          const componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(
            entryComponentType
          );
          this.componentRef = this.container.createComponent(componentFactory);
        })
        .catch((reason: any) => {
          this.dynamicComponentError(
            `Module for '${sectionName}' could not be loaded.  Module: ${
              componentManifest.loadChildren
            } Reason: ${reason}`
          );
        });
    }
  }

  dynamicComponentError(errorMessage: string) {
    console.error(errorMessage);
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      UnknownDynamicContentComponent
    );
    this.componentRef = this.container.createComponent(factory);
    // set component context
    const instance = <UnknownDynamicContentComponent>this.componentRef.instance;
    instance.loadingError = errorMessage;
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
