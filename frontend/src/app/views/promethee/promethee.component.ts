import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';
import { PrometheeDataService } from '../../services/promethee-data.service';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { faCalculator, faFloppyDisk, faRotateRight, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { apiEndpoints } from '../../../environments/environment';
import { BarChartComponent } from '../../components/charts/bar-chart/bar-chart.component';

interface Criterion {
  name: string;
  weight?: number; 
  default_weight: number;
}

@Component({
  selector: 'app-promethee',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatCheckboxModule, MatSelectModule, FontAwesomeModule, MatSlideToggleModule, BarChartComponent],
  templateUrl: './promethee.component.html',
  styleUrl: './promethee.component.css'
})
export class PrometheeComponent {
  // Fontawesome icons
  faSpinner = faSpinner;
  faCalculator = faCalculator
  faRotateRight = faRotateRight;
  faTriangleExclamation = faTriangleExclamation;
  faFloppyDisk = faFloppyDisk; 

  title = 'Preference Ranking Organization Method for Enrichment Evaluations (PROMETHEE)';
  prometheeData: any = {};
  selectedTopCount: number = 3; 
  showScores: boolean = false;
  topOptions: number[] = [3, 5, 10];
  topThreeCompanies: { name: string; net_flow: number }[] = [];
  criteriaWithWeights: { name: string; weight: number; active: boolean }[] = [];
  weightSum: number = 0;
  weightOptions: number[] = Array.from({ length: 11 }, (_, i) => i / 10);
  isCalculating = false;
  message: string | null = null;
  yFieldName: string = 'net_flow';

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private prometheeDataService: PrometheeDataService,
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
    this.prometheeDataService.getPrometheeData().subscribe(
        (data: any) => {
            this.prometheeData = data;
            
            if (!this.prometheeData) {
              this.onFetchNoData();
              console.log('Promethee data fetched!');
            }

            console.log('Promethee data loaded:', data);

            this.criteriaWithWeights = this.extractCriteriaWithWeights(this.prometheeData);

            this.calculateWeightSum();
            this.calculateTopThreeCompanies();
        },
        (error: any) => {
            console.error('Error fetching Promethee data:', error);
        }
    );
  }

  
  onFetchNoData(): void {
    this.isCalculating = true;
    this.message = null;

    this.prometheeDataService.triggerPrometheeCalculation().subscribe({
      next: () => {
        this.message = 'Promethee calculation completed successfully!';
        this.isCalculating = false;
        window.location.reload();
      },
      error: (err) => {
        console.error('Promethee calculation failed:', err);
        this.message = 'Failed to calculate Promethee. Please try again.';
        this.isCalculating = false;
      },
    });
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

    if (Array.isArray(this.prometheeData)) {
        rankings = this.prometheeData[0]?.rankings; 
    } else {
        rankings = this.prometheeData.promethee_rankings;
    }

    if (Array.isArray(rankings) && rankings.length > 0) {
        this.topThreeCompanies = rankings
            .map((ranking: any) => ({
                name: ranking.name,
                net_flow: ranking.net_flow,
            }))
            .sort((a: { name: string; net_flow: number }, b: { name: string; net_flow: number }) => b.net_flow - a.net_flow)
            .slice(0, this.selectedTopCount);

        console.log('Top Three Companies:', this.topThreeCompanies);
    } else {
        console.warn("Promethee Rankings are missing or empty.");
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
    // const selectedCriteria = activeCriteria.map(c => c.name).join(',');
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
        .post(apiEndpoints.apiUrlPrometheeCalculation, payload)
        .subscribe(
            (data: any) => {
                console.log('Backend Response:', data);
                this.prometheeData = data;
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
