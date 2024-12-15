import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ScrapingDataComponent } from '../../components/scraping-data/scraping-data.component';
import { AhpDataService } from '../../services/ahp-data.service';
import { TopsisDataService } from '../../services/topsis-data.service';
import { PrometheeDataService } from '../../services/promethee-data.service';
import { WsmDataService } from '../../services/wsm-data.service';
import { LineChartComponent } from '../../components/charts/line-chart/line-chart.component';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrapingDataComponent, HttpClientModule, LineChartComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  ahpData: any = {};
  prometheeData: any = {};
  topsisData: any = {};
  wsmData: any = {};
  chartData: any[] = [];
  lineChartComponent: any;
  
  constructor(
    private ahpDataService: AhpDataService,
    private prometheeDataService: PrometheeDataService,
    private topsisDataService: TopsisDataService,
    private wsmDataService: WsmDataService,
    @Inject(HttpClient) private http: HttpClient,
  ) {}


  // async ngAfterViewInit() {
  //   this.loadData();
  // }


  async ngOnInit() {
    this.loadData();
  }


  processRankings(data: any, methodName: string) {
    const rankings = data[0]?.rankings;
    console.log(`${methodName} rankings:`, rankings);
    this.chartData.push({ method: methodName, value: rankings });
    console.log('Chart data:', this.chartData);
  }


  updateChartData() {
    if (this.lineChartComponent) {
      this.lineChartComponent.chartData = this.chartData;
      this.lineChartComponent.createChart();
    }
  }


  private loadData() {

    this.ahpDataService.getAHPdata().subscribe(
      (data: any) => {
        this.ahpData = data;
        console.log('AHP data:', this.ahpData);
        this.processRankings(this.ahpData, 'AHP');

        if (this.ahpData < 1) {
          this.ahpDataService.triggerAHPCalculation().subscribe((data: any[]) => {
          console.log('Ahp data was empty');
          });
        }
        
      },
      (error: any) => {
        console.error('Error fetching AHP data:', error);
      }
    );
    
    this.topsisDataService.getTopsisdata().subscribe(
      (data: any[]) => {
        this.topsisData = data;
        console.log('Topsis data:', this.topsisData);
        this.processRankings(this.topsisData, 'Topsis');

        if (this.topsisData < 1) {
          this.topsisDataService.triggerTopsisCalculation().subscribe((data: any[]) => {
          console.log('Topsis data was empty');
          });
        }

      },
      (error: any) => {
        console.error('Error fetching Topsis data:', error);
      }
    );

    this.prometheeDataService.getPrometheeData().subscribe(
      (data: any) => {
        this.prometheeData = data;
        console.log('Promethee data:', this.prometheeData);
        this.processRankings(this.prometheeData, 'Promethee');

        if (this.prometheeData < 1) {
          this.prometheeDataService.triggerPrometheeCalculation().subscribe((data: any[]) => {
          console.log('Promethee data was empty');
          });
        }

      },
      (error: any) => {
        console.error('Error fetching Promethee data:', error);
      }
    );

    this.wsmDataService.getWSMdata().subscribe(
      (data: any) => {
        this.wsmData = data;
        console.log('WSM data:', this.wsmData);
        this.processRankings(this.wsmData, 'WSM');

        if (this.wsmData < 1) {
          this.wsmDataService.triggerWSmCalculation().subscribe((data: any[]) => {
          console.log('WSM data was empty');
          });
        }

      },
      (error: any) => {
        console.error('Error fetching WSM data:', error);
      }
    );
    this.updateChartData();
  }

}