import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapingDataComponent } from './scraping-data.component';

describe('ScrapingDataComponent', () => {
  let component: ScrapingDataComponent;
  let fixture: ComponentFixture<ScrapingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrapingDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScrapingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
