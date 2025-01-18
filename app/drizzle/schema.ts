import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`strftime('%s', 'now')`),
  forgotPasswordToken: text("forgot_password_token"),
  forgotPasswordTokenExpiresAt: integer("forgot_password_token_expires_at"),
});

export const passwords = sqliteTable("passwords", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  hash: text("hash"),
  salt: text("salt"),
});

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  completed: integer("completed").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`strftime('%s', 'now')`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  editing: integer("editing").notNull().default(0),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  password: one(passwords),
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
