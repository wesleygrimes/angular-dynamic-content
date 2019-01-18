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
