/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE tasks
      DROP CONSTRAINT tasks_user_id_fkey;

    ALTER TABLE tasks
      ALTER COLUMN user_id DROP NOT NULL;

    ALTER TABLE tasks
      ADD CONSTRAINT tasks_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    DELETE FROM tasks
    WHERE user_id IS NULL;

    ALTER TABLE tasks
      DROP CONSTRAINT tasks_user_id_fkey;

    ALTER TABLE tasks
      ALTER COLUMN user_id SET NOT NULL;

    ALTER TABLE tasks
      ADD CONSTRAINT tasks_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
  `);
};
