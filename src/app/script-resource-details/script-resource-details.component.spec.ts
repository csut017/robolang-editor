import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptResourceDetailsComponent } from './script-resource-details.component';

describe('ScriptResourceDetailsComponent', () => {
  let component: ScriptResourceDetailsComponent;
  let fixture: ComponentFixture<ScriptResourceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptResourceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptResourceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
