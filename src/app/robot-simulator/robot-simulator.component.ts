import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotScript } from '../data/robot-script';
import { Robot } from '../data/robot';

@Component({
  selector: 'app-robot-simulator',
  templateUrl: './robot-simulator.component.html',
  styleUrls: ['./robot-simulator.component.css']
})
export class RobotSimulatorComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() currentRobot: Robot;
  @Input() startScript: RobotScript;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
  }
}
