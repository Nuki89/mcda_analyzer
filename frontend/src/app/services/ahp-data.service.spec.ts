import { TestBed } from '@angular/core/testing';

import { AhpDataService } from './ahp-data.service';

describe('AhpDataService', () => {
  let service: AhpDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AhpDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
