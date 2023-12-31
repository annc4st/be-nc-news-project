const app = require("../db/app");
const db = require("../db/connection");

const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index");

beforeEach(() => {
  return seed({ articleData, commentData, topicData, userData });
});
afterAll(() => {
  db.end();
});

describe("General testing", () => {
  test("should return 404 if path spelt wrong or does not exist", () => {
    return request(app)
      .get("/api/not-existing-path")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("path is not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("responds with status 200 and array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)

      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});
/*3*/
describe("GET /api/", () => {
  test("responds with status 200 and object of available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        for (const [endpoint, info] of Object.entries(body)) {
          expect(info.description).toBeDefined();
        }
      });
  });
});

//4
describe(" 4 GET /api/articles/:article_id", () => {
  test("responds with status 200 and with article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(1);
        expect(body.article.title).toBe("Living in the shadow of a great man");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.author).toBe("butter_bridge");
        expect(body.article.body).toBe("I find this existence challenging");
        expect(body.article.created_at).toBe("2020-07-09T20:11:00.000Z");
        expect(body.article.votes).toBe(100);
        expect(body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });

  test("GET:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/111111")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("item does not exist");
      });
  });
  test("GET:400 sends an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/not-an-article_id")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid input syntax");
      });
  });
});

//5
describe(" 5 GET /api/articles responds with array of articles", () => {
  test("GET:200 sends an appropriate status and article array", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        // console.log("test 5-1>>", response.body.total_count);
        expect(Number(response.body.total_count)).toEqual(13)

        response.body.articles.forEach((article) => {
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.title).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });
  test("articles should be ordered in descending order by created_at", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("should return 404 if articles spelt wrong", () => {
    return request(app)
      .get("/api/articles-spelt-wrong")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("path is not found");
      });
  });
});

//6
describe(" 6 GET /api/articles/:article_id/comments", () => {
  test("if there are comments sends an appropriate status and comments array", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(Number(response.body.comment_count)).toEqual(11);
      });
  });
  test("if there are no comments sends 200 status and empty array", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("if there is no such article responds with 404 and message", () => {
    return request(app)
      .get("/api/articles/3723/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("item does not exist");
      });
  });
  test("if there not valid article id was provided => 400 code ", () => {
    return request(app)
      .get("/api/articles/notID/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input syntax");
      });
  });
});

//7
describe(" 7 POST /api/articles/:article_id/comments", () => {
  test("POST comment, we get the 201 response", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I love treasure hunting!",
    };

    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;

        expect(comment.comment_id).toEqual(expect.any(Number));
        expect(comment.author).toEqual("butter_bridge");
        expect(comment.article_id).toEqual(1);
        expect(comment.body).toEqual("I love treasure hunting!");
      });
  });

  test("POST comment 400 responds with an appropriate status and error message when provided with a no comment body", () => {
    const newComment = {
      username: "butter_bridge",
    };

    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual(
          "Comment body and username cannot be empty"
        );
      });
  });

  test("POST 400 responds with an appropriate status and error message when provided with a no username", () => {
    const newComment = {
      body: "this is test for a username missing from a comment",
    };

    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual(
          "Comment body and username cannot be empty"
        );
      });
  });

  test("if there is no such article responds with 404 and message", () => {
    const newComment = {
      username: "rogersop",
      body: "this is test for a username missing from a comment",
    };
    return request(app)
      .post(`/api/articles/654654/comments`)
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article does not exist");
      });
  });
  test("if there is article_id is not valid responds with 400", () => {
    const newComment = {
      username: "rogersop",
      body: "this is test for a username missing from a comment",
    };
    return request(app)
      .post(`/api/articles/notID/comments`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid article_id");
      });
  });
});

// 8
describe(" 8 PATCH /api/articles/:article_id", () => {
  test("200: responds with updated article", () => {
    const articleUpdate = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(articleUpdate)
      .expect(200)
      .then((response) => {
        const { article } = response.body;

        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200: responds with updated article", () => {
    const articleUpdate = { inc_votes: -1 };
    return request(app)
      .patch("/api/articles/1")
      .send(articleUpdate)
      .expect(200)
      .then((response) => {
        const { article } = response.body;

        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 99,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("404: article doesnt exist", () => {
    const articleUpdate = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/456454")
      .send(articleUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toEqual("Article does not exist");
      });
  });
  test("400: votes increment should be a number", () => {
    const articleUpdate = { inc_votes: "not-a-Number" };
    return request(app)
      .patch("/api/articles/1")
      .send(articleUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toEqual("Invalid votes increment");
      });
  });

  test("400: invalid article ID NaN", () => {
    const articleUpdate = { inc_votes: "not-a-Number" };
    return request(app)
      .patch("/api/articles/not-a-Number")
      .send(articleUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toEqual("Invalid article_id");
      });
  });
});
//9
describe(" 9 DELETE /api/comments/comments_id", () => {
  test("DELETE 204: deletes comment", () => {
    return request(app).delete("/api/comments/14").expect(204);
  });

  test("DELETE 400: invalid comment_id NaN", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toEqual("Invalid input syntax");
      });
  });

  test("DELETE 404: comment not found", () => {
    return request(app)
      .delete("/api/comments/165454")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toEqual("Comment does not exist");
      });
  });
});
//10
describe(" 10 GET /api/users", () => {
  test("responds with status 200 and array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(typeof user.name).toBe("string");
          expect(typeof user.username).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});
//11
describe("11 GET /api/articles query topic", () => {
  test("GET:200 sends an appropriate status and article array on the certain topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(1);
        body.articles.forEach((article) => {
          expect(article.topic).toEqual("cats");
        });
      });
  });
  test("GET:200 sends an appropriate status and article array on the certain topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((response) => {
        let articleItems = response.body
        expect(Number(articleItems.total_count)).toEqual(1);
        articleItems.articles.forEach((article) => {
          expect(article.topic).toEqual("cats");
        });
      });
  });
  test("GET 404 if topic does not exist sends message that topic doesnot exist", () => {
    return request(app)
      .get("/api/articles?topic=doesntexist")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Topic does not exist");
      });
  });
});

//12
describe("12 GET /api/articles/:article_id", () => {
  test("GET 200 resonds with article object where coment_count is correct", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        let articleItem = response.body
        expect(articleItem.article.article_id).toBe(1);
        expect(articleItem.article.title).toBe("Living in the shadow of a great man");
        expect(articleItem.article.comment_count).toBe(11);
      });
  });
});

//15
describe("15 GET api/articles topic, sortby and order", () => {
  test("GET:200 sends an appropriate status and article array on the certain topic sortby author and order asc", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sortby=author&order=ASC")
      .expect(200)
      .then((response) => {

        let artItems = response.body
        expect(Number(artItems.total_count)).toEqual(12); //12
        expect(artItems.articles).toBeSortedBy("author", { descending: false });
        artItems.articles.forEach((article) => {
          expect(article.topic).toEqual("mitch");
        });
        expect(artItems.articles[0].article_id).toBe(1);
      });
  });

  test("GET:200 sends article array on the certain topic sortby author and order desc by default", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sortby=author")
      .expect(200)
      .then((response) => {
        let artItems = response.body
        expect(artItems.articles).toHaveLength(10);
        expect(artItems.articles).toBeSortedBy("author", { descending: true });
        artItems.articles.forEach((article) => {
          expect(article.topic).toEqual("mitch");
        });
        expect(artItems.articles[0].article_id).toBe(4);
      });
  });

  test("GET: 400 sortby parameter not valid sends an appropriate message", () => {
    return request(app)
      .get("/api/articles?sortby=notvalidparam&order=ASC")
      .expect(400)
      .then(({ body }) => {
          expect(body.message).toBe("Sort parameter does not exist");
      });
  });
  test("GET: 400 order parameter not valid sends an appropriate message", () => {
    return request(app)
      .get("/api/articles?sortby=author&order=notvalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Order parameter does not exist");
      });
  });
  test("GET:200 sends article array on the certain topic sortby created_at and order desc by default", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sortby=created_at")
      .expect(200)
      .then((response) => {
        let artItems = response.body;
        
        expect(Number(artItems.total_count)).toBe(12); //total number or articles
        expect(artItems.articles).toHaveLength(10); //pagination arts per page
        expect(artItems.articles).toBeSortedBy("created_at", { descending: true });
        expect(artItems.articles[0].article_id).toBe(3);
      });
  });
});

// ******************

describe("POST /api/articles", () => {
  test(" 1 POST article, we get the 201 response", () => {
    const newArticle = {
      title: "89798 Unlikely Formula For Success",
      username: "butter_bridge",
      body: "The 'umami' craze has turned a much-maligned and misunderstood food additive into an object of obsession for the world’s most innovative chefs. But secret ingredient monosodium glutamate’s biggest secret may be that there was never anything wrong with it at all.",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        const { article } = response.body;
        expect(article.article_id).toEqual(expect.any(Number));
        expect(article.author).toEqual("butter_bridge");
        expect(article.topic).toEqual("cats");
      });
  });

  test("2 POST article 422 responds with an appropriate status and error message when provided with a no body", () => {
    const newArticle = {
      title: "61 Unlikely Formula For Success",
      username: "butter_bridge",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(422)
      .then((response) => {
        expect(response.body.message).toEqual(
          "Article body, title, topic and author cannot be empty"
        );
      });
  });

  test("3 POST 422 responds with an appropriate status and error message when provided with a no username", () => {
    const newArticle = {
      title: "61 Unlikely Formula For Success",
      body: "The 'umami' craze has turned a much-maligned and misunderstood food additive into an object of obsession for the world’s most innovative chefs. But secret ingredient monosodium glutamate’s biggest secret may be that there was never anything wrong with it at all.",
      topic: "cats",
    };

    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(422)
      .then((response) => {
        expect(response.body.message).toEqual(
          "Article body, title, topic and author cannot be empty"
        );
      });
  });

  test("4 POST 404 responds with an appropriate status and error message when provided with non-existent topic", () => {
    const newArticle = {
      title: "61 Unlikely Formula For Success",
      body: "The 'umami' craze has turned a much-maligned and misunderstood food additive into an object of obsession for the world’s most innovative chefs. But secret ingredient monosodium glutamate’s biggest secret may be that there was never anything wrong with it at all.",
      topic: "non-existing",
      username: "butter_bridge",
    };

    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toEqual("Topic does not exist");
      });
  });

  test("5 POST 404 responds with an appropriate status and error message when user does not exist", () => {
    const newArticle = {
      title: "61 Unlikely Formula For Success",
      body: "The 'umami' craze has turned a much-maligned and misunderstood food additive into an object of obsession for the world’s most innovative chefs. But secret ingredient monosodium glutamate’s biggest secret may be that there was never anything wrong with it at all.",
      topic: "cats",
      username: "xxx",
    };

    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toEqual("User does not exist");
      });
  });
});


describe("POST /api/topics", () => {
  test("1 POST new topic, we get the 201 response", () => {
    const topic = {
      slug: "basketball",
      description: "Amazing game for all people",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201)
      .then((response) => {
        const { topic} = response.body;
        expect(topic.slug).toEqual("basketball");
        expect(topic.description).toEqual("Amazing game for all people");
      });
  });
  test("2 POST topic with duplicate slug, we get the 422 response", () => {
    const topic = {
      slug: "cats",
      description: "Amazing animals",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(422)
      .then((response) => {
        expect(response.body.message).toBe('Topic with the same slug already exists')
      });
  });
  test("3 POST topic with duplicate slug, we get the 422 response", () => {
    const topic = {
       description: "Amazing animals",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(422)
      .then((response) => {
        expect(response.body.message).toBe('Slug and description cannot be empty')
      });
  });

  test("4 POST topic with duplicate description, we get the 422 response", () => {
    const topic = {
      slug: "bugs",
       description: "Not dogs",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(422)
      .then((response) => {
        expect(response.body.message).toBe('Topic with the same description already exists')
      });
  });
})

describe("23 DELETE /api/articles/:article_id", () => {
  test("1 Delete article and status 204", () => {
    let id = 1;
    return request(app)
    .delete(`/api/articles/${id}`)
    .expect(204)
  })
  test("2 Delete article and status 204", () => {
    let id = 46544;
    return request(app)
    .delete(`/api/articles/${id}`)
    .expect(404)
    .then((response) => {
      expect(response.body.message).toEqual(`Article ${id} does not exist`)
    })
  })
  test("3 Delete article and status 204", () => {
    let id = 'not-id';
    return request(app)
    .delete(`/api/articles/${id}`)
    .expect(400)
    .then((response) => {
      expect(response.body.message).toEqual("Invalid input syntax")
    })
  })

})