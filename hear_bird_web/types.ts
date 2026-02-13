export interface BirdResult {
  start: number;  // Time in seconds
  end: number;    // Time in seconds
  scientificName: string;
  commonName: string;
  confidence: number;  // Confidence score 0-1
}

export interface ApiResponse {
  msg: string;
  results: BirdResult[];
}

export interface BirdData {
  scientificName: string;
  commonName: string;
  description: string;
  image: string;
  coverImage: string;
  coverImageCenterX?: number;
  confidence?: string; // Calculated or from API'
  wikiLink?: string;
}

// Maps scientific names to our rich asset database
export interface BirdDatabase {
  [key: string]: BirdData;
}
