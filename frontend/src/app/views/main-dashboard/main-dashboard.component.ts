import { Component, Inject } from '@angular/core';
import { ScrapingDataComponent } from '../../components/scraping-data/scraping-data.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { TopsisDataService } from '../../services/topsis-data.service';
import { AhpDataService } from '../../services/ahp-data.service';
import { CommonModule } from '@angular/common';
import { PrometheeDataService } from '../../services/promethee-data.service';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrapingDataComponent, HttpClientModule],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  ahpData: any[] = []; 
  prometheeData: any = {};
  topsisData: any = {};
  bestCompany: any = null;
  criteriaWithWeights: { name: string, weight: number }[] = [];
  criteria: string[] = [];

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

  private extractCriteriaWithWeights(data: any): { name: string, weight: number }[] {
    return data.criteria_with_weights || [];
  }

}