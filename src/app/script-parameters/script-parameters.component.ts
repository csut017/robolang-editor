import { Component, OnInit, Input } from '@angular/core';
import { Script } from '../script';
import { ScriptViewService } from '../script-view.service';
import { ScriptParameter } from '../script-parameter';
import { ScriptValue } from '../script-value';
import { ScriptSettingsService } from '../script-settings.service';

@Component({
  selector: 'app-script-parameters',
  templateUrl: './script-parameters.component.html',
  styleUrls: ['./script-parameters.component.css']
})
export class ScriptParametersComponent implements OnInit {

  private defaultDataType: ScriptValue;

  constructor(private scriptView: ScriptViewService,
    private settingsService: ScriptSettingsService) { }

  @Input() currentScript: Script;

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => this.defaultDataType = settings.dataTypes[0]);
  }

  addParameter(): void {
    var param = new ScriptParameter();
    param.name = '';
    param.dataType = this.defaultDataType.id;
    param.dataTypeName = this.defaultDataType.value;
    if (!this.currentScript.parameters) this.currentScript.parameters = [];
    this.currentScript.parameters.push(param);
    this.scriptView.changeView('parameter', param);
  }
}
