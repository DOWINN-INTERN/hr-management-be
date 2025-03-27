interface StreamingOptions {
    formats: string[]; // 'hls', 'dash', etc.
    qualities: string[]; // '480p', '720p', '1080p', etc.
    segmentDuration: number;
}