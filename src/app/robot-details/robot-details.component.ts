import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Robot } from '../data/robot';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { RobotScript } from '../data/robot-script';

class RobotInformation {
  patient: string;
  lastAccess: string;
}

@Component({
  selector: 'app-robot-details',
  templateUrl: './robot-details.component.html',
  styleUrls: ['./robot-details.component.css']
})
export class RobotDetailsComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() currentRobot: Robot;
  currentScript: RobotScript;
  information: RobotInformation = new RobotInformation();
  scriptsDownloadLocation: string;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.information = new RobotInformation();
    this.currentScript = undefined;
    if (this.currentRobot.patient) {
      this.information.patient = this.currentRobot.patient;
      if (this.currentRobot.nhi) this.information.patient += ' [' + this.currentRobot.nhi + ']';
      this.scriptsDownloadLocation = environment.baseURL + `robots/${this.currentRobot.id}/scripts/all`;
    }
    if (this.currentRobot.lastAccess) {
      this.information.lastAccess = moment(this.currentRobot.lastAccess).fromNow();
    }
  }

  connect(): void {
    if (this.currentRobot.address) {
      window.open(this.currentRobot.address.replace('/ping', ''));
    }
  }
}
