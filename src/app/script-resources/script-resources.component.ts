import { Component, OnInit, Input } from '@angular/core';
import { Script } from '../script';
import { ScriptResource } from '../script-resource';
import { ScriptViewService } from '../script-view.service';
import { ScriptSettingsService } from '../script-settings.service';
import { ScriptValue } from '../script-value';

@Component({
  selector: 'app-script-resources',
  templateUrl: './script-resources.component.html',
  styleUrls: ['./script-resources.component.css']
})
export class ScriptResourcesComponent implements OnInit {

  private defaultResourceType: ScriptValue;

  constructor(private scriptView: ScriptViewService,
    private settingsService: ScriptSettingsService) { }

  @Input() currentScript: Script;

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => this.defaultResourceType = settings.resourceTypes[0]);
  }

  addResource(): void{
    var res = new ScriptResource();
    res.name = '';
    res.resourceType = this.defaultResourceType.id;
    res.resourceTypeName = this.defaultResourceType.value;
    if (!this.currentScript.resources) this.currentScript.resources = [];
    this.currentScript.resources.push(res);
    this.scriptView.changeView('resource', res);
  }

}
