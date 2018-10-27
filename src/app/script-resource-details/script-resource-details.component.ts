import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Script } from '../data/script';
import { ScriptResource, ResourceContent } from '../data/script-resource';
import { ScriptSettingsService } from '../services/script-settings.service';
import { ScriptValue } from '../data/script-value';
import { ScriptViewService } from '../services/script-view.service';
import { ScriptResourceService } from '../services/script-resource.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";
import { ScriptSettings } from '../data/script-settings';
import { Resource } from '../data/resource';
import { debounceTime } from 'rxjs/operators';
import { ResourcesService } from '../services/resources.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-script-resource-details',
  templateUrl: './script-resource-details.component.html',
  styleUrls: ['./script-resource-details.component.css']
})
export class ScriptResourceDetailsComponent implements OnInit, OnChanges {

  constructor(private settingsService: ScriptSettingsService,
    private resourceService: ScriptResourceService,
    private scriptView: ScriptViewService,
    private resourcesService: ResourcesService) { }

  @Input() currentScript: Script;
  @Input() currentResource: ScriptResource;
  @Output() saving = new EventEmitter<Script>();

  settings: ScriptSettings;
  resourceTypes: ScriptValue[];
  currentContent: ResourceContent;
  currentResourceType: ScriptValue;
  resources: Resource[];
  resourceSearch: string;
  searchObservable = new EventEmitter<string>();
  previewTypes: { [index: number]: ScriptValue } = {};
  previewTypesLoaded: boolean = false;
  previewActive: boolean = true;
  reviewResourceURL: string;

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => {
        this.resourceTypes = settings.resourceTypes;
        this.settings = settings;
        this.loadContent();
      });
    this.resourcesService.listTypes()
      .subscribe(types => {
        types.forEach(typ => this.previewTypes[typ.id] = typ);
        this.previewResource();
      });
    this.settingsService.languageChanged.subscribe(_ => this.loadContent());
    this.searchObservable
      .pipe(
        debounceTime(300)
      ).subscribe(search => {
        this.resourcesService.getResources(20, 0, search)
          .subscribe(res => this.resources = res);
      });
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
      this.loadLanguageContent();
      return;
    }

    if (this.currentResource.id) {
      this.resourceService.getScriptResource(this.currentScript.id, this.currentResource.id)
        .subscribe(resource => {
          this.currentResource.isLoaded = true;
          this.currentResource.contents = resource.contents;
          this.loadLanguageContent();
        });
    } else {
      this.currentResource.isLoaded = true;
      this.loadLanguageContent();
    }
  }

  private loadLanguageContent(): void {
    if (!this.settings) return;
    const langId = this.settingsService.selectedLanguage.id;
    this.currentResource.contents = this.currentResource.contents || [];
    this.currentContent = this.currentResource.contents.find(con => con.languageID == langId);
    this.onResourceChanged();

    if (!this.currentContent) {
      this.currentContent = new ResourceContent();
      this.currentContent.languageID = langId;
      this.currentContent.resource = '';
      this.currentResource.contents.push(this.currentContent);
    }
  }

  ngOnChanges(_: SimpleChanges) {
    if (this.settings) this.loadContent();
  }

  onResourceChanged() {
    this.currentResourceType = this.settings.findResourceType(this.currentResource.resourceType);
    this.previewResource();
  }

  searchForResources(): void {
    this.searchObservable.emit(this.resourceSearch);
  }

  selectResource(resource: Resource): void {
    this.previewActive = true;
    this.currentContent.resource = resource.url;
    this.previewResource();
  }

  previewResource(): void {
    if (this.currentContent && this.currentContent.resource) {
      this.reviewResourceURL = `${environment.resourceURL}${this.currentContent.resource}`;
    }
  }
}
