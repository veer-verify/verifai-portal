import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-siteinfo',
  imports: [CommonModule],
  templateUrl: './siteinfo.component.html',
  styleUrl: './siteinfo.component.css'
})
export class SiteinfoComponent {

  info = 1

  det = [false, false, false];

  changeClass(n: number){
    this.info = n;
  }

  showMore(n: number){
    this.det[n] = !this.det[n];
  }

}