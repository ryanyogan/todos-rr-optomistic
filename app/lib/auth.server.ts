import crypto from "crypto";
import { eq } from "drizzle-orm";
import { passwords, users } from "~/drizzle/schema";
import { db } from "./db.server";

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

    if (user) {
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
  } catch (error) {
    return {
      error: "An unexpected error occurred",
      data: null,
    };
  }
}
