import { Component, OnInit } from '@angular/core';
import { Robot } from '../data/robot';
import { RobotsService } from '../services/robots.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

class RobotInformation {
  patient: string;
  lastAccess: string;
}

@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.css']
})
export class RobotsComponent implements OnInit {

  constructor(private robotService: RobotsService,
    private route: ActivatedRoute,
    private router: Router) { }

  robots: Robot[];
  currentRobot: Robot;
  isLoading: boolean = false;
  connectionError: boolean = false;
  information: RobotInformation = new RobotInformation();
  scriptsDownloadLocation: string;

  ngOnInit() {
    this.getRobots();
  }

  getRobots(): void {
    this.robotService.getRobots()
      .subscribe(robots => {
        this.robots = robots;
        const id = this.route.snapshot.paramMap.get('id');
        const idToFind = +id;
        this.changeRobot(this.robots.find(robot => robot.id == idToFind));
      });
  }

  changeRobot(robot: Robot): void {
    this.currentRobot = robot;
    if (robot && robot.id && !robot.isLoaded) {
      this.isLoading = true;
      this.information = new RobotInformation();
      const original = robot;
      this.robotService.getRobot(robot.id)
        .subscribe(robot => {
          this.currentRobot = robot;
          this.currentRobot.original = original
          this.isLoading = false;
          if (robot.patient) {
            this.information.patient = robot.patient;
            if (robot.nhi) this.information.patient += ' [' + robot.nhi + ']';
          }
          if (robot.lastAccess) {
            this.information.lastAccess = moment(robot.lastAccess).fromNow();
          }

          this.currentRobot.checksum = undefined;
          this.currentRobot.scripts = undefined;
          if (robot.patient) {
            this.scriptsDownloadLocation = environment.baseURL + `robots/${this.currentRobot.id}/scripts/all`;
            this.robotService.getScriptsForRobot(this.currentRobot)
              .subscribe(r => {
                this.currentRobot.checksum = r.checksum;
                this.currentRobot.scripts = r.scripts;
              });
          }
        });
    }
    if (robot) {
      this.router.navigate([`/robots/${robot.id}`]);
    }
  }

  connect(): void {
    if (this.currentRobot.address) {
      window.open(this.currentRobot.address.replace('/ping', ''));
    }
  }
}
