import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robot-debug',
  templateUrl: './robot-debug.component.html',
  styleUrls: ['./robot-debug.component.css']
})
export class RobotDebugComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() client: RobotClient;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.queryState();
  }

  private queryState(){
    this.client.query('scripts')
      .then(msg => {
        console.log(msg);
      });
  }
}
