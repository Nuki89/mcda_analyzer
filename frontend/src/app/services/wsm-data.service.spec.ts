import { TestBed } from '@angular/core/testing';

import { WsmDataService } from './wsm-data.service';
import { HttpClientModule } from '@angular/common/http';

describe('WsmDataService', () => {
  let service: WsmDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(WsmDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
