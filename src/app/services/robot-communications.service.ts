import { Injectable, EventEmitter } from '@angular/core';
import { Robot } from '../data/robot';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RobotCommunicationsService {

  constructor(private http: HttpClient) { }

  connect(robot: Robot): Observable<RobotClient> {
    return this.http.get<RobotProtocol>(robot.address).pipe(
      tap(resp => this.log('Retrieved protocol', resp)),
      catchError(err => {
        this.log('Unable to retrieve protocol', err);
        return of(new RobotProtocol());
      }),
      map<RobotProtocol, RobotClient>(proto => new RobotClient(proto.address))
    );
  }

  private log(message: string, data?: any) {
    if (data) {
      console.groupCollapsed('[RobotCommunicationsService] ' + message);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('[RobotCommunicationsService] ' + message);
    }
  }
}

class RobotProtocol {
  address: string;
}

export class RobotClient {
  constructor(address?: string) {
    this.address = address;
  }

  onConnected: EventEmitter<number> = new EventEmitter<number>();
  onMessageReceived: EventEmitter<RobotMessage> = new EventEmitter<RobotMessage>();
  onErrorReceived: EventEmitter<string> = new EventEmitter<string>();
  onClosed: EventEmitter<number> = new EventEmitter<number>();

  connected: boolean;
  private address: string;
  private socket: WebSocket;

  canConnect(): boolean {
    return !!this.address;
  }

  connect() {
    if (!this.address) return;
    this.socket = new WebSocket(this.address);
    this.socket.onopen = _ => {
      this.connected = true;
      this.onConnected.emit(0);
    };
    this.socket.onclose = evt => {
      this.connected = false;
      this.log(`Close received: ${evt.reason} [${evt.code}]`)
      this.onClosed.emit(evt.code);
    };
    this.socket.onmessage = evt => {
      this.log('Message received', evt.data);
      var out = JSON.parse(evt.data);
      this.onMessageReceived.emit(out);
    };
    this.socket.onerror = evt => {
      this.log(`Error received: ${evt.type}`);
      this.onErrorReceived.emit(evt.type);
    }
  }

  send(type: string, data?: any) {
    var msg = new RobotMessage();
    msg.Type = type;
    if (data) msg.Data = data;
    this.socket.send(JSON.stringify(msg));
  }

  close() {
    this.socket.close();
  }

  private log(message: string, data?: any) {
    if (data) {
      console.groupCollapsed('[RobotClient] ' + message);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('[RobotClient] ' + message);
    }
  }
}

export class RobotMessage {
  Type: string;
  Data: any;
}