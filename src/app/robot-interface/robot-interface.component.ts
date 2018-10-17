import { Component, OnInit, Input } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robot-interface',
  templateUrl: './robot-interface.component.html',
  styleUrls: ['./robot-interface.component.css']
})
export class RobotInterfaceComponent implements OnInit {

  constructor() { }

  currentView: string = 'schedules';
  @Input() client: RobotClient;

  ngOnInit() {
  }

}
