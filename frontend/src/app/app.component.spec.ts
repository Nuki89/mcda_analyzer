import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); 
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();  
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('MCDA'); 
  });
});

