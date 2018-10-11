import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptParameterDetailsComponent } from './script-parameter-details.component';

describe('ScriptParameterDetailsComponent', () => {
  let component: ScriptParameterDetailsComponent;
  let fixture: ComponentFixture<ScriptParameterDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptParameterDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptParameterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
