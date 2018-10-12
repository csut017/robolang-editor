import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Script } from '../script';
import { ScriptResource, ResourceContent } from '../script-resource';
import { ScriptSettingsService } from '../script-settings.service';
import { ScriptValue, ScriptSettings } from '../script-value';
import { ScriptViewService } from '../script-view.service';
import { ScriptResourceService } from '../script-resource.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";

@Component({
  selector: 'app-script-resource-details',
  templateUrl: './script-resource-details.component.html',
  styleUrls: ['./script-resource-details.component.css']
})
export class ScriptResourceDetailsComponent implements OnInit, OnChanges {

  settings: ScriptSettings;
  resourceTypes: ScriptValue[];
  currentContent: ResourceContent;

  constructor(private settingsService: ScriptSettingsService,
    private resourceService: ScriptResourceService,
    private scriptView: ScriptViewService) { }

  @Input() currentScript: Script;
  @Input() currentResource: ScriptResource;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => {
        this.resourceTypes = settings.resourceTypes;
        this.settings = settings;
        this.loadContent();
      });
    this.settingsService.languageChanged.subscribe(_ => this.loadContent());
  }

  save(): void {
    this.currentResource.resourceType = +this.currentResource.resourceType;
    this.currentResource.resourceTypeName = this.settings.findResourceType(this.currentResource.resourceType).value;
    this.saving.emit(this.currentScript);
  }

  delete(): void {
    const index = this.currentScript.resources.indexOf(this.currentResource);
    this.currentScript.resources.splice(index, 1);
    if (this.currentResource.id) this.currentScript.deletedResources.push(this.currentResource);
    this.scriptView.changeView('details');
  }

  private loadContent(): void {
    if (this.currentResource.isLoaded) {
      this.loadLanguageContent(this.currentResource);
      return;
    }

    if (this.currentResource.id) {
      this.resourceService.getScriptResource(this.currentScript.id, this.currentResource.id)
        .subscribe(resource => {
          this.currentResource.isLoaded = true;
          this.currentResource.contents = resource.contents;
          this.loadLanguageContent(this.currentResource);
        });
    } else {
      this.currentResource.isLoaded = true;
      this.loadLanguageContent(this.currentResource);
    }
  }

  private loadLanguageContent(resource: ScriptResource): void {
    if (!this.settings) return;
    const langId = this.settingsService.selectedLanguage.id;
    this.currentResource.contents = this.currentResource.contents || [];
    this.currentContent = this.currentResource.contents.find(con => con.languageID == langId);

    if (!this.currentContent) {
      this.currentContent = new ResourceContent();
      this.currentContent.languageID = langId;
      this.currentContent.resource = '';
      this.currentResource.contents.push(this.currentContent);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.settings) this.loadContent();
  }
}
