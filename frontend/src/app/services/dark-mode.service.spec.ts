import { TestBed } from '@angular/core/testing';
import { DarkModeService } from './dark-mode.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('DarkModeService', () => {
  let service: DarkModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default dark mode set to false', () => {
    expect(service.isDarkMode).toBeFalse();
  });

  it('should toggle dark mode on and off', () => {
    expect(service.isDarkMode).toBeFalse();

    service.toggleDarkMode();
    expect(service.isDarkMode).toBeTrue();

    service.toggleDarkMode();
    expect(service.isDarkMode).toBeFalse();
  });

  it('should emit dark mode value changes', fakeAsync(() => {
    let emittedValue: boolean = false;
    service.darkMode$.subscribe((value) => {
      emittedValue = value;
    });
    
    service.toggleDarkMode();
    expect(emittedValue).toBeTrue();
    tick(); 
  }));
});
