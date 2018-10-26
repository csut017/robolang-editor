import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotScriptComponent } from './robot-script.component';

describe('RobotScriptComponent', () => {
  let component: RobotScriptComponent;
  let fixture: ComponentFixture<RobotScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
