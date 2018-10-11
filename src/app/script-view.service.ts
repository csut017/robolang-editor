import { Injectable, EventEmitter } from '@angular/core';

export interface ScriptView {
  currentView: string;
  currentItem?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptViewService implements ScriptView {

  constructor() { }

  currentView: string;
  currentItem?: any;
  viewChanged: EventEmitter<ScriptView> = new EventEmitter<ScriptView>();

  changeView(view: string, item?: any) {
    this.currentView = view;
    this.currentItem = item;
    this.viewChanged.emit(this);
  }
}
