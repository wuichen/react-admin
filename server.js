const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
app.use(bodyParser.json()); // for parsing application/json

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "build")));

app.get("/ping", function (req, res) {
  return res.send("pong");
});

const now = new Date();
const validUntil = new Date(now.getMilliseconds() + 30000);

// middleware that is specific to this router
app.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

app.get("/:resource", async (req, res) => {
  const { resource } = req.params;
  console.log("query!!", resource);
  const queries = req.query;
  let page, perPage, field, order;
  const { pagination, sort, filter } = queries;

  if (pagination) {
    if (pagination.page) {
      page = pagination.page;
    }
    if (pagination.perPage) {
      perPage = pagination.perPage;
    }
  }

  if (sort) {
    if (sort.field) {
      field = sort.field;
    }
    if (sort.order) {
      order = sort.order;
    }
  }

  let query = {};
  if (perPage && page) {
    query.perPage = perPage;
    query.skip = page * perPage;
  }
  if (field && order) {
    query.field = field;
    query.order = order;
  }
  let filterObject;
  if (filter) {
    const filterObject = JSON.parse(filter);
    let where = {};

    for (const key in filterObject) {
      if (filterObject.hasOwnProperty(key)) {
        const value = filterObject[key];
        const thisField = getField(key);

        if (key.endsWith("_gte")) {
          where = {
            ...where,
            [thisField]: {
              gte: value,
            },
          };
        } else if (key.endsWith("_lte")) {
          where = {
            ...where,
            [thisField]: {
              lte: value,
            },
          };
          // getManyReference
        } else if (key.endsWith("_id")) {
          where = {
            ...where,
            [thisField]: {
              id: {
                equals: parseInt(value),
              },
            },
          };
        } else if (key === "id" && Array.isArray(value)) {
          where = {
            ...where,
            id: {
              in: parseInt(value),
            },
          };
        } else {
          where = {
            ...where,
            [key]: value,
          };
        }
      }
    }
    if (where) {
      query.where = where;
    }
  }

  const total = await prisma[resource].count();
  const data = await prisma[resource].findMany(query);
  res.json({
    data,
    total,
    validUntil,
  });
});

app.get("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const data = await prisma[resource].findOne({
    where: { id: parseInt(id) },
  });
  res.json({ data, validUntil });
});

app.post("/:resource", async (req, res) => {
  const { resource } = req.params;
  const { body } = req;

  const data = await prisma[resource].create({
    data: generateInput(body),
  });
  res.json({
    data,
  });
});

app.delete("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const data = await prisma[resource].delete({
    where: {
      id: parseInt(id),
    },
  });
  res.json({ data });
});

app.put("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const { body } = req;
  const data = await prisma[resource].update({
    where: {
      id: parseInt(id),
    },
    data: generateInput(body),
  });
  res.json({
    data,
  });
});

const generateInput = (body) => {
  let query = {};
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const value = body[key];
      const thisField = getField(key);
      if (key.endsWith("_id")) {
        query = {
          ...query,
          [thisField]: {
            connect: {
              id: parseInt(value),
            },
          },
        };
      } else {
        query = {
          ...query,
          [key]: value,
        };
      }
    }
  }
  return query;
};

const getField = (field) => {
  return field.split("_")[0];
};

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 8080);
