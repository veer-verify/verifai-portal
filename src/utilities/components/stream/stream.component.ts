import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-stream',
  imports: [],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamComponent implements OnChanges, OnDestroy {

  constructor(
    private http: HttpClient,
    private alert_service: AlertService
  ) { }

  @Input({ required: true }) videoData: any;
  @Input() isChecked: any;
  @ViewChild('video') video!: ElementRef;

  peerConnection!: RTCPeerConnection;
  restartTimeout: any = null;
  sessionUrl: string = '';
  queuedCandidates: RTCIceCandidate[] = [];
  offerData: any;

  hitStream: boolean = false;
  encoded: any;
  previousUrl: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // 🔄 When videoData changes, restart the stream
    if (changes['videoData'] && !changes['videoData'].firstChange) {
      const newUrl = changes['videoData'].currentValue?.httpUrl;
      const oldUrl = changes['videoData'].previousValue?.httpUrl;

      // Only restart if URL actually changed
      if (newUrl && newUrl !== oldUrl) {
        this.restartStream();
      }
    }
  }

  ngOnInit(): void {
    const username = "admin";
    const password = "verifai123789";
    let credentails = `${username}:${password}`;
    this.encoded = btoa(credentails);

    this.hitStream = true;
    this.requestICEServers();
  }

  ngAfterViewInit() {
    this.video.nativeElement.controls = false;
    this.video.nativeElement.autoplay = true;
    this.video.nativeElement.playsInline = true;
    this.video.nativeElement.muted = true;
  }

  showLoader: boolean = false;
  requestICEServers() {
    if (this.hitStream) {
      this.showLoader = true;
      fetch(`${this.videoData?.httpUrl}/whep`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Basic ${this.encoded}`
        }
      }).then((res) => {
        this.showLoader = false;
        this.peerConnection = new RTCPeerConnection({
          iceServers: this.linkToIceServers(res.headers.get('Link')),
        });
        const direction = 'sendrecv';
        this.peerConnection.addTransceiver('video', { direction });
        this.peerConnection.addTransceiver('audio', { direction });
        this.peerConnection.onicecandidate = (evt: RTCPeerConnectionIceEvent) => this.onLocalCandidate(evt);
        this.peerConnection.oniceconnectionstatechange = () => this.onConnectionState();
        this.peerConnection.ontrack = (evt: RTCTrackEvent) => {
          this.onTrack(evt)
        };
        this.createOffer();
      }).catch((err) => {
        this.video.nativeElement.src = '/gif/error.mp4';
        // this.hitStream = false;
        this.showLoader = false;
        this.onError(err.toString());
      });
    }
  }

  linkToIceServers(links: string | null): RTCIceServer[] {
    const ics: RTCIceServer[] = [];

    if (links !== null) {
      links.split(', ').forEach(link => {
        const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);
        if (m !== null) {
          let ic: RTCIceServer = {
            urls: [m[1]]
          };
          ic.urls = [m[1]];
          if (m[3] !== undefined) {
            ic.username = JSON.parse(`"${m[3]}"`)
            ic.credential = JSON.parse(`"${m[4]}"`)
          }
          ics.push(ic)
        }
      })
    }
    return ics;
  }

  onError(err: any) {
    if (this.restartTimeout === null) {
      this.peerConnection?.close();

      // this.restartTimeout = window.setTimeout(() => {
      //   this.restartTimeout = null;
      //   this.requestICEServers();
      // }, 2000);

      if (this.sessionUrl) {
        fetch(this.sessionUrl, {
          method: 'DELETE',
        });
      }
      this.sessionUrl = '';
      this.queuedCandidates = [];
    }
  };

  restartStream(): void {
    // Close existing peer connection
    if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
      this.peerConnection.close();
    }

    // Delete session if exists
    if (this.sessionUrl) {
      fetch(this.sessionUrl, {
        method: 'DELETE',
      }).catch(err => console.error('Failed to delete session:', err));
    }

    // Reset state
    this.sessionUrl = '';
    this.queuedCandidates = [];
    this.peerConnection = null as any;

    // Clear video
    if (this.video && this.video.nativeElement) {
      this.video.nativeElement.srcObject = null;
    }

    // Restart the stream with new URL
    this.hitStream = true;
    this.requestICEServers();
  };

  onLocalCandidate(evt: RTCPeerConnectionIceEvent): void {
    if (this.restartTimeout !== null) {
      return;
    }

    if (evt.candidate !== null) {
      if (this.sessionUrl === '') {
        this.queuedCandidates.push(evt.candidate);
      } else {
        this.sendLocalCandidates([evt.candidate])
      }
    }
  };

  onConnectionState() {
    if (this.restartTimeout !== null) {
      return;
    }
    if (this.peerConnection!.iceConnectionState === 'disconnected') {
      this.onError('peer connection disconnected');
    }
  };

  onTrack(evt: RTCTrackEvent) {
    this.video.nativeElement.srcObject = evt.streams[0];
  };

  createOffer() {
    this.showLoader = true;
    this.peerConnection!.createOffer()
      .then((offer: RTCSessionDescriptionInit) => {
        this.showLoader = false;
        this.editOffer(offer);
        this.offerData = this.parseOffer(offer.sdp!);
        this.peerConnection!.setLocalDescription(offer);
        this.sendOffer(offer);
      }).catch((err) => {
        this.showLoader = false
      });
  };

  editOffer(offer: RTCSessionDescriptionInit) {
    const sections = offer.sdp!.split('m=');
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.startsWith('audio')) {
        sections[i] = this.enableStereoOpus(section);
      }
    }
    offer.sdp = sections.join('m=');
  };

  parseOffer(offer: string) {
    const ret: any = {
      iceUfrag: '',
      icePwd: '',
      medias: [],
    };

    for (const line of offer.split('\r\n')) {
      if (line.startsWith('m=')) {
        ret.medias.push(line.slice('m='.length));
      } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
        ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
      } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
        ret.icePwd = line.slice('a=ice-pwd:'.length);
      }
    }
    return ret;
  };

  enableStereoOpus(section: any) {
    let opusPayloadFormat = '';
    let lines = section.split('\r\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
        opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
        break;
      }
    }

    if (opusPayloadFormat === '') {
      return section;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('a=fmtp:' + opusPayloadFormat + ' ')) {
        if (!lines[i].includes('stereo')) {
          lines[i] += ';stereo=1';
        }
        if (!lines[i].includes('sprop-stereo')) {
          lines[i] += ';sprop-stereo=1';
        }
      }
    }

    return lines.join('\r\n');
  };

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.showLoader = true;
    fetch(`${this.videoData?.httpUrl}/whep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': `Basic ${this.encoded}`
      },
      body: offer.sdp,
    }).then((res: any) => {
      this.showLoader = false;
      switch (res.status) {
        case 201:
          break;
        case 404:
          throw new Error('stream not found');
        default:
          throw new Error(`bad status code ${res.status}`);
      }
      this.sessionUrl = new URL(res.headers.get('location'), this.videoData?.httpUrl).toString();
      return res.text();
    }).then((sdp) => this.onRemoteAnswer(sdp)).catch((err) => {
      this.showLoader = false;
      this.onError(err.toString());
    });
  };

  onRemoteAnswer(sdp: string) {
    if (this.restartTimeout !== null) return;

    if (this.peerConnection?.signalingState !== 'closed') {
      this.peerConnection!.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp,
      }));
    }

    if (this.queuedCandidates.length !== 0) {
      this.sendLocalCandidates(this.queuedCandidates);
      this.queuedCandidates = [];
    }
  };

  sendLocalCandidates(candidates: RTCIceCandidate[]) {
    this.showLoader = true;
    fetch(this.sessionUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': '*',
      },
      body: this.generateSdpFragment(this.offerData, candidates),
    }).then((res) => {
      this.showLoader = false;
      switch (res.status) {
        case 204:
          break;
        case 404:
          throw new Error('stream not found');
        default:
          throw new Error(`bad status code ${res.status}`);
      }
    }).catch((err) => {
      this.showLoader = false;
      this.onError(err.toString());
    });
  };

  generateSdpFragment(od: any, candidates: RTCIceCandidate[]) {
    const candidatesByMedia: any = {};
    for (const candidate of candidates) {
      const mid = candidate.sdpMLineIndex;
      if (candidatesByMedia[mid!] === undefined) {
        candidatesByMedia[mid!] = [];
      }
      candidatesByMedia[mid!].push(candidate);
    }
    let frag = 'a=ice-ufrag:' + od.iceUfrag + '\r\n' + 'a=ice-pwd:' + od.icePwd + '\r\n';
    let mid = 0;

    for (const media of od.medias) {
      if (candidatesByMedia[mid] !== undefined) {
        frag += 'm=' + media + '\r\n' + 'a=mid:' + mid + '\r\n';

        for (const candidate of candidatesByMedia[mid]) {
          frag += 'a=' + candidate.candidate + '\r\n';
        }
      }
      mid++;
    }
    return frag;
  };

  capture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(this.video.nativeElement, 0, 0, canvas.width, canvas.height);
    const imgUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `${new Date()}.png`
    link.click();
  }

  playSiren1() {
    this.http
      .get(`${environment.sitesUrl}/play_1_0/${this.videoData.cameraId}`)
      .subscribe(
        (res: any) => {
          if (res.statusCode === 200) {
            this.alert_service.success(res.message);
            // console.log()
          } else {
            this.alert_service.error(res.message);
          }
        },
        (err: HttpErrorResponse) => {
          this.alert_service.error('Failed');
        }
      );
  }

  //! =========================================
  //! 🧹 CLEANUP ON DESTROY
  //! =========================================
  ngOnDestroy(): void {
    console.log('🧹 Cleaning up stream component...');

    // Close peer connection
    if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
      this.peerConnection.close();
    }

    // Delete session
    if (this.sessionUrl) {
      fetch(this.sessionUrl, {
        method: 'DELETE',
      }).catch(err => console.error('Failed to delete session on destroy:', err));
    }

    // Clear references
    this.sessionUrl = '';
    this.queuedCandidates = [];
    this.restartTimeout = null;
  }
}
