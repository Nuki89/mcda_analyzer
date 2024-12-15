import { Component, Input, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { RouterModule } from '@angular/router';
import { faSnowflake, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ScrapeService } from '../../services/scrape.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrapingDataComponent } from '../scraping-data/scraping-data.component';
import { Subscription } from 'rxjs';
import { ScrapingDataService } from '../../services/scraping-data.service';


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
  
  private subscription!: Subscription;
  isMenuOpen = false;
  isScraping = false; 
  scrapeResult: any = null;
  datafetched: any[] = [];

  constructor(private scrapeService: ScrapeService,
    private scrapingDataService: ScrapingDataService
  ) {}


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }


  async ngOnInit() {
    this.checkData();
  }


  checkData() {
    this.subscription = this.scrapingDataService.getData().subscribe(
      data => {
        this.datafetched = data;
        console.log('ScrapingDataComponent:', data);
      }
    );
  }

  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


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
