export const menuItems = [
    {
        id: 'live',
        label: 'live view',
        routeLink: 'live-view',
        call: (data: any) => data?.key !== 'F' ? true : false
    },
    {
        id: 'alerts',
        label: 'alerts',
        routeLink: 'alerts',
        call: (data: any) => data?.key !== 'F' ? true : false
    },
    {
        id: 'insights',
        label: 'insight',
        routeLink: 'insights',
        call: (data: any) => data?.key !== 'F' ? true : false
    },
    {
        id: 'trends',
        label: 'trends',
        routeLink: 'trends',
        call: (data: any) => data?.key !== 'F' ? true : false
    },
    {
        id: 'timeLapse',
        label: 'timelapse',
        routeLink: 'timelapse',
        call: (data: any) => data?.key !== 'F' ? true : false
    },
    // {
    //     id: 'deviceHealth',
    //     label: 'health',
    //     routeLink: '/device-health',
    //     call: (data: any) => data?.key !== 'F' && data?.admin ? true : false
    // },
    // {
    //     id: 'simDetails',
    //     label: 'sim cards',
    //     routeLink: 'sim-cards',
    //     call: (data: any) => data?.key !== 'F' && data?.admin ? true : false
    // },
    // {
    //     id: 'sensors',
    //     label: 'sensors',
    //     routeLink: 'sensors',
    //     call: (data: any) => data?.key !== 'F' && data?.admin ? true : false
    // },
    {
        id: 'nvr',
        label: 'nvr',
        routeLink: 'nvr',
        call: (data: any) => data?.key !== 'F' && data?.admin ? true : false
    },
]