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
  pgm.createTable('organizations', {
    id: {
      type: 'uuid',
      default: pgm.func('gen_random_uuid()'),
      notNull: true,
      primaryKey: true,
    },
    name: { type: 'varchar(255)', notNull: true },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addColumn('projects', {
    organization_id: {
      type: 'uuid',
      references: '"organizations"',
      onDelete: 'CASCADE',
      notNull: true,
    },
  });

  pgm.createTable('organization_members', {
    id: {
      type: 'uuid',
      default: pgm.func('gen_random_uuid()'),
      notNull: true,
      primaryKey: true,
    },
    organization_id: {
      type: 'uuid',
      references: '"organizations"',
      onDelete: 'CASCADE',
      notNull: true,
    },
    user_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'CASCADE',
      notNull: true,
    },
    role: { type: 'varchar(50)', notNull: true, default: 'member' },
    createdAt: {
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
  pgm.dropTable('organization_members');
  pgm.dropColumn('projects', 'organization_id');
  pgm.dropTable('organizations');
};
