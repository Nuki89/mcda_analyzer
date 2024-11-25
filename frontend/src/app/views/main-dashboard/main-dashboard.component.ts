import { Component, Inject } from '@angular/core';
import { ScrapingDataComponent } from '../../components/scraping-data/scraping-data.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { TopsisDataService } from '../../services/topsis-data.service';
import { AhpDataService } from '../../services/ahp-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrapingDataComponent, HttpClientModule],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  topsisData: any = {};
  ahpData: any[] = []; 
  bestCompany: any = null;
  criteriaWithWeights: { name: string, weight: number }[] = [];
  criteria: string[] = [];

  constructor(
    private topsisDataService: TopsisDataService,
    @Inject(HttpClient) private http: HttpClient,
    private ahpDataService: AhpDataService,
  ) {}

  async ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {

    this.ahpDataService.getAHPdata().subscribe(
      (data) => {
          this.ahpData = data;

          if (this.ahpData.length > 0) {
              this.bestCompany = this.ahpData.reduce((prev, current) =>
                  prev.score > current.score ? prev : current
              );
          }
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
        this.criteriaWithWeights = this.extractCriteriaWithWeights(this.topsisData);
        console.log('(topsis)Criteria with Weights:', this.criteriaWithWeights);
      },
      (error: any) => {
        console.error('Error fetching Topsis data:', error);
      }
    );
    
  }

  private extractCriteriaWithWeights(data: any): { name: string, weight: number }[] {
    return data.criteria_with_weights || [];
  }

}