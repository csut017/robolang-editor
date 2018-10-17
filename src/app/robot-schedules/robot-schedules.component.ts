import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robot-schedules',
  templateUrl: './robot-schedules.component.html',
  styleUrls: ['./robot-schedules.component.css']
})
export class RobotSchedulesComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() client: RobotClient;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.queryState();
  }

  private queryState() {
    this.client.query('schedules')
      .then(msg => {
        console.log(msg);
      });
  }
}
