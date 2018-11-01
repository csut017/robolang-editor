import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild, HostListener, NgZone } from '@angular/core';
import { Script } from '../data/script';
import { ValidationService, ValidationResult, ASTNode } from '../services/validation.service';

// Import the theme and mode
import "brace";
import "brace/theme/chrome";
import "../roboLang";
import { AceEditorComponent } from 'ng2-ace-editor';
import { HelpInfo, ScriptHelpService } from '../services/script-help.service';
import { debounceTime, tap } from 'rxjs/operators';
import { ScriptService } from '../services/script.service';

class statusInfo {
  type: string;
  message: string;
  showBreakdown: boolean;

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

class range {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  node: ASTNode;
  children: range[];

  constructor(node: ASTNode) {
    this.node = node;
    this.children = [];
    this.startCol = node.token.linePos;
    this.startRow = node.token.lineNum;

    // Set some initial defaults
    this.endCol = this.startCol + node.token.value.length;
    this.endRow = this.startRow;
  }

  checkInRange(column: number, row: number): boolean {
    if ((row < this.startRow) || (row > this.endRow)) {
      // If it is not in range fail fast
      return false;
    }

    if (this.startRow == row) {
      if (this.endRow == row) {
        // Token is on a single line
        return (column >= this.startCol) && (column < this.endCol);
      } else {
        // We are on the starting line
        return column >= this.startCol;
      }
    } else if (this.endRow == row) {
      // We are on the ending line
      return column <= this.endCol;
    }

    // We must be between the two lines
    return true;
  }

  findChild(column: number, row: number): range {
    for (var child of this.children) {
      const found = child.findChild(column, row);
      if (found) return found;
    }

    if (this.checkInRange(column, row)) {
      return this;
    }
    return;
  }
}

@Component({
  selector: 'app-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.css']
})
export class ScriptEditorComponent implements OnInit, OnChanges {

  constructor(private validationService: ValidationService,
    private scriptHelp: ScriptHelpService,
    private scriptService: ScriptService,
    private zone: NgZone) { }

  help: HelpInfo[];
  visibleHelp: HelpInfo[];
  status: statusInfo;
  validation: ValidationResult;
  editorOptions: any;
  ast: ASTNode[];
  astRanges: range[];
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'F':
      case 'f':
        if (event.altKey && event.shiftKey) {
          if (this.currentScript) {
            this.scriptService.format(this.currentScript.script)
              .subscribe(script => this.currentScript.script = script);
          }
          event.preventDefault();
        }
        break;
    }
  }

  ngOnInit() {
    this.help = this.scriptHelp.getAll();
    this.onResize({
      target: window
    });
    this.editor.textChanged.pipe(
      tap(_ => this.status.warning('Script has not been validated')),
      debounceTime(1500)
    ).subscribe(_ => this.validate());
    const selection = this.editor.getEditor().getSelection();
    selection.on('changeSelection', _ => {
      const cursor = selection.getCursor(),
        node = this.findNode(cursor.column, cursor.row);

      this.zone.run(() => {
        if (!node) {
          this.visibleHelp = this.help.filter(h => h.isRoot);
        } else {
          const funcName = node.token.value;
          this.visibleHelp = this.help.filter(h => h.title == funcName || h.checkIsChildOf(funcName))
        }
      });
    });
  }

  private findNode(column: number, row: number): ASTNode {
    if (!this.ast) return;

    var current: range;
    for (var range of this.astRanges) {
      if (range.checkInRange(column, row)) {
        current = range;
        break;
      }
    };

    if (!current) {
      return;
    }

    current = current.findChild(column, row) || current;
    return current.node;
  }

  private calculateRanges(): void {
    this.astRanges = [];
    for (var node of this.ast) {
      this.astRanges.push(this.calculateRange(node));
    }
  }

  private calculateRange(node: ASTNode): range {
    var out = new range(node);
    switch (node.token.type) {
      case 'TEXT':
        out.endCol += 2;  // Need to include quotation marks;
        break;

      case 'REFERENCE':
        out.endCol++; // Need to include at sign
        break;
    }
    if (node.type == 'Function') {
      out.endCol += 2;  // Allow for no arguments
      for (var arg of node.args || []) {
        const childRange = this.calculateRange(arg);
        if (arg.type == 'Function') out.children.push(childRange);  // Only interested in functions
        out.endCol = childRange.endCol + 1;   // Expand it by one to include the end bracket
      }
    }
    for (var child of node.children || []) {
      const childRange = this.calculateRange(child);
      if (child.type == 'Function') out.children.push(childRange);  // Only interested in functions
      out.endCol = childRange.endCol;
      out.endRow = childRange.endRow;
    }
    return out;
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  validate(): void {
    this.validationService.validate(this.currentScript)
      .subscribe(result => {
        this.ast = result.ast;
        this.calculateRanges();
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
    this.status = new statusInfo().warning('Script has not been validated');
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
