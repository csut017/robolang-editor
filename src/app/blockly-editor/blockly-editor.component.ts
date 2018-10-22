import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { Script } from '../data/script';
import { ValidationService, ValidationResult } from '../services/validation.service';
import { HelpInfo, ScriptHelpService } from '../services/script-help.service';

@Component({
  selector: 'app-blockly-editor',
  templateUrl: './blockly-editor.component.html',
  styleUrls: ['./blockly-editor.component.css']
})
export class BlocklyEditorComponent implements OnInit, OnChanges {

  constructor(private validationService: ValidationService,
    private scriptHelp: ScriptHelpService) { }

  help: HelpInfo[];
  validation: ValidationResult;
  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
    this.help = this.scriptHelp.getAll();
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  validate(): void {
    this.validationService.validate(this.currentScript)
      .subscribe(result => {
        this.validation = result;
      });
  }

  ngOnChanges(_: SimpleChanges) {
    setTimeout(_ => this.validate(), 100);
  }
}
