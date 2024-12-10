import { TestBed } from '@angular/core/testing';

import { WsmDataService } from './wsm-data.service';

describe('WsmDataService', () => {
  let service: WsmDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsmDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
