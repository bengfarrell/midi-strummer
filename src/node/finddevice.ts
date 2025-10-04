import HID from 'node-hid';

export const getTabletDevice = (filterValues: {[key:string]: string}) => {
    const devices = HID.devices().filter(d => {
        const dev = d as unknown as {[key:string]: string};
        return Object.keys(filterValues).reduce(
            (accumulator, filter) => dev[filter] === filterValues[filter] && accumulator, true);
    });
    if( !devices[0] ) {
        console.log('Could not find device');
        process.exit(1);
    }

    if (devices.length > 0 && devices[0].path) {
        return new HID.HID( devices[0].path );
    }

    return undefined;
}