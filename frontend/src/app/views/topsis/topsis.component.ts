import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { TopsisDataService } from '../../services/topsis-data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faRotateRight, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DarkModeService } from '../../services/dark-mode.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { apiEndpoints } from '../../../environments/environment';
import { BarChartComponent } from '../../components/charts/bar-chart/bar-chart.component';

interface Criterion {
  name: string;
  weight?: number; 
  default_weight: number;
}

@Component({
  selector: 'app-topsis',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, FontAwesomeModule, MatSlideToggleModule, MatCheckboxModule, MatSelectModule, BarChartComponent],
  templateUrl: './topsis.component.html',
  styleUrl: './topsis.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TopsisComponent {
  // Fontawesome icons
  faSpinner = faSpinner;
  faTriangleExclamation = faTriangleExclamation;
  faRotateRight = faRotateRight;
  faFloppyDisk = faFloppyDisk;

  title = "Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)";
  topsisData: any = {};
  selectedTopCount: number = 3; 
  showScores: boolean = false;
  topThreeCompanies: { name: string; closeness_coefficient: number }[] = [];
  topOptions: number[] = [3, 5, 10];
  weightOptions: number[] = Array.from({ length: 11 }, (_, i) => i / 10);
  weightSum: number = 0;
  criteriaWithWeights: { name: string; weight: number; active: boolean }[] = [];
  isDarkMode = false;
  isCalculating = false;
  message: string | null = null;
  yFieldName: string = 'closeness_coefficient';

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private topsisDataService: TopsisDataService,
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
    this.topsisDataService.getTopsisdata().subscribe(
      (data: any) => {
        this.topsisData = data;

        if (!this.topsisData) {
          this.onFetchNoData();
          console.log('Topsis data fetched!');
        }

        console.log('Topsis data loaded:', data);

        this.criteriaWithWeights = this.extractCriteriaWithWeights(this.topsisData);

        this.calculateWeightSum();
        this.calculateTopThreeCompanies();
      },
      (error: any) => {
        console.error('Error fetching Topsis data:', error);
      }
    );
  }


  onFetchNoData(): void {
    this.isCalculating = true;
    this.message = null;

    this.topsisDataService.triggerTopsisCalculation().subscribe({
      next: () => {
        this.message = 'Topsis calculation completed successfully!';
        this.isCalculating = false;
        window.location.reload();
      },
      error: (err) => {
        console.error('Topsis calculation failed:', err);
        this.message = 'Failed to calculate Topsis. Please try again.';
        this.isCalculating = false;
      },
    });
  }


  resetToDefaultWeights() {
    this.http.get<Criterion[]>(apiEndpoints.apiUrlDefaultCriteria)
    // this.http.get<Criterion[]>('http://127.0.0.1:8000/default-criteria/')
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

    if (Array.isArray(this.topsisData)) {
        rankings = this.topsisData[0]?.rankings; 
    } else {
        rankings = this.topsisData.topsis_rankings;
    }

    if (Array.isArray(rankings) && rankings.length > 0) {
        this.topThreeCompanies = rankings
            .map((ranking: any) => ({
                name: ranking.name,
                closeness_coefficient: ranking.closeness_coefficient,
            }))
            .sort((a: { name: string; closeness_coefficient: number }, b: { name: string; closeness_coefficient: number }) => b.closeness_coefficient - a.closeness_coefficient)
            .slice(0, this.selectedTopCount);

        console.log('Top Three Companies:', this.topThreeCompanies);
    } else {
        console.warn("Topsis Rankings are missing or empty.");
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

    // const selectedCriteria = activeCriteria.map(c => c.name).join(',');
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
    .post(apiEndpoints.apiUrlTopsisCalculation, payload)
    // .post('http://127.0.0.1:8000/topsis/', payload)
      .subscribe(
        (data: any) => {
          console.log('Backend Response:', data);
          this.topsisData = data;
          this.calculateTopThreeCompanies(); 

          const savePayload = {
            criteria: data.criteria,
            rankings: data.rankings,
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


}