import { HostListener, Component, OnInit } from '@angular/core';
import { Script } from '../data/script';
import { ScriptService } from '../services/script.service'
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ScriptParameter } from '../data/script-parameter';
import { ScriptResource } from '../data/script-resource';
import { ScriptSettingsService } from '../services/script-settings.service';
import { Observable } from 'rxjs';
import { ScriptViewService, ScriptView } from '../services/script-view.service';
import * as moment from 'moment';
import { ScriptVersion } from '../data/script-version';
import { ScriptSettings } from '../data/script-settings';

@Component({
  selector: 'app-scripts',
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.css']
})
export class ScriptsComponent implements OnInit {

  settings: ScriptSettings;
  scripts: Script[];
  currentScript: Script;
  currentParameter: ScriptParameter;
  currentResource: ScriptResource;
  currentVersion: ScriptVersion;
  isLoading: boolean = false;
  view: ScriptView;
  actionMessage: string;

  constructor(private scriptService: ScriptService,
    private settingsService: ScriptSettingsService,
    private route: ActivatedRoute,
    private router: Router,
    public scriptView: ScriptViewService) {
    this.scriptView.viewChanged.subscribe(view => {
      this.view = view;
      switch (view.currentView) {
        case 'parameter':
          this.currentParameter = view.currentItem;
          this.currentResource = undefined;
          this.currentVersion = undefined;
          break;
        case 'resource':
          this.currentParameter = undefined;
          this.currentResource = view.currentItem;
          this.currentVersion = undefined;
          break;
        case 'version':
          this.currentParameter = undefined;
          this.currentResource = undefined;
          this.currentVersion = view.currentItem;
          break;
        default:
          this.currentParameter = undefined;
          this.currentResource = undefined;
          this.currentVersion = undefined;
          break;
      }
    });
    this.scriptView.changeView('details');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 's':
        if (event.ctrlKey) {
          if (this.currentScript) this.save(this.currentScript);
          event.preventDefault();
        }
    }
  }

  ngOnInit() {
    this.getScripts();
  }

  getScripts(): void {
    this.settingsService.getSettings()
      .subscribe(settings => {
        this.settings = settings;
        this.scriptService.getScripts()
          .subscribe(scripts => {
            this.scripts = scripts.map(script => {
              script.categoryName = this.settings.findCategory(script.category).value;
              return script;
            });
            const id = this.route.snapshot.paramMap.get('id');
            if (id === 'new') {
              this.startNewScript();
            } else {
              const idToFind = +id;
              this.changeScript(this.scripts.find(script => script.id == idToFind));
            }
          });
      });
  }

  startNewScript(): void {
    this.currentScript = new Script();
    this.currentScript.isAdding = true;
    this.currentScript.name = '';
    this.currentScript.script = 'doNothing()';
    this.currentScript.category = this.settings.categories[0].id;
    this.currentScript.categoryName = this.settings.categories[0].value;
    this.router.navigate(['/scripts/new']);
  }

  changeScript(script: Script): void {
    this.currentScript = script;
    if (script && script.id && !script.isLoaded) {
      this.isLoading = true;
      const original = script;
      this.scriptService.getScript(script.id)
        .subscribe(script => {
          this.currentScript = script;
          this.currentScript.original = original
          this.initialiseScript(script);
          this.isLoading = false;
        });
    }
    if (script) {
      this.router.navigate([`/scripts/${script.id}`]);
    }
  }

  openParameter(parameter: ScriptParameter) {
    ScriptParameter.unpack(parameter);
    this.scriptView.changeView('parameter', parameter);
  }

  openResource(resource: ScriptResource) {
    this.scriptView.changeView('resource', resource);
  }

  openVersion(resource: ScriptResource) {
    this.scriptView.changeView('version', resource);
  }

  save(script: Script): void {
    Script.pack(script);
    script.category = +script.category;
    script.parameters = script.parameters || [];
    script.resources = script.resources || [];
    this.scriptService.save(script)
      .subscribe(result => {
        if (result.status === 'Ok') {
          this.scripts.forEach(script => script.isNew = false);
          this.showSuccess('Script has been saved');
          script.categoryName = this.settings.findCategory(script.category).value;

          if (!this.currentScript.id) {
            this.scripts.push(script);
            this.scripts.sort((a, b) => a.name.localeCompare(b.name));
            this.currentScript = script;
            script.id = result.data.id;
            this.router.navigate([`/scripts/${script.id}`]);
            script.isNew = true;
            this.currentScript.original = new Script();
            this.currentScript.original.id = script.id;
            this.currentScript.isAdding = false;
            this.currentScript.parameters = result.data.parameters;
            this.currentScript.resources = result.data.resources;
            this.initialiseScript(this.currentScript);
          } else {
            if (script.original) {
              this.currentScript = this.currentScript.original;
              this.changeScript(this.currentScript);
            }
          }
        } else {
          // TODO: Use a modal dialog
          alert(result.msg);
        }
      });
  }

  generateVersion(description: string): void {
    this.scriptService.generateVersion(this.currentScript, description)
      .subscribe(result => {
        if (result.status === 'Ok') {
          this.showSuccess('Version has been generated for script');
        } else {
          // TODO: Use a modal dialog
          alert(result.msg);
        }
      });
  }

  delete(script: Script): void {
    this.scriptService.delete(script)
      .subscribe(result => {
        if (result.status === 'Ok') {
          this.showSuccess('Script has been deleted');
          var index = this.scripts.indexOf(script);
          if (index < 0 && script.original) {
            index = this.scripts.indexOf(script.original);
          }
          if (index >= 0) {
            this.scripts.splice(index, 1);
          }
          this.router.navigate([`/scripts`]);
        } else {
          // TODO: Use a modal dialog
          alert(result.msg);
        }
      });
  }

  exportScripts(): void {
    console.log('TODO: export scripts');
  }

  importScripts(): void {
    console.log('TODO: import scripts');
  }

  timeAgo(value: Date): string {
    return moment(value).fromNow();
  }

  private initialiseScript(script): void {
    Script.unpack(script);
    (script.resources || []).forEach(res => res.resourceTypeName = this.settings.findResourceType(res.resourceType).value);
    (script.parameters || []).forEach(param => {
      if (param.dataType) param.dataTypeName = this.settings.findDataType(param.dataType).value;
      ScriptParameter.unpack(param);
    });
    this.currentScript.deletedParameters = [];
    this.currentScript.deletedResources = [];
    (this.currentScript.versions || []).sort((a, b) => a.version == b.version ? 0 : (a.version < b.version ? 1 : -1));
  }

  private showSuccess(msg: string): void {
    this.actionMessage = msg;
    new Observable(observer => {
      setTimeout(() => observer.next(), 10000);
    }).subscribe(_ => this.actionMessage = undefined);
  }
}
