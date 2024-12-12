import { Component, AfterViewInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { AgCharts, AgCartesianChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: '<div id="myChart" style="width: 100%; height: 500px;"></div>',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent {
  @Input() chartData: any[] = [];
  private chart: any;

  constructor(private cdr: ChangeDetectorRef) {}


  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('Changes detected:', changes);
  //   if (changes['chartData'] && this.chartData) {
  //     console.log('Updating or creating chart with data:', this.chartData);
  //     this.createChart();
  //   }
  // }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chartData && this.chartData.length > 0) {
      this.createChart();
    }
  }


  createChart() {
    if (this.chart) {
      this.chart.data = this.chartData;
      this.chart.update();
    } else {
      
      this.chart = AgCharts.create({
        container: document.getElementById('myChart'),
        // autoSize: true,
        data: this.chartData,
        series: [{
          type: 'line',
          xKey: 'method',
          yKey: 'value',
          marker: {
            enabled: true
          }
        }],
        axes: [{
          type: 'category',
          position: 'bottom'
        }, {
          type: 'number',
          position: 'left'
        }]
      });
    }
    this.cdr.detectChanges();
  }

}
