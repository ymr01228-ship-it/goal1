export interface Course {
  id: string;
  name: string;
  platform: string;
  url: string;
  totalLessons: number;
  completedLessons: number;
  isRelevant: boolean;
  relevanceReason: string;
  createdAt: string;
  lastStudied: string;
  studyHours: number;
}

export interface YouTubePlaylist {
  id: string;
  playlistId: string;
  title: string;
  thumbnailUrl: string;
  videos: YouTubeVideo[];
  isRelevant: boolean;
  relevanceReason: string;
  createdAt: string;
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  order: number;
}
