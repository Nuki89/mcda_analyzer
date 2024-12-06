import { Component, ViewEncapsulation } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { RouterModule } from '@angular/router';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule ,FontAwesomeModule, DarkModeComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  // FONTAWESOME ICONS
  faSnowflake = faSnowflake;
  
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
