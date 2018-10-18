import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';
import { RobotSchedule } from '../data/robot-schedule';
import * as moment from 'moment';

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

  trigger() {
    this.triggerSchedule(false);
  }

  debug() {
    this.triggerSchedule(true);
  }

  formatTime(date: string): string{
    if (!date) return 'n/a';
    return moment(date).format('h:mm:ss a');
  }

  sendCancel() {
    this.client.send('cancel', {id: this.currentSchedule.event_id, type: 'wait'})
      .then(msg => {
        console.log(msg);
      });
  }

  private triggerSchedule(debug: boolean) {
    this.client.send('trigger', { id: this.currentSchedule.event_id, type: 'schedule', debug: debug })
      .then(msg => {
        console.log(msg);
      });
  }

  private queryState() {
    this.schedules = undefined;
    this.currentSchedule = undefined;
    this.client.query('schedules')
      .then(msg => {
        this.schedules = msg.data.sort(RobotSchedule.compare);
      });
  }
}
