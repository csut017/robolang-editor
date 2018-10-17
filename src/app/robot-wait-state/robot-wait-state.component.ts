import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robot-wait-state',
  templateUrl: './robot-wait-state.component.html',
  styleUrls: ['./robot-wait-state.component.css']
})
export class RobotWaitStateComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() client: RobotClient;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.queryState();
  }

  private queryState(){
    this.client.query('wait')
      .then(msg => {
        console.log(msg);
      });
  }
}
