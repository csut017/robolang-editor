import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotScriptsComponent } from './robot-scripts.component';

describe('RobotScriptsComponent', () => {
  let component: RobotScriptsComponent;
  let fixture: ComponentFixture<RobotScriptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotScriptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
