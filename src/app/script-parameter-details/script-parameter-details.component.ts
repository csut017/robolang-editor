import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Script } from '../script';
import { ScriptParameter } from '../script-parameter';
import { ScriptSettingsService } from '../script-settings.service';
import { ScriptValue } from '../script-value';
import { ScriptViewService } from '../script-view.service';

@Component({
  selector: 'app-script-parameter-details',
  templateUrl: './script-parameter-details.component.html',
  styleUrls: ['./script-parameter-details.component.css']
})
export class ScriptParameterDetailsComponent implements OnInit {

  dataTypes: ScriptValue[];

  constructor(private settingsService: ScriptSettingsService,
    private scriptView: ScriptViewService) { }

  @Input() currentScript: Script;
  @Input() currentParameter: ScriptParameter;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => this.dataTypes = settings.dataTypes);
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
