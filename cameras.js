// Les urls des caméras.
//
// Point d'entrée des API onvif : "http://192.168.0.184:80/onvif/device_service"
//
const cameras = [
    {
        id: 182,
        host: "192.168.0.182",
        port: "80",
        snapshot: "/tmpfs/snap.jpg",
        authBasic: "N",
        user: "admin",
        pass: "MdpDahua30",
        actif: 1,
    },
    {
        id: 185,
        host: "192.168.0.185",
        port: "80",
        snapshot: "/tmpfs/snap.jpg",
        authBasic: "N",
        user: "admin",
        pass: "MdpDahua30",
        actif: 1,
    }
];

module.exports = cameras;