export interface VideoFormat {
    format_id: string;
    resolution: string;
    filesize?: number;
    note?: string;
}

export interface VideoMetadata {
    title: string;
    thumbnail: string;
    duration?: number;
    platform: string;
    formats: VideoFormat[];
}

export interface DownloadResponse {
    success: boolean;
    downloadUrl: string;
    filename: string;
    size: number;
}

export interface DownloadHistoryItem {
    id: string;
    title: string;
    thumbnail: string;
    date: string;
    filename: string;
}
