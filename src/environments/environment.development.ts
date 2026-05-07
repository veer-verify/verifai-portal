const dev_url: string = 'https://usstaging.ivisecurity.com';
const local_url: string = 'http://localhost';

export const environment = {
  authUrl: `${dev_url}/userDetails`,
  sitesUrl: `${dev_url}/vipsites`,
  metadataUrl: `${dev_url}/metadata`,
  commonDownUrl: `${dev_url}/common`,
  helpdeskUrl: `${dev_url}/supportRequests`,
  incidentsUrl: `${dev_url}/guard_monitoring`,
  eventDataUrl: `${dev_url}/events_data`,
  verifaiInsightsUrl: `${dev_url}/bi_verifai`,

  inventoryUrl: `${dev_url}/inventory`,
  adsUrl: `${dev_url}/proximityAdsMain`,
  rulesUrl: `${dev_url}/proximityAdsRules `,
  sensorUrl: `${dev_url}/sensors`,
  simsUrl: `${dev_url}/simDevices`,
  insightsUrl: `${dev_url}/insights`,
  timelapseUrl: `${dev_url}/timeLapse`,
  faqUrl: `${dev_url}/faq`,

  healthUrl: `${dev_url}/health`,

  // commonDownUrl: `${local_url}:3001/common`,
  // authUrl: `${local_url}:3002/userDetails`,
  // sitesUrl: `${local_url}:3004/vipsites`,
  // metadataUrl: `${local_url}:3005/metadata`,
  // helpdeskUrl: `${local_url}:3003/supportRequests`,
  // incidentsUrl: `${local_url}:3009/guard_monitoring`,
  // eventDataUrl: `${local_url}:3009/events_data`,
  // verifaiInsightsUrl: `${local_url}:3019/bi_verifai`,

  // insightsUrl: `${local_url}:8857/insights`,
  // adsUrl: `${local_url}:8854/proximityAdsMain`,
  // rulesUrl: `${local_url}:8856/proximityAdsRules `,
  // inventoryUrl: `${local_url}:6465/inventory`,
  // timelapseUrl: `${local_url}:8858/timeLapse`,
  // sensorUrl: `${local_url}:8859/sensors`,
  // simsUrl: `${local_url}:8865/simDevices`,
  // faqUrl: `${local_url}:8866/faq`,

  // local health if needed later
  // healthUrl: `${local_url}:8080/health`,
};