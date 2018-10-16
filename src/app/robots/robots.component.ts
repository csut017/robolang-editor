import { Component, OnInit } from '@angular/core';
import { Robot } from '../data/robot';
import { RobotsService } from '../services/robots.service';
import { ActivatedRoute, Router } from '@angular/router';

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
}
