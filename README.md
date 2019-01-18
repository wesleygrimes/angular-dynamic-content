# Building An AOT-Friendly Dynamic Content Outlet in Angular

Have you ever needed to dynamically load content or components in your Angular applications in a way that the built-in structural directives just don't provide? Is your requirement weird enough that `*ngIf` and `*ngSwitch` just don't provide enough flexibilty? Do you want that flexibility but still need the optimization benefits of using Ahead-of-Time compilation Well, I have good news for you....you're not alone. Even more so, you'll have a solution up and running in less than an hour.

If I can have an hour of your time you will be able to implement a solution that you will provide a solid way to choose from and load dynamically, at runtime, a set of pre-defined modules & components in your application.

Side Note: This arose out of a business need for the company that I work for. What's important to note here is that many articles and examples exist on loading content dynamically in Angular, but none that I found worked reliably when compiling Angular with the `--prod` or `--aot` flags enabled. Good news is that what I describe in this article works fantastically with Ahead-of-Time compiling.

Assumptions: This article is assumes you are building an Angular 6+ application generated using the Angular CLI. For information on using the Angular CLI check out the [official documentation](https://angular.io/cli#cli-command-reference).

## TL;DR - Build a Dynamic Content Outlet

You're going to build a special module with a dynamic component outlet that can be included and used anywhere in your application. The only requirement is that you register, upfront, an array mapping your dynamic components to their parent modules. This "tricks" the compiler into thinking these dynamic modules are lazy-loaded routes. The compiler then splits them off into separate minifed chunks and makes them available to the SystemJS loader at runtime, with AOT.

## Create A Dynamic Content Outlet Module

Assuming that you have an existing Angular 6+ CLI generated project let's run through the following steps to scaffold the necessary parts that make up this new Dynamic Content Outlet.

### Create a new DynamicContentOutletModule

Generate a new module named `DynamicContentOutletModule` by running the following command in your shell of choice `ng g m dynamic-content-outlet`. We will come back later to this module and wire things up.

### Create a new DynamicContentOutletRegistry

Create a new file underneath the newly created folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.registry.ts`. This will serve as the placeholder for an object dictionary that maps the Component Name string to the Component Type. For now, it will be an empty object as follows.

```
/**
 * A mapping of Component Name to Component Type
 * that must be updated with each new component
 * that you wish to load dynamically.
 */
export const DynamicContentOutletRegistry = {};
```

### Create a new DynamicContentOutletMappings

Create a new file underneath the folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.mappings.ts`. This is essentially an Angular `Routes` array. For now, it will be an empty object as follows. We will come back later and fill this in.

```
import { Routes } from '@angular/router';

/**
 * A list of pseudo-routes or outlets linking Component to module
 * that must be updated with each new component that you wish
 * to load dynamically. This must be of type Routes so that
 * the Angular AOT compiler picks these up and chunks them
 * for runtime loading.
 *
 *
 * path: This should match exactly the name of the Component
 *       you wish to load dynamically.
 *
 * loadChildren: absolute path to the module containing the
 *  component you wish to load dynamically. This follows the
 *  same syntax as lazy-loaded routes in Angular.
 *
 * canActivate: Make sure to include the DynamicContentOutletGuard
 *  to prevent accidental navigation.
 */
export const DynamicContentOutletMappings: Routes = [];
```

### Create a new DynamicContentOutletErrorComponent

Create a new file underneath the folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet-error.component.ts`. This will serve as the component to be rendered anytime an error occurs attempt to load a dynamic component. You can customize the `template` property to use any custom styles or layout that you may have. The `errorMessage` input must stay the same and will be fed with the actual details of the error that occurred attempting to dynamically render your component.

```
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic-content-error-component',
  template: `
    <div>{{ errorMessage }}</div>
  `
})
export class DynamicContentOutletErrorComponent {
  @Input() errorMessage: string;
  constructor() {}
}

```

### Create a new DynamicContentOutletService

Create a new file underneath the folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.service.ts`. A future article may deep dive into the details of the "why" and "how" of this service. For now, however, just know that from a high-level point of view this service encapsulates the logic that loads dynamic components using SystemJS and renders them into the Dynamic Content Outlet. If an error occurs, a DynamicContentOutletErrorComponent is rendered instead with the error message included.

```
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
```

### Create a new DynamicContentOutletGuard

Create a new file underneath the folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.guard.ts`. This serves as a stop-gap to prevent accidental navigation to the routes as techincally the dynamic components are lazy-loaded Angular routes.

```
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class DynamicContentOutletGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return false; // prevent accidental navigation to this route
  }
}
```

### Create a new DynamicContentOutletComponent

Create a new file underneath the folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.component.ts`. A future article may deep dive into the details of the "why" and "how" of this component. For now, however, just know that from a high-level point of view this component takes an `@Input()` property named `componentName` that will call the `DynamicContentOutletService`.`GetComponent` method passing into it `componentName`. The service then returns an instance of that rendered and compiled component for injection into the view. The service returns an error component instance if the rendering fails for some reason.

```
import {
  AfterViewInit,
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { DynamicContentOutletService } from './dynamic-content-outlet.service';

@Component({
  selector: 'app-dynamic-content-outlet',
  template: `
    <ng-container #container></ng-container>
  `
})
export class DynamicContentOutletComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input() componentName: string;

  private component: ComponentRef<{}>;

  constructor(private dynamicContentService: DynamicContentOutletService) {}

  async ngAfterViewInit() {
    this.component = await this.dynamicContentService.GetComponent(
      this.componentName
    );
    this.container.insert(this.component.hostView);
  }

  ngOnDestroy() {
    if (this.component) {
      this.component.destroy();
      this.component = null;
    }
  }
}
```

### Finish Wiring Up Parts To The Dynamic Content Outlet Module

Make sure your `src/app/dynamic-content-outlet/dynamic-content-outlet.module.ts` file looks like the following:

```
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
```

## Register component(s) for use in the Dynamic Content Outlet Module

For any component that you would like dynamically rendered you need to do the following three steps. These steps must be followed exactly.

1. Confirm that the component is listed in the `entryComponents` array in the module that the component is a part of.

2. Add your component to the Dynamic Content Outlet Mappings in `src/app/dynamic-content-outlet/dynamic-content-outlet.mappings.ts`.

For any component that you would like dynamically rendered, add a new entry to the DynamicContentOutletMappings array in `dynamic-content-outlet.mappings.ts`. This is essentially an Angular `Routes` array. The following properties must filled out:

- `path`: This should match exactly the name of the Component you wish to load dynamically.
- `loadChildren`: The absolute path to the module containing the component you wish to load dynamically. Including the module name following a `#`.
- `canActivate`: Make sure to include the DynamicContentOutletGuard to prevent accidental navigation. If you include this for the first time you may need to add it to your import declarations at the top of file.

### Example Component Mapping

```
{
  path: 'MySpecialDynamicContentComponent',
  loadChildren:
      'src/app/my-special-dynamic-content/my-special-dynamic-content.module#MySpecialDynamicContentModule',
  canActivate: [DynamicContentOutletGuard]
}
```

3. Add your component to the Dynamic Content Outlet Registry in `src/dynamic-content-outlet/dynamic-content-outlet.registry.ts`.

One of the requirements of the `ComponentFactoryResolver: resolveComponentFactory` method is that you have to pass the literal type of the component. Since this cannot be a string literal, we create a dictionary that maps the Component Name string to the Component Type. Make sure that you add your component to this dictionary. You will need to import the component type from the component file at the top of the import declarations in your file.

### Example Component Registry Item

```
export const DynamicContentOutletRegistry = {
  ...,
  MySpecialDynamicContentComponent: MySpecialDynamicContentComponent
};
```

## Wire up the Dynamic Content Outlet Module

Up to this point you have created your dynamic content outlet module and registered your components to be available in the outlet. The last thing we need to do is wire up our new DynamicContentOutletModule to be used in our application. In order to do so you need to:

1. Add your new `DynamicContentOutletModule` to the `imports` array of any feature module or the main `AppModule` of your Angular application.

### Example of addition to the `imports` array

```
@NgModule({
  ...
  imports: [
    ...
    DynamicContentOutletModule
    ],
  ...
})
export class AppModule {}
```

2. Add the following tag to the template of the parent component that would like to render the dynamic content in: `<app-dynamic-content-outlet [componentName]="'MyComponent'"></app-dynamic-content-outlet>`. This is very simliar in nature to Angular's built-in `<router-outlet>/</router-outlet>` tag. Please note: the value of the input `componentName` is set during initialization of the parent component either from a Component TypeScript class field or set in the in the actual template. The value can also be retrieved from an external source such as a backend web service, but must be provided at initialization.

3. Happy `ng serve --prod` ing!

## Conclusion

Hopefully you have found this solution helpful. Here is the full GitHub repository example for yo to clone and play around with. PR's are welcome, appreciated, encouraged and accepted!
Full example code: [github.com/wesleygrimes/angular-dynamic-content](https://github.com/wesleygrimes/angular-dynamic-content)
