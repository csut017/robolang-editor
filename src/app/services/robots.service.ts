import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';
import { Observable, of, forkJoin } from 'rxjs';
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
    const url = `${environment.apiURL}robots?p=${page}&l=100`;
    this.log('Fetching robots');
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log('Fetched robots')),
        catchError(this.handleError('getRobots', [])),
        map(data => data.items)
      );
  }

  getRobot(id: number): Observable<Robot> {
    const url = environment.apiURL + `robots/${id}`;
    this.log(`Fetching robot with id of ${id}`);
    return this.http.get<Robot>(url)
      .pipe(
        tap(_ => this.log(`Fetched robot with id of ${id}`)),
        catchError(this.handleError<Robot>(`getRobot id=${id}`))
      );
  }

  getResourcesForRobot(robot: Robot): Observable<Robot> {
    const url = environment.apiURL + `robots/${robot.id}/scripts/resources`;
    this.log(`Fetching script resources for robot with id of ${robot.id}`);
    return this.http.get<any>(url)
      .pipe(
        tap(_ => this.log(`Fetched script resources for robot with id of ${robot.id}`)),
        catchError(this.handleError<Robot>(`getResourcesForRobot id=${robot.id}`)),
        map(data => {
          if (data) {
            robot.resources = data.items;
          }
          return robot;
        })
      );
  }

  getScriptsForRobot(robot: Robot): Observable<Robot> {
    const url = environment.apiURL + `robots/${robot.id}/scripts`;
    this.log(`Fetching scripts for robot with id of ${robot.id}`);
    var scripts = this.http.get<any>(url)
      .pipe(
        tap(_ => this.log(`Fetched scripts for robot with id of ${robot.id}`)),
        catchError(this.handleError<Robot>(`getScriptsForRobot id=${robot.id}`))
      );
    var checksum = this.http.get<any>(`${url}/checksum`)
      .pipe(
        tap(_ => this.log(`Fetched checksum for robot with id of ${robot.id}`)),
        catchError(this.handleError<Robot>(`getScriptsForRobot id=${robot.id}`))
      );
    return forkJoin([scripts, checksum])
      .pipe(
        map(data => {
          if (data[0]) {
            robot.scripts = data[0].items;
            robot.checksum = data[1].hash;
            robot.scriptsAreValid = true;
          } else {
            robot.scriptsAreValid = false;
          }
          return robot;
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
