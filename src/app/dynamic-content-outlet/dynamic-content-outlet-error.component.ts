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
