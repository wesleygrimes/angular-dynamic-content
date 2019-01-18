import {
  AfterViewInit,
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { DynamicContentService } from '../dynamic-content.service';

@Component({
  selector: 'app-dynamic-content',
  template: `
    <div #container></div>
  `
})
export class DynamicContentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input() componentType: string;

  private component: ComponentRef<{}>;

  constructor(private dynamicContentService: DynamicContentService) {}

  async ngAfterViewInit() {
    this.component = await this.dynamicContentService.getComponent(
      this.componentType
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
