export class AprilTagJsDetector {
  constructor(config = {}) {
    this.config = config;
    this.manager = null;
    this.ready = false;
  }

  async init() {
    if (typeof AprilTagDetectorManager === "undefined") {
      throw new Error(
        "AprilTagDetectorManager not loaded. Check vendor script tags."
      );
    }

    this.manager = new AprilTagDetectorManager();

    await this.manager.initialize({
      onError: (msg) => console.error("AprilTag:", msg),
    });

    await this.manager.setupDetector(
      this.config.family || "tag36h11",
      this.config.hammingDist ?? 0,
      this.config.params || null
    );

    this.ready = true;
    return this;
  }

  async detect(imageData, width, height) {
    if (!this.ready) return [];

    const result = await this.manager.detect(imageData, width, height);

    // Three possible shapes come back:
    //   []                                -> manager busy or not ready
    //   { detections: [] }                -> worker reported busy
    //   { type, detections, processingTime } -> normal
    if (Array.isArray(result)) return result;
    return result?.detections ?? [];
  }

  async dispose() {
    if (this.manager) {
      try { await this.manager.cleanup(); } catch (_) {}
      this.manager.terminate();
      this.manager = null;
    }
    this.ready = false;
  }
}