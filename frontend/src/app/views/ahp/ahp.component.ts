import { Component, Inject, OnInit } from '@angular/core';
import { AhpDataService } from '../../services/ahp-data.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DarkModeService } from '../../services/dark-mode.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-ahp',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule, MatCheckboxModule, MatSelectModule],
    templateUrl: './ahp.component.html',
    styleUrls: ['./ahp.component.css'],
})
export class AhpComponent  {
    ahpData: any = {};
    topThreeCompanies: { name: string; coefficient: number }[] = []; 
    showScores: boolean = false;
    selectedTopCount: number = 3; 
    topOptions: number[] = [3, 5, 10];
    title = "AHP";

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private ahpDataService: AhpDataService,
    public darkService: DarkModeService, 
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
