# Overview — Dynamic Content Outlet

Have you ever needed to dynamically load content or components in your Angular applications? How about in a way that the built-in structural directives  (`*ngIf*`, `*ngSwitch`) just don’t provide? Are you also in need of the optimization benefits of using Ahead-of-Time compilation?

Well, I have good news for you…(And no you don’t have to be Chuck Norris!) If you stay tuned, I will help you get a solution up and running that will provide a solid way to choose from and load dynamically, at run-time, a set of predefined modules & components in your application.

> This article is assumes you are building an Angular 6+ application generated using the Angular CLI. For information on using the Angular CLI check out the [official documentation](https://angular.io/cli#cli-command-reference).

> This arose out of a business need for the company that I work for. What’s important to note here is that many articles and examples exist on loading content dynamically in Angular, but none that I found worked reliably when compiling Angular with the `— prod` or `— aot` flags enabled. The good news is that what I describe in this article works fantastically with Ahead-of-Time compiling.

# What We’re Going To Do

We’re going to build a special module with a dynamic component outlet that can be included and used anywhere in your application. The only requirement is that you register, upfront, an array mapping your dynamic components to their parent modules. You will also add these modules to the `lazyModules` property in your `angular.json` file. By doing so, the compiler will pre-compile these modules. The compiler then splits them off into separate minified chunks and makes them available to the SystemJS loader at runtime, with AOT.

---

## Let’s Build Our Dynamic Content Outlet

Assuming that you have an existing Angular 6+ CLI generated project let’s run through the following steps to scaffold the necessary parts that make up this new Dynamic Content Outlet.

### Generate the Dynamic Content Outlet Module

Generate a new module named `DynamicContentOutletModule` by running the following command in your shell of choice:

```shell
$ ng g m dynamic-content-outlet
```

We will come back later to this module and wire things up.

### Build the Dynamic Content Outlet Registry

Create a new file underneath the newly created folder `src/app/dynamic-content-outlet` named `dynamic-content-outlet.registry.ts`. This will serve as the placeholder for array mapping component name to component type, module path and module name. For now, it will be an empty array as follows.

```typescript
interface RegistryItem {
  componentType: any;
  componentName: string;
  modulePath: string;
  moduleName: string;
}

/**
 * A registry array of Component Name to details
 * that must be updated with each new component
 * that you wish to load dynamically.
 */

export const DynamicContentOutletRegistry: RegistryItem[] = [];
```

### Build the Dynamic Content Outlet Error Component

Create a new file underneath the folder `src/app/dynamic-content-outlet/dynamic-content-outlet-error.component.ts`. This will serve as the component to be rendered anytime an error occurs attempting to load a dynamic component. You can customize the `template` property to use any custom styles or layout that you may have. The `errorMessage` input must stay the same and will be fed with the actual details of the error that occurred while attempting to dynamically render your component.

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic-content-outlet-error-component',
  template: `
    <div>{{ errorMessage }}</div>
  `
})
export class DynamicContentOutletErrorComponent {
  @Input() errorMessage: string;
  constructor() {}
}
```

### Build the Dynamic Content Outlet Service

Create a new file underneath the folder `src/app/dynamic-content-outlet/dynamic-content-outlet.service.ts`. This service encapsulates the logic that loads dynamic components using SystemJS and renders them into the Dynamic Content Outlet. If an error occurs, a `DynamicContentOutletErrorComponent` is rendered instead with the error message included.

```typescript
import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  NgModuleFactoryLoader
} from '@angular/core';
import { DynamicContentOutletErrorComponent } from './dynamic-content-outlet-error.component';
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
        `Unable to derive modulePath from component: ${componentName} in dynamic-content.registry.ts`
      );
    }

    const componentType = this.getComponentTypeForComponent(componentName);

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
    const registryItem = DynamicContentOutletRegistry.find(
      i => i.componentName === componentName
    );

    if (registryItem && registryItem.modulePath) {
      // imported modules must be in the format 'path#moduleName'
      return `${registryItem.modulePath}#${registryItem.moduleName}`;
    }

    return null;
  }

  private getComponentTypeForComponent(componentName: string) {
    const registryItem = DynamicContentOutletRegistry.find(
      i => i.componentName === componentName
    );

    if (registryItem && registryItem.componentType) {
      return registryItem.componentType;
    }

    return null;
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

### Build the Dynamic Content Outlet Component

Create a new file underneath the folder `src/app/dynamic-content-outlet/dynamic-content-outlet.component.ts`. This component takes an input property named `componentName` that will call the `DynamicContentOutletService.GetComponent` method passing into it `componentName`. The service then returns an instance of that rendered and compiled component for injection into the view. The service returns an error component instance if the rendering fails for some reason. The component listens for changes via the `ngOnChanges` life-cycle method. If the `@Input() componentName: string;` is set or changes it automatically re-renders the component as necessary. It also properly handles destroying the component with the `ngOnDestroy` life-cycle method.

```typescript
import {
  Component,
  ComponentRef,
  Input,
  OnChanges,
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
export class DynamicContentOutletComponent implements OnDestroy, OnChanges {
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input() componentName: string;

  private component: ComponentRef<{}>;

  constructor(private dynamicContentService: DynamicContentOutletService) {}

  async ngOnChanges() {
    await this.renderComponent();
  }

  ngOnDestroy() {
    this.destroyComponent();
  }

  private async renderComponent() {
    this.destroyComponent();

    this.component = await this.dynamicContentService.GetComponent(
      this.componentName
    );
    this.container.insert(this.component.hostView);
  }

  private destroyComponent() {
    if (this.component) {
      this.component.destroy();
      this.component = null;
    }
  }
}
```

### Finish Wiring Up Parts To The Dynamic Content Outlet Module

Make sure your `src/app/dynamic-content-outlet/dynamic-content-outlet.module.ts` file looks like the following:

```typescript
import { CommonModule } from '@angular/common';
import {
  NgModule,
  NgModuleFactoryLoader,
  SystemJsNgModuleLoader
} from '@angular/core';
import { DynamicContentOutletErrorComponent } from './dynamic-content-outlet-error.component';
import { DynamicContentOutletComponent } from './dynamic-content-outlet.component';
import { DynamicContentOutletService } from './dynamic-content-outlet.service';

@NgModule({
  imports: [CommonModule],
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
    DynamicContentOutletService
  ]
})
export class DynamicContentOutletModule {}
```

---

## Let’s Use Our New Dynamic Content Outlet

Phew! Take a deep breath and grab a cup of coffee (french press fair trade organic dark roast). The hard work is behind you. Next we will go through the process of actually putting this new module into play!

![](https://cdn-images-1.medium.com/max/1600/1*8BhahXd-DWmGj_n-mhP-gA.jpeg)

### Register your component(s)

For any component that you would like dynamically rendered you need to do the following three steps. **_These steps must be followed exactly_**_._

1. Confirm that the component is listed in the `entryComponents` array in the module that the component is a part of.

2. Add your component to the Dynamic Content Outlet Registry in `src/app/dynamic-content-outlet/dynamic-content-outlet.registry.ts`.

For any component that you would like dynamically rendered, add a new entry to the `DynamicContentOutletRegistry` array in `dynamic-content-outlet.registry.ts`.

The following properties must be filled out:

- `componentName`: This should match exactly the name of the Component you wish to load dynamically.

- `componentType`: This should be the literal type of the Component you wish to load dynamically. Not wrapped in quotes.

- `modulePath`: The absolute path to the module containing the component you wish to load dynamically. This is only the path to the module and does NOT include `moduleName` after a `#`.

- `moduleName`: This is the exact name of the module.

#### Example Component Mapping

```typescript
{
  componentName: 'MySpecialDynamicContentComponent',
  componentType: MySpecialDynamicContentComponent,
  modulePath: 'src/app/my-special-dynamic-content/my-special-dynamic-content.module',
  moduleName: 'MySpecialDynamicContentModule'
},
```

3. In your `angular.json` update the `projects > ** > architect > build > options > lazyModules` array and add an item for each module that you added to the registry in order for the Angular AOT compiler to detect and pre-compile your dynamic modules. If you have multiple projects in a folder, make sure you add this for the correct project you are importing and using dynamic modules in. The updated file will look similar to this:

```json
{
  ...
  "projects": {
    "angular-dynamic-content": {
      ...
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            ...
            "lazyModules": ["src/app/my-special-dynamic-content/my-special-dynamic-content.module"]
          },
        }
      }
    }
  }
}
```

### Wire up the Dynamic Content Outlet Module

Up to this point you have created your dynamic content outlet module and registered your components to be available in the outlet. The last thing we need to do is wire up our new `DynamicContentOutletModule` to be used in our application. In order to do so you need to:

1. Add your new `DynamicContentOutletModule` to the `imports` array of any feature module or the main `AppModule` of your Angular application.

#### Example of addition to the `imports` array

```typescript
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

2. Add the following tag to the template of the parent component that you would like to render the dynamic content in:

```html
<app-dynamic-content-outlet [componentName]="'MyComponent'">
</app-dynamic-content-outlet>
```

This is very similar in nature to Angular’s built-in `<router-outlet>/</router-outlet>` tag. Please note: the value of the input `componentName` is set during initialization of the parent component either from a Component TypeScript class field or set in the in the actual template. The value can also be retrieved from an external source such as a backend web service, but must be provided at initialization.

3. Happy `ng serve --prod` ing!

## Real-World Complex Example

If you are interested in a more in-depth real-world example, then check out the Github Repository which will demonstrate the following:

- Dynamic modules with multiple components
- Demonstrating the use of on-the-fly component changes
- Demonstrating that the scoped styles are loaded dynamically for each component

> GitHub Repository Example [https://github.com/wesleygrimes/angular-dynamic-content](https://github.com/wesleygrimes/angular-dynamic-content)

## Conclusion

Hopefully you have found this solution helpful. Here is the full GitHub repository example for you to clone and play around with. PR’s are welcome, appreciated, encouraged and accepted!

## Additional Resources

I would highly recommend enrolling in the Ultimate Angular courses. It is well worth the money and I have used it as a training tool for new Angular developers. Follow the link below to signup.

[Ultimate Courses: Expert online courses in JavaScript, Angular, NGRX and TypeScript](https://ultimatecourses.com/?ref=76683_ttll_neb)

## Special Thanks

I want to take a moment and thank all those I was able to glean this information from. I did not come up with all this on my own, but I was able to get a working solution by combining parts from each of these articles!

[Dynamically Loading Components with Angular CLI](https://blog.angularindepth.com/dynamically-loading-components-with-angular-cli-92a3c69bcd28)

[Here is what you need to know about dynamic components in Angular](https://blog.angularindepth.com/here-is-what-you-need-to-know-about-dynamic-components-in-angular-ac1e96167f9e)
