import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { Script } from '../script';
import { ValidationService, ValidationResult } from '../validation.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";
import "../roboLang";
import { AceEditorComponent } from 'ng2-ace-editor';
import { HelpInfo, ScriptHelpService } from '../script-help.service';
import { Observable } from 'rxjs';
import { throttleTime, debounceTime, tap } from 'rxjs/operators';

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
  editorOptions: any;
  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();
  @ViewChild(AceEditorComponent) editor: AceEditorComponent;

  private lineNumber: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var lines = (event.target.innerHeight - 370) / 12;
    this.editorOptions = {
      maxLines: lines,
      scrollPastEnd: 0.5
    };
  }

  ngOnInit() {
    this.help = this.scriptHelp.getAll();
    this.onResize({
      target: window
    });
    this.editor.textChanged.pipe(
      tap(_ => this.status.info('Script has not been validated')),
      debounceTime(1500)
    ).subscribe(_ => this.validate());
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  validate(): void {
    this.validationService.validate(this.currentScript)
      .subscribe(result => {
        this.status.showBreakdown = !result.error;
        this.validation = result;
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
    setTimeout(_ => this.validate(), 100);
    this.status.showBreakdown = false;
  }

  moveToLine(lineNum?: number): void {
    lineNum = lineNum == 0 ? 0 : (lineNum || this.lineNumber);
    if (lineNum || (lineNum == 0)) {
      lineNum++;    // Lines are 1-based, the parser treats them as 0-based
      console.log(`Moving to line ${lineNum}`);
      this.editor.getEditor().gotoLine(lineNum);
    }
  }
}
