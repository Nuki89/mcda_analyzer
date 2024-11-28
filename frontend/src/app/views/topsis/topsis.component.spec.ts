import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopsisComponent } from './topsis.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TopsisComponent', () => {
  let component: TopsisComponent;
  let fixture: ComponentFixture<TopsisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopsisComponent, BrowserAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopsisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
