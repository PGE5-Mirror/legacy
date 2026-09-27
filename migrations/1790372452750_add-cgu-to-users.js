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
    pgm.addColumns('users', {
        tos_accepted_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        tos_version: {
            type: 'varchar(20)',
            notNull: true,
            default: '1.0',
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumns('users', ['tos_accepted_at', 'tos_version']);
};
