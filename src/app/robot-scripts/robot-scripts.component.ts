import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { RobotClient } from '../services/robot-communications.service';
import { RobotScript } from '../data/robot-script';

@Component({
  selector: 'app-robot-scripts',
  templateUrl: './robot-scripts.component.html',
  styleUrls: ['./robot-scripts.component.css']
})
export class RobotScriptsComponent implements OnInit, OnChanges {

  constructor() { }

  scripts: RobotScript[];
  currentScript: RobotScript;
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

  private triggerSchedule(debug: boolean) {
    this.client.send('trigger', { id: this.currentScript.name, type: 'script', debug: debug })
      .then(msg => {
        console.log(msg);
      });
  }

  private queryState(){
    this.scripts = undefined;
    this.currentScript = undefined;
    this.client.query('scripts')
      .then(msg => {
        this.scripts = msg.data.sort(RobotScript.compare);
      });
  }
}
