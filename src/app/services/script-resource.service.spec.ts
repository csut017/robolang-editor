import { TestBed } from '@angular/core/testing';

import { ScriptResourceService } from './script-resource.service';

describe('ScriptResourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScriptResourceService = TestBed.get(ScriptResourceService);
    expect(service).toBeTruthy();
  });
});
