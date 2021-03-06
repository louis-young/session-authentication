export const seed = (knex) => {
  return knex("users")
    .del()
    .then(() => {
      return knex("users").insert([
        { name: "John", email: "john@domain.tld" },
        { name: "Alan", email: "alan@domain.tld" },
        { name: "Louis", email: "me@louisyoung.co.uk" },
      ]);
    });
};
