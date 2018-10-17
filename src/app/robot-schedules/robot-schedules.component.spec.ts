import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotSchedulesComponent } from './robot-schedules.component';

describe('RobotSchedulesComponent', () => {
  let component: RobotSchedulesComponent;
  let fixture: ComponentFixture<RobotSchedulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotSchedulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
