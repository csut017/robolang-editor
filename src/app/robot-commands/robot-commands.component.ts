import { Component, OnInit, Input } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robot-commands',
  templateUrl: './robot-commands.component.html',
  styleUrls: ['./robot-commands.component.css']
})
export class RobotCommandsComponent implements OnInit {

  constructor() { }

  @Input() client: RobotClient;

  ngOnInit() {
  }

  sendRestart() {
    this.client.send('restart', {type: 'executor'})
      .then(msg => {
        console.log(msg);
      });
  }

  sendUpdate() {
    this.client.send('update', { type: 'schedules' })
      .then(msg => {
        console.log(msg);
      });
  }
}
