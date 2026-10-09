export const Config = {
    // Transport
    wsUrl: "ws://localhost:8765",
    commandRateHz: 20,
    maxSpeed: 1.0,

    // Camera
    cameraWidth: 1920,
    cameraHeight: 1080,

    detectionWidth: 640,      // processing canvas width (height derived from video aspect)
    detectionHz: 12,

    tagFamily: "tag36h11",
    hammingDist: 0,
    detectorParams: {
        quadDecimate: 2.0,
        quadSigma: 0.0,
        refineEdges: true,
        decodeSharpening: 0.25,
    },

    overlay: {
        box: true,
        corners: true,
        crosshair: true,
        label: true,
        showMetrics: false,
    },
};