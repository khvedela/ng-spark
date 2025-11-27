import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink, CodeBlockComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  formsXInstallCode = 'npm install @ng-spark/forms-x';
  signalStoreInstallCode = 'npm install @ng-spark/signal-store-testing --save-dev';
}