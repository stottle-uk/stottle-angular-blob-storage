import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedContainerComponent } from './selected-container.component';

describe('SelectedContainerComponent', () => {
  let component: SelectedContainerComponent;
  let fixture: ComponentFixture<SelectedContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
