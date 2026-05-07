const prod_url: string = 'https://prod.ivisecurity.com';
const local_url: string = 'http://192.168.0.235:3002';

export const environment = {

    authUrl: `${prod_url}/userDetails`,
    sitesUrl: `${prod_url}/vipsites`,
    metadataUrl: `${prod_url}/metadata`,
    commonDownUrl: `${prod_url}/common`,
    adsUrl: `${prod_url}/proximityAdsMain`,
    rulesUrl: `${prod_url}/proximityAdsRules `,
    insightsUrl: `${prod_url}/insights`,
    timelapseUrl: `${prod_url}/timeLapse`,
    sensorUrl: `${prod_url}/sensors`,
    simsUrl: `${prod_url}/simDevices`,
    faqUrl: `${prod_url}/faq`,
    inventoryUrl: `${prod_url}/inventory`,
    helpdeskUrl: `${prod_url}/supportRequests`,
    incidentsUrl: `${prod_url}/guard_monitoring`,
    eventDataUrl: `${prod_url}/events_data`,
    verifaiInsightsUrl: `${prod_url}/bi_verifai`,
    healthUrl: `${prod_url}/health`,
};