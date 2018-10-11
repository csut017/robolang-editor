import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptResourcesComponent } from './script-resources.component';

describe('ScriptResourcesComponent', () => {
  let component: ScriptResourcesComponent;
  let fixture: ComponentFixture<ScriptResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
