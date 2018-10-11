import { TestBed } from '@angular/core/testing';

import { ScriptSettingsService } from './script-settings.service';

describe('ScriptSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScriptSettingsService = TestBed.get(ScriptSettingsService);
    expect(service).toBeTruthy();
  });
});
