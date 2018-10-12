import { TestBed } from '@angular/core/testing';

import { ScriptHelpService } from './script-help.service';

describe('ScriptHelpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScriptHelpService = TestBed.get(ScriptHelpService);
    expect(service).toBeTruthy();
  });
});
