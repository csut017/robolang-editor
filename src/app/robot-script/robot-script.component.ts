import { Component, OnInit, Input, HostListener } from '@angular/core';
import { RobotScript } from '../data/robot-script';

@Component({
  selector: 'app-robot-script',
  templateUrl: './robot-script.component.html',
  styleUrls: ['./robot-script.component.css']
})
export class RobotScriptComponent implements OnInit {

  constructor() { }

  @Input() currentScript: RobotScript;
  editorOptions: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var lines = (event.target.innerHeight - 550) / 12;
    this.editorOptions = {
      maxLines: lines,
      readOnly: true,
      scrollPastEnd: 0.5
    };
  }

  ngOnInit() {
    this.onResize({
      target: window
    });
  }

}
