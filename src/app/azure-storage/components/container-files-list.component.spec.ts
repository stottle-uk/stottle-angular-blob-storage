import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerFilesListComponent } from './container-files-list.component';

describe('ContainerFilesListComponent', () => {
  let component: ContainerFilesListComponent;
  let fixture: ComponentFixture<ContainerFilesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerFilesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
