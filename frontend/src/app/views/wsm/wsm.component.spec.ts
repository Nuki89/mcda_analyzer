import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsmComponent } from './wsm.component';

describe('WsmComponent', () => {
  let component: WsmComponent;
  let fixture: ComponentFixture<WsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WsmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
