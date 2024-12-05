import { TestBed } from '@angular/core/testing';

import { PrometheeDataService } from './promethee-data.service';

describe('PrometheeDataService', () => {
  let service: PrometheeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrometheeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
