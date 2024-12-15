import { Component, ViewEncapsulation } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { RouterModule } from '@angular/router';
import { faSnowflake, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ScrapeService } from '../../services/scrape.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule, DarkModeComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  // FONTAWESOME ICONS
  faSnowflake = faSnowflake;
  isSpinning = false;
  faSpinner = faSpinner;
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isScraping = false; 
  scrapeResult: any = null;

  constructor(private scrapeService: ScrapeService) {}

  onScrape(): void {
    this.isSpinning = !this.isSpinning;
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
