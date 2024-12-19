import { TestBed } from '@angular/core/testing';

import { ScrapeService } from './scrape.service';
import { HttpClientModule } from '@angular/common/http';

describe('ScrapeService', () => {
  let service: ScrapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(ScrapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
