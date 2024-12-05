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
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-promethee',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatCheckboxModule, MatSelectModule, FontAwesomeModule, MatSlideToggleModule],
  templateUrl: './promethee.component.html',
  styleUrl: './promethee.component.css'
})
export class PrometheeComponent {
  // Fontawesome icons
  faTriangleExclamation = faTriangleExclamation;

  title = 'Promethee';
  prometheeData: any = {};
  selectedTopCount: number = 3; 
  showScores: boolean = false;
  topOptions: number[] = [3, 5, 10];
  topThreeCompanies: { name: string; net_flow: number }[] = []; 

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
          console.log('Promethee data:', this.prometheeData);
          this.calculateTopThreeCompanies();
          console.log('Top Three Companies:', this.topThreeCompanies);
          // this.criteriaWithWeights = this.extractCriteriaWithWeights(this.prometheeData);
          // this.calculateWeightSum();
          },
          (error: any) => {
          console.error('Error fetching Promethee data:', error);
          }
      );
  }


  private calculateTopThreeCompanies() {
    if (Array.isArray(this.prometheeData[0]?.rankings) && this.prometheeData[0]?.rankings.length > 0) {
        this.topThreeCompanies = this.prometheeData[0].rankings
            .map((ranking: any) => ({
                name: ranking.name,
                net_flow: ranking.net_flow, 
            }))
            .sort((a: { name: string; net_flow: number }, b: { name: string; net_flow: number }) => b.net_flow - a.net_flow)
            .slice(0, this.selectedTopCount); 
    } else {
        console.error("Promethee Rankings are missing or empty.");
        this.topThreeCompanies = [];
    }
  }


  onTopCountChange(newCount: number): void {
    this.selectedTopCount = newCount; 
    this.calculateTopThreeCompanies(); 
    this.cdr.detectChanges(); 
  }

  

}
