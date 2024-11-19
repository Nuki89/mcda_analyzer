import { Routes } from '@angular/router';
import { MainDashboardComponent } from './views/main-dashboard/main-dashboard.component';
import { AhpComponent } from './views/ahp/ahp.component';
import { TopsisComponent } from './views/topsis/topsis.component';
import { PrometheeComponent } from './views/promethee/promethee.component';
import { WsmComponent } from './views/wsm/wsm.component';

export const routes: Routes = [
  { path: '', component: MainDashboardComponent },  
  { path: 'dashboard', component: MainDashboardComponent },
  { path: 'ahp', component: AhpComponent },
  { path: 'topsis', component: TopsisComponent },
  { path: 'promethee', component: PrometheeComponent }, 
  { path: 'wsm', component: WsmComponent },  
];
