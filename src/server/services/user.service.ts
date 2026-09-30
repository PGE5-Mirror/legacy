import * as db from '../persistence';

async function deleteUser(userId: string) {
  await db.deleteUser(userId);
}

async function getUserExportData(userId: string) {
  return await db.getUserExportData(userId);
}

export { deleteUser, getUserExportData };
