import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ScriptVersion } from '../script-version';
import { Script } from '../script';

@Component({
  selector: 'app-script-version-details',
  templateUrl: './script-version-details.component.html',
  styleUrls: ['./script-version-details.component.css']
})
export class ScriptVersionDetailsComponent implements OnInit {

  constructor() { }

  @Input() currentScript: Script;
  @Input() currentVersion: ScriptVersion;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }
}
