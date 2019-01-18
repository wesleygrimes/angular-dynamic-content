import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  NgModuleFactoryLoader
} from '@angular/core';
import { DynamicContentOutletErrorComponent } from './dynamic-content-outlet-error.component';
import { DynamicContentOutletMappings } from './dynamic-content-outlet.mappings';
import { DynamicContentOutletRegistry } from './dynamic-content-outlet.registry';

@Injectable()
export class DynamicContentOutletService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private moduleLoader: NgModuleFactoryLoader,
    private injector: Injector
  ) {}

  async GetComponent(componentName: string): Promise<ComponentRef<any>> {
    const modulePath = this.getModulePathForComponent(componentName);

    if (!modulePath) {
      return this.getDynamicContentErrorComponent(
        `Unable to derive modulePath from component: ${componentName} in dynamic-content.routes.ts`
      );
    }

    const componentType = DynamicContentOutletRegistry[componentName];

    if (!componentType) {
      return this.getDynamicContentErrorComponent(
        `Unable to derive componentType from component: ${componentName} in dynamic-content.registry.ts`
      );
    }

    try {
      const moduleFactory = await this.moduleLoader.load(modulePath);
      const moduleReference = moduleFactory.create(this.injector);
      const componentResolver = moduleReference.componentFactoryResolver;

      const componentFactory = componentResolver.resolveComponentFactory(
        componentType
      );
      return componentFactory.create(this.injector);
    } catch (error) {
      console.error(error.message);
      return this.getDynamicContentErrorComponent(
        `Unable to load module ${modulePath}.
                Looked up using component: ${componentName}. Error Details: ${
          error.message
        }`
      );
    }
  }

  private getModulePathForComponent(componentName: string) {
    let modulePath: string = null;

    const manifest = DynamicContentOutletMappings.find(
      m => m.path === componentName
    );

    if (manifest && manifest.loadChildren && manifest.loadChildren.toString()) {
      modulePath = manifest.loadChildren.toString();
    }

    return modulePath;
  }

  private getDynamicContentErrorComponent(errorMessage: string) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      DynamicContentOutletErrorComponent
    );
    const componentRef = factory.create(this.injector);
    const instance = <any>componentRef.instance;
    instance.errorMessage = errorMessage;
    return componentRef;
  }
}
