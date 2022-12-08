const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let book = {
  isbn: "0691161518",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2017,
};

let book1 = {
  isbn: "0593466497",
  amazon_url:
    "https://www.amazon.com/Tomorrow-novel-Gabrielle-Zevin-ebook/dp/B09JBCGQB8",
  author: "Gabrielle Zevin",
  language: "english",
  pages: 401,
  publisher: "Knopf",
  title: "Tomorrow, and Tomorrow, and Tomorrow: A Novel",
  year: 2022,
};

beforeEach(async () => {
  await db.query("DELETE FROM books");

  await Book.create(book);
});

describe("Test /GET", () => {
  test("Get all books", async () => {
    let response = await request(app).get("/books");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      books: [book],
    });
  });

  test("Get a specific book", async () => {
    let response = await request(app).get(`/books/${book.isbn}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ book });
  });

  test("Get a nonexistent book and return 404", async () => {
    let response = await request(app).get("/books/nonexistent");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: "There is no book with an isbn 'nonexistent",
        status: 404,
      },
    });
  });

  test("Go to a nonexistent route", async () => {
    let response = await request(app).get("/nonexistent");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: "Not Found",
        status: 404,
      },
    });
  });
});

describe("Test /POST", () => {
  test("Post a book with valid schema", async () => {
    const response = await request(app).post("/books").send(book1);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ book: book1 });
  });

  test("Post a book with invalid schema", async () => {
    const response = await request(app).post("/books").send({
      amazon_url: "abc",
      author: "Gabrielle Zevin",
      language: "english",
      pages: "401",
      publisher: "Knopf",
      title: "Tomorrow, and Tomorrow, and Tomorrow: A Novel",
      year: 2022,
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: {
        message: [
          'instance requires property "isbn"',
          'instance.amazon_url does not conform to the "uri" format',
          "instance.pages is not of a type(s) integer",
        ],
        status: 400,
      },
    });
  });
});

describe("Test /PUT", () => {
  test("Update a book with valid schema", async () => {
    const result = await request(app).put(`/books/${book.isbn}`).send({
      amazon_url:
        "https://www.amazon.com/dp/0691161518/ref=cm_sw_r_cp_ep_dp_R3uoBbMZG0JP2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      book: {
        isbn: "0691161518",
        amazon_url:
          "https://www.amazon.com/dp/0691161518/ref=cm_sw_r_cp_ep_dp_R3uoBbMZG0JP2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017,
      },
    });
  });

  test("Update a book with invalid schema", async () => {
    const result = await request(app).put(`/books/${book.isbn}`).send({
      isbn: "0691161518",
      amazon_url:
        "https://www.amazon.com/dp/0691161518/ref=cm_sw_r_cp_ep_dp_R3uoBbMZG0JP2",
      author: "Matthew Lane",
      language: "english",
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual({
      error: {
        message: [
          'instance requires property "pages"',
          "instance is of prohibited type [object Object]",
        ],
        status: 400,
      },
    });
  });

  test("Update a nonexistent book", async () => {
    const response = await request(app).put("/books/nonexistent").send({
      amazon_url:
        "https://www.amazon.com/dp/0691161518/ref=cm_sw_r_cp_ep_dp_R3uoBbMZG0JP2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: "There is no book with an isbn 'nonexistent",
        status: 404,
      },
    });
  });
});

describe("Test /DELETE", () => {
  test("Delete a book", async () => {
    const response = await request(app).delete(`/books/${book.isbn}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Book deleted" });
  });

  test("Delete a nonexistent book", async () => {
    const response = await request(app).delete("/books/nonexistent");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: "There is no book with an isbn 'nonexistent",
        status: 404,
      },
    });
  });
});

afterAll(async () => {
  await db.end();
});
