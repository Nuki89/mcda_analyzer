import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrometheeComponent } from './promethee.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PrometheeComponent', () => {
  let component: PrometheeComponent;
  let fixture: ComponentFixture<PrometheeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrometheeComponent, BrowserAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrometheeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
