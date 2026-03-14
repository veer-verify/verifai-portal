import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../utilities/services/alert.service';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { AgCharts } from "ag-charts-angular";

@Component({
  selector: 'app-camera-insights',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, AgCharts],
  templateUrl: './camera-insights.component.html',
  styleUrl: './camera-insights.component.css'
})
export class CameraInsightsComponent implements OnChanges {

  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ) { }

  @Input() analyticsData: any;
  @Input() camera: any;
  @Output() closeModal: any = new EventEmitter<void>();
  @Output() siteActions = new EventEmitter<any>();
  roleList: any;
  addUserForm!: FormGroup;

  ngOnChanges(changes: SimpleChanges): void {
    this.generateCharts()
  }

  ngOnInit() {
    this.generateCharts()
  }

  close() {
    this.closeModal.emit()
  }

  charts: any = [];
  generateCharts() {
    this.charts = this.analyticsData.map((section: any) => {
      const chartData = section.data.map((d: any) => ({
        label: d.type,
        value: Number(d.total)
      }));

      return {
        title: section.name,
        options: {
          data: chartData,
          series: [
            {
              type: 'donut',
              angleKey: 'value',
              calloutLabelKey: 'label',
              innerRadiusRatio: 0.6,
              calloutLabel: {
                enabled: false
              }
            },
          ],
          legend: {
            position: 'right',
            item: {
              label: {
                fontFamily: 'Neometric Medium',
                fontSize: 14
              }
            }
          },
        },
      };
    });
  }

}
