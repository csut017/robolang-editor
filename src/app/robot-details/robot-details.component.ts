import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Robot } from '../data/robot';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

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
  @Input() currentItem: any;
  @Output() currentItemChanged = new EventEmitter<any>();
  information: RobotInformation = new RobotInformation();
  scriptsDownloadLocation: string;
  simulatorVisible: boolean = false;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.information = new RobotInformation();
    if (this.currentRobot.patient) {
      this.information.patient = this.currentRobot.patient;
      if (this.currentRobot.nhi) this.information.patient += ' [' + this.currentRobot.nhi + ']';
      this.scriptsDownloadLocation = environment.apiURL + `robots/${this.currentRobot.id}/scripts/all`;
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

  changeItem(item?: any): void {
    this.currentItem = item;
    this.currentItemChanged.emit(item);
  }
}
