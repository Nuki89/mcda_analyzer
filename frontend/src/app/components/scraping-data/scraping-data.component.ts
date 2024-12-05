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
    paginationPageSizeSelector: [10, 20, 30, 50, 100],
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
    // { headerName: 'Revenue % Change', field: 'revenue_percent_change' },
    { headerName: 'Profits', field: 'profits' },
    // { headerName: 'Profits % Change', field: 'profits_percent_change' },
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
