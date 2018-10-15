import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptVersionsComponent } from './script-versions.component';

describe('ScriptVersionsComponent', () => {
  let component: ScriptVersionsComponent;
  let fixture: ComponentFixture<ScriptVersionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
