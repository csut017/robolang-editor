import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';
import { RobotWaitState } from '../data/robot-wait-state';

@Component({
  selector: 'app-robot-wait-state',
  templateUrl: './robot-wait-state.component.html',
  styleUrls: ['./robot-wait-state.component.css']
})
export class RobotWaitStateComponent implements OnInit, OnChanges {

  constructor() { }

  waits: RobotWaitState[];
  currentWait: RobotWaitState;
  @Input() client: RobotClient;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.queryState();
  }

  trigger() {
    this.client.send('input', {value: this.currentWait.response})
      .then(msg => {
        console.log(msg);
      });
  }

  private queryState(){
    this.waits = undefined;
    this.currentWait = undefined;
    this.client.query('waitState')
      .then(msg => {
        this.waits = msg.data;
      });
  }
}
