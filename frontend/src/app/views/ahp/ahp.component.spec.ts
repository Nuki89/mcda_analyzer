import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AhpComponent } from './ahp.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AhpComponent', () => {
  let component: AhpComponent;
  let fixture: ComponentFixture<AhpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AhpComponent, BrowserAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AhpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
