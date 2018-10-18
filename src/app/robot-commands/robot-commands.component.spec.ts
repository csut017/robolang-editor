import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotCommandsComponent } from './robot-commands.component';

describe('RobotCommandsComponent', () => {
  let component: RobotCommandsComponent;
  let fixture: ComponentFixture<RobotCommandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotCommandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
