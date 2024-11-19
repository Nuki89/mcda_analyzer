import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScrapingDataService } from './scraping-data.service';

describe('ScrapingDataService', () => {
  let service: ScrapingDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScrapingDataService]
    });

    service = TestBed.inject(ScrapingDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should fetch data successfully', () => {
    const mockData = [{ name: 'Test Data' }];

    service.getScrapingData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/scraped-data/');
    expect(req.request.method).toBe('GET');
    req.flush(mockData); 
  });
});
