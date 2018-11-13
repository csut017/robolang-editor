import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RobotScript } from '../data/robot-script';
import { Robot } from '../data/robot';
import { RobotSimulator } from '../data/robot-simulator';
import { ValidationService } from '../services/validation.service';
import { Script } from '../data/script';
import { Observable } from 'rxjs';
import { Variable, VariableTable } from '../data/simulator/variable-table';
import { WaitHandler, WaitHandlerType } from '../data/simulator/wait-state';

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

  processInput(input: WaitStateDisplay) {
    if (input.handler.type == WaitHandlerType.timeout) {
      this.simulator.processTimeout();
    } else if (input.handler.type == WaitHandlerType.default) {
      this.simulator.processInput('');
    } else {
      this.simulator.processInput(input.handler.text);
    }
  }

  flattenVariables(): Variable[] {
    let out: Variable[] = [];
    this.appendVariables(out, this.simulator.executionEnvironment.variables);
    return out;
  }

  private appendVariables(out: Variable[], variables: VariableTable) {
    for (let outVar of variables.variables) {
      out.push(outVar);
    }
    if (variables.parent) {
      this.appendVariables(out, variables.parent);
    }
  }

  flattenWaitState(): WaitStateDisplay[] {
    let out: WaitStateDisplay[] = [];
    for (let wait of this.simulator.waitState.stack) {
      const priority = wait.priority;
      for (let resp of wait.responseHandlers) {
        out.push(WaitStateDisplay.response(priority, resp));
      }
    }
    return out;
  }
}

class WaitStateDisplay {
  constructor(public priority: number,
    public value: string,
    public handler: WaitHandler) { }

  static response(priority: number, handler: WaitHandler): WaitStateDisplay {
    return new WaitStateDisplay(priority, `Response: text='${handler.text}'`, handler);
  }
}