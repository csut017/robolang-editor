import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Script } from '../data/script';
import { ScriptParameter } from '../data/script-parameter';
import { ScriptSettingsService } from '../services/script-settings.service';
import { ScriptValue } from '../data/script-value';
import { ScriptViewService } from '../services/script-view.service';

@Component({
  selector: 'app-script-parameter-details',
  templateUrl: './script-parameter-details.component.html',
  styleUrls: ['./script-parameter-details.component.css']
})
export class ScriptParameterDetailsComponent implements OnInit, OnChanges {

  dataTypes: ScriptValue[];

  constructor(private settingsService: ScriptSettingsService,
    private scriptView: ScriptViewService) { }

  isGenerated: boolean;
  @Input() currentScript: Script;
  @Input() currentParameter: ScriptParameter;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => this.dataTypes = settings.dataTypes);
  }

  ngOnChanges(_: SimpleChanges) {
    if (this.currentParameter) {
      ScriptParameter.unpack(this.currentParameter);
      this.isGenerated = this.currentParameter.isGenerated;
    } else {
      this.isGenerated = false;
    }
  }

  save(): void {
    ScriptParameter.pack(this.currentParameter);
    this.currentParameter.dataType = +this.currentParameter.dataType;
    this.saving.emit(this.currentScript);
  }

  delete(): void {
    const index = this.currentScript.parameters.indexOf(this.currentParameter);
    this.currentScript.parameters.splice(index, 1);
    if (this.currentParameter.id) this.currentScript.deletedParameters.push(this.currentParameter);
    this.scriptView.changeView('details');
  }
}
