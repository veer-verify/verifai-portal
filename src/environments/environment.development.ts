const dev_url: string = 'https://usstaging.ivisecurity.com';
const local_url: string = 'http://localhost';

export const environment = {

    authUrl: `${dev_url}/userDetails`,
    sitesUrl: `${dev_url}/vipsites`,
    metadataUrl: `${dev_url}/metadata`,
    commonDownUrl: `${dev_url}/common`,
    adsUrl: `${dev_url}/proximityAdsMain`,
    rulesUrl: `${dev_url}/proximityAdsRules `,
    insightsUrl: `${dev_url}/insights`,
    timelapseUrl: `${dev_url}/timeLapse`,
    sensorUrl: `${dev_url}/sensors`,
    simsUrl: `${dev_url}/simDevices`,
    faqUrl: `${dev_url}/faq`,
    inventoryUrl: `${dev_url}/inventory`,
    helpdeskUrl: `${dev_url}/supportRequests`,
    incidentsUrl: `${dev_url}/guard_monitoring`,
    eventDataUrl: `${dev_url}/events_data`,
    verifaiInsightsUrl: `${dev_url}/bi_verifai`,
    playbackUrl: `http://192.168.0.171:9632`

    // authUrl: `${local_url}:3002/userDetails`,
    // sitesUrl: `${local_url}:3004/vipsites`,
    // metadataUrl: `${local_url}:8844/metadata`,
    // commonDownUrl: `${local_url}:80/common`,
    // adsUrl: `${local_url}:8854/proximityAdsMain`,
    // rulesUrl: `${local_url}:8856/proximityAdsRules `,
    // insightsUrl: `${local_url}:8857/insights`,
    // timelapseUrl: `${local_url}:8858/timeLapse`,
    // sensorUrl: `${local_url}:8859/sensors`,
    // simsUrl: `${local_url}:8865/simDevices`,
    // faqUrl: `${local_url}:8866/faq`,
    // inventoryUrl: `${local_url}:6465/inventory`,
    // helpdeskUrl: `${local_url}:8686/supportRequests`,
    // incidentsUrl: `${local_url}:3009/guard_monitoring`,
    // eventDataUrl: `${local_url}:3009/events_data`,
};
