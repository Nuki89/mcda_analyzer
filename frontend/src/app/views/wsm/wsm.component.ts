import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faRotateRight, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { WsmDataService } from '../../services/wsm-data.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { apiEndpoints } from '../../../environments/environment';
import { BarChartComponent } from '../../components/charts/bar-chart/bar-chart.component';

interface Criterion {
  name: string;
  weight?: number; 
  default_weight: number;
}

@Component({
  selector: 'app-wsm',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatCheckboxModule, MatSelectModule, FontAwesomeModule, MatSlideToggleModule, BarChartComponent],
  templateUrl: './wsm.component.html',
  styleUrl: './wsm.component.css'
})
export class WsmComponent {
  // Fontawesome icons
  faSpinner = faSpinner;
  faTriangleExclamation = faTriangleExclamation;
  faFloppyDisk = faFloppyDisk; 
  faRotateRight = faRotateRight;

  title = "Weighted Sum Model (WSM)";
  wsmData: any = {};
  selectedTopCount: number = 3; 
  topOptions: number[] = [3, 5, 10];
  topThreeCompanies: { name: string; score: number }[] = []; 
  showScores: boolean = false;
  criteriaWithWeights: { name: string; weight: number; active: boolean }[] = [];
  weightSum: number = 0;
  weightOptions: number[] = Array.from({ length: 11 }, (_, i) => i / 10);
  isCalculating = false;
  message: string | null = null;
  yFieldName: string = 'score';

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private wsmDataService: WsmDataService,
    public darkService: DarkModeService, 
    private cdr: ChangeDetectorRef,
  ) {}

  get themeClass() {
    return this.darkService.isDarkMode ? 'dark-mode' : 'light-mode';
  }


  async ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {
    this.wsmDataService.getWSMdata().subscribe(
        (data: any) => {
        this.wsmData = data;
        if (!this.wsmData) {
            this.onFetchNoData();
            console.log('WSM data fetched!');
        }

        console.log('WSM data:', this.wsmData);

        this.criteriaWithWeights = this.extractCriteriaWithWeights(this.wsmData);

        this.calculateWeightSum();
        this.calculateTopThreeCompanies();
        },
        (error: any) => {
        console.error('Error fetching WSM data:', error);
        }
    );
  }


  onFetchNoData(): void {
    this.isCalculating = true;
    this.message = null;

    this.wsmDataService.triggerWSmCalculation().subscribe({
      next: () => {
        this.message = 'WSM calculation completed successfully!';
        this.isCalculating = false;
        window.location.reload();
      },
      error: (err) => {
        console.error('WSM calculation failed:', err);
        this.message = 'Failed to calculate WSM. Please try again.';
        this.isCalculating = false;
      },
    });
  }


  private extractCriteriaWithWeights(data: any): { name: string; weight: number; active: boolean }[] {
    let criteria = [];

    if (Array.isArray(data)) {
        criteria = data[0]?.criteria || [];
    } else if (data.criteria_with_weights) {
        criteria = data.criteria_with_weights;
    } else {
        console.warn('Criteria is missing in the data.');
        return [];
    }

    return criteria.map((criterion: any) => ({
        name: criterion.name,
        weight: criterion.weight,
        active: true,
    }));
  }


  private calculateTopThreeCompanies() {
      let rankings;

      if (Array.isArray(this.wsmData)) {
          rankings = this.wsmData[0]?.rankings; 
      } else {
          rankings = this.wsmData.wsm_rankings;
      }

      if (Array.isArray(rankings) && rankings.length > 0) {
          this.topThreeCompanies = rankings
              .map((ranking: any) => ({
                  name: ranking.name,
                  score: ranking.score,
              }))
              .sort((a: { name: string; score: number }, b: { name: string; score: number }) => b.score - a.score)
              .slice(0, this.selectedTopCount);

          console.log('Top Three Companies:', this.topThreeCompanies);
      } else {
          console.warn("WSM Rankings are missing or empty.");
          this.topThreeCompanies = [];
      }
  }


  onTopCountChange(newCount: number): void {
      this.selectedTopCount = newCount; 
      this.calculateTopThreeCompanies(); 
      this.cdr.detectChanges(); 
  }


  saveWeights() {
    const activeCriteria = this.criteriaWithWeights.filter(c => c.active);
  
    if (activeCriteria.length === 0) {
      alert('At least one criterion must be active.');
      return;
    }
  
    const selectedCriteria = activeCriteria.map(c => c.name);
    const weights = activeCriteria.map(c => c.weight);
  
    const sumOfWeights = weights.reduce((a, b) => a + b, 0);
    const roundedSum = Math.round(sumOfWeights * 1000) / 1000;
  
    if (roundedSum !== 1) {
      alert(`Weights must sum to 1. Current sum: ${roundedSum}`);
      return;
    }
  
    const payload = {
      selected_criteria: selectedCriteria,
      weights: weights
    };
    console.log('Payload:', payload);

    this.http
        .post(apiEndpoints.apiUrlWsmCalculation, payload)
        .subscribe(
            (data: any) => {
                console.log('Backend Response:', data);
                this.wsmData = data;
                this.calculateTopThreeCompanies();

                const savePayload = {
                    criteria_with_weights: data.criteria_with_weights,
                    wsm_rankings: data.wsm_rankings,
                };
        
            },
            (error) => {
            console.error('Error updating weights and criteria:', error);
            }
        );  
  }


  updateWeight(index: number, weight: number) {
      this.criteriaWithWeights[index].weight = parseFloat(weight.toString()) || 0;
      this.calculateWeightSum();
  }


  private calculateWeightSum() {
      const activeCriteria = this.criteriaWithWeights.filter(c => c.active);
      this.weightSum = activeCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      this.weightSum = Math.round(this.weightSum * 1000) / 1000;
  }


  onToggleChange() {
      this.calculateWeightSum();
  }

  resetToDefaultWeights() {
    this.http.get<Criterion[]>(apiEndpoints.apiUrlDefaultCriteria)
        .subscribe(
            (defaultWeights) => {
                if (!Array.isArray(defaultWeights)) {
                    console.error('Invalid response format for default weights.');
                    return;
                }
                this.criteriaWithWeights = defaultWeights.map(criterion => ({
                    name: criterion.name,
                    weight: criterion.default_weight, 
                    active: true 
                }));
                this.calculateWeightSum();
                this.saveWeights();
            },
            (error) => {
                console.error('Error fetching default weights:', error);
            }
        );
  }

}
