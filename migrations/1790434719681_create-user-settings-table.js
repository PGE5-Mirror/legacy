/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('user_settings', {
    user_id: {
      type: 'uuid',
      primaryKey: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    high_contrast: { type: 'boolean', notNull: true, default: false },
    font_size: { type: 'varchar(10)', notNull: true, default: 'medium' },
    updatedAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('user_settings');
};
