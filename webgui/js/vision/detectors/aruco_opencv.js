import { Detection } from "../results.js";

export class ArucoOpenCvDetector {
  constructor({ dictionaryName = "DICT_4X4_50" } = {}) {
    if (typeof cv === "undefined" || !cv.aruco_ArucoDetector) {
      throw new Error(
        "OpenCV.js loaded without aruco module. " +
        "Check typeof cv.aruco_ArucoDetector."
      );
    }
    const dictId = cv[dictionaryName];
    if (dictId === undefined) {
      throw new Error("unknown ArUco dictionary: " + dictionaryName);
    }
    this.dictionary = new cv.aruco_Dictionary(dictId, 4);
    this.params = new cv.aruco_DetectorParameters();
    this.detector = new cv.aruco_ArucoDetector(this.dictionary, this.params);
  }

  detect(imageData) {
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const corners = new cv.MatVector();
    const ids = new cv.Mat();
    const rejected = new cv.MatVector();

    this.detector.detectMarkers(gray, corners, ids, rejected);

    const out = [];
    for (let i = 0; i < ids.rows; i++) {
      const id = ids.intAt(i, 0);
      const mat = corners.get(i);
      const pts = [];
      for (let j = 0; j < 4; j++) {
        pts.push({
          x: mat.floatAt(0, j * 2),
          y: mat.floatAt(0, j * 2 + 1),
        });
      }
      out.push(new Detection(id, pts));
      mat.delete();
    }

    src.delete(); gray.delete();
    corners.delete(); ids.delete(); rejected.delete();
    return out;
  }

  dispose() {
    this.dictionary.delete();
    this.params.delete();
    this.detector.delete();
  }
}