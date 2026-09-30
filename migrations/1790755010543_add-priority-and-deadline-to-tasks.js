/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.addColumns('tasks', {
    priority: {
      type: 'varchar(10)',
      notNull: true,
      default: 'medium',
    },
    deadline: {
      type: 'date',
      notNull: false,
    },
  });

  pgm.addConstraint('tasks', 'tasks_priority_check', {
    check: "priority IN ('low', 'medium', 'high')",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropConstraint('tasks', 'tasks_priority_check');
  pgm.dropColumns('tasks', ['priority', 'deadline']);
};
