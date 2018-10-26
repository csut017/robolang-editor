import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { ScriptVersion } from '../data/script-version';
import { Script } from '../data/script';
import { ScriptService } from '../services/script.service';
import * as moment from 'moment';

@Component({
  selector: 'app-script-version-details',
  templateUrl: './script-version-details.component.html',
  styleUrls: ['./script-version-details.component.css']
})
export class ScriptVersionDetailsComponent implements OnInit, OnChanges {

  constructor(private scriptService: ScriptService) { }

  whenUpdated: string;
  editorOptions: any;
  @Input() currentScript: Script;
  @Input() currentVersion: ScriptVersion;
  @Output() saving = new EventEmitter<Script>();

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

  save(): void {
    this.saving.emit(this.currentScript);
  }

  ngOnChanges(_: SimpleChanges) {
    this.loadVersion();
  }

  private loadVersion() {
    this.format();
    if (!this.currentVersion.isLoaded) {
      this.scriptService.getScriptVersion(this.currentScript.id, this.currentVersion.id)
        .subscribe(version => {
          this.currentVersion.script = version.script;
          this.currentVersion.description = version.description;
          this.currentVersion.isLoaded = true;
        });
    }
  }

  private format(): void{
    this.whenUpdated = moment(this.currentVersion.whenUpdated).format('dddd, D MMMM YYYY');
  }
}
