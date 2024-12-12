import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeService } from './services/dark-mode.service';
import { CommonModule } from '@angular/common';
import { AgChartsModule } from 'ag-charts-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule ,RouterOutlet, RouterModule, HttpClientModule, HeaderComponent, FooterComponent, FontAwesomeModule, AgChartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'mcda-frontend';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      import('flowbite').then(({ initFlowbite }) => {
        initFlowbite();
      });
    }
  }

  constructor(
    public darkService: DarkModeService, 
  ) {}

  isDarkMode = false;
  get themeClass() {
      return this.darkService.isDarkMode ? 'dark-background' : 'light-background';
    }

}
