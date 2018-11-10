import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { Language } from '../data/language';
import { ScriptSettings } from '../data/script-settings';
import { Editor } from '../data/editor';

@Injectable({
  providedIn: 'root'
})
export class ScriptSettingsService {

  languageChanged = new EventEmitter<Language>();
  selectedLanguage: Language;
  editorChanged = new EventEmitter<Editor>();
  selectedEditor: Editor;

  constructor(private http: HttpClient,
    private messageService: MessageService) {
  }

  private settings: ScriptSettings;
  private onDownload: Observable<ScriptSettings>;

  getSettings(): Observable<ScriptSettings> {
    if (this.settings) {
      return of(this.settings);
    }

    if (!this.onDownload) {
      this.onDownload = this.download()
        .pipe(
          tap(settings => this.settings = settings)
        );
    }

    return this.onDownload;
  }

  changeEditor(editor: Editor): void {
    this.selectedEditor = editor;
    this.editorChanged.emit(editor);
  }

  changeLanguage(language: Language): void {
    this.selectedLanguage = language;
    this.languageChanged.emit(language);
  }

  private download(): Observable<ScriptSettings> {
    let categories = this.http.get<any>(`${environment.apiURL}robotScripts/categories?l=100`)
      .pipe(
        tap(_ => this.log('Fetched categories')),
        catchError(this.handleError('getCategories', []))
      );
    let dataTypes = this.http.get<any>(`${environment.apiURL}settings/dataTypes?l=100`)
      .pipe(
        tap(_ => this.log('Fetched dataTypes')),
        catchError(this.handleError('getDataTypes', []))
      );
      let resourceTypes = this.http.get<any>(`${environment.apiURL}resourceTypes?l=100`)
      .pipe(
        tap(_ => this.log('Fetched resourceTypes')),
        catchError(this.handleError('getResourceTypes', []))
      );
    let resourceTypes2 = this.http.get<any>(`${environment.apiURL}resourceTypes/v2?l=100`)
      .pipe(
        tap(_ => this.log('Fetched resourceTypes')),
        catchError(this.handleError('getResourceTypes', []))
      );
    let languages = this.http.get<any>(`${environment.apiURL}languages?l=100`)
      .pipe(
        tap(_ => this.log('Fetched languages')),
        catchError(this.handleError('languages', []))
      );
    this.log('Fetching script settings');
    return forkJoin([categories, dataTypes, resourceTypes, languages, resourceTypes2])
      .pipe(
        map(data => {
          var settings = new ScriptSettings();
          settings.categories = data[0].mappings;
          settings.dataTypes = data[1].mappings;
          settings.oldResourceTypes = data[2].mappings;
          settings.oldResourceTypes.forEach(v => v.old = true);
          settings.languages = data[3].items;
          settings.resourceTypes = data[4].mappings;
          this.selectedLanguage = settings.languages[0];
          this.selectedEditor = settings.editors.find(ed => ed.isDefault);
          return settings;
        })
      );
  }

  private log(message: string) {
    this.messageService.add(`ScriptSettingsService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
