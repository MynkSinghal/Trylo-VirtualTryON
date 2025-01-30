export type Generation = {
  id: string;
  user_id: string;
  model_image_path: string;
  garment_image_path: string;
  result_image_path: string;
  category: 'tops' | 'bottoms' | 'one-pieces';
  mode: 'performance' | 'balanced' | 'quality';
  created_at: string;
  model_image_size?: number;
  garment_image_size?: number;
  result_image_size?: number;
  processing_time?: string;
  modelImageUrl?: string;
  garmentImageUrl?: string;
  resultImageUrl?: string;
}

export type Database = {
  public: {
    Tables: {
      generations: {
        Row: Generation;
        Insert: Omit<Generation, 'id' | 'created_at'>;
        Update: Partial<Omit<Generation, 'id' | 'created_at'>>;
      };
    };
  };
}; 