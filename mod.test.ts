import { assertEquals } from "https://deno.land/std@0.94.0/testing/asserts.ts";
import { find, insert, leftCollision, Radix } from "./mod.ts";

Deno.test("Find nodes in a tree", () => {
  assertEquals(
    find("/cars/volvo/:id", new Radix([["/cars/volvo/:id", "Volvo"]])),
    "Volvo",
  );

  assertEquals(
    find(
      "/cars/volvo/{id}",
      new Radix([
        ["/cars/mercedes/{id}", "Mercedes"],
        ["/cars/volvo/{id}", "Any Volvo"],
        ["/cars/volvo/v60", "Volvo V60"],
      ]),
    ),
    "Any Volvo",
  );

  assertEquals(find("/cars/volvo/{id}", new Radix()), null);
});

Deno.test("Insert nodes into a tree given an empty tree", () => {
  const tree = new Radix();

  insert("/cars/volvo/{id}", "Volvo", tree);

  assertEquals(tree, {
    edges: {
      "/cars/volvo/{id}": {
        edges: {},
        value: "Volvo",
      },
    },
    value: null,
  });
});

Deno.test("Insert nodes into a tree given a tree with an existing prefix", () => {
  const tree = new Radix([["/cars/volvo", "Volvo"]]);

  insert("/cars/volvo/v60", "Volvo V60", tree);

  assertEquals(tree, {
    edges: {
      "/cars/volvo": {
        edges: {
          "/v60": {
            edges: {},
            value: "Volvo V60",
          },
        },
        value: "Volvo",
      },
    },
    value: null,
  });
});

Deno.test("Insert nodes into a tree given a tree with a common prefix", () => {
  const tree = new Radix([["/cars/volvo", "Volvo"]]);

  insert("/cars/audi", "Audi", tree);
  insert("/cars/audi/r8", "Audi R8", tree);

  assertEquals(tree, {
    edges: {
      "/cars/": {
        edges: {
          volvo: {
            edges: {},
            value: "Volvo",
          },
          audi: {
            edges: {
              "/r8": {
                edges: {},
                value: "Audi R8",
              },
            },
            value: "Audi",
          },
        },
        value: null,
      },
    },
    value: null,
  });
});

Deno.test("Insert nodes into a tree given a tree with an existing prefix", () => {
  const tree = new Radix([
    ["/cars/volvo/{id}", 1],
    ["/cars/volvo/v60", 2],
  ]);

  insert("/cars/volvo", 3, tree);

  assertEquals(tree, {
    edges: {
      "/cars/volvo": {
        edges: {
          "/": {
            edges: {
              "{id}": {
                edges: {},
                value: 1,
              },
              v60: {
                edges: {},
                value: 2,
              },
            },
            value: null,
          },
        },
        value: 3,
      },
    },
    value: null,
  });
});

Deno.test("Checks if two words collide", () => {
  assertEquals(leftCollision("volvo", "audi"), ["", "volvo", "audi"]);

  assertEquals(leftCollision("volvo", "cars/volvo"), [
    "",
    "volvo",
    "cars/volvo",
  ]);

  assertEquals(leftCollision("cars/volvo", "cars/audi"), [
    "cars/",
    "volvo",
    "audi",
  ]);

  assertEquals(leftCollision("cars/volvo", "cars/volvo"), [
    "cars/volvo",
    "",
    "",
  ]);
});
