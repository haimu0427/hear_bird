export interface BirdResult {
  start: string;
  end: string;
  scientificName: string;
  commonName: string;
  confidence: string;
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
