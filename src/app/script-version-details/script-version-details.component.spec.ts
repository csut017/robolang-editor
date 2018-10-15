import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptVersionDetailsComponent } from './script-version-details.component';

describe('ScriptVersionDetailsComponent', () => {
  let component: ScriptVersionDetailsComponent;
  let fixture: ComponentFixture<ScriptVersionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptVersionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptVersionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
