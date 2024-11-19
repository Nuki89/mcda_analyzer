import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { TopsisDataService } from '../../services/topsis-data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-topsis',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, FontAwesomeModule],
  templateUrl: './topsis.component.html',
  styleUrl: './topsis.component.css',
})
export class TopsisComponent {
  faTriangleExclamation = faTriangleExclamation;

  topsisData: any = {};
  topThreeCompanies: { name: string; coefficient: number }[] = [];
  weightOptions: number[] = Array.from({ length: 11 }, (_, i) => i / 10);
  weightSum: number = 0;
  criteriaWithWeights: { name: string, weight: number }[] = [];

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private topsisDataService: TopsisDataService,
  ) {}

  async ngAfterViewInit() {
    this.loadData();
  }

  private loadData() {
    this.topsisDataService.getTopsisdata().subscribe(
      (data: any) => {
        this.topsisData = data;
        // console.log('Topsis data:', this.topsisData);
        this.calculateTopThreeCompanies();
        this.criteriaWithWeights = this.extractCriteriaWithWeights(this.topsisData);
        // console.log('Criteria with Weights:', this.criteriaWithWeights);
        this.calculateWeightSum();
      },
      (error: any) => {
        console.error('Error fetching Topsis data:', error);
      },
    );
  }

  private calculateTopThreeCompanies() {
    if (this.topsisData.closeness_coefficients) {
      const coefficients = Object.entries(this.topsisData.closeness_coefficients);
      this.topThreeCompanies = coefficients
        .map(([name, coefficient]: [string, unknown]) => ({ name, coefficient: Number(coefficient) }))
        .sort((a, b) => b.coefficient - a.coefficient)
        .slice(0, 3);
    }
  }

  private calculateWeightSum() {
    if (this.criteriaWithWeights && this.criteriaWithWeights.length > 0) {
      this.weightSum = this.criteriaWithWeights.reduce((sum, criterion) => sum + criterion.weight, 0);
      this.weightSum = Math.round(this.weightSum * 1000) / 1000; 
      // console.log('Current Weight Sum:', this.weightSum);
    } else {
      this.weightSum = 0; 
    }
  }
  
  // private calculateWeightSum() {
    
  //   this.weightSum = this.criteriaWithWeights
  //     .map(criterion => parseFloat(criterion.weight.toString()) || 0)
  //     .reduce((sum, weight) => sum + weight, 0);
  
  //   this.weightSum = Math.round(this.weightSum * 1000) / 1000;
  
  //   // console.log('Current Weight Sum:', this.weightSum);
  // }

  saveWeights() {
    const updatedWeights = this.criteriaWithWeights.map(c => c.weight);
    const sumOfWeights = updatedWeights.reduce((a: number, b: number) => a + b, 0);
    const roundedSum = Math.round(sumOfWeights * 1000) / 1000; 
  
    if (roundedSum !== 1) {
        alert(`Weights must sum to 1. Current sum: ${roundedSum}`);
        return;
    }

    const queryParam = updatedWeights.join(',');
    this.http.get(`http://127.0.0.1:8000/topsis/?weights=${queryParam}`).subscribe(
      (data: any) => {
        this.topsisData = data;
        // console.log('Updated Topsis data:', this.topsisData);
        this.calculateTopThreeCompanies();
      },
      (error) => {
        console.error('Error updating weights:', error);
      }
    );
  }

  updateWeight(index: number, weight: number) {
    this.criteriaWithWeights[index].weight = parseFloat(weight.toString()) || 0;
    this.calculateWeightSum();
    // console.log(`Updated weight for ${this.criteriaWithWeights[index].name}: ${weight}`);
  }

  private extractCriteriaWithWeights(data: any): { name: string, weight: number }[] {
    return data.criteria_with_weights || [];
  }
}
