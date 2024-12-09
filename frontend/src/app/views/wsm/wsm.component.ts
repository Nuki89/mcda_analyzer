import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wsm',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './wsm.component.html',
  styleUrl: './wsm.component.css'
})
export class WsmComponent {
  // Fontawesome icons
  faSpinner = faSpinner;

  title = "WSM";
  wsmData = {} = [];

}
