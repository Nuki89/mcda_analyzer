import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ScrapingDataComponent } from '../../components/scraping-data/scraping-data.component';
import { AhpDataService } from '../../services/ahp-data.service';
import { TopsisDataService } from '../../services/topsis-data.service';
import { PrometheeDataService } from '../../services/promethee-data.service';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrapingDataComponent, HttpClientModule],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  ahpData: any = {};
  prometheeData: any = {};
  topsisData: any = {};

  constructor(
    private ahpDataService: AhpDataService,
    private prometheeDataService: PrometheeDataService,
    private topsisDataService: TopsisDataService,
    @Inject(HttpClient) private http: HttpClient,
  ) {}

  async ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {

    this.ahpDataService.getAHPdata().subscribe(
      (data) => {
          this.ahpData = data;
          console.log('AHP data:', this.ahpData);
      },
      (error) => {
          console.error('Error fetching AHP data:', error);
      }
    );

    this.topsisDataService.getTopsisdata().subscribe(
      (data: any[]) => {
        this.topsisData = data;
        console.log('Topsis data:', this.topsisData);
      },
      (error: any) => {
        console.error('Error fetching Topsis data:', error);
      }
    );

    this.prometheeDataService.getPrometheeData().subscribe(
      (data: any) => {
        this.prometheeData = data;
        console.log('Promethee data:', this.prometheeData);
      },
      (error: any) => {
        console.error('Error fetching Promethee data:', error);
      }
    );
    
  }

}