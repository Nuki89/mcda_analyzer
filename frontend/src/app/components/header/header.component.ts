import { Component, ViewEncapsulation } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { RouterModule } from '@angular/router';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { ScrapeService } from '../../services/scrape.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule ,FontAwesomeModule, DarkModeComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  // FONTAWESOME ICONS
  faSnowflake = faSnowflake;
  
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isScraping = false; 
  scrapeResult: any = null;

  constructor(private scrapeService: ScrapeService) {}

  onScrape(): void {
    this.isScraping = true;
    this.scrapeService.scrapeData().subscribe({
      next: (response) => {
        console.log('Scrape successful', response); 
        this.scrapeResult = response; 
        this.isScraping = false; 
        window.location.reload();
      },
      error: (error) => {
        console.error('Scrape failed', error);
        this.isScraping = false; 
      },
    });
  }

}
