import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';
import { PrometheeDataService } from '../../services/promethee-data.service';

@Component({
  selector: 'app-promethee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promethee.component.html',
  styleUrl: './promethee.component.css'
})
export class PrometheeComponent {
  prometheeData: any = {};

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
        // this.calculateTopThreeCompanies();
        // console.log('Top Three Companies:', this.topThreeCompanies);
        // this.criteriaWithWeights = this.extractCriteriaWithWeights(this.prometheeData);
        // this.calculateWeightSum();
        },
        (error: any) => {
        console.error('Error fetching AHP data:', error);
        }
    );
}

}
