import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Script } from '../script';
import { ValidationService, ValidationResult } from '../validation.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";
import "../roboLang";
import { AceEditorComponent } from 'ng2-ace-editor';
import { HelpInfo, ScriptHelpService } from '../script-help.service';

class statusInfo {
  type: string;
  message: string;
  showBreakdown: boolean;

  info(msg: string): statusInfo {
    this.type = '';
    this.message = msg;
    return this;
  }

  success(msg: string): statusInfo {
    this.type = 'alert-success';
    this.message = msg;
    return this;
  }

  warning(msg: string): statusInfo {
    this.type = 'alert-warning';
    this.message = msg;
    return this;
  }

  error(msg: string): statusInfo {
    this.type = 'alert-danger';
    this.message = msg;
    return this;
  }
}

@Component({
  selector: 'app-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.css']
})
export class ScriptEditorComponent implements OnInit, OnChanges {

  constructor(private validationService: ValidationService,
    private scriptHelp: ScriptHelpService) { }

  help: HelpInfo[];
  status: statusInfo;
  validation: ValidationResult;
  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();
  @ViewChild(AceEditorComponent) editor: AceEditorComponent;

  private lineNumber: number;

  ngOnInit() {
    this.help = this.scriptHelp.getAll();
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  validate(): void {
    this.validationService.validate(this.currentScript)
      .subscribe(result => {
        if (result.error) {
          this.status.error(result.error.message);
          this.lineNumber = result.error.lineNum;
        } else {
          this.status.success('Script is valid');
          this.lineNumber = undefined;
        }
      });
  }

  ngOnChanges(_: SimpleChanges) {
    this.status = new statusInfo().info('Script has not been validated');
  }

  moveToLine(lineNum?: number): void {
    lineNum = lineNum || this.lineNumber;
    if (lineNum) {
      lineNum++;    // Lines are 1-based, the parser treats them as 0-based
      console.log(`Moving to line ${lineNum}`);
      this.editor.getEditor().gotoLine(lineNum);
    }
  }
}
