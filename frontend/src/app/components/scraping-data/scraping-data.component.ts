import { Component, AfterViewInit, PLATFORM_ID, Inject, ViewChild, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular'; 
import { ColDef, GridOptions } from 'ag-grid-community';
import { HttpClientModule } from '@angular/common/http';
import { ScrapingDataService } from '../../services/scraping-data.service';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-scraping-data',
  standalone: true,
  imports: [CommonModule, AgGridAngular, HttpClientModule, FontAwesomeModule],
  templateUrl: './scraping-data.component.html',
  styleUrls: ['./scraping-data.component.css']
})
export class ScrapingDataComponent implements AfterViewInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  // FONTAWESOME ICONS
  faCoffee = faCoffee;
  faSun = faSun;
  faMoon = faMoon;

  isBrowser: boolean;
  rowData: any[] = [];

  isDarkMode = false;

  get themeClass() {
    return this.darkService.isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrapingDataService: ScrapingDataService,
    public darkService: DarkModeService, 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      this.loadData();
    }
  }

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 30],
    defaultColDef: {
      flex: 1,
      editable: false,
      autoHeight: true,
      floatingFilter: false,
      resizable: false,
      suppressMovable: true,
      sortable: true,
      filter: false,
      unSortIcon: true,
    },
    // getRowStyle: params => {
    //   if (params.node && params.node.rowIndex !== null && params.node.rowIndex % 2 === 0) {
    //     return { background: '#ffffff' }; 
    //   } else {
    //     return { background: '#f9f9f9' }; 
    //   }
    // }
    getRowStyle: params => {
      if (params.node && params.node.rowIndex !== null && params.node.rowIndex % 2 === 0) {
        return { background: 'var(--ag-even-row-background-color)' };
      } else {
        return { background: 'var(--ag-odd-row-background-color)' };
      }
    }
    
  };

  columnDefs: ColDef[] = [
    { headerName: 'Rank', field: 'rank' },
    { headerName: 'Name', field: 'name' },
    { headerName: 'Revenue', field: 'revenue' },
    { headerName: 'Revenue % Change', field: 'revenue_percent_change' },
    { headerName: 'Profits', field: 'profits' },
    { headerName: 'Profits % Change', field: 'profits_percent_change' },
    { headerName: 'Assets', field: 'assets' },
    { headerName: 'Employees', field: 'employees' },
    { headerName: 'Years on List', field: 'years_on_list' },
  ];

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.agGrid.api.sizeColumnsToFit();
  }

  private loadData() {
    this.scrapingDataService.getScrapingData().subscribe(
      (data: any[]) => {
        this.rowData = data;
      },
      (error: any) => {
        console.error('Error fetching scraping data:', error);
      }
    );
  }
}

// ############## NEEDED ADVANCED ENTERPRISE
// import { Component, AfterViewInit, PLATFORM_ID, Inject, ViewChild, HostListener } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { AgGridAngular } from 'ag-grid-angular'; 
// import { ColDef, GridOptions } from 'ag-grid-community';
// import { HttpClientModule } from '@angular/common/http';
// import { ScrapingDataService } from '../../services/scraping-data.service';
// import { themeQuartz } from '@ag-grid-community/theming'; 

// @Component({
//   selector: 'app-scraping-data',
//   standalone: true,
//   imports: [CommonModule, AgGridAngular, HttpClientModule],
//   templateUrl: './scraping-data.component.html',
//   styleUrls: ['./scraping-data.component.css']
// })
// export class ScrapingDataComponent implements AfterViewInit {
//   @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
//   isBrowser: boolean;
//   rowData: any[] = [];

//   // Define the theme configuration
//   myTheme = themeQuartz.withParams({
//     accentColor: "#00A2FF",
//     backgroundColor: "#21222C",
//     borderColor: "#429356",
//     borderRadius: 0,
//     browserColorScheme: "dark",
//     cellHorizontalPaddingScale: 0.8,
//     cellTextColor: "#50F178",
//     columnBorder: true,
//     fontFamily: {
//         googleFont: "IBM Plex Mono"
//     },
//     fontSize: 12,
//     foregroundColor: "#68FF8E",
//     headerBackgroundColor: "#21222C",
//     headerFontSize: 14,
//     headerFontWeight: 700,
//     headerTextColor: "#68FF8E",
//     headerVerticalPaddingScale: 1.5,
//     oddRowBackgroundColor: "#21222C",
//     rangeSelectionBackgroundColor: "#FFFF0020",
//     rangeSelectionBorderColor: "yellow",
//     rangeSelectionBorderStyle: "dashed",
//     rowBorder: true,
//     rowVerticalPaddingScale: 1.5,
//     sidePanelBorder: true,
//     spacing: 4,
//     wrapperBorder: true,
//     wrapperBorderRadius: 0
//   });

//   constructor(
//     @Inject(PLATFORM_ID) private platformId: Object,
//     private scrapingDataService: ScrapingDataService 
//   ) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   async ngAfterViewInit() {
//     if (this.isBrowser) {
//       this.loadData();
//     }
//   }

//   // Apply the theme configuration to the gridOptions
//   gridOptions: GridOptions = {
//     theme: this.myTheme,  // Set custom theme
//     domLayout: 'autoHeight',
//     pagination: true,
//     paginationPageSize: 10,
//     paginationPageSizeSelector: [10, 20, 30],
//     defaultColDef: {
//       flex: 1,
//       editable: false,
//       autoHeight: true,
//       floatingFilter: false,
//       resizable: false,
//       suppressMovable: true,
//       sortable: true,
//       filter: false,
//       unSortIcon: true,
//     },
//     getRowStyle: params => {
//       if (params.node && params.node.rowIndex !== null && params.node.rowIndex % 2 === 0) {
//         return { background: '#ffffff' }; 
//       } else {
//         return { background: '#f9f9f9' }; 
//       }
//     }
//   };

//   columnDefs: ColDef[] = [
//     { headerName: 'Rank', field: 'rank' },
//     { headerName: 'Name', field: 'name' },
//     { headerName: 'Revenue', field: 'revenue' },
//     { headerName: 'Revenue % Change', field: 'revenue_percent_change' },
//     { headerName: 'Profits', field: 'profits' },
//     { headerName: 'Profits % Change', field: 'profits_percent_change' },
//     { headerName: 'Assets', field: 'assets' },
//     { headerName: 'Employees', field: 'employees' },
//     { headerName: 'Years on List', field: 'years_on_list' },
//   ];

//   onGridReady(params: any) {
//     params.api.sizeColumnsToFit();
//   }

//   @HostListener('window:resize', ['$event'])
//   onResize(event: any) {
//     this.agGrid.api.sizeColumnsToFit();
//   }

//   private loadData() {
//     this.scrapingDataService.getScrapingData().subscribe(
//       (data: any[]) => {
//         this.rowData = data;
//       },
//       (error: any) => {
//         console.error('Error fetching scraping data:', error);
//       }
//     );
//   }
// }


// ##################################################################################################################
// import { Component, AfterViewInit, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { AgGridAngular } from 'ag-grid-angular'; 
// import { ColDef, GridOptions } from 'ag-grid-community';
// import { NgModule } from '@angular/core';

// @Component({
//   selector: 'app-scraping-data',
//   standalone: true,
//   imports: [AgGridAngular, CommonModule],
//   templateUrl: './scraping-data.component.html',
//   styleUrls: ['./scraping-data.component.css']
// })
// export class ScrapingDataComponent implements AfterViewInit {
//   @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
//   isBrowser: boolean;

//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   async ngAfterViewInit() {
//     if (this.isBrowser) {
//     }
//   }

//   gridOptions: GridOptions = {
//     domLayout: 'autoHeight',
//     defaultColDef: {
//       flex: 1,
//       editable: false,
//       autoHeight: true,
//       floatingFilter: false,
//       resizable: false,
//       suppressMovable: true,
//       sortable: true,
//       filter: false,
//       unSortIcon: true,
//     },
//   };

//   columnDefs: ColDef[] = [
//     { headerName: 'Rank', field: 'rank' },
//     { headerName: 'Name', field: 'name' },
//     { headerName: 'Revenue', field: 'revenue' },
//     { headerName: 'Revenue % Change', field: 'revenue_percent_change' },
//     { headerName: 'Profits', field: 'profits' },
//     { headerName: 'Profits % Change', field: 'profits_percent_change' },
//     { headerName: 'Assets', field: 'assets' },
//     { headerName: 'Employees', field: 'employees' },
//     { headerName: 'Years on List', field: 'years_on_list' },
//   ];

//   rowData = [
//     {
//       "id": 647,
//       "rank": 4,
//       "name": "Saudi Aramco",
//       "revenue": "494890.10",
//       "revenue_percent_change": "-18%",
//       "profits": "120699.30",
//       "profits_percent_change": "-24.1%",
//       "assets": "660819.20",
//       "employees": 73311,
//       "change_in_rank": -2,
//       "years_on_list": 6,
//       "sector": "N/A",
//       "industry": "N/A",
//       "last_scraped": "2024-11-08T20:53:20.325977+01:00"
//     },
//     {
//         "id": 648,
//         "rank": 24,
//         "name": "Glencore",
//         "revenue": "217829.00",
//         "revenue_percent_change": "-14.9%",
//         "profits": "4280.00",
//         "profits_percent_change": "-75.3%",
//         "assets": "123869.00",
//         "employees": 83426,
//         "change_in_rank": -3,
//         "years_on_list": 14,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326052+01:00"
//     },
//     {
//         "id": 649,
//         "rank": 56,
//         "name": "China National Offshore Oil",
//         "revenue": "141731.80",
//         "revenue_percent_change": "-14%",
//         "profits": "14559.20",
//         "profits_percent_change": "-14.3%",
//         "assets": "225842.10",
//         "employees": 82560,
//         "change_in_rank": -14,
//         "years_on_list": 18,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326074+01:00"
//     },
//     {
//         "id": 650,
//         "rank": 75,
//         "name": "Shandong Energy Group",
//         "revenue": "122383.20",
//         "revenue_percent_change": "-1.4%",
//         "profits": "829.60",
//         "profits_percent_change": "2446.3%",
//         "assets": "141176.30",
//         "employees": 214409,
//         "change_in_rank": -3,
//         "years_on_list": 7,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326093+01:00"
//     },
//     {
//         "id": 651,
//         "rank": 109,
//         "name": "Pemex",
//         "revenue": "96978.80",
//         "revenue_percent_change": "-18.2%",
//         "profits": "457.10",
//         "profits_percent_change": "-90.9%",
//         "assets": "136067.60",
//         "employees": 128616,
//         "change_in_rank": -29,
//         "years_on_list": 30,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326114+01:00"
//     },
//     {
//         "id": 652,
//         "rank": 170,
//         "name": "Shaanxi Coal & Chemical Industry",
//         "revenue": "74776.70",
//         "revenue_percent_change": "-1.4%",
//         "profits": "1113.70",
//         "profits_percent_change": "-19.7%",
//         "assets": "100857.70",
//         "employees": 140142,
//         "change_in_rank": -1,
//         "years_on_list": 10,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326130+01:00"
//     },
//     {
//         "id": 653,
//         "rank": 180,
//         "name": "Oil & Natural Gas",
//         "revenue": "71466.10",
//         "revenue_percent_change": "-9.2%",
//         "profits": "5947.60",
//         "profits_percent_change": "34.8%",
//         "assets": "85215.30",
//         "employees": 36549,
//         "change_in_rank": -22,
//         "years_on_list": 18,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326146+01:00"
//     },
//     {
//         "id": 654,
//         "rank": 213,
//         "name": "Jinneng Holding Group",
//         "revenue": "63639.80",
//         "revenue_percent_change": "-18.2%",
//         "profits": "993.60",
//         "profits_percent_change": "177%",
//         "assets": "159091.10",
//         "employees": 439051,
//         "change_in_rank": -50,
//         "years_on_list": 12,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326171+01:00"
//     },
//     {
//         "id": 655,
//         "rank": 235,
//         "name": "ConocoPhillips",
//         "revenue": "58574.00",
//         "revenue_percent_change": "-28.7%",
//         "profits": "10957.00",
//         "profits_percent_change": "-41.3%",
//         "assets": "95924.00",
//         "employees": 9900,
//         "change_in_rank": -86,
//         "years_on_list": 29,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326188+01:00"
//     },
//     {
//         "id": 656,
//         "rank": 264,
//         "name": "Rio Tinto Group",
//         "revenue": "54041.00",
//         "revenue_percent_change": "-2.7%",
//         "profits": "10058.00",
//         "profits_percent_change": "-19%",
//         "assets": "103549.00",
//         "employees": 57174,
//         "change_in_rank": -10,
//         "years_on_list": 19,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326206+01:00"
//     },
//     {
//         "id": 657,
//         "rank": 268,
//         "name": "BHP Group",
//         "revenue": "53817.00",
//         "revenue_percent_change": "-24.7%",
//         "profits": "12921.00",
//         "profits_percent_change": "-58.2%",
//         "assets": "101296.00",
//         "employees": 42319,
//         "change_in_rank": -88,
//         "years_on_list": 30,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326223+01:00"
//     },
//     {
//         "id": 658,
//         "rank": 285,
//         "name": "Shaanxi Yanchang Petroleum (Group)",
//         "revenue": "51525.90",
//         "revenue_percent_change": "-1.3%",
//         "profits": "997.30",
//         "profits_percent_change": "14.6%",
//         "assets": "68398.20",
//         "employees": 130427,
//         "change_in_rank": -16,
//         "years_on_list": 12,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326236+01:00"
//     },
//     {
//         "id": 659,
//         "rank": 363,
//         "name": "Vale",
//         "revenue": "41784.00",
//         "revenue_percent_change": "-5.7%",
//         "profits": "7983.00",
//         "profits_percent_change": "-57.5%",
//         "assets": "94186.00",
//         "employees": 66807,
//         "change_in_rank": -31,
//         "years_on_list": 18,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326252+01:00"
//     },
//     {
//         "id": 660,
//         "rank": 390,
//         "name": "Cenovus Energy",
//         "revenue": "38689.80",
//         "revenue_percent_change": "-24.7%",
//         "profits": "3045.30",
//         "profits_percent_change": "-38.6%",
//         "assets": "40894.30",
//         "employees": 6925,
//         "change_in_rank": -113,
//         "years_on_list": 3,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326265+01:00"
//     },
//     {
//         "id": 661,
//         "rank": 437,
//         "name": "China National Coal Group",
//         "revenue": "35364.00",
//         "revenue_percent_change": "-15.8%",
//         "profits": "2154.20",
//         "profits_percent_change": "14.8%",
//         "assets": "73994.90",
//         "employees": 144531,
//         "change_in_rank": -81,
//         "years_on_list": 5,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326278+01:00"
//     },
//     {
//         "id": 662,
//         "rank": 471,
//         "name": "Shanxi Coking Coal Group",
//         "revenue": "33533.20",
//         "revenue_percent_change": "-19.5%",
//         "profits": "1252.50",
//         "profits_percent_change": "252.6%",
//         "assets": "73316.40",
//         "employees": 214937,
//         "change_in_rank": -112,
//         "years_on_list": 11,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326291+01:00"
//     },
//     {
//         "id": 663,
//         "rank": 480,
//         "name": "Ecopetrol",
//         "revenue": "33126.50",
//         "revenue_percent_change": "-11.8%",
//         "profits": "4872.40",
//         "profits_percent_change": "-34.5%",
//         "assets": "72404.20",
//         "employees": 19657,
//         "change_in_rank": -83,
//         "years_on_list": 7,
//         "sector": "N/A",
//         "industry": "N/A",
//         "last_scraped": "2024-11-08T20:53:20.326304+01:00"
//     }
//   ];

//   onGridReady(params: any) {
//     params.api.sizeColumnsToFit();
//   }

// }