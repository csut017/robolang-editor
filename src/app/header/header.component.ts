import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ScriptSettingsService } from '../services/script-settings.service';
import { Language } from '../data/language';
import { ScriptSettings } from '../data/script-settings';
import { Editor } from '../data/editor';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  settings: ScriptSettings;
  selectedLanguage: Language;
  selectedEditor: Editor;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private settingsService: ScriptSettingsService) { }

  @Input() view: string;

  ngOnInit() {
    this.settingsService.getSettings()
      .subscribe(settings => {
        this.settings = settings;
        this.selectedLanguage = this.settingsService.selectedLanguage;
        this.selectedEditor = this.settingsService.selectedEditor;
      });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  changeEditor(editor: Editor): void {
    this.settingsService.changeEditor(editor);
    this.selectedEditor = this.settingsService.selectedEditor;
  }

  changeLanguage(language: Language): void {
    this.settingsService.changeLanguage(language);
    this.selectedLanguage = this.settingsService.selectedLanguage;
  }
}
