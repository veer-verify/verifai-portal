import { TestBed } from '@angular/core/testing';

import { LiveAiService } from './live-ai.service';

describe('LiveAiService', () => {
  let service: LiveAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
