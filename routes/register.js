import { Router } from "express";

import knex from "../knex/knex.js";

import argon2 from "argon2";

import { regenerateSession } from "../utilities/utilities.js";

const router = Router();

router.post("/", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ error: "An email and password are required." });
    }

    const userExists = await knex("users").where({ email }).first();

    if (userExists) {
      return response.status(400).json({ error: "A user with this email address already exists." });
    }

    // TODO: Implement zxcvbn.
    const minimumPasswordLength = 8;

    if (password.length < minimumPasswordLength) {
      return response
        .status(400)
        .json({ error: `A password must be no less than ${minimumPasswordLength} characters.` });
    }

    const hash = await argon2.hash(password);

    const user = await knex("users").insert({ email, password: hash }).returning(["id", "email"]);

    await regenerateSession(request.session);

    request.session.userId = user[0].id;

    // TODO: Find better solution to accessing the 0th index, or to get Knex to return an object.
    response.json({
      message: "Successfully registered and logged user in.",
      user: {
        id: user[0].id,
        email: user[0].email,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message }); // TODO: Make generic in production.
  }
});

export default router;
