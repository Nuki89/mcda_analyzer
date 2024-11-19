import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './dark-mode.component.html',
  styleUrls: ['./dark-mode.component.css']
})
export class DarkModeComponent {
  constructor(public darkService: DarkModeService) {}

  // FONTAWESOME ICONS 6
  faSun = faSun;
  faMoon = faMoon;

  isDarkMode = false;

  toggleTheme() {
    this.darkService.toggleDarkMode();
  }
}
