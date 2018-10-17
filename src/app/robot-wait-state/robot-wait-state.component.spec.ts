import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotWaitStateComponent } from './robot-wait-state.component';

describe('RobotWaitStateComponent', () => {
  let component: RobotWaitStateComponent;
  let fixture: ComponentFixture<RobotWaitStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotWaitStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotWaitStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
