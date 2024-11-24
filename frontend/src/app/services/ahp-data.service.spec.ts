import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AhpDataService } from './ahp-data.service';

describe('AhpDataService', () => {
  let service: AhpDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(AhpDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
