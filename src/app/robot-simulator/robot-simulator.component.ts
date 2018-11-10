import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotScript } from '../data/robot-script';
import { Robot } from '../data/robot';
import { RobotSimulator } from '../data/robot-simulator';
import { ValidationService } from '../services/validation.service';
import { Script } from '../data/script';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-robot-simulator',
  templateUrl: './robot-simulator.component.html',
  styleUrls: ['./robot-simulator.component.css']
})
export class RobotSimulatorComponent implements OnInit, OnChanges {

  constructor(private validationService: ValidationService) { }

  simulator: RobotSimulator;

  @Input() currentRobot: Robot;
  @Input() startScript: RobotScript;
  @Input() allScripts: RobotScript[];

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.simulator = new RobotSimulator();
    this.simulator.initialise();

    let scripts: { [index: string]: RobotScript } = {};
    this.allScripts.forEach(s => {
      scripts[s.name] = s;
      s.compiled = false;
    });

    let count = 1;
    var emitter;
    Observable.create(e => emitter = e)
      .subscribe(scriptToCompile => {
        if (!scriptToCompile) {
          this.simulator.addMessage('Starting simulation');
          this.simulator.start(this.startScript.name);
          return;
        }

        if (!scriptToCompile.compiled) {
          scriptToCompile.compiled = true;
          this.simulator.addMessage(`Compiling script '${scriptToCompile.name}'...`);
          this.validationService.compile(Script.from(scriptToCompile))
            .subscribe(res => {
              this.simulator.addMessage(`...compiled script '${scriptToCompile.name}'`);
              this.simulator.addScript(this.validationService.generateInformation(res), scriptToCompile.resources);
              (res.scriptCalls || []).forEach(call => {
                let nextScript = scripts[call.name];
                if (nextScript) {
                  emitter.next(nextScript);
                  count++;
                } else {
                  this.simulator.addMessage(`!! Unknown script '${call.name}' !!`);
                }
              });
              count--;
              if (count <= 0) emitter.next();
            });
        } else {
          count--;
          if (count <= 0) emitter.next();
        }
      });
    emitter.next(this.startScript);
  }
}
