import { Component, EventEmitter,OnInit, Input, Output } from '@angular/core';
import { Script } from '../script';
import { ScriptService } from '../script.service';

@Component({
  selector: 'app-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.css']
})
export class ScriptEditorComponent implements OnInit {

  constructor(private scriptService: ScriptService) { }

  @Input() currentScript: Script;
  @Output() saving = new EventEmitter<Script>();

  ngOnInit() {
  }

  save(): void {
    this.saving.emit(this.currentScript);
  }

  validate(): void {
    this.scriptService.validate(this.currentScript)
      .subscribe(result => console.log('TODO'));
  }
}
