import { Injectable } from '@angular/core';
import { Script } from './script';
import { ScriptResource } from './script-resource';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap, mergeMap, concatMap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { ScriptParameter } from './script-parameter';
import { ScriptVersion } from './script-version';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  getScripts(page: number = 0): Observable<Script[]> {
    const url = `${environment.baseURL}robotScripts?p=${page}&l=100`;
    this.log('Fetching scripts');
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log('Fetched scripts')),
        catchError(this.handleError('getScripts', [])),
        map(data => data.items)
      );
  }

  getScript(id: number): Observable<Script> {
    const url = environment.baseURL + `robotScripts/v2/${id}`;
    this.log(`Fetching script with id of ${id}`);
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log(`Fetched script with id of ${id}`)),
        catchError(this.handleError<Script>(`getScript id=${id}`)),
        map(resp => {
          var script = resp.data;
          script.versions = resp.items || [];
          return script;
        })
      );
  }

  getScriptVersion(scriptID: number, versionID: number): Observable<ScriptVersion> {
    const url = environment.baseURL + `robotScripts/v2/${scriptID}/versions/${versionID}`;
    this.log(`Fetching version with id of ${versionID}`);
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log(`Fetched version with id of ${versionID}`)),
        catchError(this.handleError<Script>(`getScriptVersion id=${versionID}`))
      );
  }

  save(script: Script): Observable<any> {
    script.format = 2;
    if (script.id) {
      return this.update(script);
    } else {
      return this.addNew(script);
    }
  }

  delete(script: Script): any {
    const url = environment.baseURL + `robotScripts/${script.id}`;
    this.log(`Deleting script with id of ${script.id}`);
    return this.http.delete<any>(url)
      .pipe(
        tap(_ => this.log(`Deleted script with id of ${script.id}`)),
        catchError(this.returnError(`delete id=${script.id}`))
      );
  }

  generateVersion(script: Script, description: string): Observable<any> {
    const url = environment.baseURL + `robotScripts/v2/${script.id}/versions`;
    this.log(`Generating version for script with id of ${script.id}`);
    var data = new Script();
    data.script = script.script;
    data.description = description;
    return this.http.post<any>(url, data)
      .pipe(
        tap(_ => this.log(`Generated version for script with id of ${script.id}`)),
        map(result => {
          script.versions.push(result.data);
          return result;
        }),
        catchError(this.returnError(`update id=${script.id}`))
      );
  }

  private update(script: Script): Observable<any> {
    const url = environment.baseURL + `robotScripts/${script.id}`;
    this.log(`Updating script with id of ${script.id}`);
    return this.http.put<any>(url, script)
      .pipe(
        tap(_ => this.log(`Updated script with id of ${script.id}`)),
        mergeMap(result => {
          const resourcesToSave = (result.data.resources || []).filter(res => res.contents);
          if ((result.status != 'Ok') || !(resourcesToSave.length || script.deletedResources.length || script.deletedParameters.length)){
            return of(result);
          }

          const updates = resourcesToSave.map(res => this.updateResource(url, res))
            .concat(script.deletedResources.map(res => this.deleteResource(url, res)))
            .concat(script.deletedParameters.map(param => this.deleteParameter(url, param)));
          
          return forkJoin(updates)
            .pipe(
              map<any, any>(res => {
                const error = res.find(r => r.status != 'Ok');
                return error || result;
              })
            );
        }),
        catchError(this.returnError(`update id=${script.id}`))
      );
  }

  private addNew(script: Script): Observable<any> {
    const url = environment.baseURL + `robotScripts`;
    this.log(`Adding new script`);
    return this.http.post<any>(url, script)
      .pipe(
        tap(_ => this.log('Added new script')),
        catchError(this.returnError(`addNew`))
      );
  }

  private updateResource(baseUrl: string, resource: ScriptResource): Observable<any> {
    const url = baseUrl + `/resources/${resource.id}`;
    return this.http.put(url, resource).pipe(
      catchError(this.returnError(`updateResource id=${resource.id}`))
    );
  }

  private deleteResource(baseUrl: string, resource: ScriptResource): Observable<any> {
    const url = baseUrl + `/resources/${resource.id}`;
    return this.http.delete(url).pipe(
      catchError(this.returnError(`updateResource id=${resource.id}`))
    );
  }

  private deleteParameter(baseUrl: string, parameter: ScriptParameter): Observable<any> {
    const url = baseUrl + `/parameters/${parameter.id}`;
    return this.http.delete(url).pipe(
      catchError(this.returnError(`updateResource id=${parameter.id}`))
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

  private returnError(operation = 'operation') {
    return (error: any): Observable<any> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(error.error);
    };
  }
}
