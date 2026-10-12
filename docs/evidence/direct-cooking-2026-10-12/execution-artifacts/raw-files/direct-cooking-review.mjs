// src/content/food-orders.ts
var FOOD_REQUESTS = {
  "food-orange": {
    products: ["orange"],
    explanation: "\u6A59\u5B50\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-pear": {
    products: ["pear"],
    explanation: "\u68A8\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-peach": {
    products: ["peach"],
    explanation: "\u6843\u5B50\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-strawberry": {
    products: ["fresh-strawberry"],
    explanation: "\u8349\u8393\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-grape": {
    products: ["grape"],
    explanation: "\u8461\u8404\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-watermelon": {
    products: ["watermelon"],
    explanation: "\u897F\u74DC\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-mango": {
    products: ["mango"],
    explanation: "\u8292\u679C\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-pineapple": {
    products: ["pineapple"],
    explanation: "\u83E0\u841D\uFF0C\u76F4\u63A5\u4F9B\u5E94\u3002"
  },
  "food-milk": {
    products: ["milk"],
    explanation: "\u725B\u5976\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-yogurt": {
    products: ["yogurt"],
    explanation: "\u9178\u5976\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-smoothie": {
    products: ["smoothie"],
    explanation: "\u601D\u6155\u96EA\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-milkshake": {
    products: ["milkshake"],
    explanation: "\u5976\u6614\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-pizza": {
    products: ["pizza"],
    explanation: "\u6BD4\u8428\u997C\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-salad": {
    products: ["salad"],
    explanation: "\u6C99\u62C9\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-cake": {
    products: ["cake"],
    explanation: "\u86CB\u7CD5\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  },
  "food-cookie": {
    products: ["cookie"],
    explanation: "\u66F2\u5947\u997C\u5E72\uFF0C\u9884\u5236\u4F9B\u5E94\uFF0C\u4E0D\u9700\u73B0\u573A\u70F9\u996A\u3002"
  }
};

// src/content/recipes.ts
var FOOD = {
  apple: ["\u82F9\u679C", "apple"],
  banana: ["\u9999\u8549", "banana"],
  cup: ["\u7A7A\u676F", "cup"],
  juice: ["\u82F9\u679C\u6C41", "apple juice"],
  "banana-juice": ["\u9999\u8549\u6C41", "banana juice"],
  bread: ["\u9762\u5305", "bread"],
  cheese: ["\u829D\u58EB", "cheese"],
  lettuce: ["\u751F\u83DC", "lettuce"],
  tomato: ["\u756A\u8304", "tomato"],
  bun: ["\u5706\u9762\u5305", "bun"],
  patty: ["\u751F\u997C", "patty"],
  "cooked-patty": ["\u719F\u997C", "cooked patty"],
  cone: ["\u86CB\u7B52", "cone"],
  vanilla: ["\u9999\u8349\u7403", "vanilla"],
  strawberry: ["\u8349\u8393\u7403", "strawberry"],
  "vanilla-cup": ["\u9999\u8349\u51B0\u6DC7\u6DCB\u676F", "vanilla ice cream"],
  "vanilla-cone": ["\u9999\u8349\u86CB\u7B52", "vanilla ice cream"],
  "strawberry-cup": ["\u8349\u8393\u51B0\u6DC7\u6DCB\u676F", "strawberry ice cream"],
  "double-cream": ["\u53CC\u7403\u51B0\u6DC7\u6DCB", "two scoops of ice cream"],
  "banana-cream": ["\u9999\u8549\u51B0\u6DC7\u6DCB", "ice cream with banana"],
  sandwich: ["\u829D\u58EB\u4E09\u660E\u6CBB", "cheese sandwich"],
  "salad-sandwich": ["\u852C\u83DC\u4E09\u660E\u6CBB", "lettuce and tomato sandwich"],
  burger: ["\u6C49\u5821", "burger"],
  "cheese-burger": ["\u829D\u58EB\u6C49\u5821", "cheeseburger"],
  orange: ["\u6A59\u5B50", "orange"],
  pear: ["\u68A8", "pear"],
  peach: ["\u6843\u5B50", "peach"],
  "fresh-strawberry": ["\u8349\u8393", "strawberry"],
  grape: ["\u8461\u8404", "grape"],
  watermelon: ["\u897F\u74DC", "watermelon"],
  mango: ["\u8292\u679C", "mango"],
  pineapple: ["\u83E0\u841D", "pineapple"],
  cucumber: ["\u9EC4\u74DC", "cucumber"],
  carrot: ["\u80E1\u841D\u535C", "carrot"],
  potato: ["\u571F\u8C46", "potato"],
  corn: ["\u7389\u7C73", "corn"],
  broccoli: ["\u897F\u5170\u82B1", "broccoli"],
  mushroom: ["\u8611\u83C7", "mushroom"],
  pumpkin: ["\u5357\u74DC", "pumpkin"],
  pea: ["\u8C4C\u8C46", "pea"],
  rice: ["\u7C73\u996D", "rice"],
  noodles: ["\u9762\u6761", "noodles"],
  egg: ["\u9E21\u86CB", "egg"],
  chicken: ["\u9E21\u8089", "chicken"],
  beef: ["\u725B\u8089", "beef"],
  fish: ["\u9C7C\u8089", "fish"],
  tofu: ["\u8C46\u8150", "tofu"],
  milk: ["\u725B\u5976", "milk"],
  yogurt: ["\u9178\u5976", "yogurt"],
  butter: ["\u9EC4\u6CB9", "butter"],
  cream: ["\u5976\u6CB9", "cream"],
  "vanilla-pod": ["\u9999\u8349", "vanilla"],
  chocolate: ["\u5DE7\u514B\u529B", "chocolate"],
  honey: ["\u8702\u871C", "honey"],
  jam: ["\u679C\u9171", "jam"],
  coconut: ["\u6930\u5B50", "coconut"],
  raisin: ["\u8461\u8404\u5E72", "raisin"],
  smoothie: ["\u6C34\u679C\u51B0\u6C99", "smoothie"],
  milkshake: ["\u5976\u6614", "milkshake"],
  pizza: ["\u6BD4\u8428\u997C", "pizza"],
  salad: ["\u6C99\u62C9", "salad"],
  cake: ["\u86CB\u7CD5", "cake"],
  cookie: ["\u66F2\u5947\u997C\u5E72", "cookie"]
};
var RECIPES = [
  {
    id: "vanilla-cup",
    family: "ice",
    station: "ice",
    inputs: ["cup", "vanilla"],
    output: "vanilla-cup",
    ms: 1e3,
    action: "\u63A5\u597D\u51B0\u6DC7\u6DCB"
  },
  {
    id: "juice",
    family: "juice",
    station: "machine",
    inputs: ["apple", "cup"],
    output: "juice",
    ms: 5e3,
    action: "\u69A8\u6C41"
  },
  {
    id: "banana-juice",
    family: "juice",
    station: "machine",
    inputs: ["banana", "cup"],
    output: "banana-juice",
    ms: 5e3,
    action: "\u69A8\u6C41"
  },
  {
    id: "vanilla-cone",
    family: "ice",
    station: "ice",
    inputs: ["cone", "vanilla"],
    output: "vanilla-cone",
    ms: 1e3,
    action: "\u63A5\u597D\u51B0\u6DC7\u6DCB"
  },
  {
    id: "strawberry-cup",
    family: "ice",
    station: "ice",
    inputs: ["cup", "strawberry"],
    output: "strawberry-cup",
    ms: 1e3,
    action: "\u63A5\u597D\u51B0\u6DC7\u6DCB"
  },
  {
    id: "double-cream",
    family: "ice",
    station: "ice",
    inputs: ["cup", "vanilla", "strawberry"],
    output: "double-cream",
    ms: 1300,
    action: "\u63A5\u597D\u53CC\u7403"
  },
  {
    id: "banana-cream",
    family: "ice",
    station: "ice",
    inputs: ["cup", "vanilla", "banana"],
    output: "banana-cream",
    ms: 1300,
    action: "\u88C5\u597D\u914D\u6599"
  },
  {
    id: "sandwich",
    family: "sandwich",
    station: "board",
    inputs: ["bread", "bread", "cheese"],
    output: "sandwich",
    ms: 1200,
    action: "\u76D6\u5408"
  },
  {
    id: "salad-sandwich",
    family: "sandwich",
    station: "board",
    inputs: ["bread", "bread", "lettuce", "tomato"],
    output: "salad-sandwich",
    ms: 1200,
    action: "\u76D6\u5408"
  },
  {
    id: "patty",
    family: "burger",
    station: "grill",
    inputs: ["patty"],
    output: "cooked-patty",
    ms: 3500,
    action: "\u714E\u597D\u997C"
  },
  {
    id: "burger",
    family: "burger",
    station: "board",
    inputs: ["bun", "cooked-patty", "lettuce", "tomato"],
    output: "burger",
    ms: 1200,
    action: "\u76D6\u597D\u6C49\u5821"
  },
  {
    id: "cheese-burger",
    family: "burger",
    station: "board",
    inputs: ["bun", "cooked-patty", "cheese"],
    output: "cheese-burger",
    ms: 1200,
    action: "\u76D6\u597D\u6C49\u5821"
  }
];
var sameContents = (a, b) => a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");
var recipeFor = (station, products) => RECIPES.find((r) => r.station === station && sameContents(products, r.inputs));
var RAW = [
  "apple",
  "banana",
  "orange",
  "pear",
  "peach",
  "fresh-strawberry",
  "grape",
  "watermelon",
  "mango",
  "pineapple",
  "cup",
  "bread",
  "cheese",
  "lettuce",
  "tomato",
  "bun",
  "patty",
  "cone",
  "vanilla",
  "strawberry"
];
var PREPARED = [
  "milk",
  "yogurt",
  "smoothie",
  "milkshake",
  "pizza",
  "salad",
  "cake",
  "cookie"
];
var isFinished = (product) => !RAW.includes(product);
var SUPPLY_PAGES = [
  ["orange", "pear", "peach", "fresh-strawberry"],
  ["grape", "watermelon", "mango", "pineapple"],
  ["milk", "yogurt", "smoothie", "milkshake"],
  ["pizza", "salad", "cake", "cookie"]
];

// src/content/dialogue-products.json
var dialogue_products_default = {
  apple: {
    one: "an apple",
    plural: "apples",
    name: "apple"
  },
  banana: {
    one: "a banana",
    plural: "bananas",
    name: "banana"
  },
  orange: {
    one: "an orange",
    plural: "oranges",
    name: "orange"
  },
  pear: {
    one: "a pear",
    plural: "pears",
    name: "pear"
  },
  peach: {
    one: "a peach",
    plural: "peaches",
    name: "peach"
  },
  "fresh-strawberry": {
    one: "a strawberry",
    plural: "strawberries",
    name: "strawberry"
  },
  mango: {
    one: "a mango",
    plural: "mangoes",
    name: "mango"
  },
  pineapple: {
    one: "a pineapple",
    plural: "pineapples",
    name: "pineapple"
  },
  sandwich: {
    one: "a cheese sandwich",
    plural: "cheese sandwiches",
    name: "cheese sandwich"
  },
  "salad-sandwich": {
    one: "a lettuce and tomato sandwich",
    plural: "lettuce and tomato sandwiches",
    name: "lettuce and tomato sandwich"
  },
  burger: {
    one: "a burger with lettuce and tomato",
    plural: "burgers with lettuce and tomato",
    name: "burger with lettuce and tomato"
  },
  "cheese-burger": {
    one: "a cheeseburger",
    plural: "cheeseburgers",
    name: "cheeseburger"
  },
  smoothie: {
    one: "a smoothie",
    plural: "smoothies",
    name: "smoothie"
  },
  milkshake: {
    one: "a milkshake",
    plural: "milkshakes",
    name: "milkshake"
  },
  cookie: {
    one: "a cookie",
    plural: "cookies",
    name: "cookie"
  },
  juice: {
    one: "some apple juice",
    plural: "portions of apple juice",
    name: "apple juice"
  },
  "banana-juice": {
    one: "some banana juice",
    plural: "portions of banana juice",
    name: "banana juice"
  },
  grape: {
    one: "some grapes",
    plural: "portions of grapes",
    name: "grapes"
  },
  watermelon: {
    one: "some watermelon",
    plural: "portions of watermelon",
    name: "watermelon"
  },
  milk: {
    one: "some milk",
    plural: "portions of milk",
    name: "milk"
  },
  yogurt: {
    one: "some yogurt",
    plural: "portions of yogurt",
    name: "yogurt"
  },
  pizza: {
    one: "some pizza",
    plural: "portions of pizza",
    name: "pizza"
  },
  salad: {
    one: "some salad",
    plural: "portions of salad",
    name: "salad"
  },
  cake: {
    one: "some cake",
    plural: "portions of cake",
    name: "cake"
  },
  "vanilla-cup": {
    one: "one scoop of vanilla ice cream in a cup",
    plural: "portions of vanilla ice cream in a cup",
    name: "vanilla ice cream in a cup"
  },
  "vanilla-cone": {
    one: "one scoop of vanilla ice cream in a cone",
    plural: "portions of vanilla ice cream in a cone",
    name: "vanilla ice cream in a cone"
  },
  "strawberry-cup": {
    one: "one scoop of strawberry ice cream in a cup",
    plural: "portions of strawberry ice cream in a cup",
    name: "strawberry ice cream in a cup"
  },
  "banana-cream": {
    one: "one scoop of vanilla ice cream with banana in a cup",
    plural: "portions of vanilla ice cream with banana in a cup",
    name: "vanilla ice cream with banana in a cup"
  },
  "double-cream": {
    one: "two scoops of ice cream in a cup, one vanilla and one strawberry",
    plural: "cups of ice cream with one vanilla scoop and one strawberry scoop",
    name: "vanilla and strawberry ice cream"
  }
};

// src/content/request-language.ts
function productPhrase(product, count) {
  if (!Object.hasOwn(dialogue_products_default, product) || !Number.isInteger(count) || count < 1 || count > 3)
    throw new Error(`Unsupported spoken product/count: ${product}/${count}`);
  const noun = dialogue_products_default[product];
  return count === 1 ? noun.one : `${["", "one", "two", "three"][count]} ${noun.plural}`;
}
function foodList(foods) {
  if (!foods.length || foods.length > 3) throw new Error("A spoken plate holds one to three foods");
  const counts = /* @__PURE__ */ new Map();
  for (const p of foods) counts.set(p, (counts.get(p) ?? 0) + 1);
  const parts = [...counts].map(([p, n2]) => productPhrase(p, n2));
  return parts.length < 3 ? parts.join(" and ") : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}
function orderLine(foods) {
  const text = `Can I have ${foodList(foods)}, please?`;
  return {
    text,
    audio: `imm-order-${[...foods].sort().join("-")}`,
    emphasis: [
      ...new Set(foods.map((p) => dialogue_products_default[p].name)),
      "two",
      "three"
    ]
  };
}

// src/content/catalog.ts
var CONTENT_VERSION = "direct-cooking-1";
var MODES = {
  guided: { name: "\u8DDF\u7740\u5927\u54AA\u505A", icon: "\u{1F43E}", trays: [0] },
  practice: { name: "\u5E2E\u5BA2\u4EBA\u51C6\u5907\u98DF\u7269", icon: "\u{1F34E}", trays: [0] },
  service: { name: "\u5C0F\u5C0F\u9910\u8F66\u8425\u4E1A\u4E2D", icon: "\u2600", trays: [0, 1] }
};
var JUICE_MS = 5e3;
var requestDefinitions = {
  ...FOOD_REQUESTS,
  apple: {
    products: ["apple"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u4E00\u4E2A\u82F9\u679C\u3002"
  },
  banana: {
    products: ["banana"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u4E00\u6839\u9999\u8549\u3002"
  },
  two: {
    products: ["apple", "apple"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u4E24\u4E2A\u82F9\u679C\u3002"
  },
  juice: {
    products: ["juice"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u4E00\u676F\u82F9\u679C\u6C41\u3002"
  },
  fruit: {
    products: ["apple", "banana"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u4E00\u4E2A\u82F9\u679C\u548C\u4E00\u6839\u9999\u8549\u3002"
  },
  "banana-juice": {
    products: ["banana-juice"],
    explanation: "\u8FD9\u4F4D\u5BA2\u4EBA\u60F3\u8981\u9999\u8549\u6C41\u3002"
  },
  "cup-vanilla": {
    products: ["vanilla-cup"],
    explanation: "\u8FD9\u9875\u56FA\u5B9A\u4E00\u7403\u9999\u8349\uFF0C\u5B69\u5B50\u9009\u62E9\u676F\u5B50\u3002"
  },
  "cone-vanilla": {
    products: ["vanilla-cone"],
    explanation: "\u8FD9\u9875\u56FA\u5B9A\u4E00\u7403\u9999\u8349\uFF0C\u5B69\u5B50\u9009\u62E9\u86CB\u7B52\u3002"
  },
  "vanilla-cup": {
    products: ["vanilla-cup"],
    explanation: "\u4E00\u7403\u9999\u8349\uFF0C\u7528\u83DC\u5355\u4E0A\u7684\u676F\u5B50\u88C5\u3002"
  },
  "vanilla-cone": {
    products: ["vanilla-cone"],
    explanation: "\u9999\u8349\u51B0\u6DC7\u6DCB\uFF0C\u88C5\u5728\u86CB\u7B52\u91CC\u3002"
  },
  "strawberry-cup": {
    products: ["strawberry-cup"],
    explanation: "\u8349\u8393\u51B0\u6DC7\u6DCB\uFF0C\u88C5\u5728\u676F\u91CC\u3002"
  },
  "double-cream": {
    products: ["double-cream"],
    explanation: "\u676F\u91CC\u653E\u4E00\u7403\u9999\u8349\u3001\u4E00\u7403\u8349\u8393\u3002"
  },
  "banana-cream": {
    products: ["banana-cream"],
    explanation: "\u676F\u91CC\u653E\u9999\u8349\u548C\u9999\u8549\u914D\u6599\u3002"
  },
  sandwich: {
    products: ["sandwich"],
    explanation: "\u4E24\u7247\u9762\u5305\u5939\u829D\u58EB\u3002"
  },
  "salad-sandwich": {
    products: ["salad-sandwich"],
    explanation: "\u4E24\u7247\u9762\u5305\u5939\u751F\u83DC\u548C\u756A\u8304\u3002"
  },
  burger: {
    products: ["burger"],
    explanation: "\u5706\u9762\u5305\u5939\u719F\u997C\u3001\u751F\u83DC\u548C\u756A\u8304\u3002"
  },
  "cheese-burger": {
    products: ["cheese-burger"],
    explanation: "\u5706\u9762\u5305\u5939\u719F\u997C\u548C\u829D\u58EB\u3002"
  }
};
var REQUESTS = Object.fromEntries(
  Object.entries(requestDefinitions).map(([id, r]) => [id, { ...r, ...orderLine(r.products) }])
);
var PRODUCT_NAMES = Object.fromEntries(
  Object.entries(FOOD).map(([id, names]) => [id, names[0]])
);
var WORDS = [
  "an",
  "a",
  "one",
  "two",
  "apple",
  "apples",
  "banana",
  "bananas",
  "and",
  "please",
  "an",
  "a",
  "apple",
  "banana"
];
var TOKENS = WORDS.map((text, i) => ({ id: `word-${i}`, text }));
function requestsFor(mode, variant) {
  if (mode === "guided") return [variant === 0 ? "apple" : "juice"];
  if (mode === "practice")
    return variant === 0 ? ["apple", "banana", "two", "fruit", "juice"] : ["banana", "apple", "two", "juice", "fruit"];
  return variant === 0 ? ["juice", "fruit"] : ["fruit", "juice"];
}

// src/content/free-shop.ts
var SHOP_THEMES = [
  { id: "all", name: "\u719F\u5BA2\u5C0F\u9662" },
  {
    id: "fruit",
    name: "\u6668\u95F4\u6C34\u679C",
    requests: ["apple", "banana", "two", "fruit", "juice", "banana-juice"]
  },
  {
    id: "cool",
    name: "\u6811\u836B\u751C\u70B9",
    requests: [
      "vanilla-cup",
      "strawberry-cup",
      "double-cream",
      "banana-cream",
      "vanilla-cone",
      "cup-vanilla",
      "cone-vanilla"
    ]
  },
  {
    id: "share",
    name: "\u5206\u4EAB\u5C0F\u98DF",
    requests: ["sandwich", "salad-sandwich", "burger", "cheese-burger", "juice"]
  }
];
var themeAllows = (theme, request) => {
  const t = SHOP_THEMES.find((t2) => t2.id === theme);
  return !!t && (!t.requests || t.requests.includes(request));
};

// src/content/phrases.ts
function parsePhrase(input) {
  const normalized = input.toLowerCase().replace(/[.,!?，。！]/g, " ").trim().replace(/\s+/g, " ");
  if (!normalized) return { kind: "incomplete", message: "\u5148\u628A\u60F3\u8BF4\u7684\u8BCD\u653E\u5230\u4FBF\u7B7E\u4E0A\u3002" };
  let words = normalized.split(" ");
  if (words[0] === "please") words = words.slice(1);
  if (words.at(-1) === "please") words = words.slice(0, -1);
  if (!words.length || words.at(-1) === "and")
    return { kind: "incomplete", message: "\u4FBF\u7B7E\u8FD8\u6CA1\u5199\u5B8C\uFF0C\u53EF\u4EE5\u63A5\u7740\u653E\u8BCD\u3002" };
  if (words.some(
    (w) => !["a", "an", "one", "two", "apple", "apples", "banana", "bananas", "and"].includes(w)
  ))
    return { kind: "outside", message: "\u8FD9\u5F20\u4FBF\u7B7E\u76EE\u524D\u8BA4\u8BC6 apple\u3001banana\u3001one\u3001two \u548C and\u3002" };
  const parts = words.join(" ").split(" and ");
  if (parts.length > 2) return { kind: "outside", message: "\u5927\u54AA\u4E00\u6B21\u6700\u591A\u62FF\u4E24\u4EFD\u6C34\u679C\u3002" };
  const fruits = [];
  for (const part of parts) {
    const pieces = part.split(" ");
    if (pieces.length === 1 && ["apple", "banana"].includes(pieces[0] ?? "")) {
      fruits.push(pieces[0]);
      continue;
    }
    const [det, noun, extra] = pieces;
    if (!noun) return { kind: "incomplete", message: "\u518D\u544A\u8BC9\u5927\u54AA\u8981\u4EC0\u4E48\u6C34\u679C\u3002" };
    if (extra || !det) return { kind: "outside", message: "\u8BD5\u8BD5\u4E00\u4E2A\u6570\u91CF\u8BCD\u914D\u4E00\u4E2A\u6C34\u679C\u8BCD\u3002" };
    const fruit = noun === "apple" || noun === "apples" ? "apple" : noun === "banana" || noun === "bananas" ? "banana" : void 0;
    if (!fruit || !["a", "an", "one", "two"].includes(det))
      return { kind: "outside", message: "\u8FD9\u53E5\u8BDD\u8D85\u51FA\u5927\u54AA\u5F53\u524D\u8BA4\u8BC6\u7684\u8868\u8FBE\u3002" };
    const two = det === "two";
    const correctArticle = det !== "a" && det !== "an" || det === (fruit === "apple" ? "an" : "a");
    if (!correctArticle || noun !== `${fruit}${two ? "s" : ""}`)
      return {
        kind: "language-adjust",
        message: "\u4E00\u4E2A\u7528 an apple / a banana\uFF1B\u4E24\u4E2A\u7528 two apples / two bananas\u3002"
      };
    fruits.push(fruit);
    if (two) fruits.push(fruit);
  }
  if (fruits.length > 2) return { kind: "outside", message: "\u5927\u54AA\u4E00\u6B21\u6700\u591A\u62FF\u4E24\u4EFD\u6C34\u679C\u3002" };
  return { kind: "valid", fruits, normalized };
}
function parseTokens(ids) {
  if (ids.length > 12 || new Set(ids).size !== ids.length)
    return { kind: "outside", message: "\u6BCF\u5F20\u8BCD\u5757\u53EA\u80FD\u4F7F\u7528\u4E00\u6B21\u3002" };
  const tokens = ids.map((id) => TOKENS.find((t) => t.id === id));
  if (tokens.some((t) => !t)) return { kind: "outside", message: "\u8FD9\u5F20\u8BCD\u5757\u4E0D\u5728\u4FBF\u7B7E\u76D2\u91CC\u3002" };
  return parsePhrase(tokens.map((t) => t?.text ?? "").join(" "));
}

// src/game/actor.ts
var HOME = { x: 0.73, y: 0.43 };
function buildPlan(id, from, stops) {
  const phases = [];
  let at = { ...from };
  for (const stop of stops) {
    const distance = Math.hypot(stop.point.x - at.x, (stop.point.y - at.y) * 1.4);
    if (distance > 1e-3)
      phases.push({
        from: { ...at },
        to: { ...stop.point },
        pose: "carry",
        duration: Math.max(240, distance / 0.32 * 1e3)
      });
    if (stop.hold > 0)
      phases.push({
        from: { ...stop.point },
        to: { ...stop.point },
        pose: stop.pose,
        duration: stop.hold,
        ...stop.event ? { event: stop.event } : {}
      });
    at = { ...stop.point };
  }
  if (!phases.length) phases.push({ from: at, to: at, pose: "idle", duration: 1 });
  return { id, phases, duration: phases.reduce((sum, p) => sum + p.duration, 0) };
}
function samplePlan(plan, elapsed) {
  let time = Math.max(0, elapsed);
  for (const [index, p] of plan.phases.entries()) {
    if (time <= p.duration || index === plan.phases.length - 1) {
      const t = Math.min(1, time / p.duration);
      const ease = t * t * (3 - 2 * t);
      return {
        point: {
          x: p.from.x + (p.to.x - p.from.x) * ease,
          y: p.from.y + (p.to.y - p.from.y) * ease
        },
        pose: p.pose,
        phase: index,
        progress: t,
        moving: p.from.x !== p.to.x || p.from.y !== p.to.y,
        ...p.event ? { event: p.event } : {}
      };
    }
    time -= p.duration;
  }
  throw new Error("Empty actor plan");
}

// src/content/adventure.ts
var ADVENTURES = [
  {
    id: 0,
    title: "\u6668\u5149\u5F00\u95E8",
    goal: "\u9001\u65E9\u9910\uFF0C\u4E00\u8D77\u5403\uFF1B\u996D\u540E\u53EF\u4EE5\u79CD\u8FCE\u5BA2\u82B1",
    reward: "flower-page",
    family: "juice",
    orders: [
      { request: "apple", visitor: "rabbit" },
      { request: "banana", visitor: "hedgehog" }
    ]
  },
  {
    id: 1,
    title: "\u6811\u836B\u751C\u70B9",
    goal: "\u5C1D\u4E0D\u540C\u53E3\u5473\uFF0C\u628A\u5206\u4EAB\u5F69\u65D7\u6302\u8D77\u6765",
    reward: "bunting-page",
    family: "ice",
    orders: [{ request: "vanilla-cone", visitor: "rabbit" }]
  },
  {
    id: 2,
    title: "\u91CE\u9910\u51C6\u5907",
    goal: "\u5E2E\u670B\u53CB\u5907\u9910\uFF0C\u4E00\u8D77\u628A\u91CE\u9910\u684C\u6446\u597D",
    reward: "picnic-page",
    family: "sandwich",
    orders: [
      { request: "sandwich", visitor: "rabbit" },
      { request: "salad-sandwich", visitor: "hedgehog" }
    ]
  },
  {
    id: 3,
    title: "\u9EC4\u660F\u534F\u4F5C",
    goal: "\u5B89\u6392\u714E\u5236\u4E0E\u996E\u54C1\uFF0C\u628A\u706F\u5E26\u5230\u9910\u684C",
    reward: "light-page",
    family: "burger",
    orders: [
      { request: "cheese-burger", visitor: "rabbit" },
      { request: "juice", visitor: "hedgehog" }
    ]
  },
  {
    id: 4,
    title: "\u793E\u533A\u5C0F\u98DF\u4F1A",
    goal: "\u9080\u8BF7\u8001\u670B\u53CB\uFF0C\u521B\u4F5C\u62FC\u76D8\uFF0C\u7559\u4E0B\u98DF\u8C31\u672B\u9875",
    reward: "feast-page",
    family: "juice",
    orders: []
  }
];
var EDIBLE = [
  "apple",
  "banana",
  "orange",
  "pear",
  "peach",
  "fresh-strawberry",
  "grape",
  "watermelon",
  "mango",
  "pineapple",
  "juice",
  "banana-juice",
  "vanilla-cup",
  "vanilla-cone",
  "strawberry-cup",
  "double-cream",
  "banana-cream",
  "sandwich",
  "salad-sandwich",
  "burger",
  "cheese-burger",
  "milk",
  "yogurt",
  "smoothie",
  "milkshake",
  "pizza",
  "salad",
  "cake",
  "cookie"
];
var COOL_CHOICES = [
  "vanilla-cup",
  "strawberry-cup",
  "double-cream",
  "banana-cream"
];
var FAMILIES = ["juice", "ice", "sandwich", "burger"];
var emptyAdventure = (chapter, kind = "chapter") => ({
  chapter,
  kind,
  branch: null,
  explored: [],
  steps: [],
  rewards: [],
  foods: [],
  works: [],
  decor: { flower: 0, bunting: "warm", cloth: "leaf", light: "warm" },
  invitations: []
});
var workSignature = (foods) => foods.map((f) => `${f.id}:${f.product}:${f.place}:${f.tasted}`).join("|");

// src/content/adventure-experience.ts
var TOOLS = ["seed", "watering-can", "mat", "lantern", "spoon"];
var emptyExperience = () => ({
  version: 2,
  tools: [],
  used: [],
  helpers: [],
  needs: [],
  known: [],
  picnic: null,
  moments: []
});
var FOOD_GROUPS = {
  fruit: [
    "apple",
    "banana",
    "orange",
    "pear",
    "peach",
    "fresh-strawberry",
    "grape",
    "watermelon",
    "mango",
    "pineapple"
  ],
  drink: ["juice", "banana-juice", "milk", "smoothie", "milkshake"],
  cool: ["vanilla-cup", "vanilla-cone", "strawberry-cup", "double-cream", "banana-cream", "yogurt"],
  savory: ["sandwich", "salad-sandwich", "burger", "cheese-burger"],
  any: []
};
var needAccepts = (need, food) => need.kind === "any" || FOOD_GROUPS[need.kind].includes(food.product);
var visitorSeat = (visitor) => visitor === "rabbit" ? 0 : visitor === "hedgehog" ? 1 : 2;
var foodVisitor = (food) => food.tastedBy ?? (food.place === "guest-hedgehog" || food.place === "table:1" ? "hedgehog" : food.place === "guest-elder" || food.place === "table:2" ? "elder" : "rabbit");
function drawerTools(a) {
  if (a.chapter === 4 && a.foods.length && !a.rewards.length) return ["spoon"];
  if (a.chapter === 0 && a.explored.includes("drawer")) return ["seed", "watering-can"];
  if (a.chapter === 1 && a.explored.includes("recipe")) return ["spoon"];
  if (a.chapter === 2 && a.branch === "hedgehog" && a.explored.includes("drawer")) return ["mat"];
  if (a.chapter === 3 && a.explored.includes("drawer")) return ["lantern"];
  if (a.rewards.length || a.kind === "shop") return TOOLS;
  return [];
}
function returningNeed(exp, visitor) {
  const cool = exp.known.some((p) => FOOD_GROUPS.cool.includes(p));
  const kind = visitor === "rabbit" ? exp.picnic === "rabbit" ? "savory" : exp.picnic === "hedgehog" ? "drink" : "fruit" : visitor === "hedgehog" ? cool ? "cool" : "drink" : exp.known.some((p) => FOOD_GROUPS.savory.includes(p)) ? "savory" : "any";
  return {
    visitor,
    kind,
    basis: visitor === "hedgehog" && cool ? "treat" : exp.picnic === "rabbit" ? "packing" : exp.picnic === "hedgehog" ? "table" : "first",
    fulfilled: []
  };
}

// src/rules/adventure-experience.ts
function hydrateExperience(a) {
  a.experience ??= emptyExperience();
}
function worldMoment(s2, moment) {
  const a = s2.adventure;
  if (!a) return;
  hydrateExperience(a);
  if (!a.experience) return;
  a.experience.moments = [
    ...a.experience.moments,
    { ...moment, id: `${s2.runId}:moment:${s2.nextId++}`, at: s2.gameTime }
  ].slice(-16);
}
function experienceReady(a) {
  const e = a.experience;
  if (!e || a.rewards.length) return true;
  return a.chapter === 1 ? e.used.includes("compare") : a.chapter === 3 ? e.used.includes("cooperate") : a.chapter === 4 ? e.used.includes("share") : true;
}
function experienceCommand(s2, c) {
  const a = s2.adventure;
  if (!a) return null;
  const result = (kind, message) => ({ kind, message });
  hydrateExperience(a);
  const e = a.experience;
  if (!e) return null;
  const use = (id) => {
    if (!e.used.includes(id)) e.used.push(id);
  };
  if (c.action === "take-tool") {
    const tool = TOOLS.find((t) => t === c.object);
    if (!tool || !drawerTools(a).includes(tool))
      return result("blocked", "\u5148\u6253\u5F00\u6709\u8FD9\u4E2A\u7269\u4EF6\u7684\u62BD\u5C49\u6216\u98DF\u8C31\u3002");
    if (s2.items.some((i) => i.location.startsWith("hand:")) || a.foods.some((f) => f.place === "hand") || e.heldTool && e.heldTool !== tool || e.heldDecoration)
      return result("blocked", "\u5148\u653E\u4E0B\u624B\u4E2D\u7684\u7269\u4EF6\uFF0C\u518D\u53D6\u5DE5\u5177\u3002");
    if (e.heldTool === tool) return result("duplicate", "\u8FD9\u4EF6\u5DE5\u5177\u5DF2\u7ECF\u5728\u624B\u91CC\u3002");
    if (!e.tools.includes(tool)) e.tools.push(tool);
    e.heldTool = tool;
    worldMoment(s2, { kind: "tool", foods: [], tool });
    return result("ok", "\u7269\u4EF6\u53D6\u51FA\u6765\u4E86\uFF0C\u70B9\u573A\u666F\u76EE\u6807\u5C31\u80FD\u4F7F\u7528\u3002");
  }
  if (c.action === "put-tool") {
    if (!e.heldTool) return result("blocked", "\u624B\u91CC\u6CA1\u6709\u5DE5\u5177\u3002");
    const tool = e.heldTool;
    e.heldTool = null;
    if (tool === "seed" && !a.steps.includes("plant")) e.tools = e.tools.filter((t) => t !== tool);
    worldMoment(s2, {
      kind: "place",
      foods: [],
      tool,
      ...c.seat === void 0 ? {} : { seat: c.seat }
    });
    return result("ok", "\u5DE5\u5177\u653E\u56DE\u4E86\uFF0C\u9700\u8981\u65F6\u53EF\u4EE5\u518D\u53D6\u51FA\u3002");
  }
  if (c.action === "water") {
    if (!a.steps.includes("plant") || !e.tools.includes("watering-can"))
      return result("blocked", "\u5148\u79CD\u82B1\u5E76\u53D6\u51FA\u6D47\u6C34\u58F6\u3002");
    if (e.used.includes("water")) return result("duplicate", "\u82B1\u5DF2\u7ECF\u559D\u8FC7\u6C34\u4E86\u3002");
    use("water");
    e.heldTool = null;
    worldMoment(s2, { kind: "water", foods: [], seat: a.decor.flower, tool: "watering-can" });
    return result("ok", "\u6C34\u6D41\u8FDB\u82B1\u76C6\uFF0C\u82B1\u5C55\u5F00\u4E86\uFF0C\u8774\u8776\u6765\u5230\u8FCE\u5BA2\u7684\u4F4D\u7F6E\u3002");
  }
  if (c.action === "compare") {
    const foods = a.foods.filter((f) => f.source === "cool" || f.source.startsWith("guest-"));
    if (a.chapter !== 1 || new Set(foods.map((f) => f.product)).size < 2)
      return result("blocked", "\u505A\u4E24\u79CD\u4E0D\u540C\u7684\u5B9E\u9645\u751C\u70B9\uFF0C\u518D\u4E00\u8D77\u770B\u770B\u676F\u7B52\u3001\u7403\u6570\u548C\u914D\u6599\u3002");
    if (e.used.includes("compare")) return result("duplicate", "\u4E24\u79CD\u505A\u6CD5\u5DF2\u7ECF\u653E\u5728\u4E00\u8D77\u770B\u8FC7\u4E86\u3002");
    use("compare");
    worldMoment(s2, {
      kind: "share",
      foods: foods.map(({ id, product }) => ({ id, product })),
      visitor: "hedgehog"
    });
    return result("ok", "\u676F\u7B52\u3001\u7403\u6570\u6216\u914D\u6599\u4E0D\u540C\uFF0C\u4E24\u79CD\u751C\u70B9\u90FD\u53EF\u4EE5\u5206\u4EAB\u3002");
  }
  if (c.action === "cooperate") {
    const visitor = c.visitor;
    const role = c.object;
    if (a.chapter !== 3 || !visitor || !["rabbit", "hedgehog"].includes(visitor) || role !== "cups" && role !== "lantern" || !a.steps.some((x) => x.startsWith("served:")))
      return result("blocked", "\u5148\u63A5\u597D\u98DF\u54C1\uFF0C\u627E\u51FA\u706F\uFF0C\u518D\u9009\u670B\u53CB\u548C\u5E2E\u5FD9\u7684\u7269\u4EF6\u3002");
    if (e.helpers.some((h) => h.visitor === visitor))
      return result("duplicate", "\u8FD9\u4F4D\u670B\u53CB\u5DF2\u7ECF\u5E2E\u5FD9\u4E86\u3002");
    e.helpers.push({ visitor, role });
    if (role === "lantern" && !e.tools.includes("lantern")) e.tools.push("lantern");
    if (role === "lantern") e.heldTool = null;
    use("cooperate");
    worldMoment(s2, {
      kind: "cooperate",
      foods: [],
      visitor,
      ...role === "lantern" ? { tool: "lantern" } : { prop: "cup" }
    });
    return result(
      "ok",
      role === "lantern" ? "\u670B\u53CB\u628A\u706F\u5E26\u5230\u684C\u8FB9\uFF0C\u7B49\u4F60\u9009\u62E9\u706F\u5149\u3002" : "\u670B\u53CB\u628A\u676F\u5B50\u5E26\u5230\u7A7A\u9910\u4F4D\uFF0C\u8BA9\u53E6\u4E00\u4F4D\u5B89\u5FC3\u5907\u9910\u3002"
    );
  }
  if (c.action === "share") {
    const need = e.needs.find((n2) => n2.visitor === c.visitor);
    const food = a.foods.find((f) => f.id === c.item);
    if (!need || !food || food.place === "basket")
      return result("blocked", "\u5148\u9080\u8BF7\u670B\u53CB\uFF0C\u518D\u9009\u684C\u8FB9\u771F\u5B9E\u7684\u98DF\u54C1\u3002");
    if (need.fulfilled.length || e.needs.some((n2) => n2.fulfilled.includes(food.id)))
      return result("duplicate", "\u8FD9\u4EFD\u5206\u4EAB\u5DF2\u7ECF\u7559\u4E0B\u4E86\u3002");
    if (food.tasted) return result("blocked", "\u8FD9\u4EFD\u5DF2\u7ECF\u54C1\u5C1D\u8FC7\u4E86\u3002\u7559\u5728\u4F5C\u54C1\u91CC\uFF0C\u518D\u505A\u4E00\u4EFD\u65B0\u98DF\u54C1\u5206\u4EAB\u3002");
    if (!needAccepts(need, food))
      return result("blocked", "\u670B\u53CB\u60F3\u8981\u53E6\u4E00\u7C7B\u98DF\u54C1\u3002\u98DF\u54C1\u7559\u7740\uFF0C\u91CD\u542C\u6216\u770B\u56FE\u518D\u9009\u3002");
    const seat = visitorSeat(need.visitor);
    if (a.foods.some((f) => f.id !== food.id && f.place === `table:${seat}`))
      return result("blocked", "\u8FD9\u4F4D\u670B\u53CB\u7684\u9910\u4F4D\u6EE1\u4E86\uFF0C\u5148\u62FF\u56DE\u684C\u8FB9\u518D\u5B89\u6392\u3002");
    food.place = `table:${seat}`;
    food.recipient = need.visitor;
    need.fulfilled.push(food.id);
    use("share");
    const place = `place:${seat}`;
    if (!a.steps.includes(place)) a.steps.push(place);
    worldMoment(s2, {
      kind: "share",
      foods: [{ id: food.id, product: food.product }],
      visitor: need.visitor,
      seat
    });
    return result("ok", "\u4F60\u9009\u7684\u98DF\u54C1\u6446\u5230\u670B\u53CB\u9762\u524D\u4E86\uFF0C\u53EF\u4EE5\u542C\u56DE\u5E94\u3001\u5C1D\u4E00\u53E3\u6216\u518D\u521B\u4F5C\u3002");
  }
  return null;
}
function addInvitationNeed(a, visitor) {
  hydrateExperience(a);
  const e = a.experience;
  if (e && !e.needs.some((n2) => n2.visitor === visitor)) e.needs.push(returningNeed(e, visitor));
}
function validExperience(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const e = value;
  const list = (xs, max, allowed) => Array.isArray(xs) && xs.length <= max && new Set(xs).size === xs.length && xs.every((x) => typeof x === "string" && allowed.includes(x));
  const visitors = ["rabbit", "hedgehog", "elder"];
  return e.version === 2 && (e.heldDecoration === void 0 || e.heldDecoration === null || ["bunting", "cloth", "light"].includes(e.heldDecoration.kind) && (e.heldDecoration.kind === "cloth" ? ["leaf", "sun"] : e.heldDecoration.kind === "light" ? ["warm", "moon"] : ["warm", "cool"]).includes(e.heldDecoration.value)) && list(e.tools, 5, TOOLS) && (e.heldTool === void 0 || e.heldTool === null || TOOLS.includes(e.heldTool) && e.tools.includes(e.heldTool)) && list(e.used, 4, ["water", "compare", "cooperate", "share"]) && list(e.known, EDIBLE.length, EDIBLE) && (e.picnic === null || ["rabbit", "hedgehog"].includes(e.picnic)) && Array.isArray(e.helpers) && e.helpers.length <= 2 && new Set(e.helpers.map((h) => h?.visitor)).size === e.helpers.length && e.helpers.every(
    (h) => h && visitors.includes(h.visitor) && ["cups", "lantern"].includes(h.role)
  ) && Array.isArray(e.needs) && e.needs.length <= 3 && new Set(e.needs.map((n2) => n2?.visitor)).size === e.needs.length && e.needs.every(
    (n2) => n2 && visitors.includes(n2.visitor) && ["fruit", "drink", "cool", "savory", "any"].includes(n2.kind) && ["first", "packing", "table", "treat"].includes(n2.basis) && Array.isArray(n2.fulfilled) && n2.fulfilled.length <= 1 && n2.fulfilled.every((id) => typeof id === "string" && /^food-\d+$/.test(id))
  ) && Array.isArray(e.moments) && e.moments.length <= 16 && new Set(e.moments.map((m) => m?.id)).size === e.moments.length && e.moments.every(
    (m) => m && typeof m.id === "string" && m.id.length < 200 && ["receive", "place", "taste", "tool", "water", "cooperate", "share", "finish"].includes(
      m.kind
    ) && Number.isFinite(m.at) && m.at >= 0 && Array.isArray(m.foods) && m.foods.length <= 12 && m.foods.every(
      (f) => f && /^food-\d+$/.test(f.id) && EDIBLE.includes(f.product) && (f.visitor === void 0 || visitors.includes(f.visitor))
    ) && (m.destination === void 0 || ["basket", "work", "table"].includes(m.destination)) && (m.visitor === void 0 || visitors.includes(m.visitor)) && (m.seat === void 0 || [0, 1, 2].includes(m.seat)) && (m.tool === void 0 || TOOLS.includes(m.tool)) && (m.prop === void 0 || m.prop === "cup")
  );
}

// src/content/chapters.ts
var CHAPTERS = [
  {
    id: 0,
    title: "\u6668\u5149\u679C\u6C41",
    subtitle: "\u628A\u7B2C\u4E00\u676F\u5FC3\u610F\u9001\u51FA\u53BB",
    family: "juice",
    requests: ["apple", "juice", "banana-juice", "fruit"],
    introduced: ["apple", "banana", "juice"],
    gift: "\u7A97\u53F0\u5C0F\u82B1",
    line: "\u957F\u8F88\u7684\u8001\u5BA2\u4EBA\u6765\u4E86\u3002\u7528\u6C34\u679C\u505A\u4E00\u676F\u6E05\u51C9\u7684\u95EE\u5019\u5427\u3002",
    audio: "chapter-juice"
  },
  {
    id: 1,
    title: "\u6811\u836B\u51B0\u6DC7\u6DCB",
    subtitle: "\u4E00\u7403\u3001\u4E24\u7403\uFF0C\u90FD\u662F\u597D\u5FC3\u60C5",
    family: "ice",
    requests: ["vanilla-cup", "strawberry-cup", "vanilla-cone", "double-cream", "banana-cream"],
    introduced: ["ice-cream", "one", "two", "and"],
    gift: "\u5F69\u8272\u906E\u9633\u65D7",
    line: "\u5348\u540E\u7684\u6811\u836B\u4E0B\uFF0C\u670B\u53CB\u4EEC\u60F3\u5C1D\u4E0D\u540C\u53E3\u5473\u3002",
    audio: "chapter-ice"
  },
  {
    id: 2,
    title: "\u91CE\u9910\u4E09\u660E\u6CBB",
    subtitle: "\u9762\u5305\u4E2D\u95F4\u7684\u5C0F\u79D8\u5BC6",
    family: "sandwich",
    requests: ["sandwich", "salad-sandwich", "juice"],
    introduced: ["bread", "cheese", "sandwich"],
    gift: "\u91CE\u9910\u684C\u5E03",
    line: "\u670B\u53CB\u5E26\u6765\u4E86\u91CE\u9910\u7BEE\u3002\u4E00\u8D77\u5939\u597D\u9762\u5305\uFF0C\u5E26\u4E0A\u679C\u6C41\u3002",
    audio: "chapter-sandwich"
  },
  {
    id: 3,
    title: "\u9EC4\u660F\u6C49\u5821",
    subtitle: "\u8BA9\u9999\u5473\u7559\u4F4F\u8FD9\u6761\u5C0F\u8857",
    family: "burger",
    requests: ["cheese-burger", "burger", "sandwich"],
    introduced: ["burger", "lettuce", "tomato"],
    gift: "\u6696\u6696\u706F\u4E32",
    line: "\u714E\u53F0\u4EAE\u8D77\u6765\u4E86\u3002\u5148\u7B49\u997C\u505A\u597D\uFF0C\u518D\u5E2E\u5927\u54AA\u7EC4\u88C5\u6C49\u5821\u3002",
    audio: "chapter-burger"
  },
  {
    id: 4,
    title: "\u793E\u533A\u5C0F\u98DF\u4F1A",
    subtitle: "\u6BCF\u4F4D\u670B\u53CB\u90FD\u6709\u4E00\u4EFD\u5FC3\u610F",
    family: "juice",
    requests: ["juice", "vanilla-cone", "sandwich", "cheese-burger"],
    introduced: ["thank-you"],
    gift: "\u5927\u5BB6\u7684\u5408\u5F71",
    line: "\u98DF\u8C31\u91CC\u7559\u4E0B\u4E86\u56DB\u9053\u83DC\u3002\u8C22\u8C22\u5927\u54AA\uFF0C\u8BF7\u8001\u670B\u53CB\u4E00\u8D77\u5230\u5C0F\u9662\u5403\u996D\u5427\uFF01",
    audio: "chapter-picnic"
  }
];
var requestFamily = (request) => request in FOOD_REQUESTS ? "ready" : [
  "cup-vanilla",
  "cone-vanilla",
  "vanilla-cup",
  "strawberry-cup",
  "vanilla-cone",
  "double-cream",
  "banana-cream"
].includes(request) ? "ice" : ["sandwich", "salad-sandwich"].includes(request) ? "sandwich" : ["burger", "cheese-burger"].includes(request) ? "burger" : "juice";
function endlessPool(families, language) {
  const pool = ["apple", "banana", "juice", "banana-juice"];
  if (language === "combined") pool.push("two", "fruit");
  if (families.includes("ice"))
    pool.push(
      ...language === "flavor" ? ["vanilla-cup", "strawberry-cup"] : language === "container" ? ["cup-vanilla", "cone-vanilla"] : [
        "cup-vanilla",
        "cone-vanilla",
        "vanilla-cup",
        "vanilla-cone",
        "strawberry-cup",
        "double-cream",
        "banana-cream"
      ]
    );
  if (families.includes("sandwich")) pool.push("sandwich", "salad-sandwich");
  if (families.includes("burger")) pool.push("burger", "cheese-burger");
  if (families.includes("ready")) pool.push(...Object.keys(FOOD_REQUESTS));
  return pool;
}
function randomAt(seed, cursor) {
  let x = seed + Math.imul(cursor + 1, 2654435769) >>> 0;
  x = Math.imul(x ^ x >>> 16, 569420461);
  x = Math.imul(x ^ x >>> 15, 1935289751);
  return ((x ^ x >>> 15) >>> 0) / 4294967296;
}

// src/content/story-levels.ts
var STORY_LEVELS = [
  {
    id: "c1-open-door",
    chapter: 0,
    title: "\u7B2C\u4E00\u6B21\u5F00\u95E8",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u957F\u8F88\u628A\u94A5\u5319\u4EA4\u7ED9\u5927\u54AA\u3002\u5154\u5154\u6765\u4E70\u719F\u6089\u7684\u82F9\u679C\u3002",
    objective: "\u542C\u8BF7\u6C42\uFF0C\u628A\u82F9\u679C\u653E\u76D8\u5E76\u4EA4\u7ED9\u5154\u5154\u3002",
    result: "\u5154\u5154\u8BF4\uFF1A\u660E\u5929\u6211\u8FD8\u4F1A\u6765\u3002",
    requests: ["apple"]
  },
  {
    id: "c1-first-juice",
    chapter: 0,
    title: "\u8001\u98DF\u8C31\u7684\u7B2C\u4E00\u9875",
    who: "\u523A\u523A",
    visitors: ["hedgehog"],
    situation: "\u523A\u523A\u5E26\u6765\u957F\u8F88\u65E7\u98DF\u8C31\u7684\u7B2C\u4E00\u9875\u3002",
    objective: "\u6309\u65E7\u98DF\u8C31\u69A8\u4E00\u676F\u82F9\u679C\u6C41\u3002",
    result: "\u523A\u523A\u8BB0\u8D77\u957F\u8F88\u8BF4\u8FC7\uFF1A\u5C0F\u9662\u9700\u8981\u4E00\u6735\u82B1\u3002",
    requests: ["juice"]
  },
  {
    id: "c1-new-fruit",
    chapter: 0,
    title: "\u6362\u4E00\u79CD\u6C34\u679C",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u5154\u5154\u56DE\u6765\u4E86\uFF0C\u60F3\u5C1D\u6628\u5929\u6CA1\u9009\u7684\u9999\u8549\u3002",
    objective: "\u628A\u9999\u8549\u76F4\u63A5\u88C5\u76D8\uFF1B\u98DF\u7269\u5148\u548C\u58F0\u97F3\u89C1\u9762\u3002",
    result: "\u5154\u5154\u53D1\u73B0\u8BD5\u65B0\u5473\u9053\u4E5F\u5F88\u5F00\u5FC3\u3002",
    requests: ["banana"]
  },
  {
    id: "c1-two-friends",
    chapter: 0,
    title: "\u4E24\u4F4D\u670B\u53CB",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u4E24\u4F4D\u670B\u53CB\u540C\u65F6\u6765\uFF0C\u4E00\u4F4D\u60F3\u8981\u6DF7\u5408\u6C34\u679C\uFF0C\u4E00\u4F4D\u60F3\u559D\u9999\u8549\u6C41\u3002",
    objective: "\u51B3\u5B9A\u5148\u62DB\u547C\u8C01\uFF0C\u518D\u5B8C\u6210\u4E24\u4EFD\u4E0D\u540C\u8BF7\u6C42\u3002",
    result: "\u5148\u88AB\u7167\u987E\u7684\u670B\u53CB\u5E2E\u53E6\u4E00\u4F4D\u62FF\u4F4F\u4E86\u82B1\u76C6\u3002",
    requests: ["fruit", "banana-juice"],
    choice: {
      prompt: "\u5148\u5E2E\u8C01\uFF1F",
      labels: ["\u5148\u5E2E\u5154\u5154\u51C6\u5907\u6C34\u679C", "\u5148\u5E2E\u523A\u523A\u69A8\u9999\u8549\u6C41"],
      alternate: ["banana-juice", "fruit"],
      responses: ["\u5154\u5154\u5148\u628A\u6C34\u679C\u63A5\u597D\uFF0C\u7B49\u523A\u523A\u7684\u679C\u6C41\u3002", "\u523A\u523A\u5148\u559D\u4E0A\u679C\u6C41\uFF0C\u518D\u5E2E\u5154\u5154\u62FF\u6C34\u679C\u3002"]
    }
  },
  {
    id: "c1-window-flower",
    chapter: 0,
    title: "\u7A97\u53F0\u7684\u5C0F\u82B1",
    who: "\u957F\u8F88\u4E0E\u5154\u5154",
    visitors: ["elder", "rabbit"],
    situation: "\u5154\u5154\u5E26\u6765\u4E00\u76C6\u5C0F\u82B1\uFF0C\u957F\u8F88\u770B\u7740\u7B2C\u4E00\u5929\u7684\u8425\u4E1A\u3002",
    objective: "\u51C6\u5907\u4E24\u53EA\u82F9\u679C\u548C\u4E00\u676F\u679C\u6C41\uFF0C\u62DB\u547C\u65B0\u670B\u53CB\u3002",
    result: "\u5C0F\u82B1\u653E\u4E0A\u7A97\u53F0\u3002\u65E7\u98DF\u8C31\u5939\u7740\u4E00\u5F20\u5199\u7740\u201C\u6811\u836B\u201D\u7684\u7EB8\u6761\u3002",
    requests: ["two", "juice"],
    followUp: {
      from: "c1-two-friends",
      alternate: ["two", "banana-juice"],
      visitors: ["elder", "hedgehog"],
      situation: "\u4E0A\u6B21\u5148\u559D\u5230\u9999\u8549\u6C41\u7684\u523A\u523A\u5E26\u6765\u5C0F\u82B1\uFF0C\u60F3\u518D\u559D\u4E00\u676F\u3002\u957F\u8F88\u6765\u5E2E\u5FD9\u6446\u82B1\u76C6\u3002"
    }
  },
  {
    id: "c2-cup",
    chapter: 1,
    title: "\u6811\u836B\u4E0B\u7684\u676F\u5B50",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u5154\u5154\u5E26\u7740\u540C\u4F34\u56DE\u6765\uFF0C\u60F3\u7528\u676F\u5B50\u63A5\u4E00\u7403\u9999\u8349\u3002",
    objective: "\u9009\u676F\u3001\u4E00\u7403\u9999\u8349\u3001\u5236\u4F5C\u5E76\u9001\u51FA\u3002",
    result: "\u5154\u5154\u8BF4\uFF1A\u539F\u6765\u676F\u88C5\u4E5F\u5F88\u597D\u62FF\u3002",
    requests: ["vanilla-cup"]
  },
  {
    id: "c2-cone",
    chapter: 1,
    title: "\u86CB\u7B52\u7684\u58F0\u97F3",
    who: "\u523A\u523A",
    visitors: ["hedgehog"],
    situation: "\u523A\u523A\u559C\u6B22\u8FB9\u8D70\u8FB9\u5403\uFF0C\u60F3\u62FF\u86CB\u7B52\u3002",
    objective: "\u9009\u86CB\u7B52\u548C\u9999\u8349\uFF0C\u505A\u5B8C\u540E\u4EA4\u7ED9\u523A\u523A\u3002",
    result: "\u523A\u523A\u6307\u7740\u6811\u4E0A\u7684\u5F69\u65D7\uFF0C\u8BF4\u8FD8\u7F3A\u4E00\u89D2\u3002",
    requests: ["vanilla-cone"]
  },
  {
    id: "c2-flavor",
    chapter: 1,
    title: "\u4E0D\u4E00\u6837\u7684\u53E3\u5473",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u6811\u836B\u4E0B\uFF0C\u5154\u5154\u8FD9\u6B21\u60F3\u8BD5\u8349\u8393\u5473\u3002",
    objective: "\u676F\u88C5\u4E0D\u53D8\uFF0C\u6539\u9009\u8349\u8393\u7403\u3002",
    result: "\u5154\u5154\u8BB0\u4F4F\u4E86\u81EA\u5DF1\u9009\u7684\u65B0\u5473\u9053\u3002",
    requests: ["strawberry-cup"]
  },
  {
    id: "c2-two-scoops",
    chapter: 1,
    title: "\u4E00\u7403\u518D\u4E00\u7403",
    who: "\u523A\u523A",
    visitors: ["hedgehog"],
    situation: "\u523A\u523A\u8981\u8BF7\u540C\u4F34\uFF0C\u60F3\u628A\u4E24\u79CD\u5473\u9053\u653E\u5728\u540C\u4E00\u676F\u3002",
    objective: "\u676F\u4E2D\u653E\u9999\u8349\u548C\u8349\u8393\u4E24\u7403\uFF0C\u660E\u786E\u5236\u4F5C\u3002",
    result: "\u523A\u523A\u628A\u5F69\u65D7\u7CFB\u5728\u6811\u836B\u65C1\u3002",
    requests: ["double-cream"]
  },
  {
    id: "c2-topping",
    chapter: 1,
    title: "\u65D7\u5B50\u4E0B\u9762",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u5F69\u65D7\u6302\u597D\u4E86\u3002\u4E24\u4F4D\u670B\u53CB\u7684\u8981\u6C42\u4ECD\u7136\u4E0D\u540C\u3002",
    objective: "\u505A\u9999\u8549\u914D\u6599\u51B0\u6DC7\u6DCB\uFF0C\u518D\u505A\u86CB\u7B52\uFF1B\u5148\u540E\u7531\u4F60\u5B89\u6392\u3002",
    result: "\u5F69\u65D7\u7559\u5728\u5C0F\u9662\u3002\u5154\u5154\u8BF4\u4E0B\u6B21\u8981\u5E26\u91CE\u9910\u7BEE\u3002",
    requests: ["banana-cream", "vanilla-cone"]
  },
  {
    id: "c3-bread",
    chapter: 2,
    title: "\u91CE\u9910\u7BEE\u6253\u5F00\u4E86",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u5154\u5154\u5E26\u6765\u7BEE\u5B50\uFF0C\u60F3\u628A\u829D\u58EB\u5939\u8FDB\u9762\u5305\u3002",
    objective: "\u51C6\u5907\u4E24\u7247\u9762\u5305\u548C\u829D\u58EB\uFF0C\u76D6\u5408\u4E09\u660E\u6CBB\u3002",
    result: "\u5154\u5154\u5728\u6811\u4E0B\u627E\u5230\u4E86\u91CE\u9910\u7684\u4F4D\u7F6E\u3002",
    requests: ["sandwich"]
  },
  {
    id: "c3-garden",
    chapter: 2,
    title: "\u83DC\u56ED\u91CC\u7684\u989C\u8272",
    who: "\u523A\u523A",
    visitors: ["hedgehog"],
    situation: "\u523A\u523A\u5E26\u6765\u751F\u83DC\u548C\u756A\u8304\uFF0C\u60F3\u8BD5\u53E6\u4E00\u79CD\u5939\u5C42\u3002",
    objective: "\u7528\u4E24\u7247\u9762\u5305\u3001\u751F\u83DC\u548C\u756A\u8304\u505A\u4E09\u660E\u6CBB\u3002",
    result: "\u523A\u523A\u60F3\u628A\u8FD9\u4EFD\u5E26\u7ED9\u6B63\u5728\u5E03\u7F6E\u5C0F\u9662\u7684\u957F\u8F88\u3002",
    requests: ["salad-sandwich"]
  },
  {
    id: "c3-drink",
    chapter: 2,
    title: "\u91CE\u9910\u8FD8\u7F3A\u4E00\u676F",
    who: "\u5154\u5154\u4E0E\u957F\u8F88",
    visitors: ["rabbit", "elder"],
    situation: "\u4E09\u660E\u6CBB\u5FEB\u597D\u4E86\uFF0C\u957F\u8F88\u8FD8\u60F3\u8981\u4E00\u676F\u679C\u6C41\u3002",
    objective: "\u5206\u522B\u5B89\u6392\u4E09\u660E\u6CBB\u548C\u679C\u6C41\uFF1B\u7B49\u5F85\u52A0\u5DE5\u65F6\u53EF\u51C6\u5907\u53E6\u4E00\u76D8\u3002",
    result: "\u957F\u8F88\u94FA\u5F00\u4E00\u89D2\u65E7\u684C\u5E03\uFF0C\u7559\u7ED9\u5927\u5BB6\u5750\u3002",
    requests: ["sandwich", "juice"]
  },
  {
    id: "c3-extra",
    chapter: 2,
    title: "\u518D\u5E26\u4E00\u4EFD\u6C34\u679C",
    who: "\u523A\u523A",
    visitors: ["hedgehog", "rabbit"],
    situation: "\u523A\u523A\u5728\u5F00\u5DE5\u524D\u8865\u5145\u91CE\u9910\u9700\u8981\u7684\u6C34\u679C\uFF0C\u4E0D\u6539\u53D8\u5DF2\u63A5\u8BA2\u5355\u3002",
    objective: "\u628A\u852C\u83DC\u4E09\u660E\u6CBB\u4E0E\u6DF7\u5408\u6C34\u679C\u5206\u522B\u9001\u597D\u3002",
    result: "\u523A\u523A\u5E2E\u5154\u5154\u628A\u91CE\u9910\u7BEE\u653E\u4E0A\u684C\u3002",
    requests: ["salad-sandwich", "fruit"]
  },
  {
    id: "c3-tablecloth",
    chapter: 2,
    title: "\u65E7\u684C\u5E03\u7684\u65B0\u4F4D\u7F6E",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u5927\u5BB6\u60F3\u8BD5\u4E24\u79CD\u5939\u5C42\u3002\u65E7\u684C\u5E03\u521A\u597D\u94FA\u6EE1\u5C0F\u9662\u684C\u5B50\u3002",
    objective: "\u5B8C\u6210\u4E24\u4EFD\u4E0D\u540C\u4E09\u660E\u6CBB\uFF0C\u5B89\u6392\u6258\u76D8\u3002",
    result: "\u684C\u5E03\u7559\u5728\u5C0F\u9662\u3002\u957F\u8F88\u8BF4\u9EC4\u660F\u4F1A\u6709\u4EBA\u5E26\u706F\u6765\u3002",
    requests: ["sandwich", "salad-sandwich"]
  },
  {
    id: "c4-grill",
    chapter: 3,
    title: "\u714E\u53F0\u70B9\u4EAE\u4E86",
    who: "\u523A\u523A",
    visitors: ["hedgehog"],
    situation: "\u9EC4\u660F\uFF0C\u523A\u523A\u60F3\u5403\u4E00\u4E2A\u6709\u751F\u83DC\u548C\u756A\u8304\u7684\u6C49\u5821\u3002",
    objective: "\u714E\u719F\u8089\u997C\uFF0C\u518D\u4E0E\u9762\u5305\u548C\u852C\u83DC\u7EC4\u88C5\u3002",
    result: "\u523A\u523A\u8BF4\u9999\u5473\u8BA9\u8DEF\u8FC7\u7684\u670B\u53CB\u505C\u4E86\u4E0B\u6765\u3002",
    requests: ["burger"]
  },
  {
    id: "c4-cheese",
    chapter: 3,
    title: "\u829D\u58EB\u7684\u90A3\u4EFD",
    who: "\u5154\u5154",
    visitors: ["rabbit"],
    situation: "\u5154\u5154\u60F3\u5403\u829D\u58EB\u6C49\u5821\uFF0C\u548C\u523A\u523A\u7684\u5939\u5C42\u4E0D\u540C\u3002",
    objective: "\u714E\u997C\u540E\u6362\u829D\u58EB\u7EC4\u88C5\u3002",
    result: "\u5154\u5154\u5E2E\u5FD9\u628A\u7B2C\u4E00\u76CF\u5C0F\u706F\u6302\u8D77\u6765\u3002",
    requests: ["cheese-burger"]
  },
  {
    id: "c4-wait",
    chapter: 3,
    title: "\u714E\u997C\u7684\u65F6\u5019",
    who: "\u523A\u523A\u4E0E\u957F\u8F88",
    visitors: ["hedgehog", "elder"],
    situation: "\u8089\u997C\u5728\u714E\u53F0\u4E0A\uFF0C\u957F\u8F88\u4E5F\u60F3\u8981\u4E00\u4E2A\u82F9\u679C\u3002",
    objective: "\u714E\u997C\u7B49\u5F85\u65F6\u53EF\u7ED9\u53E6\u4E00\u76D8\u51C6\u5907\u82F9\u679C\u3002",
    result: "\u957F\u8F88\u8BF4\uFF1A\u4F60\u5DF2\u7ECF\u4F1A\u5B89\u6392\u53A8\u623F\u4E86\u3002",
    requests: ["burger", "apple"]
  },
  {
    id: "c4-two-boards",
    chapter: 3,
    title: "\u5148\u505A\u54EA\u4E00\u4EFD",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u6709\u4EBA\u60F3\u5403\u829D\u58EB\u6C49\u5821\uFF0C\u4E5F\u6709\u4EBA\u8981\u4E09\u660E\u6CBB\u3002",
    objective: "\u9009\u62E9\u5148\u51C6\u5907\u54EA\u4E00\u4EFD\uFF0C\u5E76\u8BA9\u714E\u53F0\u548C\u7EC4\u5408\u677F\u8854\u63A5\u3002",
    result: "\u5148\u62FF\u5230\u98DF\u7269\u7684\u670B\u53CB\u5E2E\u53E6\u4E00\u4F4D\u6446\u597D\u9910\u5177\u3002",
    requests: ["cheese-burger", "sandwich"],
    choice: {
      prompt: "\u5148\u5B89\u6392\u54EA\u4EFD\uFF1F",
      labels: ["\u5148\u714E\u6C49\u5821\u8089\u997C", "\u5148\u51C6\u5907\u4E09\u660E\u6CBB"],
      alternate: ["sandwich", "cheese-burger"],
      responses: ["\u5154\u5154\u5728\u7B49\u714E\u997C\u65F6\u6446\u597D\u4E86\u9910\u5177\u3002", "\u523A\u523A\u5148\u62FF\u5230\u4E09\u660E\u6CBB\uFF0C\u4E5F\u5E2E\u5154\u5154\u770B\u7740\u714E\u53F0\u3002"]
    }
  },
  {
    id: "c4-lights",
    chapter: 3,
    title: "\u706F\u4E32\u4EAE\u4E86",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u8001\u670B\u53CB\u5E26\u7740\u706F\u4E32\u56DE\u6765\uFF0C\u8FD8\u60F3\u5404\u8981\u4E00\u4EFD\u6C49\u5821\u3002",
    objective: "\u5206\u6E05\u4E24\u79CD\u5939\u5C42\uFF0C\u5B8C\u6210\u53CC\u5BA2\u670D\u52A1\u3002",
    result: "\u706F\u4EAE\u65F6\uFF0C\u670B\u53CB\u4EEC\u8BF4\u51FA\u4E86\u79D8\u5BC6\uFF1A\u6B22\u8FCE\u5927\u54AA\u7B2C\u4E00\u6B21\u72EC\u7ACB\u5F00\u5E97\u3002\u5927\u54AA\u51B3\u5B9A\u529E\u5C0F\u98DF\u4F1A\u3002",
    requests: ["burger", "cheese-burger"],
    followUp: {
      from: "c4-two-boards",
      alternate: ["sandwich", "cheese-burger"],
      visitors: ["hedgehog", "rabbit"],
      situation: "\u4E0A\u6B21\u5148\u62FF\u5230\u4E09\u660E\u6CBB\u7684\u523A\u523A\u5E26\u7740\u706F\u4E32\u56DE\u6765\uFF0C\u60F3\u518D\u8981\u4E00\u4EFD\u3002\u5154\u5154\u8FD8\u60F3\u5403\u829D\u58EB\u6C49\u5821\u3002"
    }
  },
  {
    id: "c5-invite",
    chapter: 4,
    title: "\u5927\u54AA\u53D1\u51FA\u9080\u8BF7",
    who: "\u5927\u54AA\u4E0E\u957F\u8F88",
    visitors: ["elder", "rabbit"],
    situation: "\u5927\u54AA\u7FFB\u5F00\u65E7\u98DF\u8C31\u672A\u5199\u5B8C\u7684\u201C\u793E\u533A\u5C0F\u98DF\u4F1A\u201D\u4E00\u9875\uFF0C\u4E3B\u52A8\u9080\u8BF7\u90BB\u5C45\u3002",
    objective: "\u5148\u7ED9\u5E2E\u5FD9\u7684\u670B\u53CB\u51C6\u5907\u679C\u6C41\u548C\u6C34\u679C\u3002",
    result: "\u957F\u8F88\u628A\u7B14\u4EA4\u7ED9\u5927\u54AA\uFF1A\u6700\u540E\u4E00\u9875\u7531\u4F60\u6765\u5199\u3002",
    requests: ["juice", "fruit"]
  },
  {
    id: "c5-arrivals",
    chapter: 4,
    title: "\u684C\u5E03\u548C\u5F69\u65D7",
    who: "\u5154\u5154\u4E0E\u523A\u523A",
    visitors: ["rabbit", "hedgehog"],
    situation: "\u5154\u5154\u5E26\u7740\u5F69\u65D7\uFF0C\u523A\u523A\u94FA\u597D\u684C\u5E03\u3002",
    objective: "\u4E3A\u4E24\u4F4D\u670B\u53CB\u5206\u522B\u51C6\u5907\u51B0\u6DC7\u6DCB\u548C\u4E09\u660E\u6CBB\u3002",
    result: "\u5C0F\u9662\u7684\u82B1\u3001\u5F69\u65D7\u548C\u684C\u5E03\u90FD\u56DE\u5230\u4E86\u670B\u53CB\u8EAB\u8FB9\u3002",
    requests: ["vanilla-cup", "sandwich"]
  },
  {
    id: "c5-help",
    chapter: 4,
    title: "\u706F\u5149\u4E0B\u7684\u534F\u4F5C",
    who: "\u957F\u8F88\u4E0E\u5154\u5154",
    visitors: ["elder", "rabbit"],
    situation: "\u706F\u4E32\u4EAE\u4E86\uFF0C\u957F\u8F88\u770B\u7740\u714E\u53F0\uFF0C\u5154\u5154\u6446\u597D\u676F\u5B50\u3002",
    objective: "\u7B49\u5F85\u8089\u997C\u65F6\u51C6\u5907\u9999\u8549\u6C41\uFF0C\u6216\u5148\u505A\u53E6\u4E00\u4EFD\u3002",
    result: "\u5927\u54AA\u628A\u51C6\u5907\u987A\u5E8F\u5B89\u6392\u6E05\u695A\uFF0C\u957F\u8F88\u653E\u5FC3\u5750\u4E0B\u3002",
    requests: ["cheese-burger", "banana-juice"]
  },
  {
    id: "c5-everyone",
    chapter: 4,
    title: "\u6BCF\u4E2A\u4EBA\u90FD\u4E0D\u4E00\u6837",
    who: "\u523A\u523A\u4E0E\u5154\u5154",
    visitors: ["hedgehog", "rabbit"],
    situation: "\u670B\u53CB\u4EEC\u6709\u5404\u81EA\u559C\u6B22\u7684\u53E3\u5473\u4E0E\u642D\u914D\u3002",
    objective: "\u5B8C\u6210\u53CC\u7403\u51B0\u6DC7\u6DCB\u548C\u852C\u83DC\u4E09\u660E\u6CBB\uFF0C\u5206\u7ED9\u5BF9\u5E94\u5BA2\u4EBA\u3002",
    result: "\u5154\u5154\u60F3\u8D77\u7B2C\u4E00\u6B21\u53EA\u6562\u8981\u82F9\u679C\uFF0C\u7B11\u7740\u8BF4\u4ECA\u5929\u60F3\u8BD5\u66F4\u591A\u3002",
    requests: ["double-cream", "salad-sandwich"]
  },
  {
    id: "c5-last-page",
    chapter: 4,
    title: "\u98DF\u8C31\u6700\u540E\u4E00\u9875",
    who: "\u5927\u54AA\u4E0E\u6240\u6709\u670B\u53CB",
    visitors: ["rabbit", "hedgehog", "elder"],
    situation: "\u65E7\u98DF\u8C31\u7684\u6700\u540E\u4E00\u9875\u8FD8\u7A7A\u7740\u3002\u5C0F\u9662\u91CC\u82B1\u3001\u5F69\u65D7\u3001\u684C\u5E03\u4E0E\u706F\u90FD\u9F50\u4E86\u3002",
    objective: "\u7531\u5927\u54AA\u4EB2\u624B\u5B8C\u6210\u6700\u540E\u7684\u6C49\u5821\u3001\u679C\u6C41\u548C\u86CB\u7B52\u4EA4\u4ED8\u3002",
    result: "\u5927\u54AA\u5199\u4E0B\u201C\u670B\u53CB\u4EEC\u559C\u6B22\u7684\u5473\u9053\u201D\u3002\u957F\u8F88\u4E0E\u5154\u5154\u3001\u523A\u523A\u4E00\u8D77\u5408\u5F71\uFF0C\u5C0F\u98DF\u4F1A\u5F00\u573A\u4E86\u3002",
    requests: ["burger", "juice", "vanilla-cone"]
  }
];
var storyLevel = (id) => STORY_LEVELS.find((level) => level.id === id);
var storyRequests = (level, choice = 0) => choice === 1 ? level.choice?.alternate ?? level.followUp?.alternate ?? level.requests : level.requests;

// src/rules/sessions.ts
function orderFor(s2, request, index, seat, status) {
  return {
    id: `guest-${index}`,
    request,
    seat,
    status,
    remaining: 0,
    heard: false,
    revisit: Boolean(s2.history[request]?.length),
    support: s2.session.support === "demonstration" ? ["guided", "picture-request"] : s2.session.support === "pictures" ? [] : []
  };
}
function replenish(s2) {
  if (s2.session.activity !== "endless") return;
  const done = s2.orders.filter((o) => o.status === "done");
  s2.session.served += done.length;
  s2.orders = s2.orders.filter((o) => o.status !== "done");
  const pool = endlessPool(s2.session.unlocked, s2.session.language).filter(
    (r) => s2.session.menu.includes(r)
  );
  const theme = s2.session.shop?.theme ?? "all";
  const filtered = pool.filter((r) => themeAllows(theme, r));
  if (s2.session.shop?.accepting === false || !filtered.length) return;
  const max = s2.session.concurrency;
  while (s2.orders.length < max) {
    const cursor = s2.session.cursor++;
    let request = filtered[Math.floor(randomAt(s2.session.seed, cursor) * filtered.length)] ?? "apple";
    if (request === s2.session.lastRequest)
      request = filtered[(filtered.indexOf(request) + 1) % filtered.length] ?? "apple";
    const seat = [0, 1].find((seat2) => !s2.orders.some((o) => o.seat === seat2)) ?? 0;
    s2.orders.push(orderFor(s2, request, cursor, seat, "waiting"));
    s2.session.lastRequest = request;
  }
}
function applyPolicy(s2, support, concurrency) {
  s2.session.support = support;
  s2.session.concurrency = concurrency;
  s2.orders = s2.orders.map((o) => o.status === "waiting" ? { ...o } : o);
  for (const o of s2.orders) {
    if (o.status !== "waiting") continue;
    if (support === "demonstration") o.support = [.../* @__PURE__ */ new Set([...o.support, "guided"])].slice(-24);
  }
  if (concurrency === 2 && !s2.actor.current && !s2.helper && !s2.trays.some((t) => t.remaining))
    s2.mode = "service";
  if (s2.adventure?.kind === "chapter" && concurrency === 2)
    for (const order of s2.orders.filter((o) => o.status === "queued"))
      admitAdventure(s2, order.visitor);
  if (s2.mode === "service" || concurrency === 1) replenish(s2);
}
function admitAdventure(s2, visitor) {
  if (s2.adventure?.kind !== "chapter" || !visitor) return false;
  const order = s2.orders.find((o) => o.visitor === visitor && o.status === "queued");
  const active = s2.orders.filter((o) => o.status === "waiting" || o.status === "leaving");
  if (!order || active.length >= s2.session.concurrency) return false;
  const seat = [0, 1].find((seat2) => !active.some((o) => o.seat === seat2));
  if (seat === void 0) return false;
  order.seat = seat;
  order.status = "waiting";
  if (s2.session.support !== "less")
    order.support = [
      .../* @__PURE__ */ new Set([
        ...order.support,
        "picture-request",
        ...s2.session.support === "demonstration" ? ["guided"] : []
      ])
    ].slice(-24);
  return true;
}

// src/rules/adventure.ts
function startAdventure(s2, chapter, kind = "chapter") {
  const config = ADVENTURES[chapter];
  if (!config || s2.adventure || s2.items.length || s2.actor.current || s2.helper) return false;
  s2.adventure = emptyAdventure(chapter, kind);
  hydrateExperience(s2.adventure);
  if (kind === "shop") return true;
  s2.session.activity = "story";
  s2.session.chapter = chapter;
  delete s2.session.levelId;
  delete s2.session.storyChoice;
  s2.session.family = config.family;
  s2.session.unlocked = [...FAMILIES.slice(0, Math.min(chapter + 1, 4))];
  s2.mode = "service";
  s2.orders = config.orders.map((o, index) => ({
    id: `guest-${index}`,
    request: o.request,
    visitor: o.visitor,
    seat: index,
    status: s2.session.concurrency === 2 ? "waiting" : "queued",
    remaining: 0,
    heard: false,
    revisit: Boolean(s2.history[o.request]?.length),
    support: s2.session.support === "demonstration" ? ["guided"] : []
  }));
  return true;
}
function adventureReady(a) {
  const has = (step2) => a.steps.includes(step2);
  if (a.kind === "shop" || !experienceReady(a)) return false;
  const twoSeats = !!a.rewards.length || [0, 1].every(
    (seat) => a.foods.some(
      (f) => f.place === `table:${seat}` || f.place === `guest-${seat === 0 ? "rabbit" : "hedgehog"}`
    )
  );
  switch (a.chapter) {
    case 0:
      return has("served:rabbit") && has("served:hedgehog");
    case 1:
      return has("served:rabbit") && has("cool") && has("taste");
    case 2:
      return has("served:rabbit") && has("served:hedgehog") && has("cloth") && (a.branch === "rabbit" ? has("unpack") : a.branch === "hedgehog" && has("place:0") && has("place:1") && twoSeats);
    case 3:
      return has("served:rabbit") && has("served:hedgehog") && has("light") && has("place:0") && has("place:1") && twoSeats;
    case 4:
      return a.invitations.includes("rabbit") && a.invitations.includes("hedgehog") && has("create") && (!!a.rewards.length || a.foods.some((f) => f.source.startsWith("create:") && f.tasted)) && has("taste") && has("save-work") && ["place:0", "place:1", "place:2"].some(has);
    default:
      return false;
  }
}
var step = (a, id) => {
  if (!a.steps.includes(id)) a.steps.push(id);
};
function canReceiveAdventure(s2, count) {
  const pending = [s2.actor.current, ...s2.actor.queue].reduce(
    (n2, j) => n2 + (j?.kind === "delivery" ? j.itemIds.length : 0),
    0
  );
  return !s2.adventure || s2.adventure.foods.length + pending + count <= 12;
}
function adventureCommand(s2, c) {
  const a = s2.adventure;
  const result = (kind, message) => ({ kind, message });
  if (!a) return result("blocked", "\u5148\u4ECE\u5C0F\u9662\u9009\u62E9\u6D3B\u52A8\u3002");
  const has = (id) => a.steps.includes(id);
  const chapter = a.chapter;
  const complete = a.rewards.length > 0 || a.kind === "shop";
  const experienceResult = experienceCommand(s2, c);
  if (experienceResult) return experienceResult;
  if (c.action === "welcome") {
    return admitAdventure(s2, c.visitor) ? result("ok", "\u670B\u53CB\u6765\u5230\u67DC\u53F0\uFF0C\u8BF7\u542C\u542C\u9700\u8981\u3002") : result("blocked", "\u5148\u670D\u52A1\u5DF2\u63A5\u7684\u670B\u53CB\uFF0C\u6216\u9009\u62E9\u53CC\u5BA2\u63A5\u5F85\u3002");
  }
  if (c.action === "explore") {
    const object = c.object;
    if (!object || !["basket", "drawer", "recipe"].includes(object))
      return result("blocked", "\u8FD9\u4E2A\u7269\u4EF6\u6682\u65F6\u6CA1\u6709\u7EBF\u7D22\u3002");
    if (object === "drawer" && (chapter === 0 || chapter === 3) && !complete && !has("served:rabbit") && !has("served:hedgehog"))
      return result("blocked", "\u5148\u7ED9\u4E00\u4F4D\u670B\u53CB\u9001\u597D\u98DF\u54C1\uFF0C\u518D\u4E00\u8D77\u6253\u5F00\u62BD\u5C49\u3002");
    if (chapter === 2 && (object === "basket" && a.branch !== "rabbit" || object === "drawer" && a.branch !== "hedgehog"))
      return result("blocked", "\u5148\u7ED9\u670B\u53CB\u9001\u597D\u7B2C\u4E00\u4EFD\uFF0C\u518D\u4E00\u8D77\u68C0\u67E5\u3002");
    if (!a.explored.includes(object)) a.explored.push(object);
    return result(
      "ok",
      object === "basket" ? "\u7BEE\u5B50\u91CC\u8FD8\u9700\u8981\u4E00\u4EFD\u4E09\u660E\u6CBB\u548C\u4E00\u4EFD\u6C34\u679C\u3002" : object === "drawer" ? chapter === 0 ? "\u627E\u5230\u82B1\u82D7\u4E86\u3002\u9009\u4E00\u4E2A\u4F4D\u7F6E\u79CD\u4E0B\u5427\u3002" : chapter === 3 ? "\u627E\u5230\u706F\u4E32\u4E86\u3002\u6446\u597D\u4E24\u4EFD\u98DF\u7269\uFF0C\u9009\u706F\u5149\u4E00\u8D77\u5F00\u706F\u3002" : "\u62BD\u5C49\u91CC\u627E\u5230\u4E24\u4E2A\u9910\u4F4D\u3002\u7ED9\u4E24\u4F4D\u670B\u53CB\u5404\u6446\u4E00\u4EFD\u3002" : "\u65E7\u98DF\u8C31\u8BB0\u7740\uFF1A\u53EF\u4EE5\u6362\u53E3\u5473\u3001\u54C1\u5C1D\uFF0C\u4E5F\u80FD\u628A\u81EA\u5DF1\u7684\u62FC\u76D8\u4FDD\u5B58\u5230\u672B\u9875\u3002"
    );
  }
  if (c.action === "pack" || c.action === "cool" || c.action === "create") {
    if (c.tray !== 0 && c.tray !== 1) return result("blocked", "\u5148\u9009\u4E00\u53EA\u6210\u54C1\u76D8\u3002");
    if (c.action === "pack" && (chapter !== 2 || a.branch !== "rabbit" || !a.explored.includes("basket")))
      return result("blocked", "\u5148\u68C0\u67E5\u5154\u5154\u7684\u7BEE\u5B50\u3002");
    if (c.action === "cool" && chapter !== 1) return result("blocked", "\u8FD9\u4E2A\u6D3B\u52A8\u6CA1\u6709\u751C\u70B9\u59D4\u6258\u3002");
    if (c.action === "create" && !complete && chapter !== 4)
      return result("blocked", "\u5148\u5B8C\u6210\u5171\u540C\u6D3B\u52A8\uFF0C\u518D\u505A\u81EA\u5DF1\u7684\u4F5C\u54C1\u3002");
    if (c.action !== "create" && (has(c.action) || [s2.actor.current, ...s2.actor.queue].some((j) => j?.worldTarget === c.action)))
      return result("blocked", "\u8FD9\u4E00\u4EFD\u5DF2\u7ECF\u9001\u51FA\u3002");
    if (s2.trays[c.tray].remaining || s2.helper?.tray === c.tray || Object.values(s2.routing).some((t) => t && "tray" in t && t.tray === c.tray) || s2.actor.queue.length >= 3)
      return result("blocked", "\u8FD9\u53EA\u76D8\u8FD8\u5728\u5DE5\u4F5C\uFF0C\u7B49\u597D\u6216\u6362\u4E00\u53EA\u76D8\u3002");
    const items = s2.items.filter(
      (i) => i.location.startsWith(c.fromHand ? "hand:" : `tray:${c.tray}:`)
    );
    if (!items.length) return result("incomplete", "\u76D8\u91CC\u8FD8\u6CA1\u51C6\u5907\u9F50\uFF0C\u98DF\u7269\u7559\u5728\u539F\u5904\u3002");
    const products = [
      ...c.action === "pack" ? a.foods.filter((f) => f.place === "basket").map((f) => f.product) : [],
      ...items.map((i) => i.product)
    ];
    const valid = c.action === "pack" ? products.length <= 2 && products.every((p) => ["sandwich", "salad-sandwich", "apple", "banana"].includes(p)) && products.filter((p) => ["sandwich", "salad-sandwich"].includes(p)).length <= 1 && products.filter((p) => p === "apple" || p === "banana").length <= 1 : c.action === "cool" ? products.length === 1 && COOL_CHOICES.includes(products[0]) : products.length <= 3 && products.every((p) => EDIBLE.includes(p));
    if (!valid)
      return result(
        "blocked",
        c.action === "pack" ? "\u7BEE\u5B50\u9700\u8981\u4E00\u4EFD\u4E09\u660E\u6CBB\u548C\u4E00\u4EFD\u82F9\u679C\u6216\u9999\u8549\uFF0C\u98DF\u7269\u7559\u5728\u76D8\u91CC\u3002" : c.action === "cool" ? "\u53EF\u9009\u4E00\u676F\u9999\u8349\u3001\u8349\u8393\u3001\u53CC\u7403\u6216\u9999\u8549\u51B0\u6DC7\u6DCB\u3002\u5176\u4ED6\u98DF\u7269\u7559\u5728\u76D8\u91CC\u3002" : "\u5148\u628A\u53EF\u5403\u7684\u98DF\u54C1\u505A\u597D\uFF0C\u6700\u591A\u653E\u4E09\u4EFD\u3002"
      );
    if (c.action === "create" && c.visitor) {
      const need = a.experience?.needs.find((n2) => n2.visitor === c.visitor);
      if (!need || need.fulfilled.length || items.length !== 1 || !needAccepts(need, {
        ...items[0],
        source: "create",
        place: "work",
        tasted: false
      }))
        return result("blocked", "\u98DF\u54C1\u4ECD\u5728\u624B\u91CC\u3002\u5148\u542C\u670B\u53CB\u7684\u5206\u4EAB\u9700\u8981\uFF0C\u518D\u9009\u4E00\u4EFD\u5408\u9002\u98DF\u54C1\u3002");
      const seat = visitorSeat(c.visitor);
      if (a.foods.some((f) => f.place === `table:${seat}` || f.place === `guest-${c.visitor}`))
        return result("blocked", "\u9910\u4F4D\u5DF2\u6709\u98DF\u54C1\uFF0C\u53EF\u4EE5\u5148\u62FF\u56DE\u4F5C\u54C1\u533A\u3002");
    }
    if (!canReceiveAdventure(s2, items.length))
      return result("blocked", "\u6D3B\u52A8\u684C\u6EE1\u4E86\u3002\u4FDD\u5B58\u4F5C\u54C1\u540E\u6536\u62FE\u684C\u9762\u518D\u505A\u3002");
    const duration = queueActor(
      s2,
      "delivery",
      `world-${s2.nextId++}`,
      [
        { point: trayAnchor(c.tray, s2.mode), pose: "reach", hold: 220, event: "lift" },
        { point: { x: 0.5, y: 0.34 }, pose: "place", hold: 360, event: "receive" },
        { point: trayAnchor(c.tray, s2.mode), pose: "place", hold: 220, event: "return" }
      ],
      items.map((i) => i.id),
      c.tray,
      void 0,
      c.fromHand
    );
    const job = s2.actor.queue.at(-1) ?? s2.actor.current;
    if (job) {
      job.worldTarget = c.action;
      if (c.action === "create" && c.visitor) {
        job.shareWith = c.visitor;
        job.creationGroup = `sharing-${a.works.at(-1)?.id.split(":").at(-1) ?? "first"}`;
      }
      if (c.fromHand) job.fromHand = true;
    }
    for (const i of items)
      i.location = `delivery:${c.tray}:${i.location.split(":")[c.fromHand ? 1 : 2]}`;
    s2.trays[c.tray].remaining = duration;
    return result(
      "ok",
      c.action === "pack" ? "\u5927\u54AA\u6B63\u628A\u4F60\u62FF\u7684\u98DF\u54C1\u88C5\u8FDB\u91CE\u9910\u7BEE\u3002" : c.action === "cool" ? "\u5927\u54AA\u628A\u4F60\u9009\u7684\u53E3\u5473\u5E26\u5230\u6811\u836B\u4E0B\u3002" : "\u5927\u54AA\u6B63\u628A\u4F60\u7684\u4F5C\u54C1\u5E26\u5230\u6D3B\u52A8\u684C\u3002"
    );
  }
  if (c.action === "place") {
    if (c.seat !== 0 && c.seat !== 1 && c.seat !== 2) return result("blocked", "\u9009\u4E00\u4E2A\u53EF\u89C1\u9910\u4F4D\u3002");
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || food.place === "basket") return result("blocked", "\u5148\u628A\u98DF\u7269\u771F\u6B63\u9001\u5230\u6D3B\u52A8\u684C\u3002");
    if (a.foods.some((f) => f.id !== food.id && f.place === `table:${c.seat}`))
      return result("blocked", "\u8FD9\u4E2A\u9910\u4F4D\u6709\u98DF\u7269\u4E86\uFF0C\u6362\u4E00\u4E2A\u4F4D\u7F6E\u3002");
    food.place = `table:${c.seat}`;
    food.recipient = c.seat === 0 ? "rabbit" : c.seat === 1 ? "hedgehog" : "elder";
    worldMoment(s2, {
      kind: "place",
      foods: [{ id: food.id, product: food.product }],
      seat: c.seat,
      visitor: foodVisitor(food)
    });
    step(a, `place:${c.seat}`);
    return result("ok", `\u98DF\u7269\u6446\u5728${c.seat + 1}\u53F7\u9910\u4F4D\u3002`);
  }
  if (c.action === "take-decoration") {
    const allowed = {
      bunting: ["warm", "cool"],
      cloth: ["leaf", "sun"],
      light: ["warm", "moon"]
    };
    if (!allowed[c.object ?? ""]?.includes(c.value ?? ""))
      return result("blocked", "\u9009\u62E9\u5B9E\u9645\u7684\u88C5\u9970\u7269\u3002");
    if (s2.items.some((i) => i.location.startsWith("hand:")) || a.foods.some((f) => f.place === "hand") || a.experience?.heldTool || a.experience?.heldDecoration)
      return result("blocked", "\u5148\u653E\u4E0B\u624B\u4E2D\u7684\u7269\u4EF6\u3002");
    hydrateExperience(a);
    if (a.experience)
      a.experience.heldDecoration = { kind: c.object, value: c.value };
    return result("ok", "\u88C5\u9970\u5728\u624B\u91CC\u4E86\uFF0C\u70B9\u684C\u9762\u6216\u4E0A\u65B9\u6302\u7EF3\u653E\u597D\u3002");
  }
  if (c.action === "return-decoration") {
    if (a.experience) a.experience.heldDecoration = null;
    return result("ok", "\u88C5\u9970\u5DF2\u653E\u56DE\u3002");
  }
  if (c.action === "put-decoration") {
    const held = a.experience?.heldDecoration;
    if (!held) return result("blocked", "\u5148\u62FF\u8D77\u88C5\u9970\u3002");
    const placed = adventureCommand(s2, { ...c, action: held.kind, value: held.value });
    if (placed.kind === "ok" && a.experience) a.experience.heldDecoration = null;
    return placed;
  }
  if (c.action === "pickup") {
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || food.place === "basket") return result("blocked", "\u5148\u9009\u684C\u4E0A\u7684\u4E00\u4EFD\u98DF\u54C1\u3002");
    if (s2.items.some((i) => i.location.startsWith("hand:")) || a.foods.some((f) => f.place === "hand" && f.id !== food.id) || a.experience?.heldTool || a.experience?.heldDecoration)
      return result("blocked", "\u5148\u653E\u4E0B\u624B\u4E2D\u7684\u7269\u4EF6\u3002");
    food.place = "hand";
    return result("ok", `${PRODUCT_NAMES[food.product]}\u62FF\u56DE\u684C\u8FB9\u4E86\uFF0C\u53EF\u4EE5\u91CD\u65B0\u9009\u9910\u4F4D\u3002`);
  }
  if (c.action === "put-world") {
    const food = a.foods.find((f) => f.place === "hand");
    if (!food) return result("blocked", "\u624B\u91CC\u6CA1\u6709\u6D3B\u52A8\u98DF\u54C1\u3002");
    food.place = "work";
    return result("ok", "\u6D3B\u52A8\u98DF\u54C1\u653E\u5728\u4F5C\u54C1\u533A\u4E86\u3002");
  }
  if (c.action === "taste") {
    if (c.visitor !== void 0 && !["rabbit", "hedgehog", "elder"].includes(c.visitor))
      return result("blocked", "\u8BF7\u9009\u62E9\u573A\u666F\u91CC\u7684\u670B\u53CB\u3002");
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || food.place === "basket") return result("blocked", "\u5148\u628A\u4E00\u4EFD\u98DF\u7269\u5E26\u5230\u684C\u8FB9\u3002");
    if (food.tasted) return result("duplicate", "\u8FD9\u4EFD\u5DF2\u7ECF\u5C1D\u8FC7\u3002");
    food.tasted = true;
    food.tastedBy = food.recipient ?? c.visitor ?? foodVisitor(food);
    worldMoment(s2, {
      kind: "taste",
      foods: [{ id: food.id, product: food.product }],
      visitor: food.tastedBy,
      ...food.place.startsWith("table:") ? { seat: Number(food.place.slice(-1)) } : {}
    });
    step(a, "taste");
    return result(
      "ok",
      `\u670B\u53CB\u5C1D\u5230\u4E86\u4F60\u9009\u7684${PRODUCT_NAMES[food.product]}\uFF0C\u8FD9\u4E2A\u5473\u9053\u7559\u5728\u4ECA\u5929\u7684\u98DF\u8C31\u91CC\u3002`
    );
  }
  if (c.action === "save-work") {
    const source = a.foods.filter((f) => f.source.startsWith("create:")).at(-1)?.source;
    const foods = a.foods.filter((f) => f.source === source);
    if (!foods.length) return result("blocked", "\u5148\u628A\u81EA\u5DF1\u7684\u62FC\u76D8\u9001\u5230\u684C\u8FB9\u3002");
    const signature = workSignature(foods);
    if (a.works.some((w) => w.signature === signature))
      return result("duplicate", "\u8FD9\u4E2A\u4F5C\u54C1\u5DF2\u7ECF\u7559\u5728\u98DF\u8C31\u91CC\u3002");
    a.works = [
      ...a.works,
      { id: `${s2.runId}:work:${s2.nextId++}`, foods: structuredClone(foods), signature }
    ].slice(-8);
    step(a, "save-work");
    return result("ok", "\u98DF\u8C31\u4FDD\u5B58\u4E86\u5B9E\u9645\u98DF\u7269\u3001\u4F4D\u7F6E\u548C\u54C1\u5C1D\u8BB0\u5FC6\u3002");
  }
  if (c.action === "clear-table") {
    if (!complete && a.chapter !== 4) return result("blocked", "\u5148\u628A\u4ECA\u5929\u7684\u5171\u540C\u6D3B\u52A8\u5B8C\u6210\u3002");
    if (!c.confirmed) return result("confirm", "\u6536\u62FE\u540E\u98DF\u54C1\u4E0D\u4F1A\u56DE\u5230\u8425\u4E1A\u5E93\u5B58\u3002\u5148\u4FDD\u5B58\u60F3\u7559\u4E0B\u7684\u4F5C\u54C1\u3002");
    const removed = new Set(
      a.foods.filter((f) => complete || f.source.startsWith("create:")).map((f) => f.id)
    );
    a.foods = a.foods.filter((f) => !removed.has(f.id));
    if (a.experience) {
      for (const need of a.experience.needs)
        need.fulfilled = need.fulfilled.filter((id) => !removed.has(id));
      if (!complete && !a.experience.needs.some((n2) => n2.fulfilled.length))
        a.experience.used = a.experience.used.filter((x) => x !== "share");
    }
    return result("ok", "\u684C\u9762\u6536\u62FE\u597D\u4E86\uFF0C\u98DF\u8C31\u4F5C\u54C1\u4FDD\u7559\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u521B\u4F5C\u3002");
  }
  if (c.action === "invite") {
    if (!["rabbit", "hedgehog", "elder"].includes(c.visitor ?? ""))
      return result("blocked", "\u9009\u4E00\u4F4D\u719F\u6089\u7684\u670B\u53CB\u3002");
    if (chapter !== 4 && !complete) return result("blocked", "\u5148\u5B8C\u6210\u6D3B\u52A8\u518D\u9080\u8BF7\u56DE\u8BBF\u3002");
    if (!a.invitations.includes(c.visitor)) a.invitations.push(c.visitor);
    addInvitationNeed(a, c.visitor);
    return result("ok", "\u670B\u53CB\u5E26\u7740\u4E4B\u524D\u7684\u5C0F\u9662\u8BB0\u5FC6\u6765\u8D74\u7EA6\uFF0C\u4E5F\u6709\u65B0\u7684\u5206\u4EAB\u9700\u8981\u3002");
  }
  if (c.action === "plant") {
    if (chapter !== 0 && !complete || !a.explored.includes("drawer") && !complete || ![0, 1, 2].includes(Number(c.seat)))
      return result("blocked", "\u5148\u5728\u62BD\u5C49\u627E\u82B1\u82D7\uFF0C\u518D\u9009\u82B1\u7684\u4F4D\u7F6E\u3002");
    if (!complete && !a.experience?.tools.includes("seed"))
      return result("blocked", "\u5148\u628A\u82B1\u82D7\u4ECE\u62BD\u5C49\u53D6\u51FA\u6765\u3002");
    a.decor.flower = c.seat;
    if (a.experience) a.experience.heldTool = null;
    step(a, "plant");
    return result("ok", "\u8FCE\u5BA2\u82B1\u79CD\u597D\u4E86\uFF0C\u5B83\u8BA9\u65E9\u9910\u684C\u6709\u4E86\u65B0\u7684\u4F4D\u7F6E\u3002");
  }
  if (c.action === "bunting") {
    if (chapter !== 1 && !complete || !complete && (!has("cool") || !has("taste")) || !["warm", "cool"].includes(c.value ?? ""))
      return result("blocked", "\u5148\u7FFB\u65E7\u98DF\u8C31\uFF0C\u518D\u9009\u5F69\u65D7\u989C\u8272\u3002");
    if (chapter === 1 && !has("bunting")) {
      const desserts = a.foods.filter((f) => f.source === "cool" || f.source.startsWith("guest-"));
      desserts.slice(0, 2).forEach((f, seat) => {
        f.place = `table:${seat}`;
        f.recipient = seat === 0 ? "rabbit" : "hedgehog";
      });
      worldMoment(s2, {
        kind: "place",
        destination: "table",
        foods: desserts.map((f) => ({
          id: f.id,
          product: f.product,
          visitor: f.recipient ?? foodVisitor(f)
        }))
      });
    }
    a.decor.bunting = c.value;
    step(a, "bunting");
    return result("ok", "\u5F69\u65D7\u6302\u597D\u4E86\uFF0C\u670B\u53CB\u53EF\u4EE5\u5728\u8FD9\u91CC\u5206\u4EAB\u751C\u70B9\u3002");
  }
  if (c.action === "unpack") {
    if (chapter !== 2 || a.branch !== "rabbit" || !has("pack"))
      return result("blocked", "\u5148\u628A\u91CE\u9910\u7BEE\u8865\u9F50\u3002");
    const foods = a.foods.filter((f) => f.place === "basket");
    if (!foods.length) return result("duplicate", "\u7BEE\u5B50\u5DF2\u7ECF\u653E\u5230\u684C\u4E0A\u4E86\u3002");
    foods.forEach((f, i) => {
      f.place = `table:${i}`;
      f.recipient = i === 0 ? "rabbit" : "hedgehog";
    });
    worldMoment(s2, {
      kind: "place",
      destination: "table",
      foods: foods.map((f) => ({
        id: f.id,
        product: f.product,
        visitor: f.recipient ?? foodVisitor(f)
      }))
    });
    step(a, "unpack");
    return result("ok", "\u7BEE\u5B50\u6253\u5F00\u4E86\uFF0C\u5B9E\u9645\u6253\u5305\u7684\u4E24\u4EFD\u98DF\u54C1\u6446\u5230\u684C\u8FB9\u3002");
  }
  if (c.action === "cloth") {
    if (chapter !== 2 && !complete || !["leaf", "sun"].includes(c.value ?? ""))
      return result("blocked", "\u9009\u4E00\u5F20\u91CE\u9910\u684C\u5E03\u3002");
    if (!complete && !(a.branch === "rabbit" ? has("unpack") : has("place:0") && has("place:1")))
      return result("blocked", "\u5148\u628A\u4E24\u4EFD\u98DF\u7269\u6446\u597D\uFF0C\u518D\u94FA\u684C\u5E03\u3002");
    a.decor.cloth = c.value;
    step(a, "cloth");
    return result("ok", "\u684C\u5E03\u94FA\u597D\u4E86\uFF0C\u5927\u5BB6\u6709\u4E86\u53EF\u4EE5\u56F4\u5750\u7684\u91CE\u9910\u684C\u3002");
  }
  if (c.action === "light") {
    if (chapter !== 3 && !complete || !["warm", "moon"].includes(c.value ?? ""))
      return result("blocked", "\u5148\u627E\u5230\u706F\u4E32\uFF0C\u518D\u9009\u62E9\u706F\u5149\u3002");
    if (!complete && !a.experience?.used.includes("cooperate"))
      return result("blocked", "\u8BF7\u4E00\u4F4D\u670B\u53CB\u5E26\u706F\uFF0C\u518D\u70B9\u4EAE\u3002");
    a.decor.light = c.value;
    step(a, "light");
    return result("ok", "\u706F\u4EAE\u4E86\uFF0C\u665A\u9910\u684C\u7B49\u7740\u670B\u53CB\u56F4\u5750\u3002");
  }
  if (c.action === "finish") {
    if (!adventureReady(a)) return result("blocked", "\u5927\u5BB6\u8FD8\u6CA1\u51C6\u5907\u597D\uFF0C\u7EE7\u7EED\u770B\u770B\u573A\u666F\u91CC\u80FD\u505A\u4EC0\u4E48\u3002");
    const reward = ADVENTURES[chapter]?.reward;
    if (!reward) return result("blocked", "\u4ECA\u5929\u662F\u81EA\u7531\u5F00\u5E97\u3002");
    if (a.rewards.includes(reward)) return result("duplicate", "\u8FD9\u9875\u6D3B\u52A8\u5DF2\u7ECF\u8BB0\u4E0B\u4E86\u3002");
    a.rewards.push(reward);
    if (a.chapter === 2 && a.experience) a.experience.picnic = a.branch;
    for (const food of a.foods) {
      if (!food.tasted && food.place !== "basket") {
        food.tasted = true;
        food.tastedBy = food.recipient ?? foodVisitor(food);
      }
    }
    worldMoment(s2, {
      kind: "finish",
      foods: a.foods.filter((f) => f.place !== "basket").map((food) => ({
        id: food.id,
        product: food.product,
        visitor: food.tastedBy ?? foodVisitor(food)
      })),
      destination: "table"
    });
    return result("ok", "\u5927\u5BB6\u4E00\u8D77\u5F00\u5E2D\uFF01\u53EF\u4EE5\u7EE7\u7EED\u505A\u4F5C\u54C1\u3001\u5E03\u7F6E\uFF0C\u6216\u81EA\u7136\u6536\u644A\u3002");
  }
  return result("blocked", "\u8FD9\u4E2A\u52A8\u4F5C\u8FD8\u6CA1\u5F00\u653E\u3002");
}
function validAdventure(v) {
  if (!v || typeof v !== "object") return false;
  const a = v;
  const list = (v2, max) => Array.isArray(v2) && v2.length <= max && v2.every((x) => typeof x === "string" && x.length > 0 && x.length < 160) && new Set(v2).size === v2.length;
  const food = (f) => f && /^food-\d+$/.test(f.id) && EDIBLE.includes(f.product) && typeof f.source === "string" && f.source.length < 100 && [
    "guest-rabbit",
    "guest-hedgehog",
    "guest-elder",
    "basket",
    "work",
    "hand",
    "table:0",
    "table:1",
    "table:2"
  ].includes(f.place) && typeof f.tasted === "boolean" && (f.tastedBy === void 0 || f.tasted && ["rabbit", "hedgehog", "elder"].includes(f.tastedBy)) && (f.recipient === void 0 || ["rabbit", "hedgehog", "elder"].includes(f.recipient));
  return (a.experience === void 0 || validExperience(a.experience)) && Number.isInteger(a.chapter) && a.chapter >= 0 && a.chapter < 5 && ["chapter", "shop"].includes(a.kind) && (a.branch === null || a.branch === "rabbit" || a.branch === "hedgehog") && list(a.explored, 3) && a.explored.every((x) => ["basket", "drawer", "recipe"].includes(x)) && list(a.steps, 24) && a.steps.every(
    (x) => [
      "served:rabbit",
      "served:hedgehog",
      "served:elder",
      "plant",
      "cool",
      "pack",
      "unpack",
      "place:0",
      "place:1",
      "place:2",
      "taste",
      "bunting",
      "cloth",
      "light",
      "create",
      "save-work"
    ].includes(x)
  ) && list(a.rewards, 1) && a.rewards.every((r) => r === ADVENTURES[a.chapter]?.reward) && (!a.rewards.length || adventureReady(a)) && Array.isArray(a.foods) && a.foods.length <= 12 && a.foods.every(food) && a.foods.filter((f) => f.place === "hand").length <= 1 && new Set(a.foods.map((f) => f.id)).size === a.foods.length && Array.isArray(a.works) && a.works.length <= 8 && a.works.every(
    (w) => w && typeof w.id === "string" && w.id.length < 160 && Array.isArray(w.foods) && w.foods.length > 0 && w.foods.length <= 3 && w.foods.every(food) && w.signature === workSignature(w.foods)
  ) && !!a.decor && [0, 1, 2].includes(a.decor.flower) && ["warm", "cool"].includes(a.decor.bunting) && ["leaf", "sun"].includes(a.decor.cloth) && ["warm", "moon"].includes(a.decor.light) && list(a.invitations, 3) && a.invitations.every((x) => ["rabbit", "hedgehog", "elder"].includes(x));
}

// src/rules/actions.ts
var trayAnchor = (tray, mode = "service") => ({
  x: mode === "service" ? tray === 0 ? 0.205 : 0.695 : 0.45,
  y: 0.68
});
var supplyAnchor = (product) => ({
  x: product === "apple" ? 0.22 : 0.44,
  y: 0.74
});
function queueActor(s2, kind, id, stops, itemIds, tray, order, fromHand) {
  if (s2.actor.current?.kind === "return" && !s2.actor.queue.length) s2.actor.current = null;
  const previous = s2.actor.queue.at(-1) ?? s2.actor.current;
  const from = previous ? samplePlan(previous.plan, previous.plan.duration).point : s2.actor.point;
  const route = fromHand ? stops.map(
    (stop) => stop.event === "lift" ? { ...stop, point: from, hold: 120 } : stop.event === "return" ? { ...stop, point: HOME, hold: 120 } : stop
  ) : stops;
  const plan = buildPlan(
    id,
    from,
    route.map((stop, i) => i === 0 && stop.pose === "read" ? { ...stop, point: from } : stop)
  );
  if (fromHand) {
    for (const phase of plan.phases)
      if (phase.from.x !== phase.to.x || phase.from.y !== phase.to.y)
        phase.duration = Math.max(180, phase.duration * 0.65);
    plan.duration = plan.phases.reduce((sum, phase) => sum + phase.duration, 0);
  }
  const job = {
    plan,
    elapsed: 0,
    kind,
    itemIds,
    ...fromHand ? { fromHand: true } : {},
    ...tray !== void 0 ? { tray } : {},
    ...order ? { order } : {}
  };
  const delay = (s2.actor.current ? s2.actor.current.plan.duration - s2.actor.current.elapsed : 0) + s2.actor.queue.reduce((t, j) => t + j.plan.duration - j.elapsed, 0);
  if (s2.actor.current) s2.actor.queue.push(job);
  else s2.actor.current = job;
  return delay + plan.duration;
}
function cancelHelperActor(s2) {
  s2.actor.queue = s2.actor.queue.filter((j) => j.kind !== "helper");
  if (s2.actor.current?.kind === "helper") {
    s2.actor.current = null;
    const queued = s2.actor.queue;
    s2.actor.queue = [];
    for (const j of queued) {
      const stops = j.plan.phases.filter((p) => p.from.x === p.to.x && p.from.y === p.to.y).map((p) => ({
        point: p.to,
        pose: p.pose,
        hold: p.duration,
        ...p.event ? { event: p.event } : {}
      }));
      queueActor(s2, j.kind, j.plan.id, stops, j.itemIds, j.tray, j.order, j.fromHand);
      const rebased = s2.actor.queue.at(-1) ?? s2.actor.current;
      if (rebased && j.worldTarget) rebased.worldTarget = j.worldTarget;
    }
  }
  alignActionTimers(s2);
  if (!s2.actor.current)
    queueActor(s2, "return", "return", [{ point: HOME, pose: "idle", hold: 100 }], []);
}
function alignActionTimers(s2) {
  let time = 0;
  for (const j of [...s2.actor.current ? [s2.actor.current] : [], ...s2.actor.queue]) {
    time += j.plan.duration - j.elapsed;
    if (j.kind === "helper" && s2.helper) s2.helper.remaining = time;
    if (j.kind === "delivery" && j.tray !== void 0) {
      s2.trays[j.tray].remaining = time;
      const order = s2.orders.find((o) => o.id === j.order);
      if (order) order.remaining = time;
    }
  }
}

// src/rules/routing.ts
var emptyRouting = () => ({ machine: null, ice: null, board: null, grill: null });
var targetLocation = (t) => "tray" in t ? `tray:${t.tray}:${t.slot}` : `station:${t.station}:${t.slot}`;
var reserved = (s2, location) => Object.values(s2.routing).some((t) => t && targetLocation(t) === location);
function reserveOutput(s2, id, tray) {
  if (s2.routing[id]) return false;
  if (id === "grill") {
    if (["processing", "ready"].includes(s2.stations.board.status)) return false;
    const slot2 = [0, 1, 2, 3, 4].find(
      (n2) => !s2.items.some((i) => i.location === `station:board:${n2}`) && !reserved(s2, `station:board:${n2}`)
    );
    if (slot2 === void 0) return false;
    s2.routing[id] = { station: "board", slot: slot2 };
    return true;
  }
  if (s2.trays[tray].remaining || s2.mode !== "service" && tray !== 0) return false;
  const slot = [0, 1, 2].find(
    (n2) => !s2.items.some((i) => i.location === `tray:${tray}:${n2}`) && !reserved(s2, `tray:${tray}:${n2}`) && !(s2.helper?.tray === tray && s2.helper.slots.includes(n2))
  );
  if (slot === void 0) return false;
  s2.routing[id] = { tray, slot };
  return true;
}

// src/rules/cooking.ts
var stationItems = (s2, id) => s2.items.filter((i) => i.location.startsWith(`station:${id}:`));
function stationDestination(s2, id, product) {
  if (!RECIPES.some((r) => r.station === id && s2.session.unlocked.includes(r.family)))
    return { reason: "\u8FD9\u53F0\u8BBE\u5907\u7684\u505A\u6CD5\u8FD8\u6CA1\u6709\u4ECB\u7ECD\u3002" };
  const station = s2.stations[id];
  if (station.status === "processing" || station.status === "ready")
    return { reason: "\u7B49\u5236\u4F5C\u5B8C\u6210\uFF0C\u53D6\u8D70\u6210\u54C1\u540E\u518D\u51C6\u5907\u3002" };
  const items = stationItems(s2, id);
  if (id === "ice" && !items.length && product !== "cup" && product !== "cone")
    return { reason: "\u5148\u70B9\u676F\u6216\u7B52\uFF0C\u518D\u6316\u7403\u3002" };
  if (items.length >= 5) return { reason: "\u5907\u9910\u53F0\u6EE1\u4E86\uFF0C\u70B9\u9009\u539F\u6599\u653E\u56DE\u3002" };
  if (!RECIPES.some(
    (r) => r.station === id && s2.session.unlocked.includes(r.family) && r.inputs.includes(product)
  ))
    return { reason: "\u8FD9\u4EFD\u98DF\u54C1\u4E0D\u653E\u5728\u8FD9\u91CC\uFF0C\u53EF\u6682\u653E\u6216\u653E\u56DE\u3002" };
  const slot = [0, 1, 2, 3, 4].find(
    (n2) => !items.some((i) => i.location === `station:${id}:${n2}`) && !reserved(s2, `station:${id}:${n2}`)
  );
  if (slot === void 0) return { reason: "\u53F0\u9762\u6EE1\u4E86\u3002" };
  return `station:${id}:${slot}`;
}
function syncStations(s2) {
  for (const id of ["ice", "board", "grill"]) {
    const st = s2.stations[id];
    if (st.status === "processing") continue;
    const items = stationItems(s2, id);
    st.status = items.length ? st.status === "ready" ? "ready" : "loaded" : "empty";
    if (!items.length) {
      st.recipe = null;
      st.remaining = 0;
    }
  }
}
function startStation(s2, id) {
  const st = s2.stations[id];
  if (st.status === "ready") return { ok: false, message: "\u642D\u914D\u5DF2\u5B8C\u6210\uFF0C\u76F4\u63A5\u62FF\u8D77\u4EA4\u4ED8\u3002" };
  if (st.status === "processing") return { ok: false, message: "\u5148\u7B49\u4E00\u7B49\u6216\u53D6\u8D70\u6210\u54C1\u3002" };
  const recipe = recipeFor(
    id,
    stationItems(s2, id).map((i) => i.product)
  );
  if (!recipe)
    return {
      ok: false,
      message: id === "grill" ? "\u653E\u4E00\u4EFD\u751F\u997C\uFF0C\u518D\u6309\u714E\u5236\u3002" : id === "ice" ? "\u8FD8\u6CA1\u63A5\u597D\uFF1A\u770B\u770B\u676F\u6216\u7B52\u3001\u7403\u6570\u4E0E\u914D\u6599\u3002\u53EF\u4EE5\u70B9\u539F\u6599\u653E\u56DE\uFF0C\u518D\u6309\u9700\u770B\u98DF\u8C31\u3002" : s2.session.family === "sandwich" ? "\u5939\u5C42\u8FD8\u6CA1\u51C6\u5907\u9F50\uFF1A\u770B\u770B\u9762\u5305\u548C\u914D\u6599\uFF0C\u53EF\u653E\u56DE\u5355\u4EFD\u518D\u76D6\u5408\u3002" : "\u6C49\u5821\u8FD8\u6CA1\u51C6\u5907\u9F50\uFF1A\u719F\u997C\u987B\u5148\u4ECE\u714E\u53F0\u6765\u5230\u7EC4\u5408\u677F\uFF0C\u518D\u68C0\u67E5\u9762\u5305\u548C\u914D\u6599\u3002"
    };
  st.recipe = recipe.id;
  st.remaining = recipe.ms;
  st.status = "processing";
  return { ok: true, message: `${recipe.action}\u5F00\u59CB\u4E86\uFF0C\u8FD8\u80FD\u51C6\u5907\u522B\u7684\u98DF\u54C1\u3002` };
}
function itemLocked(s2, item) {
  if (item.location.startsWith("delivery:")) return true;
  if (item.location.startsWith("station:"))
    return s2.stations[item.location.split(":")[1]].status === "processing";
  return false;
}
var canSupply = (product) => RAW.includes(product) || PREPARED.includes(product);

// src/rules/direct-cooking.ts
function assemble(s2, id) {
  if (id === "grill" || s2.stations[id].status !== "loaded") return false;
  const inputs = stationItems(s2, id);
  const recipe = recipeFor(
    id,
    inputs.map((i) => i.product)
  );
  if (!recipe || !s2.session.unlocked.includes(recipe.family) || !inputs[0]) return false;
  const ids = new Set(inputs.map((i) => i.id));
  s2.items = s2.items.filter((i) => !ids.has(i.id));
  s2.items.push({ id: inputs[0].id, product: recipe.output, location: `station:${id}:0` });
  s2.stations[id] = { recipe: recipe.id, status: "ready", remaining: 0 };
  return true;
}
function extendIce(s2, product) {
  const items = stationItems(s2, "ice");
  const output = items[0];
  const previous = RECIPES.find((r) => r.station === "ice" && r.output === output?.product);
  if (items.length !== 1 || !previous || !output || !recipeFor("ice", [...previous.inputs, product]))
    return false;
  s2.items = s2.items.filter((i) => i.id !== output.id);
  previous.inputs.forEach((p, slot) => {
    s2.items.push({
      id: slot === 0 ? output.id : `food-${s2.nextId++}`,
      product: p,
      location: `station:ice:${slot}`
    });
  });
  s2.stations.ice = { status: "loaded", recipe: null, remaining: 0 };
  return true;
}

// src/rules/game.ts
function createGame(runId, variant = 0, priorSupport = {}, mode = "service") {
  const requests = requestsFor(mode, variant);
  return {
    schemaVersion: 7,
    adventure: null,
    routing: emptyRouting(),
    session: {
      activity: "training",
      chapter: 0,
      support: mode === "guided" ? "demonstration" : "less",
      concurrency: mode === "service" ? 2 : 1,
      menu: Object.keys(REQUESTS),
      supplyPage: 0,
      language: "flavor",
      family: "juice",
      unlocked: ["juice"],
      seed: 1,
      cursor: 0,
      served: 0,
      lastRequest: ""
    },
    stations: {
      ice: { status: "empty", recipe: null, remaining: 0 },
      board: { status: "empty", recipe: null, remaining: 0 },
      grill: { status: "empty", recipe: null, remaining: 0 }
    },
    actor: { point: { ...HOME }, current: null, queue: [] },
    recycle: null,
    contentVersion: CONTENT_VERSION,
    mode,
    history: structuredClone(priorSupport),
    runId,
    revision: 0,
    nextId: mode === "guided" && variant === 1 ? 2 : 1,
    variant,
    gameTime: 0,
    items: mode === "guided" && variant === 1 ? [{ id: "food-1", product: "cup", location: "machine:cup" }] : [],
    orders: requests.map((request, index) => ({
      heard: false,
      revisit: Boolean(priorSupport[request]?.length),
      id: `guest-${index}`,
      request,
      seat: mode === "service" ? index : 0,
      status: mode === "service" || index === 0 ? "waiting" : "queued",
      remaining: 0,
      support: [
        .../* @__PURE__ */ new Set([
          ...mode === "guided" ? ["guided", "picture-request", ...variant === 1 ? ["guided-preparation"] : []] : []
        ])
      ]
    })),
    machine: {
      status: mode === "guided" && variant === 1 ? "loaded" : "empty",
      remaining: 0,
      jobId: null
    },
    helper: null,
    trays: [{ remaining: 0 }, { remaining: 0 }],
    receipts: [],
    attempts: [],
    audio: [],
    lessons: [],
    noteSupport: []
  };
}
var trayItems = (s2, tray) => s2.items.filter((i) => i.location.startsWith(`tray:${tray}:`));
var handItems = (s2) => s2.items.filter((i) => i.location.startsWith("hand:"));
function emptyTraySlots(s2, tray) {
  if (!MODES[s2.mode].trays.includes(tray)) return [];
  return [0, 1, 2].filter(
    (slot) => !s2.items.some((i) => i.location === `tray:${tray}:${slot}`) && !reserved(s2, `tray:${tray}:${slot}`) && !(s2.helper?.tray === tray && s2.helper.slots.includes(slot))
  );
}
function freeSlots(s2, tray) {
  const remaining = MODES[s2.mode].trays.reduce((n2, t) => n2 + emptyTraySlots(s2, t).length, 0) - handItems(s2).length;
  return emptyTraySlots(s2, tray).slice(0, Math.max(0, remaining));
}
function matchProducts(actual, expected) {
  return actual.length === expected.length && [...actual].sort().join("|") === [...expected].sort().join("|");
}
function nextId(s2, prefix) {
  return `${prefix}-${s2.nextId++}`;
}
function attempt(s2, a) {
  s2.attempts.push({
    ...a,
    id: `${s2.runId}:attempt:${s2.revision}`,
    condition: s2.mode === "guided" ? "guided" : a.support.length ? "assisted" : "independent-condition",
    visit: a.activity === "delivery" ? s2.orders.find((o) => a.input.startsWith(`${o.id}:`))?.revisit ? "revisit" : "first" : s2.noteSupport.includes("seen-in-prior-run") ? "revisit" : "first",
    audioQualified: false,
    runId: s2.runId,
    gameTime: s2.gameTime,
    retry: s2.attempts.filter(
      (t) => t.activity === a.activity && (a.activity === "note" || t.input.startsWith(a.input.split(":")[0] ?? ""))
    ).length
  });
  s2.attempts = s2.attempts.slice(-80);
}
function syncMachine(s2) {
  if (s2.machine.status === "processing" || s2.machine.status === "ready") return;
  s2.machine.status = s2.items.some((i) => i.location.startsWith("machine:")) ? "loaded" : "empty";
}
function dispatch(current, e) {
  if (e.runId !== current.runId)
    return { state: current, kind: "stale", message: "\u8FD9\u6B21\u64CD\u4F5C\u5C5E\u4E8E\u4E4B\u524D\u7684\u4E00\u5C40\u3002" };
  if (current.receipts.includes(e.id)) return { state: current, kind: "duplicate", message: "" };
  const s2 = structuredClone(current);
  s2.receipts = [...s2.receipts, e.id].slice(-64);
  const result = (kind, message) => {
    for (const o of s2.orders)
      if (o.status !== "queued" && (e.command.type === "deliver" || e.command.type === "support" && (e.command.order === "all" || e.command.order === o.id) || e.command.type === "audio" && e.command.audio.id === REQUESTS[o.request].audio && e.command.audio.status === "started"))
        s2.history[o.request] = [
          .../* @__PURE__ */ new Set([...s2.history[o.request] ?? [], ...o.support, "seen-before"])
        ].slice(-24);
    s2.revision++;
    return { state: s2, kind, message };
  };
  const c = e.command;
  if (c.type === "ingredient") {
    if (handItems(s2).length || s2.adventure?.foods.some((f) => f.place === "hand") || s2.adventure?.experience?.heldTool || s2.adventure?.experience?.heldDecoration)
      return result("blocked", "\u624B\u4E2D\u7269\u4EF6\u4ECD\u5728\u539F\u5904\u3002\u5148\u653E\u4E0B\u6216\u4EA4\u4ED8\uFF0C\u518D\u505A\u4E0B\u4E00\u4EFD\u3002");
    if (!c.target || Object.keys(c.target).length !== 1 || !("station" in c.target) && !("machine" in c.target) || !canSupply(c.product))
      return result("blocked", "\u70B9\u8BBE\u5907\u65C1\u7684\u5B9E\u9645\u539F\u6599\u3002");
    if ("machine" in c.target && !s2.session.unlocked.includes("juice"))
      return result("blocked", "\u679C\u6C41\u673A\u8FD8\u6CA1\u6709\u4ECB\u7ECD\u3002");
    return dispatch(s2, {
      ...e,
      id: `${e.id}:ingredient`,
      command: {
        type: "move",
        source: { supply: c.product },
        destination: c.target
      }
    });
  }
  if (c.type === "pickup") {
    if (s2.adventure?.foods.some((f) => f.place === "hand") || s2.adventure?.experience?.heldTool || s2.adventure?.experience?.heldDecoration)
      return result("blocked", "\u5148\u628A\u624B\u4E2D\u7684\u6D3B\u52A8\u98DF\u54C1\u6216\u5DE5\u5177\u653E\u4E0B\uFF0C\u518D\u62FF\u5236\u4F5C\u539F\u6599\u3002");
    if (!c.source || typeof c.source !== "object" || "item" in c.source === "supply" in c.source)
      return result("blocked", "\u70B9\u4E00\u4EFD\u5B9E\u9645\u98DF\u54C1\u62FF\u8D77\u3002");
    return dispatch(s2, {
      ...e,
      id: `${e.id}:pickup`,
      command: { type: "move", source: c.source, destination: { hand: true } }
    });
  }
  if (c.type === "put" || c.type === "return-hand") {
    if (c.type === "put" && (!c.target || typeof c.target !== "object" || Object.keys(c.target).length !== 1 || !["preparation", "order", "world", "tray", "machine", "station"].some(
      (k) => k in c.target
    ) || "preparation" in c.target && c.target.preparation !== true))
      return result("blocked", "\u70B9\u4E00\u4E2A\u660E\u786E\u7684\u5B9E\u9645\u76EE\u6807\u3002");
    const items = handItems(s2);
    if (!items.length) return result("blocked", "\u624B\u91CC\u8FD8\u6CA1\u6709\u98DF\u54C1\uFF0C\u5148\u62FF\u8D77\u4E00\u4EFD\u3002");
    if (c.type === "return-hand") {
      const finished = items.filter((i) => isFinished(i.product));
      if (finished.length > 1 || finished.length && s2.recycle)
        return result("blocked", "\u5148\u628A\u6210\u54C1\u653E\u5230\u5236\u4F5C\u53F0\uFF0C\u9010\u4EFD\u6536\u8D77\u6216\u6062\u590D\u5DF2\u6709\u6210\u54C1\u3002");
    }
    if (c.type === "put" && c.target && ("order" in c.target || "world" in c.target)) {
      const tray = MODES[s2.mode].trays.find(
        (t) => !s2.trays[t].remaining && s2.helper?.tray !== t && !Object.values(s2.routing).some((r) => r && "tray" in r && r.tray === t)
      );
      if (tray === void 0)
        return result("blocked", "\u9012\u9001\u4F4D\u7F6E\u6B63\u5728\u5DE5\u4F5C\u3002\u98DF\u54C1\u4ECD\u5728\u624B\u91CC\uFF0C\u7A0D\u7B49\u6216\u653E\u56DE\u5236\u4F5C\u53F0\u3002");
      const command = "order" in c.target ? { type: "deliver", tray, order: c.target.order, fromHand: true } : { type: "adventure", action: c.target.world, tray, fromHand: true };
      return dispatch(s2, { ...e, id: `${e.id}:offer`, command });
    }
    let candidate = s2;
    for (const [index, item] of items.entries()) {
      const prepTray = c.type === "put" && "preparation" in c.target ? MODES[candidate.mode].trays.find(
        (t) => !candidate.trays[t].remaining && emptyTraySlots(candidate, t).length
      ) : void 0;
      const destination2 = c.type === "return-hand" ? { discard: true, confirmed: true } : "preparation" in c.target ? { tray: prepTray ?? -1 } : c.target;
      if (!destination2 || typeof destination2 !== "object" || !["tray", "machine", "station", "discard"].some((key) => key in destination2))
        return result("blocked", "\u70B9\u4E00\u4E2A\u660E\u786E\u7684\u627F\u653E\u76EE\u6807\u3002");
      const r = dispatch(candidate, {
        ...e,
        id: `${e.id}:put:${index}`,
        command: { type: "move", source: { item: item.id }, destination: destination2 }
      });
      if (r.kind !== "ok") return result(r.kind, r.message);
      candidate = r.state;
    }
    return {
      state: candidate,
      kind: "ok",
      message: c.type === "return-hand" ? "\u98DF\u54C1\u5DF2\u653E\u56DE\uFF1B\u53EF\u4EE5\u7EE7\u7EED\u62FF\u53D6\u3002" : "\u98DF\u54C1\u653E\u5728\u4F60\u70B9\u7684\u4F4D\u7F6E\u4E86\u3002"
    };
  }
  if (c.type === "shop-policy") {
    if (s2.session.activity !== "endless" || typeof c.accepting !== "boolean" || !["all", "fruit", "cool", "share"].includes(c.theme) || !Array.isArray(c.menu) || !c.menu.length || c.menu.length > 50 || c.menu.some((r) => !(s2.session.knownMenu ?? s2.session.menu).includes(r)))
      return result("blocked", "\u53EA\u9009\u62E9\u5DF2\u7ECF\u4ECB\u7ECD\u7684\u83DC\u5355\uFF0C\u81F3\u5C11\u4FDD\u7559\u4E00\u9053\u3002");
    const legal = c.menu.filter((r) => themeAllows(c.theme, r));
    if (!legal.length) return result("blocked", "\u8FD9\u4E2A\u4E3B\u9898\u8FD8\u6CA1\u6709\u5DF2\u4ECB\u7ECD\u7684\u83DC\uFF0C\u5148\u9009\u5176\u4ED6\u4E3B\u9898\u3002");
    s2.session.knownMenu ??= [...s2.session.menu];
    s2.session.shop = { accepting: c.accepting, theme: c.theme };
    s2.session.menu = [...new Set(c.menu)];
    replenish(s2);
    return result(
      "ok",
      c.accepting ? "\u83DC\u5355\u4E0E\u4E3B\u9898\u7559\u7ED9\u4E0B\u4E00\u4F4D\u5BA2\u4EBA\uFF0C\u5DF2\u63A5\u8BF7\u6C42\u4FDD\u7559\u3002" : "\u62DB\u547C\u5B8C\u5DF2\u63A5\u7684\u670B\u53CB\uFF0C\u5C31\u53EF\u4EE5\u81EA\u7531\u505A\u4F5C\u54C1\u6216\u6536\u644A\u3002"
    );
  }
  if (c.type === "adventure-start")
    return result(
      startAdventure(s2, c.chapter, c.kind) ? "ok" : "blocked",
      "\u5148\u5907\u9910\uFF0C\u518D\u5230\u6D3B\u52A8\u684C\u4E00\u8D77\u51C6\u5907\u3002"
    );
  if (c.type === "adventure") {
    const r = adventureCommand(s2, c);
    return result(r.kind, r.message);
  }
  if (c.type === "supply-page") {
    if (!Number.isInteger(c.page) || !SUPPLY_PAGES[c.page])
      return result("blocked", "\u8FD9\u7BEE\u6CA1\u6709\u4F9B\u8D27\u3002");
    s2.session.supplyPage = c.page;
    return result("ok", "\u6362\u4E00\u7BEE\uFF0C\u76D8\u4E2D\u98DF\u7269\u4ECD\u4FDD\u7559\u3002");
  }
  if (c.type === "menu") {
    if (s2.session.shop)
      s2.session.knownMenu = [
        .../* @__PURE__ */ new Set([
          ...s2.session.knownMenu ?? s2.session.menu,
          ...c.requests.filter((r) => r in REQUESTS)
        ])
      ];
    s2.session.menu = [.../* @__PURE__ */ new Set([...s2.session.menu, ...c.requests.filter((r) => r in REQUESTS)])];
    s2.session.unlocked = [.../* @__PURE__ */ new Set([...s2.session.unlocked, ...c.families])];
    return result("ok", "\u65B0\u83DC\u5355\u5DF2\u7ECF\u4ECB\u7ECD\uFF0C\u4E0B\u4E00\u4F4D\u5BA2\u4EBA\u53EF\u4EE5\u9009\u62E9\u3002");
  }
  if (c.type === "language") {
    if (!["flavor", "container", "combined"].includes(c.language))
      return result("blocked", "\u8BF7\u9009\u62E9\u4E00\u79CD\u8BF7\u6C42\u65B9\u5F0F\u3002");
    s2.session.language = c.language;
    return result("ok", "\u53EA\u8C03\u6574\u65B0\u8BF7\u6C42\uFF0C\u5DF2\u63A5\u7684\u5BA2\u4EBA\u548C\u98DF\u7269\u4FDD\u7559\u3002");
  }
  if (c.type === "policy") {
    applyPolicy(s2, c.support, c.concurrency);
    return result(
      "ok",
      c.concurrency === 1 ? "\u5DF2\u63A5\u7684\u5BA2\u4EBA\u5148\u670D\u52A1\u5B8C\uFF0C\u518D\u4E00\u6B21\u63A5\u5F85\u4E00\u4F4D\u3002" : "\u6709\u7A7A\u4F4D\u65F6\u4F1A\u8FCE\u6765\u7B2C\u4E8C\u4F4D\u5BA2\u4EBA\u3002"
    );
  }
  if (c.type === "prepare-cup") {
    if (s2.machine.status === "empty" || s2.machine.status === "loaded") {
      if (!s2.items.some((i) => i.location === "machine:cup"))
        s2.items.push({ id: nextId(s2, "food"), product: "cup", location: "machine:cup" });
      syncMachine(s2);
      return result("ok", "\u7A7A\u676F\u653E\u597D\u4E86\uFF0C\u6C34\u679C\u7531\u4F60\u6765\u9009\u3002");
    }
    return result("blocked", "\u8FD9\u676F\u505A\u597D\u5E76\u53D6\u8D70\u540E\uFF0C\u518D\u653E\u65B0\u676F\u3002");
  }
  if (c.type === "support") {
    for (const o of s2.orders)
      if (c.order === "all" || o.id === c.order)
        o.support = [.../* @__PURE__ */ new Set([...o.support, c.reason])].slice(-24);
    return result("ok", "\u53EF\u4EE5\u770B\u56FE\u3001\u91CD\u542C\uFF0C\u6162\u6162\u51C6\u5907\u3002");
  }
  if (c.type === "lesson") {
    s2.lessons = [.../* @__PURE__ */ new Set([...s2.lessons, c.lesson])].slice(-24);
    return result("ok", "\u5148\u8BA4\u8BC6\uFF0C\u518D\u52A8\u624B\u3002");
  }
  if (c.type === "note-support") {
    s2.noteSupport = [.../* @__PURE__ */ new Set([...s2.noteSupport, c.reason])].slice(-24);
    return result("ok", "\u4FBF\u7B7E\u5E2E\u52A9\u5DF2\u8BB0\u5F55\u3002");
  }
  if (c.type === "audio") {
    if (c.audio.status === "completed") {
      for (const o of s2.orders)
        if (o.status === "waiting" && REQUESTS[o.request].audio === c.audio.id && c.audio.order === o.id)
          o.heard = true;
    }
    if (c.audio.status === "failed") {
      for (const o of s2.orders)
        if (o.status === "waiting" && REQUESTS[o.request].audio === c.audio.id && c.audio.order === o.id)
          o.support = [.../* @__PURE__ */ new Set([...o.support, "audio-unavailable"])].slice(-24);
    }
    if (c.audio.status === "muted" || c.audio.status === "skipped") {
      for (const o of s2.orders)
        if (o.status === "waiting" && REQUESTS[o.request].audio === c.audio.id && c.audio.order === o.id)
          o.support = [
            .../* @__PURE__ */ new Set([
              ...o.support,
              c.audio.status === "muted" ? "muted-visual" : "skipped-visual"
            ])
          ].slice(-24);
    }
    s2.audio = [...s2.audio, { ...c.audio, gameTime: s2.gameTime }].slice(-80);
    return result("ok", "");
  }
  if (c.type === "actor-anchor") {
    if ((!s2.actor.current || s2.actor.current.kind === "return") && !s2.actor.queue.length && Number.isFinite(c.point.x) && Number.isFinite(c.point.y) && c.point.x >= 0 && c.point.x <= 1 && c.point.y >= 0 && c.point.y <= 1) {
      s2.actor.point = { ...c.point };
      queueActor(
        s2,
        "return",
        `lesson-return-${s2.revision}`,
        [{ point: HOME, pose: "idle", hold: 160 }],
        []
      );
    }
    return result("ok", "");
  }
  if (c.type === "family") {
    if (!s2.session.unlocked.includes(c.family)) return result("blocked", "\u8FD9\u9053\u98DF\u8C31\u8FD8\u6CA1\u6709\u4ECB\u7ECD\u3002");
    s2.session.family = c.family;
    return result("ok", "\u5907\u9910\u53F0\u5DF2\u6362\u597D\uFF0C\u539F\u6765\u7684\u98DF\u7269\u4E0E\u8BBE\u5907\u4F1A\u7B49\u4F60\u3002");
  }
  if (c.type === "start-station") {
    if (c.tray !== void 0 && !reserveOutput(s2, c.station, c.tray))
      return result("blocked", "\u5148\u5728\u76EE\u7684\u76D8\u6216\u7EC4\u5408\u677F\u817E\u4E00\u4E2A\u4F4D\u7F6E\uFF0C\u518D\u5F00\u59CB\u3002");
    if (c.tray !== void 0 && s2.stations[c.station].status === "ready")
      return result("ok", "\u6210\u54C1\u5DF2\u505A\u597D\uFF0C\u6CBF\u539F\u76EE\u7684\u4F4D\u7F6E\u627F\u653E\u3002");
    const r = startStation(s2, c.station);
    if (!r.ok) s2.routing[c.station] = null;
    return result(r.ok ? "ok" : "blocked", r.message);
  }
  if (c.type === "restore-cleared") {
    if (!s2.recycle) return result("blocked", "\u6CA1\u6709\u7B49\u5F85\u6062\u590D\u7684\u6210\u54C1\u3002");
    const slot = freeSlots(s2, c.tray)[0];
    if (slot === void 0 || s2.trays[c.tray].remaining)
      return result("blocked", "\u5148\u5728\u5236\u4F5C\u627F\u653E\u533A\u817E\u4E00\u4E2A\u4F4D\u7F6E\u3002");
    s2.items.push({ ...s2.recycle, location: `tray:${c.tray}:${slot}` });
    s2.recycle = null;
    return result("ok", "\u6210\u54C1\u56DE\u5230\u5236\u4F5C\u627F\u653E\u533A\u4E86\u3002");
  }
  if (c.type === "move") {
    const source = c.source;
    const existing = "item" in source ? s2.items.find((i) => i.id === source.item) : void 0;
    if ("item" in c.source && !existing) return result("blocked", "\u7269\u54C1\u5DF2\u4E0D\u5728\u539F\u5904\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002");
    const product = existing?.product ?? ("supply" in c.source ? c.source.supply : "apple");
    if (!existing && !canSupply(product)) return result("blocked", "\u6210\u54C1\u9700\u8981\u5728\u5DE5\u4F5C\u53F0\u5236\u4F5C\u3002");
    if (existing && itemLocked(s2, existing))
      return result("blocked", "\u98DF\u7269\u6B63\u5728\u5236\u4F5C\u6216\u9012\u4EA4\uFF0C\u7A0D\u7B49\u5C31\u597D\u3002");
    if (existing?.location === "helper")
      return result("blocked", "\u5927\u54AA\u8FD8\u5728\u62FF\u8FD9\u4EFD\u6C34\u679C\uFF0C\u53EF\u4EE5\u53D6\u6D88\u4FBF\u7B7E\u3002");
    if (existing?.location.startsWith("machine:") && s2.machine.status === "processing")
      return result("blocked", "\u679C\u6C41\u6B63\u5728\u5236\u4F5C\uFF0C\u7B49\u676F\u5B50\u88C5\u597D\u518D\u62FF\u3002");
    if (existing?.location.startsWith("tray:")) {
      const tray = Number(existing.location.split(":")[1]);
      if (s2.trays[tray].remaining > 0)
        return result("blocked", "\u6B63\u5728\u9012\u9001\uFF1B\u53EF\u4EE5\u5148\u653E\u56DE\u624B\u4E2D\u7269\uFF0C\u7B49\u4E00\u4E0B\u518D\u6682\u653E\u3002");
    }
    if ("discard" in c.destination) {
      if (!existing) return result("blocked", "\u653E\u56DE\u5C31\u597D\uFF0C\u4E0D\u9700\u8981\u4ECE\u539F\u6599\u683C\u6E05\u7406\u3002");
      if (isFinished(product) && !c.destination.confirmed)
        return result("confirm", "\u8981\u6536\u8D77\u8FD9\u4EFD\u6210\u54C1\u5E76\u91CD\u65B0\u51C6\u5907\u5417\uFF1F");
      if (isFinished(product)) s2.recycle = { ...existing, location: "recycle" };
      if (existing.location.startsWith("machine:")) s2.routing.machine = null;
      if (existing.location.startsWith("station:"))
        s2.routing[existing.location.split(":")[1]] = null;
      s2.items = s2.items.filter((i) => i.id !== existing.id);
      if (s2.machine.status === "ready" && existing.location === "machine:cup")
        s2.machine = { status: "empty", remaining: 0, jobId: null };
      syncMachine(s2);
      syncStations(s2);
      return result(
        "ok",
        isFinished(product) ? "\u6210\u54C1\u5DF2\u6536\u8D77\uFF0C\u53EF\u4EE5\u6062\u590D\u6216\u91CD\u65B0\u5236\u4F5C\u3002" : "\u5DF2\u653E\u56DE\u539F\u6599\u3002"
      );
    }
    if ("station" in c.destination && c.destination.station === "ice" && s2.stations.ice.status === "ready") {
      const candidate = structuredClone(s2);
      if (!extendIce(candidate, product))
        return result("blocked", "\u8FD9\u4EFD\u642D\u914D\u4FDD\u6301\u539F\u6837\u3002\u53EF\u4EE5\u62FF\u8D70\uFF0C\u4E5F\u53EF\u653E\u56DE\u53E6\u505A\u3002");
      const r = dispatch(candidate, { ...e, id: `${e.id}:extend`, command: c });
      return r.kind === "ok" ? r : result(r.kind, r.message);
    }
    const location = destination(s2, c.destination, product, existing);
    if (typeof location !== "string") return result("blocked", location.reason);
    if (existing) {
      const fromMachine = existing.location === "machine:cup" && s2.machine.status === "ready";
      if (existing.location.startsWith("machine:")) s2.routing.machine = null;
      if (existing.location.startsWith("station:"))
        s2.routing[existing.location.split(":")[1]] = null;
      existing.location = location;
      if (fromMachine) s2.machine = { status: "empty", remaining: 0, jobId: null };
    } else s2.items.push({ id: nextId(s2, "food"), product, location });
    syncMachine(s2);
    syncStations(s2);
    if ("station" in c.destination && assemble(s2, c.destination.station))
      return result("ok", "\u4F60\u9009\u7684\u642D\u914D\u505A\u597D\u4E86\u3002\u53EF\u4EE5\u7EE7\u7EED\u6316\u7403\u6216\u62FF\u8D77\u4EA4\u4ED8\u3002");
    return result("ok", placementMessage(location, product));
  }
  if (c.type === "start-machine") {
    if (s2.machine.status === "processing")
      return result("blocked", "\u6B63\u5728\u5236\u4F5C\uFF0C\u4F60\u8FD8\u53EF\u4EE5\u51C6\u5907\u522B\u7684\u98DF\u54C1\u3002");
    if (s2.machine.status === "ready") return result("blocked", "\u5148\u62FF\u8D70\u6210\u54C1\uFF0C\u624D\u80FD\u518D\u505A\u4E00\u676F\u3002");
    if (!s2.items.some(
      (i) => i.location === "machine:apple" && ["apple", "banana"].includes(i.product)
    ))
      return result("blocked", "\u5148\u628A\u6C34\u679C\u653E\u8FDB\u4E0A\u9762\u7684\u5165\u53E3\u3002");
    if (!s2.items.some((i) => i.location === "machine:cup" && i.product === "cup"))
      return result("blocked", "\u8FD8\u7F3A\u4E00\u4E2A\u7A7A\u676F\uFF0C\u653E\u5230\u51FA\u6C41\u53E3\u4E0B\u3002");
    if (c.tray !== void 0 && !reserveOutput(s2, "machine", c.tray))
      return result("blocked", "\u5148\u5728\u8FD9\u53EA\u76D8\u91CC\u817E\u4E00\u4E2A\u4F4D\u7F6E\uFF0C\u518D\u542F\u52A8\u3002");
    s2.machine = { status: "processing", remaining: JUICE_MS, jobId: nextId(s2, "juice") };
    return result("ok", "\u679C\u6C41\u673A\u5F00\u59CB\u4E86\u3002\u73B0\u5728\u4E5F\u80FD\u51C6\u5907\u6C34\u679C\u3002");
  }
  if (c.type === "cancel-helper") {
    if (!s2.helper) return result("blocked", "\u5927\u54AA\u73B0\u5728\u6CA1\u6709\u53D6\u6599\u4EFB\u52A1\u3002");
    const ids = s2.helper.itemIds;
    s2.items = s2.items.filter((i) => !ids.includes(i.id));
    s2.helper = null;
    cancelHelperActor(s2);
    return result("ok", "\u4FBF\u7B7E\u5DF2\u64A4\u56DE\uFF0C\u6C34\u679C\u653E\u56DE\uFF0C\u76D8\u4F4D\u5DF2\u91CA\u653E\u3002");
  }
  if (c.type === "note" || c.type === "picture-request") {
    if (!MODES[s2.mode].trays.includes(c.tray))
      return result("blocked", "\u5236\u4F5C\u627F\u653E\u533A\u6682\u65F6\u6CA1\u6709\u8FD9\u4E2A\u4F4D\u7F6E\u3002");
    if (c.type === "picture-request" && (!c.fruits.length || c.fruits.length > 2 || c.fruits.some((f) => f !== "apple" && f !== "banana")))
      return result("blocked", "\u9009\u4E00\u4EFD\u6216\u4E24\u4EFD\u6C34\u679C\u3002");
    const phrase = c.type === "note" ? parseTokens(c.tokens) : { kind: "valid", fruits: c.fruits, normalized: "picture-request" };
    if (c.type === "picture-request") {
      s2.noteSupport = [.../* @__PURE__ */ new Set([...s2.noteSupport, "picture-request"])];
      for (const o of s2.orders)
        if (o.status === "waiting") o.support = [.../* @__PURE__ */ new Set([...o.support, "picture-assistant"])];
    }
    if (phrase.kind !== "valid") {
      if (phrase.kind !== "incomplete")
        attempt(s2, {
          activity: "note",
          input: c.type === "note" ? c.tokens.join(" ") : "picture-request",
          result: phrase.kind,
          support: [...s2.noteSupport]
        });
      if (phrase.kind === "language-adjust")
        s2.noteSupport = [.../* @__PURE__ */ new Set([...s2.noteSupport, "grammar-explanation"])];
      return result(phrase.kind, phrase.message);
    }
    const slots = freeSlots(s2, c.tray);
    const blocked = s2.helper ? "\u5927\u54AA\u6B63\u5728\u53D6\u6599\u3002\u7B49\u4E00\u4E0B\uFF0C\u6216\u64A4\u56DE\u4E0A\u4E00\u5F20\u4FBF\u7B7E\u3002" : s2.trays[c.tray].remaining > 0 ? "\u5927\u54AA\u8FD8\u5728\u9012\u9001\uFF0C\u98DF\u54C1\u4F1A\u7B49\u4F60\u3002" : slots.length < phrase.fruits.length ? "\u5236\u4F5C\u627F\u653E\u533A\u4E0D\u591F\u653E\u3002\u5148\u53D6\u8D70\u5DF2\u6709\u98DF\u54C1\uFF0C\u6216\u64A4\u56DE\u4FBF\u7B7E\u3002" : "";
    if (c.type === "note")
      attempt(s2, {
        activity: "note",
        input: phrase.normalized,
        result: blocked ? "world-blocked" : "completed",
        support: [...s2.noteSupport]
      });
    if (blocked) return result("blocked", blocked);
    const items = phrase.fruits.map((product) => ({
      id: nextId(s2, "food"),
      product,
      location: "helper"
    }));
    s2.helper = {
      id: nextId(s2, "helper"),
      tray: c.tray,
      slots: slots.slice(0, items.length),
      itemIds: items.map((i) => i.id),
      remaining: queueActor(
        s2,
        "helper",
        `helper-${s2.nextId}`,
        [
          { point: s2.actor.point, pose: "read", hold: 200 },
          ...items.map((i) => ({
            point: supplyAnchor(i.product),
            pose: "reach",
            hold: 300,
            event: `pick:${i.id}`
          })),
          { point: trayAnchor(c.tray, s2.mode), pose: "place", hold: 360, event: "place" }
        ],
        items.map((i) => i.id),
        c.tray
      )
    };
    s2.items.push(...items);
    return result("ok", `\u5927\u54AA\u8BFB\u61C2\u4E86\uFF0C\u6B63\u5728\u628A\u98DF\u54C1\u5E26\u5230\u5236\u4F5C\u627F\u653E\u533A\u3002`);
  }
  if (c.type === "deliver") {
    const order = s2.orders.find((o) => o.id === c.order);
    if (order?.status !== "waiting") return result("blocked", "\u8FD9\u4F4D\u5BA2\u4EBA\u5DF2\u7ECF\u6536\u5230\u98DF\u7269\u3002");
    if (s2.trays[c.tray].remaining > 0) return result("blocked", "\u9012\u9001\u8FD8\u5728\u8FDB\u884C\uFF0C\u98DF\u54C1\u4ECD\u5728\u624B\u91CC\u3002");
    if (Object.values(s2.routing).some((t) => t && "tray" in t && t.tray === c.tray))
      return result("blocked", "\u8BBE\u5907\u9884\u7559\u7684\u4F4D\u7F6E\u8FD8\u5728\u4F7F\u7528\uFF1B\u7B49\u505A\u597D\u518D\u9012\u9001\uFF0C\u98DF\u54C1\u4F1A\u4FDD\u7559\u3002");
    if (s2.helper?.tray === c.tray)
      return result("blocked", "\u5927\u54AA\u6B63\u5728\u6309\u4FBF\u7B7E\u51C6\u5907\uFF1B\u7B49\u5B83\u653E\u597D\uFF0C\u6216\u64A4\u56DE\u4FBF\u7B7E\u3002");
    const items = c.fromHand ? handItems(s2) : trayItems(s2, c.tray);
    if (s2.actor.queue.length >= 3) return result("blocked", "\u5927\u54AA\u6B63\u5728\u9012\u9910\uFF0C\u7A0D\u7B49\u4E00\u4E0B\u3002");
    if (!canReceiveAdventure(s2, items.length))
      return result("blocked", "\u6D3B\u52A8\u684C\u6EE1\u4E86\uFF0C\u4FDD\u5B58\u4F5C\u54C1\u540E\u6536\u62FE\u518D\u9001\u3002");
    const expected = REQUESTS[order.request].products;
    if (items.length < expected.length)
      return result("incomplete", "\u98DF\u54C1\u8FD8\u6CA1\u51C6\u5907\u9F50\uFF0C\u53EF\u4EE5\u63A5\u7740\u62FF\u53D6\u3002");
    if (!order.heard)
      order.support = [.../* @__PURE__ */ new Set([...order.support, "audio-not-observed"])].slice(-24);
    const match = matchProducts(
      items.map((i) => i.product),
      expected
    );
    attempt(s2, {
      activity: "delivery",
      input: `${order.id}:${items.map((i) => i.product).join(",")}`,
      result: match ? "completed" : "request-mismatch",
      support: [...order.support]
    });
    if (!match) {
      order.support = [.../* @__PURE__ */ new Set([...order.support, "mismatch-explanation"])];
      return result(
        "mismatch",
        `${REQUESTS[order.request].explanation} ${c.fromHand ? "\u98DF\u54C1\u4ECD\u5728\u624B\u91CC" : "\u98DF\u54C1\u4ECD\u5728\u5236\u4F5C\u627F\u653E\u533A"}\uFF0C\u53EF\u4EE5\u8C03\u6574\u6216\u653E\u56DE\u3002`
      );
    }
    const duration = queueActor(
      s2,
      "delivery",
      `delivery-${order.id}`,
      [
        { point: trayAnchor(c.tray, s2.mode), pose: "reach", hold: 220, event: "lift" },
        {
          point: { x: s2.mode === "service" ? order.seat === 0 ? 0.23 : 0.69 : 0.46, y: 0.34 },
          pose: "place",
          hold: 360,
          event: "receive"
        },
        { point: trayAnchor(c.tray, s2.mode), pose: "place", hold: 220, event: "return" }
      ],
      items.map((i) => i.id),
      c.tray,
      order.id,
      c.fromHand
    );
    if (c.fromHand) {
      const job = s2.actor.queue.at(-1) ?? s2.actor.current;
      if (job) job.fromHand = true;
    }
    for (const item of items)
      item.location = `delivery:${c.tray}:${item.location.split(":")[c.fromHand ? 1 : 2]}`;
    s2.trays[c.tray].remaining = duration;
    order.status = "leaving";
    order.remaining = duration;
    return result("ok", "\u5927\u54AA\u6B63\u628A\u8FD9\u4EFD\u5FC3\u610F\u9001\u8FC7\u53BB\u3002");
  }
  return result("blocked", "\u65E0\u6CD5\u6267\u884C\u8FD9\u6B21\u64CD\u4F5C\u3002");
}
function placementMessage(location, product) {
  if (location.startsWith("hand:"))
    return `\u62FF\u8D77\u4E86${PRODUCT_NAMES[product]}\u3002\u70B9\u76EE\u6807\u653E\u4E0B\u6216\u4F7F\u7528\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u653E\u56DE\u3002`;
  if (location.startsWith("tray:"))
    return `${PRODUCT_NAMES[product]}\u653E\u5728\u5236\u4F5C\u627F\u653E\u533A\u4E86\uFF1B\u62FF\u8D77\u540E\u518D\u70B9\u63A5\u6536\u8005\u3002`;
  if (location.startsWith("machine:"))
    return product === "cup" ? "\u7A7A\u676F\u5728\u51FA\u6C41\u53E3\u3002\u6C34\u679C\u7531\u4F60\u9009\uFF0C\u673A\u5668\u505A\u597D\u540E\u4F1A\u88C5\u8FDB\u8FD9\u53EA\u676F\u3002" : `${PRODUCT_NAMES[product]}\u8FDB\u5165\u679C\u6C41\u673A\u3002\u70B9\u69A8\u6C41\uFF0C\u7B49\u5F85\u65F6\u8FD8\u53EF\u4EE5\u51C6\u5907\u522B\u7684\u98DF\u54C1\u3002`;
  const station = location.split(":")[1];
  if (station === "ice")
    return product === "cup" || product === "cone" ? `${PRODUCT_NAMES[product]}\u5DF2\u6446\u597D\u3002\u70B9\u53E3\u5473\u76F4\u63A5\u6316\u7403\u3002` : `${PRODUCT_NAMES[product]}\u653E\u8FDB\u51B0\u6DC7\u6DCB\u53F0\u3002\u7403\u6570\u4E0E\u914D\u6599\u53EF\u89C1\uFF0C\u70B9\u540C\u4E00\u4EFD\u53EF\u653E\u56DE\u3002`;
  if (station === "grill") return "\u751F\u997C\u4E0A\u714E\u53F0\u3002\u70B9\u714E\u5236\uFF0C\u7B49\u5F85\u65F6\u53EF\u5728\u7EC4\u5408\u677F\u653E\u9762\u5305\u548C\u914D\u6599\u3002";
  if (station === "board")
    return product === "cooked-patty" ? "\u719F\u997C\u5DF2\u5230\u7EC4\u5408\u677F\u3002\u52A0\u5165\u914D\u6599\u540E\u81EA\u7136\u7EC4\u5408\u3002" : `${PRODUCT_NAMES[product]}\u653E\u5728\u7EC4\u5408\u677F\u3002\u7EE7\u7EED\u53E0\u653E\u5939\u5C42\uFF0C\u6700\u540E\u653E\u9762\u5305\u81EA\u7136\u5B8C\u6210\u3002`;
  return "\u98DF\u7269\u5DF2\u653E\u597D\u3002";
}
function destination(s2, dest, product, existing) {
  if ("hand" in dest) {
    if (existing?.location.startsWith("hand:")) return { reason: "\u8FD9\u4EFD\u5DF2\u7ECF\u5728\u624B\u91CC\u3002" };
    const hands = handItems(s2);
    const room = MODES[s2.mode].trays.reduce((n2, tray) => n2 + emptyTraySlots(s2, tray).length, 0) - hands.length + (existing?.location.startsWith("tray:") ? 1 : 0);
    if (room <= 0 || hands.length >= 3)
      return { reason: "\u624B\u91CC\u6216\u627F\u653E\u533A\u6EE1\u4E86\u3002\u5148\u653E\u5230\u8BBE\u5907\u3001\u4EA4\u7ED9\u670B\u53CB\uFF0C\u6216\u76F4\u63A5\u653E\u56DE\u3002" };
    const slot = [0, 1, 2].find((n2) => !hands.some((i) => i.location === `hand:${n2}`));
    return slot === void 0 ? { reason: "\u624B\u91CC\u6EE1\u4E86\u3002" } : `hand:${slot}`;
  }
  if ("station" in dest) return stationDestination(s2, dest.station, product);
  if ("tray" in dest) {
    if (!MODES[s2.mode].trays.includes(dest.tray)) return { reason: "\u5236\u4F5C\u627F\u653E\u533A\u6682\u65F6\u6CA1\u6709\u8FD9\u4E2A\u4F4D\u7F6E\u3002" };
    if (product === "cup" && !existing?.location.startsWith("hand:"))
      return { reason: "\u7A7A\u676F\u653E\u5230\u679C\u6C41\u673A\u53F3\u4FA7\u7684\u676F\u5EA7\u3002" };
    if (s2.trays[dest.tray].remaining > 0) return { reason: "\u8FD9\u91CC\u8FD8\u5728\u9012\u9001\uFF0C\u98DF\u54C1\u4FDD\u7559\u5728\u624B\u91CC\u3002" };
    const slot = (existing?.location.startsWith("hand:") ? emptyTraySlots(s2, dest.tray) : freeSlots(s2, dest.tray))[0];
    if (slot === void 0) return { reason: "\u5236\u4F5C\u627F\u653E\u533A\u6EE1\u4E86\uFF0C\u5148\u62FF\u8D70\u4E00\u4EF6\u98DF\u54C1\u6216\u653E\u56DE\u3002" };
    return `tray:${dest.tray}:${slot}`;
  }
  if (s2.machine.status === "processing" || s2.machine.status === "ready")
    return { reason: "\u673A\u5668\u6B63\u5728\u5DE5\u4F5C\u6216\u6709\u6210\u54C1\uFF0C\u5148\u53D6\u8D70\u6210\u54C1\u3002" };
  if (dest.machine === "apple" ? !["apple", "banana"].includes(product) : product !== "cup")
    return {
      reason: dest.machine === "apple" ? "\u8FD9\u4E2A\u5165\u53E3\u653E\u82F9\u679C\u6216\u9999\u8549\u3002" : "\u8FD9\u91CC\u9700\u8981\u4E00\u4E2A\u7A7A\u676F\u3002"
    };
  const location = `machine:${dest.machine}`;
  if (s2.items.some((i) => i.location === location && i.id !== existing?.id))
    return { reason: "\u8FD9\u91CC\u5DF2\u7ECF\u653E\u597D\u4E86\uFF0C\u53EF\u4EE5\u5F00\u59CB\u5236\u4F5C\u6216\u53D6\u56DE\u3002" };
  return location;
}

// src/rules/snapshot.ts
var record = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var str = (v) => typeof v === "string" && v.length > 0 && v.length <= 240;
var number = (v, max = 1e12) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
var integer = (v, max = 1e9) => number(v, max) && Number.isInteger(v);
var strings = (v, max) => Array.isArray(v) && v.length <= max && v.every(str);
var unique = (v) => new Set(v).size === v.length;
function validateState(v) {
  if (!record(v) || v.schemaVersion !== 7 || v.contentVersion !== CONTENT_VERSION || !["guided", "practice", "service"].includes(v.mode) || !record(v.history) || Object.entries(v.history).some(([key, values]) => !(key in REQUESTS) || !strings(values, 24)) || !str(v.runId) || !integer(v.revision) || !integer(v.nextId) || v.nextId < 1 || ![0, 1].includes(v.variant) || !number(v.gameTime))
    return false;
  if (v.adventure !== null && !validAdventure(v.adventure)) return false;
  if (!Array.isArray(v.items) || v.items.length > 26 || !v.items.every(
    (i) => record(i) && str(i.id) && /^food-\d+$/.test(i.id) && Object.hasOwn(FOOD, i.product) && /^(hand:[012]|tray:[01]:[012]|machine:(apple|cup)|helper|station:(ice|board|grill):[0-4]|delivery:[01]:[012])$/.test(
      String(i.location)
    )
  ))
    return false;
  if (v.adventure) {
    const a = v.adventure;
    const hands = [
      v.items.some((i) => String(i.location).startsWith("hand:")),
      a.foods.some((f) => f.place === "hand"),
      Boolean(a.experience?.heldTool),
      Boolean(a.experience?.heldDecoration)
    ];
    if (hands.filter(Boolean).length > 1) return false;
  }
  if (!Array.isArray(v.orders) || v.orders.length < 1 && !(record(v.adventure) && v.adventure.chapter === 4) && !(record(v.session) && v.session.activity === "endless" && record(v.session.shop) && v.session.shop.accepting === false) || v.orders.length > 8 || !v.orders.every(
    (o) => record(o) && typeof o.revisit === "boolean" && typeof o.heard === "boolean" && (o.visitor === void 0 || ["rabbit", "hedgehog", "elder"].includes(String(o.visitor))) && str(o.id) && Object.keys(REQUESTS).includes(o.request) && [0, 1].includes(o.seat) && ["queued", "waiting", "leaving", "done"].includes(o.status) && number(o.remaining, 12e4) && strings(o.support, 24) && unique(o.support)
  ))
    return false;
  if (!record(v.machine) || !["empty", "loaded", "processing", "ready"].includes(v.machine.status) || !number(v.machine.remaining, JUICE_MS) || !(v.machine.jobId === null || str(v.machine.jobId)))
    return false;
  if (!Array.isArray(v.trays) || v.trays.length !== 2 || !v.trays.every((t) => record(t) && number(t.remaining, 12e4)))
    return false;
  if (v.helper !== null && (!record(v.helper) || !str(v.helper.id) || ![0, 1].includes(v.helper.tray) || !Array.isArray(v.helper.slots) || !v.helper.slots.length || v.helper.slots.length > 2 || !v.helper.slots.every((i) => [0, 1, 2].includes(i)) || !unique(v.helper.slots) || !strings(v.helper.itemIds, 2) || v.helper.itemIds.length !== v.helper.slots.length || !unique(v.helper.itemIds) || !number(v.helper.remaining, 12e4) || v.helper.remaining === 0))
    return false;
  if (!strings(v.receipts, 64) || !unique(v.receipts) || !strings(v.lessons, 24) || !strings(v.noteSupport, 24))
    return false;
  if (!Array.isArray(v.attempts) || v.attempts.length > 80 || !unique(v.attempts.map((a) => record(a) ? a.id : void 0)) || !v.attempts.every(
    (a) => record(a) && str(a.id) && ["guided", "assisted", "independent-condition"].includes(a.condition) && ["first", "revisit"].includes(a.visit) && a.audioQualified === false && str(a.runId) && ["delivery", "note"].includes(a.activity) && str(a.input) && ["completed", "world-blocked", "request-mismatch", "language-adjust", "outside"].includes(
      a.result
    ) && strings(a.support, 24) && integer(a.retry, 1e6) && number(a.gameTime)
  ))
    return false;
  if (!Array.isArray(v.audio) || v.audio.length > 80 || !v.audio.every(
    (a) => record(a) && str(a.id) && str(a.version) && (a.order === void 0 || str(a.order)) && ["started", "completed", "interrupted", "failed", "muted", "skipped"].includes(
      a.status
    ) && number(a.gameTime)
  ))
    return false;
  if (!record(v.session) || ![1, 2].includes(v.session.concurrency) || !strings(v.session.menu, 50) || !v.session.menu.length || !unique(v.session.menu) || v.session.menu.some((r) => !(r in REQUESTS)) || !["story", "endless", "training"].includes(v.session.activity) || !integer(v.session.chapter, 4) || !(v.session.levelId === void 0 || str(v.session.levelId) && storyLevel(v.session.levelId)?.chapter === v.session.chapter) || !(v.session.storyChoice === void 0 || v.session.storyChoice === 0 || v.session.storyChoice === 1) || !["demonstration", "pictures", "less"].includes(v.session.support) || !["juice", "ice", "sandwich", "burger", "ready"].includes(v.session.family) || !strings(v.session.unlocked, 5) || !unique(v.session.unlocked) || !v.session.unlocked.includes("juice") || v.session.unlocked.some((f) => !["juice", "ice", "sandwich", "burger", "ready"].includes(f)) || !integer(v.session.seed, 4294967295) || !["flavor", "container", "combined"].includes(v.session.language) || !integer(v.session.supplyPage, 3) || !integer(v.session.cursor) || !integer(v.session.served) || typeof v.session.lastRequest !== "string")
    return false;
  if (v.session.shop !== void 0 && (!record(v.session.shop) || typeof v.session.shop.accepting !== "boolean" || !["all", "fruit", "cool", "share"].includes(String(v.session.shop.theme))))
    return false;
  if (v.session.knownMenu !== void 0 && (!strings(v.session.knownMenu, 50) || !unique(v.session.knownMenu) || v.session.knownMenu.some((r) => !(r in REQUESTS))))
    return false;
  if (!record(v.routing) || Object.keys(v.routing).length !== 4) return false;
  for (const id of ["machine", "ice", "board", "grill"]) {
    const t = v.routing[id];
    if (t === null) continue;
    if (!record(t)) return false;
    if ("tray" in t) {
      if (![0, 1].includes(t.tray) || ![0, 1, 2].includes(t.slot)) return false;
    } else if (id !== "grill" || t.station !== "board" || !integer(t.slot, 4)) return false;
  }
  if (!record(v.stations)) return false;
  for (const id of ["ice", "board", "grill"]) {
    const st = v.stations[id];
    if (!record(st) || !["empty", "loaded", "processing", "ready"].includes(st.status) || !number(st.remaining, 5e3) || !(st.recipe === null || RECIPES.some((r) => r.id === st.recipe && r.station === id)))
      return false;
  }
  if (!record(v.actor) || !point(v.actor.point) || !Array.isArray(v.actor.queue) || v.actor.queue.length > 3 || !v.actor.queue.every(actorJob) || !(v.actor.current === null || actorJob(v.actor.current)))
    return false;
  if (v.recycle !== null && (!record(v.recycle) || !str(v.recycle.id) || !Object.hasOwn(FOOD, v.recycle.product) || RAW.includes(v.recycle.product) || v.recycle.location !== "recycle"))
    return false;
  const s2 = v;
  const shared = s2.items.filter(
    (i) => i.location.startsWith("hand:") || i.location.startsWith("tray:")
  ).length;
  const outputSlots = Object.values(s2.routing).filter((r) => r && "tray" in r).length;
  if (shared + (s2.helper?.slots.length ?? 0) + outputSlots > MODES[s2.mode].trays.length * 3)
    return false;
  const ids = s2.items.map((i) => i.id);
  if (s2.recycle) ids.push(s2.recycle.id);
  if (!unique(ids) || !unique(s2.items.filter((i) => i.location !== "helper").map((i) => i.location)) || s2.items.some((i) => Number(i.id.slice(5)) >= s2.nextId))
    return false;
  if (!unique(s2.orders.map((o) => o.id)) || s2.orders.some((o) => o.status === "leaving" ? o.remaining <= 0 : o.remaining !== 0))
    return false;
  if (s2.adventure && (s2.adventure.kind === "chapter" && (s2.adventure.chapter !== s2.session.chapter || s2.session.activity !== "story") || s2.adventure.foods.some((f) => s2.items.some((i) => i.id === f.id) || s2.recycle?.id === f.id)))
    return false;
  const active = s2.orders.filter((o) => o.status === "waiting" || o.status === "leaving");
  if (active.length > (s2.mode === "service" ? 2 : 1) || !unique(active.map((o) => o.seat)))
    return false;
  if (s2.session.activity === "story") {
    const oldIce = ["vanilla-cone", "strawberry-cup", "double-cream", "banana-cream"];
    const level = storyLevel(s2.session.levelId);
    const expected = s2.adventure?.kind === "chapter" ? ADVENTURES[s2.adventure.chapter]?.orders.map((o) => o.request) : level ? storyRequests(level, s2.session.storyChoice ?? 0) : s2.session.chapter === 1 && s2.orders.map((o) => o.request).join("|") === oldIce.join("|") ? oldIce : CHAPTERS[s2.session.chapter]?.requests;
    if (!expected || s2.orders.length !== expected.length || s2.orders.some((o, i) => o.request !== expected[i] || o.id !== `guest-${i}`))
      return false;
    if (s2.adventure?.kind === "chapter" && s2.orders.some(
      (o, i) => o.visitor !== ADVENTURES[s2.adventure?.chapter ?? 0]?.orders[i]?.visitor
    ))
      return false;
  } else if (s2.session.activity === "endless") {
    const pool = endlessPool(s2.session.unlocked, "combined");
    if (s2.orders.length > (s2.mode === "service" ? 2 : 1) || s2.orders.some(
      (o) => !pool.includes(o.request) || o.status === "queued" || o.status === "done" || !/^guest-\d+$/.test(o.id) || Number(o.id.slice(6)) >= s2.session.cursor
    ))
      return false;
  } else {
    const actual = s2.orders.map((o) => o.request).join("|");
    if (![
      requestsFor(s2.mode, s2.variant).join("|"),
      "apple|banana|two|fruit|juice",
      CHAPTERS[s2.session.chapter]?.requests.join("|"),
      ...s2.session.chapter === 1 ? ["vanilla-cone|strawberry-cup|double-cream|banana-cream"] : []
    ].includes(actual))
      return false;
  }
  if (!s2.session.unlocked.includes(s2.session.family) || s2.orders.some((o) => !s2.session.unlocked.includes(requestFamily(o.request))))
    return false;
  if (s2.mode !== "service" && (s2.items.some((i) => i.location.startsWith("tray:1:")) || s2.helper?.tray === 1 || s2.trays[1].remaining))
    return false;
  const targets = Object.values(s2.routing).filter((t) => t !== null);
  if (!unique(targets.map(targetLocation))) return false;
  for (const [id, target] of Object.entries(s2.routing)) {
    if (!target) continue;
    const device = id === "machine" ? s2.machine : s2.stations[id];
    if (!["processing", "ready"].includes(device.status) || s2.items.some((i) => i.location === targetLocation(target)))
      return false;
    if ("tray" in target && (s2.trays[target.tray].remaining || s2.mode !== "service" && target.tray !== 0 || s2.helper?.tray === target.tray && s2.helper.slots.includes(target.slot)))
      return false;
  }
  const apple = s2.items.find((i) => i.location === "machine:apple"), cup = s2.items.find((i) => i.location === "machine:cup");
  if (apple && !["apple", "banana"].includes(apple.product)) return false;
  if (s2.machine.status === "empty" && (apple || cup)) return false;
  if (s2.machine.status === "loaded" && (!apple && !cup || cup && cup.product !== "cup"))
    return false;
  if (s2.machine.status === "processing" && (!recipeFor("machine", [...apple ? [apple.product] : [], ...cup ? [cup.product] : []]) || !s2.machine.jobId || s2.machine.remaining <= 0))
    return false;
  if (s2.machine.status === "ready" && (apple || !cup || !["juice", "banana-juice"].includes(cup.product)))
    return false;
  if (s2.machine.status !== "processing" && (s2.machine.remaining !== 0 || s2.machine.jobId !== null))
    return false;
  for (const id of ["ice", "board", "grill"]) {
    const st = s2.stations[id], items = stationItems(s2, id), recipe = RECIPES.find((r) => r.id === st.recipe);
    if (st.status === "empty" && (items.length || st.recipe || st.remaining)) return false;
    if (st.status === "loaded" && (!items.length || st.remaining || items.some((i) => !RECIPES.some((r) => r.station === id && r.inputs.includes(i.product)))))
      return false;
    if (st.status === "processing" && (!recipe || recipeFor(
      id,
      items.map((i) => i.product)
    )?.id !== recipe.id || st.remaining <= 0 || st.remaining > recipe.ms))
      return false;
    if (st.status === "ready" && (!recipe || items.length !== 1 || items[0]?.product !== recipe.output || st.remaining !== 0))
      return false;
  }
  const held = s2.items.filter((i) => i.location === "helper");
  if (s2.helper) {
    const h = s2.helper;
    if (held.length !== h.itemIds.length || held.some((i) => !h.itemIds.includes(i.id) || !["apple", "banana"].includes(i.product)) || h.slots.some((slot) => s2.items.some((i) => i.location === `tray:${h.tray}:${slot}`)) || s2.trays[h.tray].remaining > 0)
      return false;
  } else if (held.length) return false;
  const jobs = [...s2.actor.current ? [s2.actor.current] : [], ...s2.actor.queue];
  if (s2.adventure?.kind === "chapter") {
    const a = s2.adventure;
    for (const order of s2.orders) {
      const job = jobs.find((j) => j.kind === "delivery" && j.order === order.id);
      const at = job?.plan.phases.findIndex((p) => p.event === "receive") ?? -1;
      const received = order.status === "done" || Boolean(
        job && at >= 0 && job.elapsed >= job.plan.phases.slice(0, at + 1).reduce((n2, p) => n2 + p.duration, 0)
      );
      if (a.steps.includes(`served:${order.visitor}`) !== received) return false;
      const foods = a.foods.filter((f) => f.source === order.id);
      if (!received && foods.length || received && !a.rewards.length && !foods.length)
        return false;
      if (foods.length && foods.map((f) => f.product).sort().join("|") !== [...REQUESTS[order.request].products].sort().join("|"))
        return false;
    }
    if (a.chapter === 2 && (a.branch === null ? a.steps.some((x) => x.startsWith("served:")) : !a.steps.includes(`served:${a.branch}`)))
      return false;
  }
  if (!unique(jobs.map((j) => j.plan.id)) || jobs.some((j) => j.itemIds.some((id) => !s2.items.some((i) => i.id === id))))
    return false;
  if (s2.helper && !jobs.some(
    (j) => j.kind === "helper" && j.itemIds.length === s2.helper?.itemIds.length && j.itemIds.every((id) => s2.helper?.itemIds.includes(id))
  ))
    return false;
  if (s2.items.some(
    (i) => i.location.startsWith("delivery:") && !jobs.some((j) => j.kind === "delivery" && j.itemIds.includes(i.id))
  ))
    return false;
  if (!s2.actor.current && s2.actor.queue.length) return false;
  let completion = 0;
  for (const [index, job] of jobs.entries()) {
    if (index > 0 && job.elapsed !== 0) return false;
    completion += job.plan.duration - job.elapsed;
    if (job.kind === "helper" && (!s2.helper || job.tray !== s2.helper.tray || Math.abs(s2.helper.remaining - completion) > 0.05))
      return false;
    if (job.kind === "return" && (job.itemIds.length || job.order !== void 0 || job.tray !== void 0))
      return false;
    if (job.kind === "delivery") {
      const order = s2.orders.find((o) => o.id === job.order);
      if (job.tray === void 0 || (job.worldTarget ? !s2.adventure || job.order !== void 0 : !order || order.status !== "leaving" || Math.abs(order.remaining - completion) > 0.05) || Math.abs(s2.trays[job.tray].remaining - completion) > 0.05)
        return false;
      if (job.itemIds.some(
        (id) => !s2.items.some((i) => i.id === id && i.location.startsWith(`delivery:${job.tray}:`))
      ))
        return false;
      const at = job.plan.phases.findIndex((p) => p.event === "receive");
      if (at < 0) return false;
      const received = job.elapsed >= job.plan.phases.slice(0, at + 1).reduce((n2, p) => n2 + p.duration, 0);
      if (received ? job.itemIds.length > 0 : job.itemIds.length === 0) return false;
    }
  }
  if (s2.orders.some(
    (o) => o.status === "leaving" && !jobs.some((j) => j.kind === "delivery" && j.order === o.id)
  ))
    return false;
  if (!unique(jobs.filter((j) => j.kind === "delivery").map((j) => j.tray))) return false;
  if (s2.trays.some(
    (t, index) => t.remaining > 0 && !jobs.some((j) => j.kind === "delivery" && j.tray === index)
  ))
    return false;
  if (s2.trays.some(
    (t, index) => t.remaining > 0 && s2.items.some((i) => i.location.startsWith(`tray:${index}:`)) && !jobs.some((j) => j.kind === "delivery" && j.tray === index && j.fromHand === true)
  ))
    return false;
  return true;
}
function point(v) {
  return record(v) && number(v.x, 1) && number(v.y, 1);
}
function actorJob(v) {
  if (!record(v) || !["helper", "delivery", "return"].includes(v.kind) || !(v.fromHand === void 0 || v.fromHand === true && v.kind === "delivery") || !(v.creationGroup === void 0 || v.worldTarget === "create" && str(v.creationGroup)) || !(v.shareWith === void 0 || v.worldTarget === "create" && ["rabbit", "hedgehog", "elder"].includes(String(v.shareWith))) || !number(v.elapsed, 12e4) || !strings(v.itemIds, 3) || !unique(v.itemIds) || !(v.tray === void 0 || v.tray === 0 || v.tray === 1) || !(v.order === void 0 || str(v.order)) || !(v.worldTarget === void 0 || ["pack", "cool", "create"].includes(v.worldTarget)) || !record(v.plan) || !str(v.plan.id) || !number(v.plan.duration, 3e4) || !Array.isArray(v.plan.phases) || !v.plan.phases.length || v.plan.phases.length > 16)
    return false;
  if (!v.plan.phases.every(
    (p) => record(p) && point(p.from) && point(p.to) && ["idle", "read", "reach", "place", "carry", "celebrate", "greet", "blocked"].includes(
      p.pose
    ) && number(p.duration, 1e4) && p.duration > 0 && (p.event === void 0 || str(p.event))
  ))
    return false;
  const duration = v.plan.phases.reduce((sum, p) => sum + Number(p.duration), 0);
  return Math.abs(duration - Number(v.plan.duration)) < 0.01 && Number(v.elapsed) <= duration;
}
function decodeSnapshot(raw) {
  if (raw.length > 16e4) return { ok: false, reason: "\u5B58\u6863\u592A\u5927\uFF0C\u5DF2\u4FDD\u7559\u539F\u6587\u4F9B\u5BFC\u51FA\u3002", raw };
  try {
    const value = JSON.parse(raw);
    if (record(value) && value.schemaVersion === 3 && value.contentVersion === "m2.0" && record(value.session)) {
      value.schemaVersion = 4;
      value.contentVersion = "m2.1";
      value.session.concurrency = value.mode === "service" && value.session.support === "less" ? 2 : 1;
      value.session.menu = Array.isArray(value.session.unlocked) ? endlessPool(value.session.unlocked, "combined") : [];
      if (Array.isArray(value.orders)) {
        for (const o of value.orders) if (record(o)) o.heard = false;
      }
      if (Array.isArray(value.attempts)) {
        for (const [i, a] of value.attempts.entries())
          if (record(a)) a.id = `${value.runId}:legacy:${i}`;
      }
    }
    if (record(value) && value.schemaVersion === 4 && value.contentVersion === "m2.1" && record(value.session)) {
      value.schemaVersion = 5;
      value.session.supplyPage = 0;
      value.session.language = "flavor";
      value.contentVersion = CONTENT_VERSION;
      value.routing = emptyRouting();
    }
    if (record(value) && value.schemaVersion === 5 && (value.contentVersion === "m2.2" || value.contentVersion === CONTENT_VERSION) && record(value.session)) {
      value.schemaVersion = 6;
      value.session.language = "flavor";
    }
    if (record(value) && value.schemaVersion === 6 && ["m2.2", "m2.3-story-1", "m2.4-adventure-1", CONTENT_VERSION].includes(
      String(value.contentVersion)
    )) {
      value.schemaVersion = 7;
      value.contentVersion = CONTENT_VERSION;
      value.adventure = null;
    }
    const migratePositions = record(value) && value.schemaVersion === 7 && ["playable-adventure-1", "adventure-experience-2", "together-play-1"].includes(
      String(value.contentVersion)
    );
    if (migratePositions) value.contentVersion = CONTENT_VERSION;
    if (!validateState(value))
      return { ok: false, reason: "\u5B58\u6863\u7248\u672C\u6216\u7269\u54C1\u5173\u7CFB\u4E0D\u53D7\u652F\u6301\uFF0C\u5DF2\u4FDD\u7559\u539F\u6587\u3002", raw };
    if (value.adventure) {
      hydrateExperience(value.adventure);
      const a = value.adventure;
      if (migratePositions && (a.chapter === 2 || a.chapter === 3))
        for (const [seat, visitor] of ["rabbit", "hedgehog"].entries()) {
          if (a.steps.includes(`served:${visitor}`) && a.foods.some((f) => f.place === `guest-${visitor}`) && !a.steps.includes(`place:${seat}`))
            a.steps.push(`place:${seat}`);
        }
    }
    return { ok: true, state: value };
  } catch {
    return { ok: false, reason: "\u5B58\u6863\u635F\u574F\uFF0C\u5DF2\u4FDD\u7559\u539F\u6587\u3002", raw };
  }
}

// review.ts
var n = 0;
var run = (s2, c) => dispatch(s2, { id: "review" + n++, runId: s2.runId, command: c });
var s = createGame("review");
s.session.unlocked = ["juice", "ice", "sandwich", "burger"];
s = run(s, { type: "ingredient", product: "patty", target: { station: "grill" } }).state;
s = run(s, { type: "start-station", station: "grill", tray: 0 }).state;
console.log("reserved snapshot valid", decodeSnapshot(JSON.stringify(s)).ok, s.routing);
for (const product of ["bread", "cheese", "bread"]) s = run(s, { type: "ingredient", product, target: { station: "board" } }).state;
console.log("assembled snapshot valid", decodeSnapshot(JSON.stringify(s)).ok, s.items, s.routing);
