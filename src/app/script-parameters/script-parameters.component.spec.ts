import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptParametersComponent } from './script-parameters.component';

describe('ScriptParametersComponent', () => {
  let component: ScriptParametersComponent;
  let fixture: ComponentFixture<ScriptParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
