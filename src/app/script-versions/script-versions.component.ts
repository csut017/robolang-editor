import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Script } from '../script';

@Component({
  selector: 'app-script-versions',
  templateUrl: './script-versions.component.html',
  styleUrls: ['./script-versions.component.css']
})
export class ScriptVersionsComponent implements OnInit {

  constructor() { }

  @Output() versioning = new EventEmitter<string>();

  description: string;
  @Input() currentScript: Script;

  ngOnInit() {
  }

  generateVersion(): void {
    this.versioning.emit(this.description);
  }
}
