import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
import { AceEditorComponent } from 'ng2-ace-editor';

@Component({
  selector: 'app-script-resource-details',
  templateUrl: './script-resource-details.component.html',
  styleUrls: ['./script-resource-details.component.css']
})
export class ScriptResourceDetailsComponent implements OnInit, OnChanges {

  constructor(private settingsService: ScriptSettingsService,
    private resourceService: ScriptResourceService,
    private scriptView: ScriptViewService,
    private resourcesService: ResourcesService) { 
      this.baseItems = [
        new resourceItem('weather.type', 'One word summary of the weather.', false),
        new resourceItem('weather.current', 'Current weather.', false),
        new resourceItem('weather.forecast', 'Forecasted weather.', false),
        new resourceItem('time.full', 'The full current time (12 hour clock).'),
        new resourceItem('time.hour', 'The current hour of the day (12 hour clock).'),
        new resourceItem('time.minute', 'The current minute of the hour.'),
        new resourceItem('time.second', 'The current second of the minute.'),
        new resourceItem('time.dayPart', 'Current part of the day (morning, afternoon, evening, night).'),
        new resourceItem('time.hourType', 'Whether the hour is AM or PM.'),
        new resourceItem('date.full', 'The full current date.'),
        new resourceItem('date.day', 'Current day of the month.'),
        new resourceItem('date.dayth', 'Current day of the month (ordinal).'),
        new resourceItem('date.dayOfWeek', 'Current day of the week (Monday to Sunday)'),
        new resourceItem('date.month', 'Current month of the year.'),
        new resourceItem('date.year', 'Current year.'),
        new resourceItem('person.name', 'Name of the person.'),
      ];
    }

  @Input() currentScript: Script;
  @Input() currentResource: ScriptResource;
  @Output() saving = new EventEmitter<Script>();
  @ViewChild(AceEditorComponent) editor: AceEditorComponent;

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
  newResourceUrl: string;
  resourceToUpload: any;
  items: resourceItem[];
  baseItems: resourceItem[];

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => {
        this.resourceTypes = settings.resourceTypes;
        this.settings = settings;
        this.loadContent();
      });
    this.resourcesService.listTypes()
      .subscribe(types => {
        types.forEach(typ => this.previewTypes[typ.value] = typ);
        this.previewResource();
      });
    this.settingsService.languageChanged.subscribe(_ => this.loadContent());
    this.searchObservable
      .pipe(
        debounceTime(300)
      ).subscribe(search => {
        if (search) {
          this.resourcesService.getResources(20, 0, search)
            .subscribe(res => {
              const resType = this.settings.findResourceType(this.currentResource.resourceType);
              var rtID = this.previewTypes[resType.value];
              rtID = rtID ? rtID.id : -1;
              this.resources = (res || []).filter(r => r.resourceType == rtID);
            });
        }
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
    this.items = [];
    this.baseItems.forEach(i => this.items.push(i));
    this.currentScript.parameters.forEach(p => this.items.push(new resourceItem(`parameter.${p.name}`, `Parameter ${p.name} of type ${p.dataTypeName}`)));
    this.items.sort((a, b) => a.name == b.name ? 0 : a.name > b.name ? 1 : -1);
  }

  onResourceChanged() {
    this.currentResourceType = this.settings.findResourceType(this.currentResource.resourceType);
    this.previewResource();
    this.searchObservable.emit(this.resourceSearch);
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

  uploadResource(): void {
    const resType = this.settings.findResourceType(this.currentResource.resourceType);
    var rtID = this.previewTypes[resType.value];
    rtID = rtID ? rtID.id : -1;
    this.resourcesService.addResource(this.newResourceUrl, rtID)
      .subscribe(res => {
        this.resourcesService.uploadResourceData(res, this.resourceToUpload)
          .subscribe(_ => {
            this.selectResource(res);
          });
      });
  }

  storeResource(event): void {
    this.resourceToUpload = event.target.files[0];
  }

  insertItem(item: string): void {
    const editor = this.editor.getEditor()
    editor.insert('@' + item + ' ');
    editor.focus();
  }
}

class resourceItem {
  constructor(public name: string, 
    public description?: string,
    public isLocal: boolean = true) {}
}