import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySpecialDynamicContentComponent } from './my-special-dynamic-content.component';

describe('MySpecialDynamicContentComponent', () => {
  let component: MySpecialDynamicContentComponent;
  let fixture: ComponentFixture<MySpecialDynamicContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySpecialDynamicContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySpecialDynamicContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
