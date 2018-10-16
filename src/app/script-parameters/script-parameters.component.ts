import { Component, OnInit, Input } from '@angular/core';
import { Script } from '../data/script';
import { ScriptViewService } from '../services/script-view.service';
import { ScriptParameter } from '../data/script-parameter';
import { ScriptValue } from '../data/script-value';
import { ScriptSettingsService } from '../services/script-settings.service';

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
