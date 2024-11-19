import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrometheeComponent } from './promethee.component';

describe('PrometheeComponent', () => {
  let component: PrometheeComponent;
  let fixture: ComponentFixture<PrometheeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrometheeComponent]
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
