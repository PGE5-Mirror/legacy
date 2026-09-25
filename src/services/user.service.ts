import * as db from "../persistence";

async function deleteUser(userId: string) {
    await db.deleteUser(userId);
}

export {
    deleteUser,
};