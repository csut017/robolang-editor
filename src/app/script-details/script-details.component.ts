import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Script } from '../data/script';
import { ScriptSettingsService } from '../services/script-settings.service';
import { ScriptValue } from '../data/script-value';

@Component({
  selector: 'app-script-details',
  templateUrl: './script-details.component.html',
  styleUrls: ['./script-details.component.css']
})
export class ScriptDetailsComponent implements OnInit {

  categories: ScriptValue[];

  constructor(private settingsService: ScriptSettingsService) { }

  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();
  @Output() deleting = new EventEmitter<Script>();

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => this.categories = settings.categories);
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  delete(): void {
    this.deleting.emit(this.currentScript);
  }
}
