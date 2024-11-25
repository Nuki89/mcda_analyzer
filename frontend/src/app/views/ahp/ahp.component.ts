import { Component, Inject, OnInit } from '@angular/core';
import { AhpDataService } from '../../services/ahp-data.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-ahp',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule],
    templateUrl: './ahp.component.html',
    styleUrls: ['./ahp.component.css'],
})
export class AhpComponent  {
    ahpData: any = {};
    topThreeCompanies: { name: string; coefficient: number }[] = []; 

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private ahpDataService: AhpDataService,
    ) {}

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
            // this.calculateTopThreeCompanies();
            // this.criteriaWithWeights = this.extractCriteriaWithWeights(this.topsisData);
            // this.calculateWeightSum();
            },
            (error: any) => {
            console.error('Error fetching Topsis data:', error);
            }
        );
    }

    private calculateTopThreeCompanies() {
        if (Array.isArray(this.ahpData.ahp_rankings) && this.ahpData.ahp_rankings.length > 0) {
    
            this.topThreeCompanies = this.ahpData.ahp_rankings
                .map((ranking: any) => ({
                    name: ranking.name,
                    coefficient: Number(ranking.score),
                }))
                .sort((a: { name: string; coefficient: number }, b: { name: string; coefficient: number }) => b.coefficient - a.coefficient)
                .slice(0, 3);
    
        } else {
            console.error("AHP Rankings are missing or empty.");
            this.topThreeCompanies = [];
        }
    }
    
}
