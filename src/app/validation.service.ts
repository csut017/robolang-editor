import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { Observable, of } from 'rxjs';
import { catchError, map, tap, mergeMap, concatMap } from 'rxjs/operators';
import { Script } from './script';

export class ValidationResult {
  error: ParseError;
}

export class ParseError {
  message: string;
  linePos: number;
  lineNum: number;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  validate(script: Script): Observable<ValidationResult> {
    const url = `${environment.baseURL}robotScripts/compile`;
    this.log(`Compiling script ${script.name}`);
    return this.http.post(url, {
      script: script.script
    })
      .pipe(
        tap(_ => this.log(`Compiled script ${script.name}`)),
        catchError(this.handleError<Script>(`validate id=${script.id}`)),
        map<any, ValidationResult>(res => {
          var val = new ValidationResult();
          if (res.error) val.error = res.error;
          return val;
        })
      );
  }

  private log(message: string) {
    this.messageService.add(`ValidationService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
