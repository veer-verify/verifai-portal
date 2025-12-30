import { PDFViewer } from './../../../../../node_modules/pdfjs-dist/types/web/pdf_viewer.d';
import { Component } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RequestService } from '../../../../utilities/services/request.service';
import { SanitizePipe } from '../../../../utilities/pipes/sanitize.pipe';
import { AuthService } from '../../../auth/auth.service';
import { ConfigService } from '../../../../utilities/services/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../../utilities/services/storage.service';

@Component({
  selector: 'app-terms-conditions',
  imports: [PdfViewerModule, SanitizePipe],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.css',
})
export class TermsConditionsComponent {

  constructor(
    private request_service: RequestService,
    private config_service: ConfigService,
    private http: HttpClient,
    private storage_service: StorageService
  ) { }

  sanitizedURL: any;
  pdfSrc: any;
  ngOnInit(): void {
    let url = `${environment.commonDownUrl}/downloadFile_1_0?requestName=TermsandConditions&assetName=TermsandConditions.pdf`;
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (data: Blob) => {
        const fileURL = URL.createObjectURL(data);
        console.log(fileURL)
        this.pdfSrc = fileURL;
      },
      (error) => {
        console.error('Error fetching PDF:', error);
      }
    );
  }
}
