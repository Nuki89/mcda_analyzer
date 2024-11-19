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
export class AhpComponent implements OnInit {
  ahpData: any[] = []; 
  bestCompany: any = null; 

  constructor(
    @Inject(HttpClient) private http: HttpClient,
    private ahpDataService: AhpDataService,
    ) {}

  ngOnInit() {
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
              console.log('Best company:', this.bestCompany);
          },
          (error) => {
              console.error('Error fetching AHP data:', error);
          }
      );
  }
}
