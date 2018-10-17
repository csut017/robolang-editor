import { Component, OnInit } from '@angular/core';
import { Robot } from '../data/robot';
import { RobotsService } from '../services/robots.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RobotCommunicationsService, RobotClient } from '../services/robot-communications.service';

@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.css']
})
export class RobotsComponent implements OnInit {

  constructor(private robotService: RobotsService,
    private route: ActivatedRoute,
    private router: Router,
    private communications: RobotCommunicationsService) { }

  robots: Robot[];
  currentRobot: Robot;
  isLoading: boolean = false;
  client: RobotClient;
  connected: boolean = false;

  ngOnInit() {
    this.getRobots();
  }

  connect(): void {
    const robotName = this.currentRobot.display;
    this.log(`Connecting to robot ${robotName}`);
    this.communications.connect(this.currentRobot)
      .subscribe(client => {
        if (client.canConnect()) {
          this.log('Opening connection');
          client.connect();
          client.onClosed.subscribe(_ => {
            this.log(`Disconnected to ${robotName}`);
            this.connected = false;
          });
          client.onConnected.subscribe(_ => {
            this.log(`Connected to ${robotName}`);
            this.connected = true;
          })
          this.client = client;
        } else {
          this.log(`Unable to connect to ${robotName}`);
        }
      });
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
      const original = robot;
      this.robotService.getRobot(robot.id)
        .subscribe(robot => {
          this.currentRobot = robot;
          this.currentRobot.original = original
          this.isLoading = false;
        });
    }
    if (robot) {
      this.router.navigate([`/robots/${robot.id}`]);
    }
  }

  private log(message: string, data?: any) {
    if (data) {
      console.groupCollapsed('[Robots] ' + message);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('[Robots] ' + message);
    }
  }
}
