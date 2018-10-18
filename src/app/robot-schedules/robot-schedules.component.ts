import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';
import { RobotSchedule } from '../data/robot-schedule';

@Component({
  selector: 'app-robot-schedules',
  templateUrl: './robot-schedules.component.html',
  styleUrls: ['./robot-schedules.component.css']
})
export class RobotSchedulesComponent implements OnInit, OnChanges {

  constructor() { }

  schedules: RobotSchedule[];
  currentSchedule: RobotSchedule;
  @Input() client: RobotClient;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.queryState();
  }

  private queryState() {
    this.schedules = undefined;
    this.currentSchedule = undefined;
    this.client.query('schedules')
      .then(msg => {
        this.schedules = msg.data;
      });
  }
}
