import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").unique().notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%S', 'now'))`),
    forgotPasswordToken: text("forgot_password_token"),
    forgotPasswordTokenExpiresAt: integer("forgot_password_token_expires_at"),
  },
  (table) => [index("email_idx").on(table.email)]
);

export const passwords = sqliteTable(
  "passwords",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    hash: text("hash").notNull(),
    salt: text("salt").notNull(),
  },
  (t) => [index("user_password_id_idx").on(t.userId)]
);

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  data: text("data").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(sql`0`),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%S', 'now'))`),
    completedAt: text("completed_at"),
    editing: integer("editing", { mode: "boolean" })
      .notNull()
      .default(sql`0`),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("completed_idx").on(table.completed),
  ]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  password: one(passwords, {
    fields: [users.id],
    references: [passwords.userId],
  }),
}));

export const passwordsRelations = relations(passwords, ({ one }) => ({
  user: one(users, {
    fields: [passwords.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
