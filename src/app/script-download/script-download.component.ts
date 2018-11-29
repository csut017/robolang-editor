import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Script } from '../data/script';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-script-download',
  templateUrl: './script-download.component.html',
  styleUrls: ['./script-download.component.css']
})
export class ScriptDownloadComponent implements OnInit, OnChanges {

  constructor() { }

  scriptDownloadLocation: string;
  includeCalled: boolean;
  includeResources: boolean;
  @Input() currentScript: Script;

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges) {
    this.generateURL();
  }

  generateURL(): void {
    let options = [];
    this.scriptDownloadLocation = environment.apiURL + `robotScripts/${this.currentScript.id}/downloads/package`;
    if (this.includeCalled) options.push('called=yes');
    if (this.includeResources) options.push('resources=yes');
    if (options.length) {
      this.scriptDownloadLocation += '?' + options.join('&');
    }
  }

}
