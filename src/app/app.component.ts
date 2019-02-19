import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  components = [
    'DynamicSingleOneComponent',
    'DynamicMultipleOneComponent',
    'DynamicMultipleTwoComponent'
  ];

  selectedComponent = '';

  renderComponent() {}
}
