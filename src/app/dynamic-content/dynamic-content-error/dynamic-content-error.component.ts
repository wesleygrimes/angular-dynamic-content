import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic-content-error-component',
  template: `
    <div>{{ errorMessage }}</div>
  `
})
export class DynamicContentErrorComponent {
  @Input() errorMessage: string;
  constructor() {}
}
