import { UserSettingsUpdate } from '../models/UserSettings';
import * as db from '../persistence';

async function getUserSettings(id: string) {
  return await db.getUserSettings(id);
}

async function updateUserSettings(userId: string, data: UserSettingsUpdate) {
  return await db.upsertUserSettings(userId, data);
}

export { getUserSettings, updateUserSettings };
