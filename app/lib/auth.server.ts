import crypto from "crypto";
import { eq } from "drizzle-orm";
import { passwords, users } from "~/drizzle/schema";
import { db } from "./db.server";

export async function authenticateUser(email: string, password: string) {
  try {
    const [user] = await db.query.users.findMany({
      where: eq(users.email, email),
      with: {
        password: true,
      },
    });

    if (!user || !user.password) {
      return {
        error: "Incorrect email or password",
        data: null,
      };
    }

    const hash = crypto
      .pbkdf2Sync(password, user.password.salt, 100_000, 64, "sha512")
      .toString("hex");

    if (hash !== user.password.hash) {
      return { error: "Incorrect email or password", data: null };
    }

    return { error: null, data: user.id.toString() };
  } catch (error: any) {
    return { error: `Error Occurred: ${error.message}`, data: null };
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (user.length > 0) {
      return {
        error: "The email addres is already taken",
        data: null,
      };
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
      .toString("hex");

    const newUser = await db.transaction(async (trx) => {
      const [insertedUser] = await trx
        .insert(users)
        .values({ name, email })
        .returning();

      await trx
        .insert(passwords)
        .values({ userId: insertedUser.id, hash, salt })
        .execute();

      return insertedUser;
    });

    return {
      error: null,
      data: newUser.id.toString(),
    };
  } catch (error: any) {
    return {
      error: `Error Occurred: ${error?.message}`,
      data: null,
    };
  }
}

export async function getUser(id: string) {
  try {
    const userWithTasks = await db.query.users.findMany({
      where: eq(users.id, id),
      with: {
        tasks: true,
      },
    });

    if (userWithTasks.length === 0) {
      return { error: "User not found", data: null };
    }

    const user = userWithTasks[0];

    return { error: null, data: { user } };
  } catch (error: any) {
    return { error: `Error Occurred: ${error.message}`, data: null };
  }
}
