import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment'
import { Robot } from '../data/robot';

@Injectable({
  providedIn: 'root'
})
export class RobotsService {

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  getRobots(page: number = 0): Observable<Robot[]> {
    const url = `${environment.baseURL}robots?p=${page}&l=100`;
    this.log('Fetching robots');
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log('Fetched robots')),
        catchError(this.handleError('getRobots', [])),
        map(data => data.items)
      );
  }

  getRobot(id: number): Observable<Robot> {
    const url = environment.baseURL + `robots/${id}`;
    this.log(`Fetching robot with id of ${id}`);
    return this.http.get<Robot>(url)
      .pipe(
        tap(_ => this.log(`Fetched robot with id of ${id}`)),
        catchError(this.handleError<Robot>(`getRobot id=${id}`))
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
