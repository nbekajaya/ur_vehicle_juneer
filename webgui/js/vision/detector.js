// import { ArucoOpenCvDetector } from "./detectors/aruco_opencv.js";
import { AprilTagJsDetector } from "./detectors/apriltag_js.js";

export async function createDetector(kind, config) {
  switch (kind) {
    case "apriltag": {
      const d = new AprilTagJsDetector(config);
      await d.init();
      return d;
    }
    default:
      throw new Error("unknown detector: " + kind);
  }
}

// export function createDetector(kind, config) {
// //   switch (kind) {
// //     case "aruco": return new ArucoOpenCvDetector(config);
// //     default: throw new Error("unknown detector: " + kind);
// //   }
// }