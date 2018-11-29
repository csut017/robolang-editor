import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptDownloadComponent } from './script-download.component';

describe('ScriptDownloadComponent', () => {
  let component: ScriptDownloadComponent;
  let fixture: ComponentFixture<ScriptDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
