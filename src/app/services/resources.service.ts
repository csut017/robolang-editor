import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Resource } from '../data/resource';
import { ScriptValue } from '../data/script-value';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  getResources(size: number = 20, page: number = 0, search?: string): Observable<Resource[]> {
    var url = `${environment.apiURL}resources?p=${page}&l=${size}`;
    if (search) url += `&s=url:(${search})`;
    this.log('Fetching resources');
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log('Fetched resources')),
        catchError(this.handleError('getResources', [])),
        map(data => data.items)
      );
  }

  listTypes(): Observable<ScriptValue[]> {
    var url = `${environment.apiURL}resources/types`;
    this.log('Fetching resource types');
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log('Fetched resource types')),
        catchError(this.handleError('listTypes', [])),
        map(data => data.mappings)
      );
  }

  addResource(name: string, typeID: number): Observable<Resource> {
    var url = `${environment.apiURL}resources`;
    const data = {
      resourceType: typeID,
      url: name
    };
    this.log('Adding resource');
    return this.http.post<any>(url, data)
      .pipe(
        tap(_ => this.log('Added resource')),
        catchError(this.handleError<Resource>('addResource')),
        map<any, Resource>(data => data.data)
      );
  }

  uploadResourceData(resource: Resource, data: any): Observable<Resource>{
    var fileData = new FormData();
    fileData.append("fileData", data);
    fileData.append("filename", resource.url);
    const url = `${environment.resourceURL}${resource.url}`;
    this.log('Uploading resource');
    return this.http.post<any>(url, data)
      .pipe(
        tap(_ => this.log('Uploaded resource')),
        catchError(this.handleError<Resource>('addResource')),
        map<any, Resource>(resp => {
          console.log(resp);
          return resource;
        })
      );
  }
  
  private log(message: string) {
    this.messageService.add(`RobotService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
