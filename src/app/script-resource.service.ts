import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment'
import { ScriptResource } from './script-resource';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScriptResourceService {

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  getScriptResource(scriptID, resourceID: number): Observable<ScriptResource> {
    const url = environment.baseURL + `robotScripts/${scriptID}/resources/${resourceID}`;
    this.log(`Fetching script resource with id of ${resourceID}`);
    return this.http.get<ScriptResource>(url)
      .pipe(
        tap(_ => this.log(`Fetched script resource with id of ${resourceID}`)),
        catchError(this.handleError<ScriptResource>(`getScriptResource id=${resourceID}`))
      );
  }

  private log(message: string) {
    this.messageService.add(`ScriptService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
