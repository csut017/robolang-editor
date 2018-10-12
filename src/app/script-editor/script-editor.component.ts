import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Script } from '../script';
import { ValidationService, ValidationResult } from '../validation.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";
import "../roboLang";

class statusInfo {
  type: string;
  message: string;

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

  constructor(private validationService: ValidationService) { }

  status: statusInfo;
  validation: ValidationResult;
  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();

  private lineNumber: number;

  ngOnInit() {
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

  ngOnChanges(changes: SimpleChanges) {
    this.status = new statusInfo().info('Script has not been validated');
  }

  moveToLine(lineNum?: number): void {
    lineNum = lineNum || this.lineNumber;
    if (lineNum) {
      console.log(`Moving to line ${lineNum}`);
    }
  }
}
