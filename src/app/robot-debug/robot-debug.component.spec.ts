import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotDebugComponent } from './robot-debug.component';

describe('RobotDebugComponent', () => {
  let component: RobotDebugComponent;
  let fixture: ComponentFixture<RobotDebugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotDebugComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
