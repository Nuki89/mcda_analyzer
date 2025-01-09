import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: '<div #chartdiv id="chartdiv" style="width: 100%; height: 550px; "></div>',
  styles: [`
    #chartdiv { width: 100%; height: 600px; }
  `]
})
export class BarChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartdiv', { static: true }) chartDiv!: ElementRef;
  @Input() chartData: any[] = [];
  @Input() yField: string = 'score';

  private root!: am5.Root;
  private chart!: am5xy.XYChart;

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData'] && this.chart) {
      this.updateChartData();
    }
  }

  private initChart() {
    this.root = am5.Root.new(this.chartDiv.nativeElement);

    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true
    }));

    let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
    cursor.lineY.set("visible", false);

    let xRenderer = am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 });
    let xAxis = this.chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
      categoryField: "name",  
      renderer: xRenderer
    }));

    let yRenderer = am5xy.AxisRendererY.new(this.root, {});
    let yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: yRenderer
    }));

    let series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: this.yField,
      categoryXField: "name"  
    }));

    if (this.chartData) {
      this.updateChartData();
    }

    series.appear(1000);
    this.chart.appear(1000, 100);
  }

  private updateChartData() {
    let xAxis = this.chart.xAxes.getIndex(0) as am5xy.CategoryAxis<am5xy.AxisRendererX>;
    let series = this.chart.series.getIndex(0) as am5xy.ColumnSeries;

    xAxis.data.setAll(this.chartData);
    series.data.setAll(this.chartData);
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
