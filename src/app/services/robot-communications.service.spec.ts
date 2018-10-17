import { TestBed } from '@angular/core/testing';

import { RobotCommunicationsService } from './robot-communications.service';

describe('RobotCommunicationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RobotCommunicationsService = TestBed.get(RobotCommunicationsService);
    expect(service).toBeTruthy();
  });
});
