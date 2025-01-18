import { eq, sql } from "drizzle-orm";
import {
  createCookie,
  createSessionStorage,
  type Cookie,
  type SessionStorage,
} from "react-router";
import { sessions } from "~/drizzle/schema";
import { db } from "./db.server";

if (
  !process.env.SESSION_SECRET_CURRENT ||
  !process.env.SESSION_SECRET_PREVIOUS ||
  !process.env.SESSION_SECRET_OLD
) {
  throw new Error(
    "Invalid/Missing SESSION_SECRET_CURRENT, SESSION_SECRET_PREVIOUS, or SESSION env variable"
  );
}

interface SessionData {
  id: string;
}

const secrets = [
  process.env.SESSION_SECRET_CURRENT,
  process.env.SESSION_SECRET_PREVIOUS,
  process.env.SESSION_SECRET_OLD,
];

const cookie = createCookie("__session", {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  sameSite: "lax",
  secrets,
  secure: process.env.NODE_ENV === "production",
});

async function createDrizzleSessionStorage(props: { cookie: Cookie }) {
  async function cleanupExpiredSession() {
    await db
      .delete(sessions)
      .where(sql`${sessions.expiresAt} < CURRENT_TIMESTAMP`);
  }

  setInterval(cleanupExpiredSession, 60 * 60 * 1_000);

  return createSessionStorage<SessionData>({
    cookie,
    async createData(data, expires) {
      const id = crypto.randomUUID();

      if (!expires) {
        throw new Error("Expires date is required");
      }

      await db.insert(sessions).values({
        id,
        data: JSON.stringify(data),
        expiresAt: expires,
      });

      return id;
    },
    async readData(id) {
      const [result] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, id))
        .limit(1);

      if (!result) {
        return null;
      }
      const session = result;
      return JSON.parse(session.data);
    },
    async updateData(id, data, expires) {
      await db
        .update(sessions)
        .set({
          data: JSON.stringify(data),
          expiresAt: expires,
        })
        .where(eq(sessions.id, id));
    },
    async deleteData(id) {
      await db.delete(sessions).where(eq(sessions.id, id));
    },
  });
}

const sessionStorePromise = createDrizzleSessionStorage({ cookie });

export async function getSession(
  ...args: Parameters<SessionStorage["getSession"]>
) {
  const sessionStore = await sessionStorePromise;
  return sessionStore.getSession(...args);
}

export async function commitSession(
  ...args: Parameters<SessionStorage["commitSession"]>
) {
  const sessionStore = await sessionStorePromise;
  return sessionStore.commitSession(...args);
}

export async function destroySession(
  ...args: Parameters<SessionStorage["destroySession"]>
) {
  const sessionStore = await sessionStorePromise;
  return sessionStore.destroySession(...args);
}
