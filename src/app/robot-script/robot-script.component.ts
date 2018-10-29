import { Component, OnInit, Input, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-robot-script',
  templateUrl: './robot-script.component.html',
  styleUrls: ['./robot-script.component.css']
})
export class RobotScriptComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() currentScript: any;
  editorOptions: any;
  content: string;

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

  ngOnChanges(_: SimpleChanges) {
    this.content = this.currentScript.script
      || this.currentScript.resource
      || this.currentScript.file
      || this.currentScript.url;
  }
}
