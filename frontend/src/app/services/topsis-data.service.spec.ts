import { TestBed } from '@angular/core/testing';

import { TopsisDataService } from './topsis-data.service';

describe('TopsisDataService', () => {
  let service: TopsisDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopsisDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
