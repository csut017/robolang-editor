import { EventEmitter, Injectable } from '@angular/core';
import { ScriptSettings } from './script-value';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { Language } from './language';

@Injectable({
  providedIn: 'root'
})
export class ScriptSettingsService {

  languageChanged = new EventEmitter<Language>();
  selectedLanguage: Language;

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

  changeLanguage(language: Language): void {
    this.selectedLanguage = language;
    this.languageChanged.emit(language);
  }

  private download(): Observable<ScriptSettings> {
    let categories = this.http.get<any>(`${environment.baseURL}robotScripts/categories?l=100`)
      .pipe(
        tap(_ => this.log('Fetched categories')),
        catchError(this.handleError('getCategories', []))
      );
    let dataTypes = this.http.get<any>(`${environment.baseURL}settings/dataTypes?l=100`)
      .pipe(
        tap(_ => this.log('Fetched dataTypes')),
        catchError(this.handleError('getDataTypes', []))
      );
    let resourceTypes = this.http.get<any>(`${environment.baseURL}resourceTypes?l=100`)
      .pipe(
        tap(_ => this.log('Fetched resourceTypes')),
        catchError(this.handleError('getResourceTypes', []))
      );
    let languages = this.http.get<any>(`${environment.baseURL}languages?l=100`)
      .pipe(
        tap(_ => this.log('Fetched languages')),
        catchError(this.handleError('languages', []))
      );
    this.log('Fetching script settings');
    return forkJoin([categories, dataTypes, resourceTypes, languages])
      .pipe(
        map(data => {
          var settings = new ScriptSettings();
          settings.categories = data[0].mappings;
          settings.dataTypes = data[1].mappings;
          settings.resourceTypes = data[2].mappings;
          settings.languages = data[3].items;
          this.selectedLanguage = settings.languages[0];
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
