import { TestBed } from '@angular/core/testing';

import { PrometheeDataService } from './promethee-data.service';
import { HttpClientModule } from '@angular/common/http';

describe('PrometheeDataService', () => {
  let service: PrometheeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(PrometheeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
