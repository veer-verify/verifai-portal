export const menuItems = [
  {
    id: 'live',
    label: 'live view',
    routeLink: 'live-view',
    call: (data: any) => (data?.key !== 'F' ? true : false),
  },
  // {
  //   id: 'playback',
  //   label: 'playback',
  //   routeLink: 'playback',
  //   call: (data: any) => (data?.key !== 'F' && data?.admin ? true : false),
  // },
  {
    id: 'liveAI',
    label: 'live ai',
    routeLink: 'live-ai',
    call: (data: any) => (data?.key !== 'F' ? true : false),
  },
  {
    id: 'alerts',
    label: 'alerts',
    routeLink: 'alerts',
    call: (data: any) => (data?.key !== 'F' ? true : false),
  },
  {
    id: 'insights',
    label: 'insights',
    routeLink: 'insights',
    call: (data: any) => (data?.key !== 'F' ? true : false),
    // call: () => true,
  },

  // {
  //   id: 'trends',
  //   label: 'trends',
  //   routeLink: 'trends',
  //   call: (data: any) => (data?.key !== 'F' ? true : false),
  // },
  {
    id: 'timeLapse',
    label: 'timelapse',
    routeLink: 'timelapse',
    call: (data: any) => (data?.key !== 'F' ? true : false),
  },
  // {
  //   id: 'nvr',
  //   label: 'nvr',
  //   routeLink: 'nvr',
  //   call: (data: any) => (data?.key !== 'F' && data?.admin ? true : false),
  // },
  // {
  //   id: 'map',
  //   label: 'map',
  //   routeLink: 'site-map',
  //   call: () => true
  // },
  // {
  //   id: 'siteInfo',
  //   label: 'siteinfo',
  //   routeLink: 'siteinfo',
  //   call: () => true,
  // },
  // {
  //     id: 'deviceHealth',
  //     label: 'health',
  //     routeLink: '/device-health',
  //     call: (data: any) => data?.key !== 'F' && data?.admin ? true : false
  // },
];
