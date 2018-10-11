import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'
import { environment } from '../environments/environment'
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { catchError, shareReplay, tap, share } from 'rxjs/operators';

interface login {
  status: string,
  msg: string,
  data?: loginToken
}

interface loginToken {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private keyName: string = 'authToken';

  constructor(private http: HttpClient,
    private messageService: MessageService) {
      this.token = sessionStorage.getItem(this.keyName) || '';
     }

  token: string = '';

  login(username, password): Observable<login> {
    const url = `${environment.baseURL}login`;
    return this.http.post<login>(url, {
      'user': username,
      'password': password,
      'type': 'user'
    }).pipe(
      share(),
      catchError(this.handleError()),
      tap(data => {
        if (data.data) {
          this.token = data.data.token;
          sessionStorage.setItem(this.keyName, this.token);
        } else {
          this.token = '';
        }
        this.log('Login complete')
      })
    );
  }

  logout() {
    this.token = '';
    sessionStorage.removeItem(this.keyName);
  }

  isValid(): boolean {
    return !!this.token;
  }

  private log(message: string) {
    this.messageService.add(`AuthenticationService: ${message}`);
  }

  private handleError() {
    return (error: any): Observable<login> => {
      const msg = error.error && error.error.msg ? error.error.msg : error.message;
      this.log(`login failed: ${msg}`);
      return of({
        status: 'Failure',
        msg: msg
      });
    };
  }
}
