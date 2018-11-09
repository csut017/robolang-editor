import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Robot } from '../data/robot';
import { RobotsService } from '../services/robots.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RobotScript } from '../data/robot-script';

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
  currentItem: any;
  itemID: number;

  ngOnInit() {
    this.getRobots();
  }

  getRobots(): void {
    this.robotService.getRobots()
      .subscribe(robots => {
        this.robots = robots;
        const id = this.route.snapshot.paramMap.get('id');
        const itemID = this.route.snapshot.paramMap.get('script');
        if (itemID) {
          this.itemID = parseInt(itemID);
        }
        const idToFind = +id;
        this.changeRobot(this.robots.find(robot => robot.id == idToFind));
      });
  }

  changeRobot(robot: Robot, changeURL?: boolean): void {
    this.currentRobot = robot;
    if (robot && robot.id && !robot.isLoaded) {
      this.isLoading = true;
      const original = robot;
      this.robotService.getRobot(robot.id)
        .subscribe(robot => {
          this.currentRobot = robot;
          this.currentRobot.original = original

          this.currentRobot.checksum = undefined;
          this.currentRobot.scripts = undefined;
          if (robot.patient) {
            this.robotService.getScriptsForRobot(this.currentRobot)
              .subscribe(r => {
                this.currentRobot.checksum = r.checksum;
                r.scripts.sort((a, b) => {
                  const aName = (a.name || '').toLowerCase();
                  const bName = (b.name || '').toLowerCase();
                  const out = aName == bName ? 0 : aName > bName ? 1 : -1;
                  return out;
                });
                this.currentRobot.scripts = r.scripts;
                if (this.itemID) {
                  this.currentItem = r.scripts.find(s => s.id == this.itemID);
                }
                this.robotService.getResourcesForRobot(this.currentRobot)
                  .subscribe(resp => {
                    this.currentRobot.resources = resp.resources;
                    let scripts: { [index: string]: RobotScript } = {};
                    r.scripts.forEach(s => scripts[s.name] = s);
                    resp.resources.forEach(res => {
                      let parent = scripts[res.parent];
                      if (parent) {
                        if (!parent.resources) parent.resources = [];
                        parent.resources.push(res);
                      }
                    });
                    this.isLoading = false;
                  });
              });
          } else {
            this.isLoading = false;
          }
        });
    }
    if (changeURL) {
      if (robot) {
        this.router.navigate([`/robots/${robot.id}`]);
      } else {
        this.router.navigate([`/robots`]);
      }
    }
  }

  currentItemChanged(item: any): void {
    console.groupCollapsed('[Robots] Current item changed');
    console.log(item);
    console.groupEnd();
    if (item && item.script) {
      this.router.navigate([`/robots/${this.currentRobot.id}/${item.id}`]);
    } else {
      this.router.navigate([`/robots/${this.currentRobot.id}`]);
    }
  }
}