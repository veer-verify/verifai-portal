import { PDFViewer } from './../../../../../node_modules/pdfjs-dist/types/web/pdf_viewer.d';
import { Component } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RequestService } from '../../../../utilities/services/request.service';
import { SanitizePipe } from '../../../../utilities/pipes/sanitize.pipe';
import { AuthService } from '../../../auth/auth.service';
import { ConfigService } from '../../../../utilities/services/config.service';

@Component({
  selector: 'app-terms-conditions',
  imports: [PdfViewerModule, SanitizePipe],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.css',
})
export class TermsConditionsComponent {
  
  constructor(
    private domsanitizer: DomSanitizer,
    private request_service: RequestService,
    private config_service: ConfigService
  ) {}

  sanitizedURL: any;

  pdf() {
    this.request_service.gettnc().subscribe((res: any) => {
      if (res.Status == "Success") {
        var zoom = '';
        if (window.innerWidth > 1300) { zoom = 'zoom=120&' }
        else { zoom = '' }
        this.sanitizedURL = this.domsanitizer.bypassSecurityTrustResourceUrl(res.url + `#${zoom}toolbar=0&transparent=1`);
      } else {
        return res;
      }
      // if (res.Message == "Invalid accessToken") { this.config_service.refresh(); }
    });
  }

  sanitizedUrls: Map<string, SafeResourceUrl> = new Map();
  sanitizeUrl(url: string | undefined): SafeResourceUrl | null {
    if (url === undefined) {
      return null;
    } else {
      let sanitizedUrl = this.sanitizedUrls.get(url);
      if (!sanitizedUrl) {
        sanitizedUrl = this.domsanitizer.bypassSecurityTrustResourceUrl(url);
        this.sanitizedUrls.set(url, sanitizedUrl);
      }
      return sanitizedUrl;
    }
  }

  showOptions1() { return this.request_service.showOptions1() }

}
