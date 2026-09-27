export interface UserSettings {
  user_id: string;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large';
  updatedAt: string;
}

export interface UserSettingsUpdate {
  high_contrast?: boolean;
  font_size?: 'small' | 'medium' | 'large';
}
