import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AhpDataService } from '../../services/ahp-data.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DarkModeService } from '../../services/dark-mode.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-ahp',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule, MatCheckboxModule, MatSelectModule, FontAwesomeModule, MatSlideToggleModule],
    templateUrl: './ahp.component.html',
    styleUrls: ['./ahp.component.css'],
})

export class AhpComponent  {
    // Fontawesome icons
    faTriangleExclamation = faTriangleExclamation;

    ahpData: any = {};
    topThreeCompanies: { name: string; coefficient: number }[] = []; 
    showScores: boolean = false;
    selectedTopCount: number = 3; 
    topOptions: number[] = [3, 5, 10];
    title = "AHP";
    criteriaWithWeights: { name: string; weight: number; active: boolean }[] = [];
    weightSum: number = 0;
    weightOptions: number[] = Array.from({ length: 11 }, (_, i) => i / 10);

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private ahpDataService: AhpDataService,
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
        this.ahpDataService.getAHPdata().subscribe(
            (data: any) => {
            this.ahpData = data;
            console.log('AHP data:', this.ahpData);
            this.calculateTopThreeCompanies();
            console.log('Top Three Companies:', this.topThreeCompanies);
            this.criteriaWithWeights = this.extractCriteriaWithWeights(this.ahpData);
            this.calculateWeightSum();
            },
            (error: any) => {
            console.error('Error fetching AHP data:', error);
            }
        );
    }

    private extractCriteriaWithWeights(data: any): { name: string; weight: number; active: boolean }[] {
        return (data.criteria_with_weights || []).map((criterion: any) => ({
          ...criterion,
          active: true,
        }));
      }

    private calculateTopThreeCompanies() {
        if (Array.isArray(this.ahpData.ahp_rankings) && this.ahpData.ahp_rankings.length > 0) {
    
            this.topThreeCompanies = this.ahpData.ahp_rankings
                .map((ranking: any) => ({
                    name: ranking.name,
                    coefficient: Number(ranking.score),
                }))
                .sort((a: { name: string; coefficient: number }, b: { name: string; coefficient: number }) => b.coefficient - a.coefficient)
                .slice(0, this.selectedTopCount);
    
        } else {
            console.error("AHP Rankings are missing or empty.");
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
      
        this.http
            .post('http://127.0.0.1:8000/ahp/', payload)
            .subscribe(
                (data: any) => {
                    this.ahpData = data;
                    this.calculateTopThreeCompanies();

                    // Step 2: Save the results to backend
                    const savePayload = {
                        criteria_with_weights: data.criteria_with_weights,
                        ahp_rankings: data.ahp_rankings,
                    };
            
                    // NOT WORKING
                    // this.http
                    //     .post('http://127.0.0.1:8000/ahp-results/save_ahp/', savePayload)
                    //     .subscribe(
                    //     (saveData: any) => {
                    //         console.log('Results saved successfully:', saveData);
                    //     },
                    //     (saveError) => {
                    //         console.error('Error saving AHP results:', saveError);
                    //     }
                    // );
                },
                (error) => {
                console.error('Error updating weights and criteria:', error);
                }
            );  
    }
      
    // OLD VERSION WITHOUT SECURITY
    // saveWeights() {
    //     // !!!!!! FOUND SECURITY ISSUES HERE IN URL !!!!!!
    //     const activeCriteria = this.criteriaWithWeights.filter(c => c.active);
    
    //     if (activeCriteria.length === 0) {
    //       alert('At least one criterion must be active.');
    //       return;
    //     }
    
    //     const selectedCriteria = activeCriteria.map(c => c.name).join(',');
    //     const weights = activeCriteria.map(c => c.weight);
    
    //     const sumOfWeights = weights.reduce((a, b) => a + b, 0);
    //     const roundedSum = Math.round(sumOfWeights * 1000) / 1000;
    
    //     if (roundedSum !== 1) {
    //       alert(`Weights must sum to 1. Current sum: ${roundedSum}`);
    //       return;
    //     }
    
    //     const queryParam = `selected_criteria=${selectedCriteria}&weights=${weights.join(',')}`;
    
    //     this.http
    //       .get(`http://127.0.0.1:8000/ahp/?${queryParam}`)
    //       .subscribe(
    //         (data: any) => {
    //           this.ahpData = data;
    //           this.calculateTopThreeCompanies(); 
    //         },
    //         (error) => {
    //           console.error('Error updating weights and criteria:', error);
    //         }
    //     );

    // }

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
