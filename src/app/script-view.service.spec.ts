import { TestBed } from '@angular/core/testing';

import { ScriptViewService } from './script-view.service';

describe('ScriptViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScriptViewService = TestBed.get(ScriptViewService);
    expect(service).toBeTruthy();
  });
});
