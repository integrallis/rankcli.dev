// Auto-generated Deno-compatible audit bundle
// Do not edit manually - regenerate with: pnpm build:deno
// Generated: 2026-09-28T19:23:49.329Z

// Polyfill for Node's Buffer if needed
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = {
    from: (str, encoding) => new TextEncoder().encode(str),
    isBuffer: () => false
  };
}


// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/identity.js
var ALIAS = Symbol.for("yaml.alias");
var DOC = Symbol.for("yaml.document");
var MAP = Symbol.for("yaml.map");
var PAIR = Symbol.for("yaml.pair");
var SCALAR = Symbol.for("yaml.scalar");
var SEQ = Symbol.for("yaml.seq");
var NODE_TYPE = Symbol.for("yaml.node.type");
var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
function isCollection(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case MAP:
      case SEQ:
        return true;
    }
  return false;
}
function isNode(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case ALIAS:
      case MAP:
      case SCALAR:
      case SEQ:
        return true;
    }
  return false;
}
var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/visit.js
var BREAK = Symbol("break visit");
var SKIP = Symbol("skip children");
var REMOVE = Symbol("remove node");
function visit(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE)
      node.contents = null;
  } else
    visit_(null, node, visitor_, Object.freeze([]));
}
visit.BREAK = BREAK;
visit.SKIP = SKIP;
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
  const ctrl = callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visit_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = visit_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = visit_("key", node.key, visitor, path);
      if (ck === BREAK)
        return BREAK;
      else if (ck === REMOVE)
        node.key = null;
      const cv = visit_("value", node.value, visitor, path);
      if (cv === BREAK)
        return BREAK;
      else if (cv === REMOVE)
        node.value = null;
    }
  }
  return ctrl;
}
async function visitAsync(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE)
      node.contents = null;
  } else
    await visitAsync_(null, node, visitor_, Object.freeze([]));
}
visitAsync.BREAK = BREAK;
visitAsync.SKIP = SKIP;
visitAsync.REMOVE = REMOVE;
async function visitAsync_(key, node, visitor, path) {
  const ctrl = await callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visitAsync_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = await visitAsync_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = await visitAsync_("key", node.key, visitor, path);
      if (ck === BREAK)
        return BREAK;
      else if (ck === REMOVE)
        node.key = null;
      const cv = await visitAsync_("value", node.value, visitor, path);
      if (cv === BREAK)
        return BREAK;
      else if (cv === REMOVE)
        node.value = null;
    }
  }
  return ctrl;
}
function initVisitor(visitor) {
  if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
    return Object.assign({
      Alias: visitor.Node,
      Map: visitor.Node,
      Scalar: visitor.Node,
      Seq: visitor.Node
    }, visitor.Value && {
      Map: visitor.Value,
      Scalar: visitor.Value,
      Seq: visitor.Value
    }, visitor.Collection && {
      Map: visitor.Collection,
      Seq: visitor.Collection
    }, visitor);
  }
  return visitor;
}
function callVisitor(key, node, visitor, path) {
  if (typeof visitor === "function")
    return visitor(key, node, path);
  if (isMap(node))
    return visitor.Map?.(key, node, path);
  if (isSeq(node))
    return visitor.Seq?.(key, node, path);
  if (isPair(node))
    return visitor.Pair?.(key, node, path);
  if (isScalar(node))
    return visitor.Scalar?.(key, node, path);
  if (isAlias(node))
    return visitor.Alias?.(key, node, path);
  return void 0;
}
function replaceNode(key, path, node) {
  const parent = path[path.length - 1];
  if (isCollection(parent)) {
    parent.items[key] = node;
  } else if (isPair(parent)) {
    if (key === "key")
      parent.key = node;
    else
      parent.value = node;
  } else if (isDocument(parent)) {
    parent.contents = node;
  } else {
    const pt = isAlias(parent) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${pt} parent`);
  }
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/doc/directives.js
var escapeChars = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
};
var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
var Directives = class _Directives {
  constructor(yaml, tags) {
    this.docStart = null;
    this.docEnd = false;
    this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
    this.tags = Object.assign({}, _Directives.defaultTags, tags);
  }
  clone() {
    const copy = new _Directives(this.yaml, this.tags);
    copy.docStart = this.docStart;
    return copy;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const res = new _Directives(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = true;
        break;
      case "1.2":
        this.atNextDocument = false;
        this.yaml = {
          explicit: _Directives.defaultYaml.explicit,
          version: "1.2"
        };
        this.tags = Object.assign({}, _Directives.defaultTags);
        break;
    }
    return res;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(line, onError) {
    if (this.atNextDocument) {
      this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
      this.tags = Object.assign({}, _Directives.defaultTags);
      this.atNextDocument = false;
    }
    const parts = line.trim().split(/[ \t]+/);
    const name = parts.shift();
    switch (name) {
      case "%TAG": {
        if (parts.length !== 2) {
          onError(0, "%TAG directive should contain exactly two parts");
          if (parts.length < 2)
            return false;
        }
        const [handle, prefix] = parts;
        this.tags[handle] = prefix;
        return true;
      }
      case "%YAML": {
        this.yaml.explicit = true;
        if (parts.length !== 1) {
          onError(0, "%YAML directive should contain exactly one part");
          return false;
        }
        const [version] = parts;
        if (version === "1.1" || version === "1.2") {
          this.yaml.version = version;
          return true;
        } else {
          const isValid = /^\d+\.\d+$/.test(version);
          onError(6, `Unsupported YAML version ${version}`, isValid);
          return false;
        }
      }
      default:
        onError(0, `Unknown directive ${name}`, true);
        return false;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(source, onError) {
    if (source === "!")
      return "!";
    if (source[0] !== "!") {
      onError(`Not a valid tag: ${source}`);
      return null;
    }
    if (source[1] === "<") {
      const verbatim = source.slice(2, -1);
      if (verbatim === "!" || verbatim === "!!") {
        onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
        return null;
      }
      if (source[source.length - 1] !== ">")
        onError("Verbatim tags must end with a >");
      return verbatim;
    }
    const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
    if (!suffix)
      onError(`The ${source} tag has no suffix`);
    const prefix = this.tags[handle];
    if (prefix) {
      try {
        return prefix + decodeURIComponent(suffix);
      } catch (error) {
        onError(String(error));
        return null;
      }
    }
    if (handle === "!")
      return source;
    onError(`Could not resolve tag: ${source}`);
    return null;
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(tag) {
    for (const [handle, prefix] of Object.entries(this.tags)) {
      if (tag.startsWith(prefix))
        return handle + escapeTagName(tag.substring(prefix.length));
    }
    return tag[0] === "!" ? tag : `!<${tag}>`;
  }
  toString(doc) {
    const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
    const tagEntries = Object.entries(this.tags);
    let tagNames;
    if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
      const tags = {};
      visit(doc.contents, (_key, node) => {
        if (isNode(node) && node.tag)
          tags[node.tag] = true;
      });
      tagNames = Object.keys(tags);
    } else
      tagNames = [];
    for (const [handle, prefix] of tagEntries) {
      if (handle === "!!" && prefix === "tag:yaml.org,2002:")
        continue;
      if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
        lines.push(`%TAG ${handle} ${prefix}`);
    }
    return lines.join("\n");
  }
};
Directives.defaultYaml = { explicit: false, version: "1.2" };
Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/doc/anchors.js
function anchorIsValid(anchor) {
  if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
    const sa = JSON.stringify(anchor);
    const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
    throw new Error(msg);
  }
  return true;
}
function anchorNames(root) {
  const anchors = /* @__PURE__ */ new Set();
  visit(root, {
    Value(_key, node) {
      if (node.anchor)
        anchors.add(node.anchor);
    }
  });
  return anchors;
}
function findNewAnchor(prefix, exclude) {
  for (let i = 1; true; ++i) {
    const name = `${prefix}${i}`;
    if (!exclude.has(name))
      return name;
  }
}
function createNodeAnchors(doc, prefix) {
  const aliasObjects = [];
  const sourceObjects = /* @__PURE__ */ new Map();
  let prevAnchors = null;
  return {
    onAnchor: (source) => {
      aliasObjects.push(source);
      prevAnchors ?? (prevAnchors = anchorNames(doc));
      const anchor = findNewAnchor(prefix, prevAnchors);
      prevAnchors.add(anchor);
      return anchor;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const source of aliasObjects) {
        const ref = sourceObjects.get(source);
        if (typeof ref === "object" && ref.anchor && (isScalar(ref.node) || isCollection(ref.node))) {
          ref.node.anchor = ref.anchor;
        } else {
          const error = new Error("Failed to resolve repeated object (this should not happen)");
          error.source = source;
          throw error;
        }
      }
    },
    sourceObjects
  };
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/doc/applyReviver.js
function applyReviver(reviver, obj, key, val) {
  if (val && typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0, len = val.length; i < len; ++i) {
        const v0 = val[i];
        const v1 = applyReviver(reviver, val, String(i), v0);
        if (v1 === void 0)
          delete val[i];
        else if (v1 !== v0)
          val[i] = v1;
      }
    } else if (val instanceof Map) {
      for (const k of Array.from(val.keys())) {
        const v0 = val.get(k);
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          val.delete(k);
        else if (v1 !== v0)
          val.set(k, v1);
      }
    } else if (val instanceof Set) {
      for (const v0 of Array.from(val)) {
        const v1 = applyReviver(reviver, val, v0, v0);
        if (v1 === void 0)
          val.delete(v0);
        else if (v1 !== v0) {
          val.delete(v0);
          val.add(v1);
        }
      }
    } else {
      for (const [k, v0] of Object.entries(val)) {
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          delete val[k];
        else if (v1 !== v0)
          val[k] = v1;
      }
    }
  }
  return reviver.call(obj, key, val);
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/toJS.js
function toJS(value, arg, ctx) {
  if (Array.isArray(value))
    return value.map((v, i) => toJS(v, String(i), ctx));
  if (value && typeof value.toJSON === "function") {
    if (!ctx || !hasAnchor(value))
      return value.toJSON(arg, ctx);
    const data = { aliasCount: 0, count: 1, res: void 0 };
    ctx.anchors.set(value, data);
    ctx.onCreate = (res2) => {
      data.res = res2;
      delete ctx.onCreate;
    };
    const res = value.toJSON(arg, ctx);
    if (ctx.onCreate)
      ctx.onCreate(res);
    return res;
  }
  if (typeof value === "bigint" && !ctx?.keep)
    return Number(value);
  return value;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/Node.js
var NodeBase = class {
  constructor(type) {
    Object.defineProperty(this, NODE_TYPE, { value: type });
  }
  /** Create a copy of this node.  */
  clone() {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** A plain JavaScript representation of this node. */
  toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    if (!isDocument(doc))
      throw new TypeError("A document argument is required");
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc,
      keep: true,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this, "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/Alias.js
var Alias = class extends NodeBase {
  constructor(source) {
    super(ALIAS);
    this.source = source;
    Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(doc, ctx) {
    let nodes;
    if (ctx?.aliasResolveCache) {
      nodes = ctx.aliasResolveCache;
    } else {
      nodes = [];
      visit(doc, {
        Node: (_key, node) => {
          if (isAlias(node) || hasAnchor(node))
            nodes.push(node);
        }
      });
      if (ctx)
        ctx.aliasResolveCache = nodes;
    }
    let found = void 0;
    for (const node of nodes) {
      if (node === this)
        break;
      if (node.anchor === this.source)
        found = node;
    }
    return found;
  }
  toJSON(_arg, ctx) {
    if (!ctx)
      return { source: this.source };
    const { anchors, doc, maxAliasCount } = ctx;
    const source = this.resolve(doc, ctx);
    if (!source) {
      const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(msg);
    }
    let data = anchors.get(source);
    if (!data) {
      toJS(source, null, ctx);
      data = anchors.get(source);
    }
    if (data?.res === void 0) {
      const msg = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(msg);
    }
    if (maxAliasCount >= 0) {
      data.count += 1;
      if (data.aliasCount === 0)
        data.aliasCount = getAliasCount(doc, source, anchors);
      if (data.count * data.aliasCount > maxAliasCount) {
        const msg = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(msg);
      }
    }
    return data.res;
  }
  toString(ctx, _onComment, _onChompKeep) {
    const src = `*${this.source}`;
    if (ctx) {
      anchorIsValid(this.source);
      if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(msg);
      }
      if (ctx.implicitKey)
        return `${src} `;
    }
    return src;
  }
};
function getAliasCount(doc, node, anchors) {
  if (isAlias(node)) {
    const source = node.resolve(doc);
    const anchor = anchors && source && anchors.get(source);
    return anchor ? anchor.count * anchor.aliasCount : 0;
  } else if (isCollection(node)) {
    let count = 0;
    for (const item of node.items) {
      const c = getAliasCount(doc, item, anchors);
      if (c > count)
        count = c;
    }
    return count;
  } else if (isPair(node)) {
    const kc = getAliasCount(doc, node.key, anchors);
    const vc = getAliasCount(doc, node.value, anchors);
    return Math.max(kc, vc);
  }
  return 1;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/Scalar.js
var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
var Scalar = class extends NodeBase {
  constructor(value) {
    super(SCALAR);
    this.value = value;
  }
  toJSON(arg, ctx) {
    return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
  }
  toString() {
    return String(this.value);
  }
};
Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
Scalar.PLAIN = "PLAIN";
Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/doc/createNode.js
var defaultTagPrefix = "tag:yaml.org,2002:";
function findTagObject(value, tagName, tags) {
  if (tagName) {
    const match = tags.filter((t) => t.tag === tagName);
    const tagObj = match.find((t) => !t.format) ?? match[0];
    if (!tagObj)
      throw new Error(`Tag ${tagName} not found`);
    return tagObj;
  }
  return tags.find((t) => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
  if (isDocument(value))
    value = value.contents;
  if (isNode(value))
    return value;
  if (isPair(value)) {
    const map2 = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
    map2.items.push(value);
    return map2;
  }
  if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
    value = value.valueOf();
  }
  const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema4, sourceObjects } = ctx;
  let ref = void 0;
  if (aliasDuplicateObjects && value && typeof value === "object") {
    ref = sourceObjects.get(value);
    if (ref) {
      ref.anchor ?? (ref.anchor = onAnchor(value));
      return new Alias(ref.anchor);
    } else {
      ref = { anchor: null, node: null };
      sourceObjects.set(value, ref);
    }
  }
  if (tagName?.startsWith("!!"))
    tagName = defaultTagPrefix + tagName.slice(2);
  let tagObj = findTagObject(value, tagName, schema4.tags);
  if (!tagObj) {
    if (value && typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (!value || typeof value !== "object") {
      const node2 = new Scalar(value);
      if (ref)
        ref.node = node2;
      return node2;
    }
    tagObj = value instanceof Map ? schema4[MAP] : Symbol.iterator in Object(value) ? schema4[SEQ] : schema4[MAP];
  }
  if (onTagObj) {
    onTagObj(tagObj);
    delete ctx.onTagObj;
  }
  const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar(value);
  if (tagName)
    node.tag = tagName;
  else if (!tagObj.default)
    node.tag = tagObj.tag;
  if (ref)
    ref.node = node;
  return node;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/Collection.js
function collectionFromPath(schema4, path, value) {
  let v = value;
  for (let i = path.length - 1; i >= 0; --i) {
    const k = path[i];
    if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
      const a = [];
      a[k] = v;
      v = a;
    } else {
      v = /* @__PURE__ */ new Map([[k, v]]);
    }
  }
  return createNode(v, void 0, {
    aliasDuplicateObjects: false,
    keepUndefined: false,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: schema4,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
var Collection = class extends NodeBase {
  constructor(type, schema4) {
    super(type);
    Object.defineProperty(this, "schema", {
      value: schema4,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(schema4) {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (schema4)
      copy.schema = schema4;
    copy.items = copy.items.map((it) => isNode(it) || isPair(it) ? it.clone(schema4) : it);
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(path, value) {
    if (isEmptyPath(path))
      this.add(value);
    else {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (isCollection(node))
        node.addIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.delete(key);
    const node = this.get(key, true);
    if (isCollection(node))
      return node.deleteIn(rest);
    else
      throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    const [key, ...rest] = path;
    const node = this.get(key, true);
    if (rest.length === 0)
      return !keepScalar && isScalar(node) ? node.value : node;
    else
      return isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
  }
  hasAllNullValues(allowScalar) {
    return this.items.every((node) => {
      if (!isPair(node))
        return false;
      const n = node.value;
      return n == null || allowScalar && isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.has(key);
    const node = this.get(key, true);
    return isCollection(node) ? node.hasIn(rest) : false;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    const [key, ...rest] = path;
    if (rest.length === 0) {
      this.set(key, value);
    } else {
      const node = this.get(key, true);
      if (isCollection(node))
        node.setIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyComment.js
var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
function indentComment(comment, indent) {
  if (/^\n+$/.test(comment))
    return comment.substring(1);
  return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/foldFlowLines.js
var FOLD_FLOW = "flow";
var FOLD_BLOCK = "block";
var FOLD_QUOTED = "quoted";
function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
  if (!lineWidth || lineWidth < 0)
    return text;
  if (lineWidth < minContentWidth)
    minContentWidth = 0;
  const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
  if (text.length <= endStep)
    return text;
  const folds = [];
  const escapedFolds = {};
  let end = lineWidth - indent.length;
  if (typeof indentAtStart === "number") {
    if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
      folds.push(0);
    else
      end = lineWidth - indentAtStart;
  }
  let split = void 0;
  let prev = void 0;
  let overflow = false;
  let i = -1;
  let escStart = -1;
  let escEnd = -1;
  if (mode === FOLD_BLOCK) {
    i = consumeMoreIndentedLines(text, i, indent.length);
    if (i !== -1)
      end = i + endStep;
  }
  for (let ch; ch = text[i += 1]; ) {
    if (mode === FOLD_QUOTED && ch === "\\") {
      escStart = i;
      switch (text[i + 1]) {
        case "x":
          i += 3;
          break;
        case "u":
          i += 5;
          break;
        case "U":
          i += 9;
          break;
        default:
          i += 1;
      }
      escEnd = i;
    }
    if (ch === "\n") {
      if (mode === FOLD_BLOCK)
        i = consumeMoreIndentedLines(text, i, indent.length);
      end = i + indent.length + endStep;
      split = void 0;
    } else {
      if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
        const next = text[i + 1];
        if (next && next !== " " && next !== "\n" && next !== "	")
          split = i;
      }
      if (i >= end) {
        if (split) {
          folds.push(split);
          end = split + endStep;
          split = void 0;
        } else if (mode === FOLD_QUOTED) {
          while (prev === " " || prev === "	") {
            prev = ch;
            ch = text[i += 1];
            overflow = true;
          }
          const j = i > escEnd + 1 ? i - 2 : escStart - 1;
          if (escapedFolds[j])
            return text;
          folds.push(j);
          escapedFolds[j] = true;
          end = j + endStep;
          split = void 0;
        } else {
          overflow = true;
        }
      }
    }
    prev = ch;
  }
  if (overflow && onOverflow)
    onOverflow();
  if (folds.length === 0)
    return text;
  if (onFold)
    onFold();
  let res = text.slice(0, folds[0]);
  for (let i2 = 0; i2 < folds.length; ++i2) {
    const fold = folds[i2];
    const end2 = folds[i2 + 1] || text.length;
    if (fold === 0)
      res = `
${indent}${text.slice(0, end2)}`;
    else {
      if (mode === FOLD_QUOTED && escapedFolds[fold])
        res += `${text[fold]}\\`;
      res += `
${indent}${text.slice(fold + 1, end2)}`;
    }
  }
  return res;
}
function consumeMoreIndentedLines(text, i, indent) {
  let end = i;
  let start = i + 1;
  let ch = text[start];
  while (ch === " " || ch === "	") {
    if (i < start + indent) {
      ch = text[++i];
    } else {
      do {
        ch = text[++i];
      } while (ch && ch !== "\n");
      end = i;
      start = i + 1;
      ch = text[start];
    }
  }
  return end;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyString.js
var getFoldOptions = (ctx, isBlock2) => ({
  indentAtStart: isBlock2 ? ctx.indent.length : ctx.indentAtStart,
  lineWidth: ctx.options.lineWidth,
  minContentWidth: ctx.options.minContentWidth
});
var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
  if (!lineWidth || lineWidth < 0)
    return false;
  const limit = lineWidth - indentLength;
  const strLen = str.length;
  if (strLen <= limit)
    return false;
  for (let i = 0, start = 0; i < strLen; ++i) {
    if (str[i] === "\n") {
      if (i - start > limit)
        return true;
      start = i + 1;
      if (strLen - start <= limit)
        return false;
    }
  }
  return true;
}
function doubleQuotedString(value, ctx) {
  const json = JSON.stringify(value);
  if (ctx.options.doubleQuotedAsJSON)
    return json;
  const { implicitKey } = ctx;
  const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  let str = "";
  let start = 0;
  for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
    if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
      str += json.slice(start, i) + "\\ ";
      i += 1;
      start = i;
      ch = "\\";
    }
    if (ch === "\\")
      switch (json[i + 1]) {
        case "u":
          {
            str += json.slice(start, i);
            const code = json.substr(i + 2, 4);
            switch (code) {
              case "0000":
                str += "\\0";
                break;
              case "0007":
                str += "\\a";
                break;
              case "000b":
                str += "\\v";
                break;
              case "001b":
                str += "\\e";
                break;
              case "0085":
                str += "\\N";
                break;
              case "00a0":
                str += "\\_";
                break;
              case "2028":
                str += "\\L";
                break;
              case "2029":
                str += "\\P";
                break;
              default:
                if (code.substr(0, 2) === "00")
                  str += "\\x" + code.substr(2);
                else
                  str += json.substr(i, 6);
            }
            i += 5;
            start = i + 1;
          }
          break;
        case "n":
          if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
            i += 1;
          } else {
            str += json.slice(start, i) + "\n\n";
            while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
              str += "\n";
              i += 2;
            }
            str += indent;
            if (json[i + 2] === " ")
              str += "\\";
            i += 1;
            start = i + 1;
          }
          break;
        default:
          i += 1;
      }
  }
  str = start ? str + json.slice(start) : json;
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
  if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
    return doubleQuotedString(value, ctx);
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
  return ctx.implicitKey ? res : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
  const { singleQuote } = ctx.options;
  let qs;
  if (singleQuote === false)
    qs = doubleQuotedString;
  else {
    const hasDouble = value.includes('"');
    const hasSingle = value.includes("'");
    if (hasDouble && !hasSingle)
      qs = singleQuotedString;
    else if (hasSingle && !hasDouble)
      qs = doubleQuotedString;
    else
      qs = singleQuote ? singleQuotedString : doubleQuotedString;
  }
  return qs(value, ctx);
}
var blockEndNewlines;
try {
  blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
} catch {
  blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
  const { blockQuote, commentString, lineWidth } = ctx.options;
  if (!blockQuote || /\n[\t ]+$/.test(value)) {
    return quotedString(value, ctx);
  }
  const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
  const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.BLOCK_FOLDED ? false : type === Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
  if (!value)
    return literal ? "|\n" : ">\n";
  let chomp;
  let endStart;
  for (endStart = value.length; endStart > 0; --endStart) {
    const ch = value[endStart - 1];
    if (ch !== "\n" && ch !== "	" && ch !== " ")
      break;
  }
  let end = value.substring(endStart);
  const endNlPos = end.indexOf("\n");
  if (endNlPos === -1) {
    chomp = "-";
  } else if (value === end || endNlPos !== end.length - 1) {
    chomp = "+";
    if (onChompKeep)
      onChompKeep();
  } else {
    chomp = "";
  }
  if (end) {
    value = value.slice(0, -end.length);
    if (end[end.length - 1] === "\n")
      end = end.slice(0, -1);
    end = end.replace(blockEndNewlines, `$&${indent}`);
  }
  let startWithSpace = false;
  let startEnd;
  let startNlPos = -1;
  for (startEnd = 0; startEnd < value.length; ++startEnd) {
    const ch = value[startEnd];
    if (ch === " ")
      startWithSpace = true;
    else if (ch === "\n")
      startNlPos = startEnd;
    else
      break;
  }
  let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
  if (start) {
    value = value.substring(start.length);
    start = start.replace(/\n+/g, `$&${indent}`);
  }
  const indentSize = indent ? "2" : "1";
  let header = (startWithSpace ? indentSize : "") + chomp;
  if (comment) {
    header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
    if (onComment)
      onComment();
  }
  if (!literal) {
    const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
    let literalFallback = false;
    const foldOptions = getFoldOptions(ctx, true);
    if (blockQuote !== "folded" && type !== Scalar.BLOCK_FOLDED) {
      foldOptions.onOverflow = () => {
        literalFallback = true;
      };
    }
    const body = foldFlowLines(`${start}${foldedValue}${end}`, indent, FOLD_BLOCK, foldOptions);
    if (!literalFallback)
      return `>${header}
${indent}${body}`;
  }
  value = value.replace(/\n+/g, `$&${indent}`);
  return `|${header}
${indent}${start}${value}${end}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
  const { type, value } = item;
  const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
  if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
    return quotedString(value, ctx);
  }
  if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
    return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
  }
  if (!implicitKey && !inFlow && type !== Scalar.PLAIN && value.includes("\n")) {
    return blockString(item, ctx, onComment, onChompKeep);
  }
  if (containsDocumentMarker(value)) {
    if (indent === "") {
      ctx.forceBlockIndent = true;
      return blockString(item, ctx, onComment, onChompKeep);
    } else if (implicitKey && indent === indentStep) {
      return quotedString(value, ctx);
    }
  }
  const str = value.replace(/\n+/g, `$&
${indent}`);
  if (actualString) {
    const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
    const { compat, tags } = ctx.doc.schema;
    if (tags.some(test) || compat?.some(test))
      return quotedString(value, ctx);
  }
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
  const { implicitKey, inFlow } = ctx;
  const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
  let { type } = item;
  if (type !== Scalar.QUOTE_DOUBLE) {
    if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
      type = Scalar.QUOTE_DOUBLE;
  }
  const _stringify = (_type) => {
    switch (_type) {
      case Scalar.BLOCK_FOLDED:
      case Scalar.BLOCK_LITERAL:
        return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
      case Scalar.QUOTE_DOUBLE:
        return doubleQuotedString(ss.value, ctx);
      case Scalar.QUOTE_SINGLE:
        return singleQuotedString(ss.value, ctx);
      case Scalar.PLAIN:
        return plainString(ss, ctx, onComment, onChompKeep);
      default:
        return null;
    }
  };
  let res = _stringify(type);
  if (res === null) {
    const { defaultKeyType, defaultStringType } = ctx.options;
    const t = implicitKey && defaultKeyType || defaultStringType;
    res = _stringify(t);
    if (res === null)
      throw new Error(`Unsupported default string type ${t}`);
  }
  return res;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringify.js
function createStringifyContext(doc, options) {
  const opt = Object.assign({
    blockQuote: true,
    commentString: stringifyComment,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: false,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: true,
    indentSeq: true,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: false,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: true
  }, doc.schema.toStringOptions, options);
  let inFlow;
  switch (opt.collectionStyle) {
    case "block":
      inFlow = false;
      break;
    case "flow":
      inFlow = true;
      break;
    default:
      inFlow = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc,
    flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
    inFlow,
    options: opt
  };
}
function getTagObject(tags, item) {
  if (item.tag) {
    const match = tags.filter((t) => t.tag === item.tag);
    if (match.length > 0)
      return match.find((t) => t.format === item.format) ?? match[0];
  }
  let tagObj = void 0;
  let obj;
  if (isScalar(item)) {
    obj = item.value;
    let match = tags.filter((t) => t.identify?.(obj));
    if (match.length > 1) {
      const testMatch = match.filter((t) => t.test);
      if (testMatch.length > 0)
        match = testMatch;
    }
    tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
  } else {
    obj = item;
    tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
  }
  if (!tagObj) {
    const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
    throw new Error(`Tag not resolved for ${name} value`);
  }
  return tagObj;
}
function stringifyProps(node, tagObj, { anchors, doc }) {
  if (!doc.directives)
    return "";
  const props = [];
  const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
  if (anchor && anchorIsValid(anchor)) {
    anchors.add(anchor);
    props.push(`&${anchor}`);
  }
  const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
  if (tag)
    props.push(doc.directives.tagString(tag));
  return props.join(" ");
}
function stringify(item, ctx, onComment, onChompKeep) {
  if (isPair(item))
    return item.toString(ctx, onComment, onChompKeep);
  if (isAlias(item)) {
    if (ctx.doc.directives)
      return item.toString(ctx);
    if (ctx.resolvedAliases?.has(item)) {
      throw new TypeError(`Cannot stringify circular structure without alias nodes`);
    } else {
      if (ctx.resolvedAliases)
        ctx.resolvedAliases.add(item);
      else
        ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
      item = item.resolve(ctx.doc);
    }
  }
  let tagObj = void 0;
  const node = isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
  tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
  const props = stringifyProps(node, tagObj, ctx);
  if (props.length > 0)
    ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
  const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : isScalar(node) ? stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
  if (!props)
    return str;
  return isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyPair.js
function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
  const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
  let keyComment = isNode(key) && key.comment || null;
  if (simpleKeys) {
    if (keyComment) {
      throw new Error("With simple keys, key nodes cannot have comments");
    }
    if (isCollection(key) || !isNode(key) && typeof key === "object") {
      const msg = "With simple keys, collection cannot be used as a key value";
      throw new Error(msg);
    }
  }
  let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || isCollection(key) || (isScalar(key) ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL : typeof key === "object"));
  ctx = Object.assign({}, ctx, {
    allNullValues: false,
    implicitKey: !explicitKey && (simpleKeys || !allNullValues),
    indent: indent + indentStep
  });
  let keyCommentDone = false;
  let chompKeep = false;
  let str = stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
  if (!explicitKey && !ctx.inFlow && str.length > 1024) {
    if (simpleKeys)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    explicitKey = true;
  }
  if (ctx.inFlow) {
    if (allNullValues || value == null) {
      if (keyCommentDone && onComment)
        onComment();
      return str === "" ? "?" : explicitKey ? `? ${str}` : str;
    }
  } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
    str = `? ${str}`;
    if (keyComment && !keyCommentDone) {
      str += lineComment(str, ctx.indent, commentString(keyComment));
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  if (keyCommentDone)
    keyComment = null;
  if (explicitKey) {
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
    str = `? ${str}
${indent}:`;
  } else {
    str = `${str}:`;
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
  }
  let vsb, vcb, valueComment;
  if (isNode(value)) {
    vsb = !!value.spaceBefore;
    vcb = value.commentBefore;
    valueComment = value.comment;
  } else {
    vsb = false;
    vcb = null;
    valueComment = null;
    if (value && typeof value === "object")
      value = doc.createNode(value);
  }
  ctx.implicitKey = false;
  if (!explicitKey && !keyComment && isScalar(value))
    ctx.indentAtStart = str.length + 1;
  chompKeep = false;
  if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && isSeq(value) && !value.flow && !value.tag && !value.anchor) {
    ctx.indent = ctx.indent.substring(2);
  }
  let valueCommentDone = false;
  const valueStr = stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
  let ws = " ";
  if (keyComment || vsb || vcb) {
    ws = vsb ? "\n" : "";
    if (vcb) {
      const cs = commentString(vcb);
      ws += `
${indentComment(cs, ctx.indent)}`;
    }
    if (valueStr === "" && !ctx.inFlow) {
      if (ws === "\n" && valueComment)
        ws = "\n\n";
    } else {
      ws += `
${ctx.indent}`;
    }
  } else if (!explicitKey && isCollection(value)) {
    const vs0 = valueStr[0];
    const nl0 = valueStr.indexOf("\n");
    const hasNewline = nl0 !== -1;
    const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
    if (hasNewline || !flow) {
      let hasPropsLine = false;
      if (hasNewline && (vs0 === "&" || vs0 === "!")) {
        let sp0 = valueStr.indexOf(" ");
        if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
          sp0 = valueStr.indexOf(" ", sp0 + 1);
        }
        if (sp0 === -1 || nl0 < sp0)
          hasPropsLine = true;
      }
      if (!hasPropsLine)
        ws = `
${ctx.indent}`;
    }
  } else if (valueStr === "" || valueStr[0] === "\n") {
    ws = "";
  }
  str += ws + valueStr;
  if (ctx.inFlow) {
    if (valueCommentDone && onComment)
      onComment();
  } else if (valueComment && !valueCommentDone) {
    str += lineComment(str, ctx.indent, commentString(valueComment));
  } else if (chompKeep && onChompKeep) {
    onChompKeep();
  }
  return str;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/log.js
function warn(logLevel, warning) {
  if (logLevel === "debug" || logLevel === "warn") {
    console.warn(warning);
  }
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/merge.js
var MERGE_KEY = "<<";
var merge = {
  identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new Scalar(Symbol(MERGE_KEY)), {
    addToJSMap: addMergeToJSMap
  }),
  stringify: () => MERGE_KEY
};
var isMergeKey = (ctx, key) => (merge.identify(key) || isScalar(key) && (!key.type || key.type === Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
function addMergeToJSMap(ctx, map2, value) {
  value = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
  if (isSeq(value))
    for (const it of value.items)
      mergeValue(ctx, map2, it);
  else if (Array.isArray(value))
    for (const it of value)
      mergeValue(ctx, map2, it);
  else
    mergeValue(ctx, map2, value);
}
function mergeValue(ctx, map2, value) {
  const source = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
  if (!isMap(source))
    throw new Error("Merge sources must be maps or map aliases");
  const srcMap = source.toJSON(null, ctx, Map);
  for (const [key, value2] of srcMap) {
    if (map2 instanceof Map) {
      if (!map2.has(key))
        map2.set(key, value2);
    } else if (map2 instanceof Set) {
      map2.add(key);
    } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
      Object.defineProperty(map2, key, {
        value: value2,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }
  return map2;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/addPairToJSMap.js
function addPairToJSMap(ctx, map2, { key, value }) {
  if (isNode(key) && key.addToJSMap)
    key.addToJSMap(ctx, map2, value);
  else if (isMergeKey(ctx, key))
    addMergeToJSMap(ctx, map2, value);
  else {
    const jsKey = toJS(key, "", ctx);
    if (map2 instanceof Map) {
      map2.set(jsKey, toJS(value, jsKey, ctx));
    } else if (map2 instanceof Set) {
      map2.add(jsKey);
    } else {
      const stringKey = stringifyKey(key, jsKey, ctx);
      const jsValue = toJS(value, stringKey, ctx);
      if (stringKey in map2)
        Object.defineProperty(map2, stringKey, {
          value: jsValue,
          writable: true,
          enumerable: true,
          configurable: true
        });
      else
        map2[stringKey] = jsValue;
    }
  }
  return map2;
}
function stringifyKey(key, jsKey, ctx) {
  if (jsKey === null)
    return "";
  if (typeof jsKey !== "object")
    return String(jsKey);
  if (isNode(key) && ctx?.doc) {
    const strCtx = createStringifyContext(ctx.doc, {});
    strCtx.anchors = /* @__PURE__ */ new Set();
    for (const node of ctx.anchors.keys())
      strCtx.anchors.add(node.anchor);
    strCtx.inFlow = true;
    strCtx.inStringifyKey = true;
    const strKey = key.toString(strCtx);
    if (!ctx.mapKeyWarned) {
      let jsonStr = JSON.stringify(strKey);
      if (jsonStr.length > 40)
        jsonStr = jsonStr.substring(0, 36) + '..."';
      warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
      ctx.mapKeyWarned = true;
    }
    return strKey;
  }
  return JSON.stringify(jsKey);
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/Pair.js
function createPair(key, value, ctx) {
  const k = createNode(key, void 0, ctx);
  const v = createNode(value, void 0, ctx);
  return new Pair(k, v);
}
var Pair = class _Pair {
  constructor(key, value = null) {
    Object.defineProperty(this, NODE_TYPE, { value: PAIR });
    this.key = key;
    this.value = value;
  }
  clone(schema4) {
    let { key, value } = this;
    if (isNode(key))
      key = key.clone(schema4);
    if (isNode(value))
      value = value.clone(schema4);
    return new _Pair(key, value);
  }
  toJSON(_, ctx) {
    const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return addPairToJSMap(ctx, pair, this);
  }
  toString(ctx, onComment, onChompKeep) {
    return ctx?.doc ? stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyCollection.js
function stringifyCollection(collection, ctx, options) {
  const flow = ctx.inFlow ?? collection.flow;
  const stringify4 = flow ? stringifyFlowCollection : stringifyBlockCollection;
  return stringify4(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
  const { indent, options: { commentString } } = ctx;
  const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
  let chompKeep = false;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment2 = null;
    if (isNode(item)) {
      if (!chompKeep && item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
      if (item.comment)
        comment2 = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (!chompKeep && ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
      }
    }
    chompKeep = false;
    let str2 = stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
    if (comment2)
      str2 += lineComment(str2, itemIndent, commentString(comment2));
    if (chompKeep && comment2)
      chompKeep = false;
    lines.push(blockItemPrefix + str2);
  }
  let str;
  if (lines.length === 0) {
    str = flowChars.start + flowChars.end;
  } else {
    str = lines[0];
    for (let i = 1; i < lines.length; ++i) {
      const line = lines[i];
      str += line ? `
${indent}${line}` : "\n";
    }
  }
  if (comment) {
    str += "\n" + indentComment(commentString(comment), indent);
    if (onComment)
      onComment();
  } else if (chompKeep && onChompKeep)
    onChompKeep();
  return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
  const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
  itemIndent += indentStep;
  const itemCtx = Object.assign({}, ctx, {
    indent: itemIndent,
    inFlow: true,
    type: null
  });
  let reqNewline = false;
  let linesAtValue = 0;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment = null;
    if (isNode(item)) {
      if (item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, false);
      if (item.comment)
        comment = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, false);
        if (ik.comment)
          reqNewline = true;
      }
      const iv = isNode(item.value) ? item.value : null;
      if (iv) {
        if (iv.comment)
          comment = iv.comment;
        if (iv.commentBefore)
          reqNewline = true;
      } else if (item.value == null && ik?.comment) {
        comment = ik.comment;
      }
    }
    if (comment)
      reqNewline = true;
    let str = stringify(item, itemCtx, () => comment = null);
    if (i < items.length - 1)
      str += ",";
    if (comment)
      str += lineComment(str, itemIndent, commentString(comment));
    if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
      reqNewline = true;
    lines.push(str);
    linesAtValue = lines.length;
  }
  const { start, end } = flowChars;
  if (lines.length === 0) {
    return start + end;
  } else {
    if (!reqNewline) {
      const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
      reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
    }
    if (reqNewline) {
      let str = start;
      for (const line of lines)
        str += line ? `
${indentStep}${indent}${line}` : "\n";
      return `${str}
${indent}${end}`;
    } else {
      return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
    }
  }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
  if (comment && chompKeep)
    comment = comment.replace(/^\n+/, "");
  if (comment) {
    const ic = indentComment(commentString(comment), indent);
    lines.push(ic.trimStart());
  }
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/YAMLMap.js
function findPair(items, key) {
  const k = isScalar(key) ? key.value : key;
  for (const it of items) {
    if (isPair(it)) {
      if (it.key === key || it.key === k)
        return it;
      if (isScalar(it.key) && it.key.value === k)
        return it;
    }
  }
  return void 0;
}
var YAMLMap = class extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(schema4) {
    super(MAP, schema4);
    this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(schema4, obj, ctx) {
    const { keepUndefined, replacer } = ctx;
    const map2 = new this(schema4);
    const add = (key, value) => {
      if (typeof replacer === "function")
        value = replacer.call(obj, key, value);
      else if (Array.isArray(replacer) && !replacer.includes(key))
        return;
      if (value !== void 0 || keepUndefined)
        map2.items.push(createPair(key, value, ctx));
    };
    if (obj instanceof Map) {
      for (const [key, value] of obj)
        add(key, value);
    } else if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj))
        add(key, obj[key]);
    }
    if (typeof schema4.sortMapEntries === "function") {
      map2.items.sort(schema4.sortMapEntries);
    }
    return map2;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(pair, overwrite) {
    let _pair;
    if (isPair(pair))
      _pair = pair;
    else if (!pair || typeof pair !== "object" || !("key" in pair)) {
      _pair = new Pair(pair, pair?.value);
    } else
      _pair = new Pair(pair.key, pair.value);
    const prev = findPair(this.items, _pair.key);
    const sortEntries = this.schema?.sortMapEntries;
    if (prev) {
      if (!overwrite)
        throw new Error(`Key ${_pair.key} already set`);
      if (isScalar(prev.value) && isScalarValue(_pair.value))
        prev.value.value = _pair.value;
      else
        prev.value = _pair.value;
    } else if (sortEntries) {
      const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
      if (i === -1)
        this.items.push(_pair);
      else
        this.items.splice(i, 0, _pair);
    } else {
      this.items.push(_pair);
    }
  }
  delete(key) {
    const it = findPair(this.items, key);
    if (!it)
      return false;
    const del = this.items.splice(this.items.indexOf(it), 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const it = findPair(this.items, key);
    const node = it?.value;
    return (!keepScalar && isScalar(node) ? node.value : node) ?? void 0;
  }
  has(key) {
    return !!findPair(this.items, key);
  }
  set(key, value) {
    this.add(new Pair(key, value), true);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(_, ctx, Type) {
    const map2 = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
    if (ctx?.onCreate)
      ctx.onCreate(map2);
    for (const item of this.items)
      addPairToJSMap(ctx, map2, item);
    return map2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    for (const item of this.items) {
      if (!isPair(item))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
    }
    if (!ctx.allNullValues && this.hasAllNullValues(false))
      ctx = Object.assign({}, ctx, { allNullValues: true });
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: ctx.indent || "",
      onChompKeep,
      onComment
    });
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/common/map.js
var map = {
  collection: "map",
  default: true,
  nodeClass: YAMLMap,
  tag: "tag:yaml.org,2002:map",
  resolve(map2, onError) {
    if (!isMap(map2))
      onError("Expected a mapping for this tag");
    return map2;
  },
  createNode: (schema4, obj, ctx) => YAMLMap.from(schema4, obj, ctx)
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/nodes/YAMLSeq.js
var YAMLSeq = class extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(schema4) {
    super(SEQ, schema4);
    this.items = [];
  }
  add(value) {
    this.items.push(value);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return false;
    const del = this.items.splice(idx, 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return void 0;
    const it = this.items[idx];
    return !keepScalar && isScalar(it) ? it.value : it;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(key) {
    const idx = asItemIndex(key);
    return typeof idx === "number" && idx < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(key, value) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      throw new Error(`Expected a valid index, not ${key}.`);
    const prev = this.items[idx];
    if (isScalar(prev) && isScalarValue(value))
      prev.value = value;
    else
      this.items[idx] = value;
  }
  toJSON(_, ctx) {
    const seq2 = [];
    if (ctx?.onCreate)
      ctx.onCreate(seq2);
    let i = 0;
    for (const item of this.items)
      seq2.push(toJS(item, String(i++), ctx));
    return seq2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (ctx.indent || "") + "  ",
      onChompKeep,
      onComment
    });
  }
  static from(schema4, obj, ctx) {
    const { replacer } = ctx;
    const seq2 = new this(schema4);
    if (obj && Symbol.iterator in Object(obj)) {
      let i = 0;
      for (let it of obj) {
        if (typeof replacer === "function") {
          const key = obj instanceof Set ? it : String(i++);
          it = replacer.call(obj, key, it);
        }
        seq2.items.push(createNode(it, void 0, ctx));
      }
    }
    return seq2;
  }
};
function asItemIndex(key) {
  let idx = isScalar(key) ? key.value : key;
  if (idx && typeof idx === "string")
    idx = Number(idx);
  return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/common/seq.js
var seq = {
  collection: "seq",
  default: true,
  nodeClass: YAMLSeq,
  tag: "tag:yaml.org,2002:seq",
  resolve(seq2, onError) {
    if (!isSeq(seq2))
      onError("Expected a sequence for this tag");
    return seq2;
  },
  createNode: (schema4, obj, ctx) => YAMLSeq.from(schema4, obj, ctx)
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/common/string.js
var string = {
  identify: (value) => typeof value === "string",
  default: true,
  tag: "tag:yaml.org,2002:str",
  resolve: (str) => str,
  stringify(item, ctx, onComment, onChompKeep) {
    ctx = Object.assign({ actualString: true }, ctx);
    return stringifyString(item, ctx, onComment, onChompKeep);
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/common/null.js
var nullTag = {
  identify: (value) => value == null,
  createNode: () => new Scalar(null),
  default: true,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new Scalar(null),
  stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/core/bool.js
var boolTag = {
  identify: (value) => typeof value === "boolean",
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (str) => new Scalar(str[0] === "t" || str[0] === "T"),
  stringify({ source, value }, ctx) {
    if (source && boolTag.test.test(source)) {
      const sv = source[0] === "t" || source[0] === "T";
      if (value === sv)
        return source;
    }
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyNumber.js
function stringifyNumber({ format, minFractionDigits, tag, value }) {
  if (typeof value === "bigint")
    return String(value);
  const num = typeof value === "number" ? value : Number(value);
  if (!isFinite(num))
    return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
  let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
  if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
    let i = n.indexOf(".");
    if (i < 0) {
      i = n.length;
      n += ".";
    }
    let d = minFractionDigits - (n.length - i - 1);
    while (d-- > 0)
      n += "0";
  }
  return n;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/core/float.js
var floatNaN = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
var floatExp = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
var float = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str));
    const dot = str.indexOf(".");
    if (dot !== -1 && str[str.length - 1] === "0")
      node.minFractionDigits = str.length - dot - 1;
    return node;
  },
  stringify: stringifyNumber
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/core/int.js
var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
function intStringify(node, radix, prefix) {
  const { value } = node;
  if (intIdentify(value) && value >= 0)
    return prefix + value.toString(radix);
  return stringifyNumber(node);
}
var intOct = {
  identify: (value) => intIdentify(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
  stringify: (node) => intStringify(node, 8, "0o")
};
var int = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
  stringify: stringifyNumber
};
var intHex = {
  identify: (value) => intIdentify(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
  stringify: (node) => intStringify(node, 16, "0x")
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/core/schema.js
var schema = [
  map,
  seq,
  string,
  nullTag,
  boolTag,
  intOct,
  int,
  intHex,
  floatNaN,
  floatExp,
  float
];

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/json/schema.js
function intIdentify2(value) {
  return typeof value === "bigint" || Number.isInteger(value);
}
var stringifyJSON = ({ value }) => JSON.stringify(value);
var jsonScalars = [
  {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify: stringifyJSON
  },
  {
    identify: (value) => value == null,
    createNode: () => new Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: stringifyJSON
  },
  {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^true$|^false$/,
    resolve: (str) => str === "true",
    stringify: stringifyJSON
  },
  {
    identify: intIdentify2,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
    stringify: ({ value }) => intIdentify2(value) ? value.toString() : JSON.stringify(value)
  },
  {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (str) => parseFloat(str),
    stringify: stringifyJSON
  }
];
var jsonError = {
  default: true,
  tag: "",
  test: /^/,
  resolve(str, onError) {
    onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
    return str;
  }
};
var schema2 = [map, seq].concat(jsonScalars, jsonError);

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js
var binary = {
  identify: (value) => value instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: false,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(src, onError) {
    if (typeof atob === "function") {
      const str = atob(src.replace(/[\n\r]/g, ""));
      const buffer = new Uint8Array(str.length);
      for (let i = 0; i < str.length; ++i)
        buffer[i] = str.charCodeAt(i);
      return buffer;
    } else {
      onError("This environment does not support reading binary tags; either Buffer or atob is required");
      return src;
    }
  },
  stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
    if (!value)
      return "";
    const buf = value;
    let str;
    if (typeof btoa === "function") {
      let s = "";
      for (let i = 0; i < buf.length; ++i)
        s += String.fromCharCode(buf[i]);
      str = btoa(s);
    } else {
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    }
    type ?? (type = Scalar.BLOCK_LITERAL);
    if (type !== Scalar.QUOTE_DOUBLE) {
      const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
      const n = Math.ceil(str.length / lineWidth);
      const lines = new Array(n);
      for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
        lines[i] = str.substr(o, lineWidth);
      }
      str = lines.join(type === Scalar.BLOCK_LITERAL ? "\n" : " ");
    }
    return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js
function resolvePairs(seq2, onError) {
  if (isSeq(seq2)) {
    for (let i = 0; i < seq2.items.length; ++i) {
      let item = seq2.items[i];
      if (isPair(item))
        continue;
      else if (isMap(item)) {
        if (item.items.length > 1)
          onError("Each pair must have its own sequence indicator");
        const pair = item.items[0] || new Pair(new Scalar(null));
        if (item.commentBefore)
          pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
        if (item.comment) {
          const cn = pair.value ?? pair.key;
          cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
        }
        item = pair;
      }
      seq2.items[i] = isPair(item) ? item : new Pair(item);
    }
  } else
    onError("Expected a sequence for this tag");
  return seq2;
}
function createPairs(schema4, iterable, ctx) {
  const { replacer } = ctx;
  const pairs2 = new YAMLSeq(schema4);
  pairs2.tag = "tag:yaml.org,2002:pairs";
  let i = 0;
  if (iterable && Symbol.iterator in Object(iterable))
    for (let it of iterable) {
      if (typeof replacer === "function")
        it = replacer.call(iterable, String(i++), it);
      let key, value;
      if (Array.isArray(it)) {
        if (it.length === 2) {
          key = it[0];
          value = it[1];
        } else
          throw new TypeError(`Expected [key, value] tuple: ${it}`);
      } else if (it && it instanceof Object) {
        const keys = Object.keys(it);
        if (keys.length === 1) {
          key = keys[0];
          value = it[key];
        } else {
          throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
        }
      } else {
        key = it;
      }
      pairs2.items.push(createPair(key, value, ctx));
    }
  return pairs2;
}
var pairs = {
  collection: "seq",
  default: false,
  tag: "tag:yaml.org,2002:pairs",
  resolve: resolvePairs,
  createNode: createPairs
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js
var YAMLOMap = class _YAMLOMap extends YAMLSeq {
  constructor() {
    super();
    this.add = YAMLMap.prototype.add.bind(this);
    this.delete = YAMLMap.prototype.delete.bind(this);
    this.get = YAMLMap.prototype.get.bind(this);
    this.has = YAMLMap.prototype.has.bind(this);
    this.set = YAMLMap.prototype.set.bind(this);
    this.tag = _YAMLOMap.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(_, ctx) {
    if (!ctx)
      return super.toJSON(_);
    const map2 = /* @__PURE__ */ new Map();
    if (ctx?.onCreate)
      ctx.onCreate(map2);
    for (const pair of this.items) {
      let key, value;
      if (isPair(pair)) {
        key = toJS(pair.key, "", ctx);
        value = toJS(pair.value, key, ctx);
      } else {
        key = toJS(pair, "", ctx);
      }
      if (map2.has(key))
        throw new Error("Ordered maps must not include duplicate keys");
      map2.set(key, value);
    }
    return map2;
  }
  static from(schema4, iterable, ctx) {
    const pairs2 = createPairs(schema4, iterable, ctx);
    const omap2 = new this();
    omap2.items = pairs2.items;
    return omap2;
  }
};
YAMLOMap.tag = "tag:yaml.org,2002:omap";
var omap = {
  collection: "seq",
  identify: (value) => value instanceof Map,
  nodeClass: YAMLOMap,
  default: false,
  tag: "tag:yaml.org,2002:omap",
  resolve(seq2, onError) {
    const pairs2 = resolvePairs(seq2, onError);
    const seenKeys = [];
    for (const { key } of pairs2.items) {
      if (isScalar(key)) {
        if (seenKeys.includes(key.value)) {
          onError(`Ordered maps must not include duplicate keys: ${key.value}`);
        } else {
          seenKeys.push(key.value);
        }
      }
    }
    return Object.assign(new YAMLOMap(), pairs2);
  },
  createNode: (schema4, iterable, ctx) => YAMLOMap.from(schema4, iterable, ctx)
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js
function boolStringify({ value, source }, ctx) {
  const boolObj = value ? trueTag : falseTag;
  if (source && boolObj.test.test(source))
    return source;
  return value ? ctx.options.trueStr : ctx.options.falseStr;
}
var trueTag = {
  identify: (value) => value === true,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new Scalar(true),
  stringify: boolStringify
};
var falseTag = {
  identify: (value) => value === false,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new Scalar(false),
  stringify: boolStringify
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/float.js
var floatNaN2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
var floatExp2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str.replace(/_/g, "")),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
var float2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str.replace(/_/g, "")));
    const dot = str.indexOf(".");
    if (dot !== -1) {
      const f = str.substring(dot + 1).replace(/_/g, "");
      if (f[f.length - 1] === "0")
        node.minFractionDigits = f.length;
    }
    return node;
  },
  stringify: stringifyNumber
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/int.js
var intIdentify3 = (value) => typeof value === "bigint" || Number.isInteger(value);
function intResolve2(str, offset, radix, { intAsBigInt }) {
  const sign = str[0];
  if (sign === "-" || sign === "+")
    offset += 1;
  str = str.substring(offset).replace(/_/g, "");
  if (intAsBigInt) {
    switch (radix) {
      case 2:
        str = `0b${str}`;
        break;
      case 8:
        str = `0o${str}`;
        break;
      case 16:
        str = `0x${str}`;
        break;
    }
    const n2 = BigInt(str);
    return sign === "-" ? BigInt(-1) * n2 : n2;
  }
  const n = parseInt(str, radix);
  return sign === "-" ? -1 * n : n;
}
function intStringify2(node, radix, prefix) {
  const { value } = node;
  if (intIdentify3(value)) {
    const str = value.toString(radix);
    return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
  }
  return stringifyNumber(node);
}
var intBin = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 2, 2, opt),
  stringify: (node) => intStringify2(node, 2, "0b")
};
var intOct2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 1, 8, opt),
  stringify: (node) => intStringify2(node, 8, "0")
};
var int2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (str, _onError, opt) => intResolve2(str, 0, 10, opt),
  stringify: stringifyNumber
};
var intHex2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 2, 16, opt),
  stringify: (node) => intStringify2(node, 16, "0x")
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/set.js
var YAMLSet = class _YAMLSet extends YAMLMap {
  constructor(schema4) {
    super(schema4);
    this.tag = _YAMLSet.tag;
  }
  add(key) {
    let pair;
    if (isPair(key))
      pair = key;
    else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
      pair = new Pair(key.key, null);
    else
      pair = new Pair(key, null);
    const prev = findPair(this.items, pair.key);
    if (!prev)
      this.items.push(pair);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(key, keepPair) {
    const pair = findPair(this.items, key);
    return !keepPair && isPair(pair) ? isScalar(pair.key) ? pair.key.value : pair.key : pair;
  }
  set(key, value) {
    if (typeof value !== "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
    const prev = findPair(this.items, key);
    if (prev && !value) {
      this.items.splice(this.items.indexOf(prev), 1);
    } else if (!prev && value) {
      this.items.push(new Pair(key));
    }
  }
  toJSON(_, ctx) {
    return super.toJSON(_, ctx, Set);
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    if (this.hasAllNullValues(true))
      return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
    else
      throw new Error("Set items must all have null values");
  }
  static from(schema4, iterable, ctx) {
    const { replacer } = ctx;
    const set2 = new this(schema4);
    if (iterable && Symbol.iterator in Object(iterable))
      for (let value of iterable) {
        if (typeof replacer === "function")
          value = replacer.call(iterable, value, value);
        set2.items.push(createPair(value, null, ctx));
      }
    return set2;
  }
};
YAMLSet.tag = "tag:yaml.org,2002:set";
var set = {
  collection: "map",
  identify: (value) => value instanceof Set,
  nodeClass: YAMLSet,
  default: false,
  tag: "tag:yaml.org,2002:set",
  createNode: (schema4, iterable, ctx) => YAMLSet.from(schema4, iterable, ctx),
  resolve(map2, onError) {
    if (isMap(map2)) {
      if (map2.hasAllNullValues(true))
        return Object.assign(new YAMLSet(), map2);
      else
        onError("Set items must all have null values");
    } else
      onError("Expected a mapping for this tag");
    return map2;
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js
function parseSexagesimal(str, asBigInt) {
  const sign = str[0];
  const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
  const num = (n) => asBigInt ? BigInt(n) : Number(n);
  const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
  return sign === "-" ? num(-1) * res : res;
}
function stringifySexagesimal(node) {
  let { value } = node;
  let num = (n) => n;
  if (typeof value === "bigint")
    num = (n) => BigInt(n);
  else if (isNaN(value) || !isFinite(value))
    return stringifyNumber(node);
  let sign = "";
  if (value < 0) {
    sign = "-";
    value *= num(-1);
  }
  const _60 = num(60);
  const parts = [value % _60];
  if (value < 60) {
    parts.unshift(0);
  } else {
    value = (value - parts[0]) / _60;
    parts.unshift(value % _60);
    if (value >= 60) {
      value = (value - parts[0]) / _60;
      parts.unshift(value);
    }
  }
  return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
var intTime = {
  identify: (value) => typeof value === "bigint" || Number.isInteger(value),
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
  stringify: stringifySexagesimal
};
var floatTime = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (str) => parseSexagesimal(str, false),
  stringify: stringifySexagesimal
};
var timestamp = {
  identify: (value) => value instanceof Date,
  default: true,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(str) {
    const match = str.match(timestamp.test);
    if (!match)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, year, month, day, hour, minute, second] = match.map(Number);
    const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
    let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
    const tz = match[8];
    if (tz && tz !== "Z") {
      let d = parseSexagesimal(tz, false);
      if (Math.abs(d) < 30)
        d *= 60;
      date -= 6e4 * d;
    }
    return new Date(date);
  },
  stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js
var schema3 = [
  map,
  seq,
  string,
  nullTag,
  trueTag,
  falseTag,
  intBin,
  intOct2,
  int2,
  intHex2,
  floatNaN2,
  floatExp2,
  float2,
  binary,
  merge,
  omap,
  pairs,
  set,
  intTime,
  floatTime,
  timestamp
];

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/tags.js
var schemas = /* @__PURE__ */ new Map([
  ["core", schema],
  ["failsafe", [map, seq, string]],
  ["json", schema2],
  ["yaml11", schema3],
  ["yaml-1.1", schema3]
]);
var tagsByName = {
  binary,
  bool: boolTag,
  float,
  floatExp,
  floatNaN,
  floatTime,
  int,
  intHex,
  intOct,
  intTime,
  map,
  merge,
  null: nullTag,
  omap,
  pairs,
  seq,
  set,
  timestamp
};
var coreKnownTags = {
  "tag:yaml.org,2002:binary": binary,
  "tag:yaml.org,2002:merge": merge,
  "tag:yaml.org,2002:omap": omap,
  "tag:yaml.org,2002:pairs": pairs,
  "tag:yaml.org,2002:set": set,
  "tag:yaml.org,2002:timestamp": timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
  const schemaTags = schemas.get(schemaName);
  if (schemaTags && !customTags) {
    return addMergeTag && !schemaTags.includes(merge) ? schemaTags.concat(merge) : schemaTags.slice();
  }
  let tags = schemaTags;
  if (!tags) {
    if (Array.isArray(customTags))
      tags = [];
    else {
      const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
    }
  }
  if (Array.isArray(customTags)) {
    for (const tag of customTags)
      tags = tags.concat(tag);
  } else if (typeof customTags === "function") {
    tags = customTags(tags.slice());
  }
  if (addMergeTag)
    tags = tags.concat(merge);
  return tags.reduce((tags2, tag) => {
    const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
    if (!tagObj) {
      const tagName = JSON.stringify(tag);
      const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
    }
    if (!tags2.includes(tagObj))
      tags2.push(tagObj);
    return tags2;
  }, []);
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/schema/Schema.js
var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
var Schema = class _Schema {
  constructor({ compat, customTags, merge: merge2, resolveKnownTags, schema: schema4, sortMapEntries, toStringDefaults }) {
    this.compat = Array.isArray(compat) ? getTags(compat, "compat") : compat ? getTags(null, compat) : null;
    this.name = typeof schema4 === "string" && schema4 || "core";
    this.knownTags = resolveKnownTags ? coreKnownTags : {};
    this.tags = getTags(customTags, this.name, merge2);
    this.toStringOptions = toStringDefaults ?? null;
    Object.defineProperty(this, MAP, { value: map });
    Object.defineProperty(this, SCALAR, { value: string });
    Object.defineProperty(this, SEQ, { value: seq });
    this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
  }
  clone() {
    const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
    copy.tags = this.tags.slice();
    return copy;
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/stringify/stringifyDocument.js
function stringifyDocument(doc, options) {
  const lines = [];
  let hasDirectives = options.directives === true;
  if (options.directives !== false && doc.directives) {
    const dir = doc.directives.toString(doc);
    if (dir) {
      lines.push(dir);
      hasDirectives = true;
    } else if (doc.directives.docStart)
      hasDirectives = true;
  }
  if (hasDirectives)
    lines.push("---");
  const ctx = createStringifyContext(doc, options);
  const { commentString } = ctx.options;
  if (doc.commentBefore) {
    if (lines.length !== 1)
      lines.unshift("");
    const cs = commentString(doc.commentBefore);
    lines.unshift(indentComment(cs, ""));
  }
  let chompKeep = false;
  let contentComment = null;
  if (doc.contents) {
    if (isNode(doc.contents)) {
      if (doc.contents.spaceBefore && hasDirectives)
        lines.push("");
      if (doc.contents.commentBefore) {
        const cs = commentString(doc.contents.commentBefore);
        lines.push(indentComment(cs, ""));
      }
      ctx.forceBlockIndent = !!doc.comment;
      contentComment = doc.contents.comment;
    }
    const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
    let body = stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
    if (contentComment)
      body += lineComment(body, "", commentString(contentComment));
    if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
      lines[lines.length - 1] = `--- ${body}`;
    } else
      lines.push(body);
  } else {
    lines.push(stringify(doc.contents, ctx));
  }
  if (doc.directives?.docEnd) {
    if (doc.comment) {
      const cs = commentString(doc.comment);
      if (cs.includes("\n")) {
        lines.push("...");
        lines.push(indentComment(cs, ""));
      } else {
        lines.push(`... ${cs}`);
      }
    } else {
      lines.push("...");
    }
  } else {
    let dc = doc.comment;
    if (dc && chompKeep)
      dc = dc.replace(/^\n+/, "");
    if (dc) {
      if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
        lines.push("");
      lines.push(indentComment(commentString(dc), ""));
    }
  }
  return lines.join("\n") + "\n";
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/doc/Document.js
var Document = class _Document {
  constructor(value, replacer, options) {
    this.commentBefore = null;
    this.comment = null;
    this.errors = [];
    this.warnings = [];
    Object.defineProperty(this, NODE_TYPE, { value: DOC });
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const opt = Object.assign({
      intAsBigInt: false,
      keepSourceTokens: false,
      logLevel: "warn",
      prettyErrors: true,
      strict: true,
      stringKeys: false,
      uniqueKeys: true,
      version: "1.2"
    }, options);
    this.options = opt;
    let { version } = opt;
    if (options?._directives) {
      this.directives = options._directives.atDocument();
      if (this.directives.yaml.explicit)
        version = this.directives.yaml.version;
    } else
      this.directives = new Directives({ version });
    this.setSchema(version, options);
    this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const copy = Object.create(_Document.prototype, {
      [NODE_TYPE]: { value: DOC }
    });
    copy.commentBefore = this.commentBefore;
    copy.comment = this.comment;
    copy.errors = this.errors.slice();
    copy.warnings = this.warnings.slice();
    copy.options = Object.assign({}, this.options);
    if (this.directives)
      copy.directives = this.directives.clone();
    copy.schema = this.schema.clone();
    copy.contents = isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** Adds a value to the document. */
  add(value) {
    if (assertCollection(this.contents))
      this.contents.add(value);
  }
  /** Adds a value to the document. */
  addIn(path, value) {
    if (assertCollection(this.contents))
      this.contents.addIn(path, value);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(node, name) {
    if (!node.anchor) {
      const prev = anchorNames(this);
      node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !name || prev.has(name) ? findNewAnchor(name || "a", prev) : name;
    }
    return new Alias(node.anchor);
  }
  createNode(value, replacer, options) {
    let _replacer = void 0;
    if (typeof replacer === "function") {
      value = replacer.call({ "": value }, "", value);
      _replacer = replacer;
    } else if (Array.isArray(replacer)) {
      const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
      const asStr = replacer.filter(keyToStr).map(String);
      if (asStr.length > 0)
        replacer = replacer.concat(asStr);
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
    const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      anchorPrefix || "a"
    );
    const ctx = {
      aliasDuplicateObjects: aliasDuplicateObjects ?? true,
      keepUndefined: keepUndefined ?? false,
      onAnchor,
      onTagObj,
      replacer: _replacer,
      schema: this.schema,
      sourceObjects
    };
    const node = createNode(value, tag, ctx);
    if (flow && isCollection(node))
      node.flow = true;
    setAnchors();
    return node;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(key, value, options = {}) {
    const k = this.createNode(key, null, options);
    const v = this.createNode(value, null, options);
    return new Pair(k, v);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    return assertCollection(this.contents) ? this.contents.delete(key) : false;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    if (isEmptyPath(path)) {
      if (this.contents == null)
        return false;
      this.contents = null;
      return true;
    }
    return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(key, keepScalar) {
    return isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    if (isEmptyPath(path))
      return !keepScalar && isScalar(this.contents) ? this.contents.value : this.contents;
    return isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(key) {
    return isCollection(this.contents) ? this.contents.has(key) : false;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(path) {
    if (isEmptyPath(path))
      return this.contents !== void 0;
    return isCollection(this.contents) ? this.contents.hasIn(path) : false;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(key, value) {
    if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, [key], value);
    } else if (assertCollection(this.contents)) {
      this.contents.set(key, value);
    }
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    if (isEmptyPath(path)) {
      this.contents = value;
    } else if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, Array.from(path), value);
    } else if (assertCollection(this.contents)) {
      this.contents.setIn(path, value);
    }
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(version, options = {}) {
    if (typeof version === "number")
      version = String(version);
    let opt;
    switch (version) {
      case "1.1":
        if (this.directives)
          this.directives.yaml.version = "1.1";
        else
          this.directives = new Directives({ version: "1.1" });
        opt = { resolveKnownTags: false, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        if (this.directives)
          this.directives.yaml.version = version;
        else
          this.directives = new Directives({ version });
        opt = { resolveKnownTags: true, schema: "core" };
        break;
      case null:
        if (this.directives)
          delete this.directives;
        opt = null;
        break;
      default: {
        const sv = JSON.stringify(version);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
      }
    }
    if (options.schema instanceof Object)
      this.schema = options.schema;
    else if (opt)
      this.schema = new Schema(Object.assign(opt, options));
    else
      throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !json,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this.contents, jsonArg ?? "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(jsonArg, onAnchor) {
    return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
  }
  /** A YAML representation of the document. */
  toString(options = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
      const s = JSON.stringify(options.indent);
      throw new Error(`"indent" option must be a positive integer, not ${s}`);
    }
    return stringifyDocument(this, options);
  }
};
function assertCollection(contents) {
  if (isCollection(contents))
    return true;
  throw new Error("Expected a YAML collection as document contents");
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/errors.js
var YAMLError = class extends Error {
  constructor(name, pos, code, message) {
    super();
    this.name = name;
    this.code = code;
    this.message = message;
    this.pos = pos;
  }
};
var YAMLParseError = class extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLParseError", pos, code, message);
  }
};
var YAMLWarning = class extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLWarning", pos, code, message);
  }
};
var prettifyError = (src, lc) => (error) => {
  if (error.pos[0] === -1)
    return;
  error.linePos = error.pos.map((pos) => lc.linePos(pos));
  const { line, col } = error.linePos[0];
  error.message += ` at line ${line}, column ${col}`;
  let ci = col - 1;
  let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
  if (ci >= 60 && lineStr.length > 80) {
    const trimStart = Math.min(ci - 39, lineStr.length - 79);
    lineStr = "\u2026" + lineStr.substring(trimStart);
    ci -= trimStart - 1;
  }
  if (lineStr.length > 80)
    lineStr = lineStr.substring(0, 79) + "\u2026";
  if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
    let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
    if (prev.length > 80)
      prev = prev.substring(0, 79) + "\u2026\n";
    lineStr = prev + lineStr;
  }
  if (/[^ ]/.test(lineStr)) {
    let count = 1;
    const end = error.linePos[1];
    if (end?.line === line && end.col > col) {
      count = Math.max(1, Math.min(end.col - col, 80 - ci));
    }
    const pointer = " ".repeat(ci) + "^".repeat(count);
    error.message += `:

${lineStr}
${pointer}
`;
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-props.js
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
  let spaceBefore = false;
  let atNewline = startOnNewline;
  let hasSpace = startOnNewline;
  let comment = "";
  let commentSep = "";
  let hasNewline = false;
  let reqSpace = false;
  let tab = null;
  let anchor = null;
  let tag = null;
  let newlineAfterProp = null;
  let comma = null;
  let found = null;
  let start = null;
  for (const token of tokens) {
    if (reqSpace) {
      if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
        onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      reqSpace = false;
    }
    if (tab) {
      if (atNewline && token.type !== "comment" && token.type !== "newline") {
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      }
      tab = null;
    }
    switch (token.type) {
      case "space":
        if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
          tab = token;
        }
        hasSpace = true;
        break;
      case "comment": {
        if (!hasSpace)
          onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const cb = token.source.substring(1) || " ";
        if (!comment)
          comment = cb;
        else
          comment += commentSep + cb;
        commentSep = "";
        atNewline = false;
        break;
      }
      case "newline":
        if (atNewline) {
          if (comment)
            comment += token.source;
          else if (!found || indicator !== "seq-item-ind")
            spaceBefore = true;
        } else
          commentSep += token.source;
        atNewline = true;
        hasNewline = true;
        if (anchor || tag)
          newlineAfterProp = token;
        hasSpace = true;
        break;
      case "anchor":
        if (anchor)
          onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
        if (token.source.endsWith(":"))
          onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
        anchor = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      case "tag": {
        if (tag)
          onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
        tag = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      }
      case indicator:
        if (anchor || tag)
          onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
        if (found)
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
        found = token;
        atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
        hasSpace = false;
        break;
      case "comma":
        if (flow) {
          if (comma)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
          comma = token;
          atNewline = false;
          hasSpace = false;
          break;
        }
      default:
        onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
        atNewline = false;
        hasSpace = false;
    }
  }
  const last = tokens[tokens.length - 1];
  const end = last ? last.offset + last.source.length : offset;
  if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
    onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
  }
  if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
    onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
  return {
    comma,
    found,
    spaceBefore,
    comment,
    hasNewline,
    anchor,
    tag,
    newlineAfterProp,
    end,
    start: start ?? end
  };
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/util-contains-newline.js
function containsNewline(key) {
  if (!key)
    return null;
  switch (key.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (key.source.includes("\n"))
        return true;
      if (key.end) {
        for (const st of key.end)
          if (st.type === "newline")
            return true;
      }
      return false;
    case "flow-collection":
      for (const it of key.items) {
        for (const st of it.start)
          if (st.type === "newline")
            return true;
        if (it.sep) {
          for (const st of it.sep)
            if (st.type === "newline")
              return true;
        }
        if (containsNewline(it.key) || containsNewline(it.value))
          return true;
      }
      return false;
    default:
      return true;
  }
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/util-flow-indent-check.js
function flowIndentCheck(indent, fc, onError) {
  if (fc?.type === "flow-collection") {
    const end = fc.end[0];
    if (end.indent === indent && (end.source === "]" || end.source === "}") && containsNewline(fc)) {
      const msg = "Flow end indicator should be more indented than parent";
      onError(end, "BAD_INDENT", msg, true);
    }
  }
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/util-map-includes.js
function mapIncludes(ctx, items, search) {
  const { uniqueKeys } = ctx.options;
  if (uniqueKeys === false)
    return false;
  const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || isScalar(a) && isScalar(b) && a.value === b.value;
  return items.some((pair) => isEqual(pair.key, search));
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-block-map.js
var startColMsg = "All mapping items must start at the same column";
function resolveBlockMap({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bm, onError, tag) {
  const NodeClass = tag?.nodeClass ?? YAMLMap;
  const map2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  let offset = bm.offset;
  let commentEnd = null;
  for (const collItem of bm.items) {
    const { start, key, sep, value } = collItem;
    const keyProps = resolveProps(start, {
      indicator: "explicit-key-ind",
      next: key ?? sep?.[0],
      offset,
      onError,
      parentIndent: bm.indent,
      startOnNewline: true
    });
    const implicitKey = !keyProps.found;
    if (implicitKey) {
      if (key) {
        if (key.type === "block-seq")
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
        else if ("indent" in key && key.indent !== bm.indent)
          onError(offset, "BAD_INDENT", startColMsg);
      }
      if (!keyProps.anchor && !keyProps.tag && !sep) {
        commentEnd = keyProps.end;
        if (keyProps.comment) {
          if (map2.comment)
            map2.comment += "\n" + keyProps.comment;
          else
            map2.comment = keyProps.comment;
        }
        continue;
      }
      if (keyProps.newlineAfterProp || containsNewline(key)) {
        onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      }
    } else if (keyProps.found?.indent !== bm.indent) {
      onError(offset, "BAD_INDENT", startColMsg);
    }
    ctx.atKey = true;
    const keyStart = keyProps.end;
    const keyNode = key ? composeNode2(ctx, key, keyProps, onError) : composeEmptyNode2(ctx, keyStart, start, null, keyProps, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bm.indent, key, onError);
    ctx.atKey = false;
    if (mapIncludes(ctx, map2.items, keyNode))
      onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
    const valueProps = resolveProps(sep ?? [], {
      indicator: "map-value-ind",
      next: value,
      offset: keyNode.range[2],
      onError,
      parentIndent: bm.indent,
      startOnNewline: !key || key.type === "block-scalar"
    });
    offset = valueProps.end;
    if (valueProps.found) {
      if (implicitKey) {
        if (value?.type === "block-map" && !valueProps.hasNewline)
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
        if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
          onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : composeEmptyNode2(ctx, offset, sep, null, valueProps, onError);
      if (ctx.schema.compat)
        flowIndentCheck(bm.indent, value, onError);
      offset = valueNode.range[2];
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    } else {
      if (implicitKey)
        onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
      if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    }
  }
  if (commentEnd && commentEnd < offset)
    onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
  map2.range = [bm.offset, offset, commentEnd ?? offset];
  return map2;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-block-seq.js
function resolveBlockSeq({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bs, onError, tag) {
  const NodeClass = tag?.nodeClass ?? YAMLSeq;
  const seq2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = bs.offset;
  let commentEnd = null;
  for (const { start, value } of bs.items) {
    const props = resolveProps(start, {
      indicator: "seq-item-ind",
      next: value,
      offset,
      onError,
      parentIndent: bs.indent,
      startOnNewline: true
    });
    if (!props.found) {
      if (props.anchor || props.tag || value) {
        if (value?.type === "block-seq")
          onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
        else
          onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
      } else {
        commentEnd = props.end;
        if (props.comment)
          seq2.comment = props.comment;
        continue;
      }
    }
    const node = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, start, null, props, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bs.indent, value, onError);
    offset = node.range[2];
    seq2.items.push(node);
  }
  seq2.range = [bs.offset, offset, commentEnd ?? offset];
  return seq2;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-end.js
function resolveEnd(end, offset, reqSpace, onError) {
  let comment = "";
  if (end) {
    let hasSpace = false;
    let sep = "";
    for (const token of end) {
      const { source, type } = token;
      switch (type) {
        case "space":
          hasSpace = true;
          break;
        case "comment": {
          if (reqSpace && !hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += sep + cb;
          sep = "";
          break;
        }
        case "newline":
          if (comment)
            sep += source;
          hasSpace = true;
          break;
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
      }
      offset += source.length;
    }
  }
  return { comment, offset };
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-flow-collection.js
var blockMsg = "Block collections are not allowed within flow collections";
var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
function resolveFlowCollection({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, fc, onError, tag) {
  const isMap2 = fc.start.source === "{";
  const fcName = isMap2 ? "flow map" : "flow sequence";
  const NodeClass = tag?.nodeClass ?? (isMap2 ? YAMLMap : YAMLSeq);
  const coll = new NodeClass(ctx.schema);
  coll.flow = true;
  const atRoot = ctx.atRoot;
  if (atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = fc.offset + fc.start.source.length;
  for (let i = 0; i < fc.items.length; ++i) {
    const collItem = fc.items[i];
    const { start, key, sep, value } = collItem;
    const props = resolveProps(start, {
      flow: fcName,
      indicator: "explicit-key-ind",
      next: key ?? sep?.[0],
      offset,
      onError,
      parentIndent: fc.indent,
      startOnNewline: false
    });
    if (!props.found) {
      if (!props.anchor && !props.tag && !sep && !value) {
        if (i === 0 && props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        else if (i < fc.items.length - 1)
          onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
        if (props.comment) {
          if (coll.comment)
            coll.comment += "\n" + props.comment;
          else
            coll.comment = props.comment;
        }
        offset = props.end;
        continue;
      }
      if (!isMap2 && ctx.options.strict && containsNewline(key))
        onError(
          key,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
    }
    if (i === 0) {
      if (props.comma)
        onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
    } else {
      if (!props.comma)
        onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
      if (props.comment) {
        let prevItemComment = "";
        loop:
          for (const st of start) {
            switch (st.type) {
              case "comma":
              case "space":
                break;
              case "comment":
                prevItemComment = st.source.substring(1);
                break loop;
              default:
                break loop;
            }
          }
        if (prevItemComment) {
          let prev = coll.items[coll.items.length - 1];
          if (isPair(prev))
            prev = prev.value ?? prev.key;
          if (prev.comment)
            prev.comment += "\n" + prevItemComment;
          else
            prev.comment = prevItemComment;
          props.comment = props.comment.substring(prevItemComment.length + 1);
        }
      }
    }
    if (!isMap2 && !sep && !props.found) {
      const valueNode = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, sep, null, props, onError);
      coll.items.push(valueNode);
      offset = valueNode.range[2];
      if (isBlock(value))
        onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
    } else {
      ctx.atKey = true;
      const keyStart = props.end;
      const keyNode = key ? composeNode2(ctx, key, props, onError) : composeEmptyNode2(ctx, keyStart, start, null, props, onError);
      if (isBlock(key))
        onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
      ctx.atKey = false;
      const valueProps = resolveProps(sep ?? [], {
        flow: fcName,
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (valueProps.found) {
        if (!isMap2 && !props.found && ctx.options.strict) {
          if (sep)
            for (const st of sep) {
              if (st === valueProps.found)
                break;
              if (st.type === "newline") {
                onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          if (props.start < valueProps.found.offset - 1024)
            onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else if (value) {
        if ("source" in value && value.source?.[0] === ":")
          onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
        else
          onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode2(ctx, valueProps.end, sep, null, valueProps, onError) : null;
      if (valueNode) {
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      if (isMap2) {
        const map2 = coll;
        if (mapIncludes(ctx, map2.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        map2.items.push(pair);
      } else {
        const map2 = new YAMLMap(ctx.schema);
        map2.flow = true;
        map2.items.push(pair);
        const endRange = (valueNode ?? keyNode).range;
        map2.range = [keyNode.range[0], endRange[1], endRange[2]];
        coll.items.push(map2);
      }
      offset = valueNode ? valueNode.range[2] : valueProps.end;
    }
  }
  const expectedEnd = isMap2 ? "}" : "]";
  const [ce, ...ee] = fc.end;
  let cePos = offset;
  if (ce?.source === expectedEnd)
    cePos = ce.offset + ce.source.length;
  else {
    const name = fcName[0].toUpperCase() + fcName.substring(1);
    const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
    onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
    if (ce && ce.source.length !== 1)
      ee.unshift(ce);
  }
  if (ee.length > 0) {
    const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
    if (end.comment) {
      if (coll.comment)
        coll.comment += "\n" + end.comment;
      else
        coll.comment = end.comment;
    }
    coll.range = [fc.offset, cePos, end.offset];
  } else {
    coll.range = [fc.offset, cePos, cePos];
  }
  return coll;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/compose-collection.js
function resolveCollection(CN2, ctx, token, onError, tagName, tag) {
  const coll = token.type === "block-map" ? resolveBlockMap(CN2, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq(CN2, ctx, token, onError, tag) : resolveFlowCollection(CN2, ctx, token, onError, tag);
  const Coll = coll.constructor;
  if (tagName === "!" || tagName === Coll.tagName) {
    coll.tag = Coll.tagName;
    return coll;
  }
  if (tagName)
    coll.tag = tagName;
  return coll;
}
function composeCollection(CN2, ctx, token, props, onError) {
  const tagToken = props.tag;
  const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
  if (token.type === "block-seq") {
    const { anchor, newlineAfterProp: nl } = props;
    const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
    if (lastProp && (!nl || nl.offset < lastProp.offset)) {
      const message = "Missing newline after block sequence props";
      onError(lastProp, "MISSING_CHAR", message);
    }
  }
  const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
  if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.tagName && expType === "seq") {
    return resolveCollection(CN2, ctx, token, onError, tagName);
  }
  let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
  if (!tag) {
    const kt = ctx.schema.knownTags[tagName];
    if (kt?.collection === expType) {
      ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
      tag = kt;
    } else {
      if (kt) {
        onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
      } else {
        onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
      }
      return resolveCollection(CN2, ctx, token, onError, tagName);
    }
  }
  const coll = resolveCollection(CN2, ctx, token, onError, tagName, tag);
  const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
  const node = isNode(res) ? res : new Scalar(res);
  node.range = coll.range;
  node.tag = tagName;
  if (tag?.format)
    node.format = tag.format;
  return node;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-block-scalar.js
function resolveBlockScalar(ctx, scalar, onError) {
  const start = scalar.offset;
  const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
  if (!header)
    return { value: "", type: null, comment: "", range: [start, start, start] };
  const type = header.mode === ">" ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
  const lines = scalar.source ? splitLines(scalar.source) : [];
  let chompStart = lines.length;
  for (let i = lines.length - 1; i >= 0; --i) {
    const content = lines[i][1];
    if (content === "" || content === "\r")
      chompStart = i;
    else
      break;
  }
  if (chompStart === 0) {
    const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
    let end2 = start + header.length;
    if (scalar.source)
      end2 += scalar.source.length;
    return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
  }
  let trimIndent = scalar.indent + header.indent;
  let offset = scalar.offset + header.length;
  let contentStart = 0;
  for (let i = 0; i < chompStart; ++i) {
    const [indent, content] = lines[i];
    if (content === "" || content === "\r") {
      if (header.indent === 0 && indent.length > trimIndent)
        trimIndent = indent.length;
    } else {
      if (indent.length < trimIndent) {
        const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
        onError(offset + indent.length, "MISSING_CHAR", message);
      }
      if (header.indent === 0)
        trimIndent = indent.length;
      contentStart = i;
      if (trimIndent === 0 && !ctx.atRoot) {
        const message = "Block scalar values in collections must be indented";
        onError(offset, "BAD_INDENT", message);
      }
      break;
    }
    offset += indent.length + content.length + 1;
  }
  for (let i = lines.length - 1; i >= chompStart; --i) {
    if (lines[i][0].length > trimIndent)
      chompStart = i + 1;
  }
  let value = "";
  let sep = "";
  let prevMoreIndented = false;
  for (let i = 0; i < contentStart; ++i)
    value += lines[i][0].slice(trimIndent) + "\n";
  for (let i = contentStart; i < chompStart; ++i) {
    let [indent, content] = lines[i];
    offset += indent.length + content.length + 1;
    const crlf = content[content.length - 1] === "\r";
    if (crlf)
      content = content.slice(0, -1);
    if (content && indent.length < trimIndent) {
      const src = header.indent ? "explicit indentation indicator" : "first line";
      const message = `Block scalar lines must not be less indented than their ${src}`;
      onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
      indent = "";
    }
    if (type === Scalar.BLOCK_LITERAL) {
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
    } else if (indent.length > trimIndent || content[0] === "	") {
      if (sep === " ")
        sep = "\n";
      else if (!prevMoreIndented && sep === "\n")
        sep = "\n\n";
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
      prevMoreIndented = true;
    } else if (content === "") {
      if (sep === "\n")
        value += "\n";
      else
        sep = "\n";
    } else {
      value += sep + content;
      sep = " ";
      prevMoreIndented = false;
    }
  }
  switch (header.chomp) {
    case "-":
      break;
    case "+":
      for (let i = chompStart; i < lines.length; ++i)
        value += "\n" + lines[i][0].slice(trimIndent);
      if (value[value.length - 1] !== "\n")
        value += "\n";
      break;
    default:
      value += "\n";
  }
  const end = start + header.length + scalar.source.length;
  return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
  if (props[0].type !== "block-scalar-header") {
    onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
    return null;
  }
  const { source } = props[0];
  const mode = source[0];
  let indent = 0;
  let chomp = "";
  let error = -1;
  for (let i = 1; i < source.length; ++i) {
    const ch = source[i];
    if (!chomp && (ch === "-" || ch === "+"))
      chomp = ch;
    else {
      const n = Number(ch);
      if (!indent && n)
        indent = n;
      else if (error === -1)
        error = offset + i;
    }
  }
  if (error !== -1)
    onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
  let hasSpace = false;
  let comment = "";
  let length = source.length;
  for (let i = 1; i < props.length; ++i) {
    const token = props[i];
    switch (token.type) {
      case "space":
        hasSpace = true;
      case "newline":
        length += token.source.length;
        break;
      case "comment":
        if (strict && !hasSpace) {
          const message = "Comments must be separated from other tokens by white space characters";
          onError(token, "MISSING_CHAR", message);
        }
        length += token.source.length;
        comment = token.source.substring(1);
        break;
      case "error":
        onError(token, "UNEXPECTED_TOKEN", token.message);
        length += token.source.length;
        break;
      default: {
        const message = `Unexpected token in block scalar header: ${token.type}`;
        onError(token, "UNEXPECTED_TOKEN", message);
        const ts = token.source;
        if (ts && typeof ts === "string")
          length += ts.length;
      }
    }
  }
  return { mode, indent, chomp, comment, length };
}
function splitLines(source) {
  const split = source.split(/\n( *)/);
  const first = split[0];
  const m = first.match(/^( *)/);
  const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
  const lines = [line0];
  for (let i = 1; i < split.length; i += 2)
    lines.push([split[i], split[i + 1]]);
  return lines;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js
function resolveFlowScalar(scalar, strict, onError) {
  const { offset, type, source, end } = scalar;
  let _type;
  let value;
  const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
  switch (type) {
    case "scalar":
      _type = Scalar.PLAIN;
      value = plainValue(source, _onError);
      break;
    case "single-quoted-scalar":
      _type = Scalar.QUOTE_SINGLE;
      value = singleQuotedValue(source, _onError);
      break;
    case "double-quoted-scalar":
      _type = Scalar.QUOTE_DOUBLE;
      value = doubleQuotedValue(source, _onError);
      break;
    default:
      onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
      return {
        value: "",
        type: null,
        comment: "",
        range: [offset, offset + source.length, offset + source.length]
      };
  }
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, strict, onError);
  return {
    value,
    type: _type,
    comment: re.comment,
    range: [offset, valueEnd, re.offset]
  };
}
function plainValue(source, onError) {
  let badChar = "";
  switch (source[0]) {
    case "	":
      badChar = "a tab character";
      break;
    case ",":
      badChar = "flow indicator character ,";
      break;
    case "%":
      badChar = "directive indicator character %";
      break;
    case "|":
    case ">": {
      badChar = `block scalar indicator ${source[0]}`;
      break;
    }
    case "@":
    case "`": {
      badChar = `reserved character ${source[0]}`;
      break;
    }
  }
  if (badChar)
    onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
  return foldLines(source);
}
function singleQuotedValue(source, onError) {
  if (source[source.length - 1] !== "'" || source.length === 1)
    onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
  return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
  let first, line;
  try {
    first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
    line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
  } catch {
    first = /(.*?)[ \t]*\r?\n/sy;
    line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let match = first.exec(source);
  if (!match)
    return source;
  let res = match[1];
  let sep = " ";
  let pos = first.lastIndex;
  line.lastIndex = pos;
  while (match = line.exec(source)) {
    if (match[1] === "") {
      if (sep === "\n")
        res += sep;
      else
        sep = "\n";
    } else {
      res += sep + match[1];
      sep = " ";
    }
    pos = line.lastIndex;
  }
  const last = /[ \t]*(.*)/sy;
  last.lastIndex = pos;
  match = last.exec(source);
  return res + sep + (match?.[1] ?? "");
}
function doubleQuotedValue(source, onError) {
  let res = "";
  for (let i = 1; i < source.length - 1; ++i) {
    const ch = source[i];
    if (ch === "\r" && source[i + 1] === "\n")
      continue;
    if (ch === "\n") {
      const { fold, offset } = foldNewline(source, i);
      res += fold;
      i = offset;
    } else if (ch === "\\") {
      let next = source[++i];
      const cc = escapeCodes[next];
      if (cc)
        res += cc;
      else if (next === "\n") {
        next = source[i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "\r" && source[i + 1] === "\n") {
        next = source[++i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "x" || next === "u" || next === "U") {
        const length = { x: 2, u: 4, U: 8 }[next];
        res += parseCharCode(source, i + 1, length, onError);
        i += length;
      } else {
        const raw = source.substr(i - 1, 2);
        onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        res += raw;
      }
    } else if (ch === " " || ch === "	") {
      const wsStart = i;
      let next = source[i + 1];
      while (next === " " || next === "	")
        next = source[++i + 1];
      if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
        res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
    } else {
      res += ch;
    }
  }
  if (source[source.length - 1] !== '"' || source.length === 1)
    onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
  return res;
}
function foldNewline(source, offset) {
  let fold = "";
  let ch = source[offset + 1];
  while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
    if (ch === "\r" && source[offset + 2] !== "\n")
      break;
    if (ch === "\n")
      fold += "\n";
    offset += 1;
    ch = source[offset + 1];
  }
  if (!fold)
    fold = " ";
  return { fold, offset };
}
var escapeCodes = {
  "0": "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: "\n",
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "\x85",
  // Unicode next line
  _: "\xA0",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function parseCharCode(source, offset, length, onError) {
  const cc = source.substr(offset, length);
  const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
  const code = ok ? parseInt(cc, 16) : NaN;
  if (isNaN(code)) {
    const raw = source.substr(offset - 2, length + 2);
    onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
    return raw;
  }
  return String.fromCodePoint(code);
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/compose-scalar.js
function composeScalar(ctx, token, tagToken, onError) {
  const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar(ctx, token, onError) : resolveFlowScalar(token, ctx.options.strict, onError);
  const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
  let tag;
  if (ctx.options.stringKeys && ctx.atKey) {
    tag = ctx.schema[SCALAR];
  } else if (tagName)
    tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
  else if (token.type === "scalar")
    tag = findScalarTagByTest(ctx, value, token, onError);
  else
    tag = ctx.schema[SCALAR];
  let scalar;
  try {
    const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
    scalar = isScalar(res) ? res : new Scalar(res);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
    scalar = new Scalar(value);
  }
  scalar.range = range;
  scalar.source = value;
  if (type)
    scalar.type = type;
  if (tagName)
    scalar.tag = tagName;
  if (tag.format)
    scalar.format = tag.format;
  if (comment)
    scalar.comment = comment;
  return scalar;
}
function findScalarTagByName(schema4, value, tagName, tagToken, onError) {
  if (tagName === "!")
    return schema4[SCALAR];
  const matchWithTest = [];
  for (const tag of schema4.tags) {
    if (!tag.collection && tag.tag === tagName) {
      if (tag.default && tag.test)
        matchWithTest.push(tag);
      else
        return tag;
    }
  }
  for (const tag of matchWithTest)
    if (tag.test?.test(value))
      return tag;
  const kt = schema4.knownTags[tagName];
  if (kt && !kt.collection) {
    schema4.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
    return kt;
  }
  onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
  return schema4[SCALAR];
}
function findScalarTagByTest({ atKey, directives, schema: schema4 }, value, token, onError) {
  const tag = schema4.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema4[SCALAR];
  if (schema4.compat) {
    const compat = schema4.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema4[SCALAR];
    if (tag.tag !== compat.tag) {
      const ts = directives.tagString(tag.tag);
      const cs = directives.tagString(compat.tag);
      const msg = `Value may be parsed as either ${ts} or ${cs}`;
      onError(token, "TAG_RESOLVE_FAILED", msg, true);
    }
  }
  return tag;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js
function emptyScalarPosition(offset, before, pos) {
  if (before) {
    pos ?? (pos = before.length);
    for (let i = pos - 1; i >= 0; --i) {
      let st = before[i];
      switch (st.type) {
        case "space":
        case "comment":
        case "newline":
          offset -= st.source.length;
          continue;
      }
      st = before[++i];
      while (st?.type === "space") {
        offset += st.source.length;
        st = before[++i];
      }
      break;
    }
  }
  return offset;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/compose-node.js
var CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
  const atKey = ctx.atKey;
  const { spaceBefore, comment, anchor, tag } = props;
  let node;
  let isSrcToken = true;
  switch (token.type) {
    case "alias":
      node = composeAlias(ctx, token, onError);
      if (anchor || tag)
        onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      node = composeScalar(ctx, token, tag, onError);
      if (anchor)
        node.anchor = anchor.source.substring(1);
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      node = composeCollection(CN, ctx, token, props, onError);
      if (anchor)
        node.anchor = anchor.source.substring(1);
      break;
    default: {
      const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
      onError(token, "UNEXPECTED_TOKEN", message);
      node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
      isSrcToken = false;
    }
  }
  if (anchor && node.anchor === "")
    onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  if (atKey && ctx.options.stringKeys && (!isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
    const msg = "With stringKeys, all keys must be strings";
    onError(tag ?? token, "NON_STRING_KEY", msg);
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    if (token.type === "scalar" && token.source === "")
      node.comment = comment;
    else
      node.commentBefore = comment;
  }
  if (ctx.options.keepSourceTokens && isSrcToken)
    node.srcToken = token;
  return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
  const token = {
    type: "scalar",
    offset: emptyScalarPosition(offset, before, pos),
    indent: -1,
    source: ""
  };
  const node = composeScalar(ctx, token, tag, onError);
  if (anchor) {
    node.anchor = anchor.source.substring(1);
    if (node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    node.comment = comment;
    node.range[2] = end;
  }
  return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
  const alias = new Alias(source.substring(1));
  if (alias.source === "")
    onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
  if (alias.source.endsWith(":"))
    onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, options.strict, onError);
  alias.range = [offset, valueEnd, re.offset];
  if (re.comment)
    alias.comment = re.comment;
  return alias;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/compose-doc.js
function composeDoc(options, directives, { offset, start, value, end }, onError) {
  const opts = Object.assign({ _directives: directives }, options);
  const doc = new Document(void 0, opts);
  const ctx = {
    atKey: false,
    atRoot: true,
    directives: doc.directives,
    options: doc.options,
    schema: doc.schema
  };
  const props = resolveProps(start, {
    indicator: "doc-start",
    next: value ?? end?.[0],
    offset,
    onError,
    parentIndent: 0,
    startOnNewline: true
  });
  if (props.found) {
    doc.directives.docStart = true;
    if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
      onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
  }
  doc.contents = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
  const contentEnd = doc.contents.range[2];
  const re = resolveEnd(end, contentEnd, false, onError);
  if (re.comment)
    doc.comment = re.comment;
  doc.range = [offset, contentEnd, re.offset];
  return doc;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/compose/composer.js
function getErrorPos(src) {
  if (typeof src === "number")
    return [src, src + 1];
  if (Array.isArray(src))
    return src.length === 2 ? src : [src[0], src[1]];
  const { offset, source } = src;
  return [offset, offset + (typeof source === "string" ? source.length : 1)];
}
function parsePrelude(prelude) {
  let comment = "";
  let atComment = false;
  let afterEmptyLine = false;
  for (let i = 0; i < prelude.length; ++i) {
    const source = prelude[i];
    switch (source[0]) {
      case "#":
        comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
        atComment = true;
        afterEmptyLine = false;
        break;
      case "%":
        if (prelude[i + 1]?.[0] !== "#")
          i += 1;
        atComment = false;
        break;
      default:
        if (!atComment)
          afterEmptyLine = true;
        atComment = false;
    }
  }
  return { comment, afterEmptyLine };
}
var Composer = class {
  constructor(options = {}) {
    this.doc = null;
    this.atDirectives = false;
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
    this.onError = (source, code, message, warning) => {
      const pos = getErrorPos(source);
      if (warning)
        this.warnings.push(new YAMLWarning(pos, code, message));
      else
        this.errors.push(new YAMLParseError(pos, code, message));
    };
    this.directives = new Directives({ version: options.version || "1.2" });
    this.options = options;
  }
  decorate(doc, afterDoc) {
    const { comment, afterEmptyLine } = parsePrelude(this.prelude);
    if (comment) {
      const dc = doc.contents;
      if (afterDoc) {
        doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
      } else if (afterEmptyLine || doc.directives.docStart || !dc) {
        doc.commentBefore = comment;
      } else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
        let it = dc.items[0];
        if (isPair(it))
          it = it.key;
        const cb = it.commentBefore;
        it.commentBefore = cb ? `${comment}
${cb}` : comment;
      } else {
        const cb = dc.commentBefore;
        dc.commentBefore = cb ? `${comment}
${cb}` : comment;
      }
    }
    if (afterDoc) {
      Array.prototype.push.apply(doc.errors, this.errors);
      Array.prototype.push.apply(doc.warnings, this.warnings);
    } else {
      doc.errors = this.errors;
      doc.warnings = this.warnings;
    }
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: parsePrelude(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(tokens, forceDoc = false, endOffset = -1) {
    for (const token of tokens)
      yield* this.next(token);
    yield* this.end(forceDoc, endOffset);
  }
  /** Advance the composer by one CST token. */
  *next(token) {
    switch (token.type) {
      case "directive":
        this.directives.add(token.source, (offset, message, warning) => {
          const pos = getErrorPos(token);
          pos[0] += offset;
          this.onError(pos, "BAD_DIRECTIVE", message, warning);
        });
        this.prelude.push(token.source);
        this.atDirectives = true;
        break;
      case "document": {
        const doc = composeDoc(this.options, this.directives, token, this.onError);
        if (this.atDirectives && !doc.directives.docStart)
          this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
        this.decorate(doc, false);
        if (this.doc)
          yield this.doc;
        this.doc = doc;
        this.atDirectives = false;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(token.source);
        break;
      case "error": {
        const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
        const error = new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
        if (this.atDirectives || !this.doc)
          this.errors.push(error);
        else
          this.doc.errors.push(error);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const msg = "Unexpected doc-end without preceding document";
          this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
          break;
        }
        this.doc.directives.docEnd = true;
        const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
        this.decorate(this.doc, true);
        if (end.comment) {
          const dc = this.doc.comment;
          this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
        }
        this.doc.range[2] = end.offset;
        break;
      }
      default:
        this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(forceDoc = false, endOffset = -1) {
    if (this.doc) {
      this.decorate(this.doc, true);
      yield this.doc;
      this.doc = null;
    } else if (forceDoc) {
      const opts = Object.assign({ _directives: this.directives }, this.options);
      const doc = new Document(void 0, opts);
      if (this.atDirectives)
        this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
      doc.range = [0, endOffset, endOffset];
      this.decorate(doc, false);
      yield doc;
    }
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/parse/cst-visit.js
var BREAK2 = Symbol("break visit");
var SKIP2 = Symbol("skip children");
var REMOVE2 = Symbol("remove item");
function visit2(cst, visitor) {
  if ("type" in cst && cst.type === "document")
    cst = { start: cst.start, value: cst.value };
  _visit(Object.freeze([]), cst, visitor);
}
visit2.BREAK = BREAK2;
visit2.SKIP = SKIP2;
visit2.REMOVE = REMOVE2;
visit2.itemAtPath = (cst, path) => {
  let item = cst;
  for (const [field, index] of path) {
    const tok = item?.[field];
    if (tok && "items" in tok) {
      item = tok.items[index];
    } else
      return void 0;
  }
  return item;
};
visit2.parentCollection = (cst, path) => {
  const parent = visit2.itemAtPath(cst, path.slice(0, -1));
  const field = path[path.length - 1][0];
  const coll = parent?.[field];
  if (coll && "items" in coll)
    return coll;
  throw new Error("Parent collection not found");
};
function _visit(path, item, visitor) {
  let ctrl = visitor(item, path);
  if (typeof ctrl === "symbol")
    return ctrl;
  for (const field of ["key", "value"]) {
    const token = item[field];
    if (token && "items" in token) {
      for (let i = 0; i < token.items.length; ++i) {
        const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK2)
          return BREAK2;
        else if (ci === REMOVE2) {
          token.items.splice(i, 1);
          i -= 1;
        }
      }
      if (typeof ctrl === "function" && field === "key")
        ctrl = ctrl(item, path);
    }
  }
  return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/parse/cst.js
var BOM = "\uFEFF";
var DOCUMENT = "";
var FLOW_END = "";
var SCALAR2 = "";
function tokenType(source) {
  switch (source) {
    case BOM:
      return "byte-order-mark";
    case DOCUMENT:
      return "doc-mode";
    case FLOW_END:
      return "flow-error-end";
    case SCALAR2:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case "\n":
    case "\r\n":
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (source[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/parse/lexer.js
function isEmpty(ch) {
  switch (ch) {
    case void 0:
    case " ":
    case "\n":
    case "\r":
    case "	":
      return true;
    default:
      return false;
  }
}
var hexDigits = new Set("0123456789ABCDEFabcdef");
var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
var flowIndicatorChars = new Set(",[]{}");
var invalidAnchorChars = new Set(" ,[]{}\n\r	");
var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
var Lexer = class {
  constructor() {
    this.atEnd = false;
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    this.buffer = "";
    this.flowKey = false;
    this.flowLevel = 0;
    this.indentNext = 0;
    this.indentValue = 0;
    this.lineEndPos = null;
    this.next = null;
    this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(source, incomplete = false) {
    if (source) {
      if (typeof source !== "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + source : source;
      this.lineEndPos = null;
    }
    this.atEnd = !incomplete;
    let next = this.next ?? "stream";
    while (next && (incomplete || this.hasChars(1)))
      next = yield* this.parseNext(next);
  }
  atLineEnd() {
    let i = this.pos;
    let ch = this.buffer[i];
    while (ch === " " || ch === "	")
      ch = this.buffer[++i];
    if (!ch || ch === "#" || ch === "\n")
      return true;
    if (ch === "\r")
      return this.buffer[i + 1] === "\n";
    return false;
  }
  charAt(n) {
    return this.buffer[this.pos + n];
  }
  continueScalar(offset) {
    let ch = this.buffer[offset];
    if (this.indentNext > 0) {
      let indent = 0;
      while (ch === " ")
        ch = this.buffer[++indent + offset];
      if (ch === "\r") {
        const next = this.buffer[indent + offset + 1];
        if (next === "\n" || !next && !this.atEnd)
          return offset + indent + 1;
      }
      return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
    }
    if (ch === "-" || ch === ".") {
      const dt = this.buffer.substr(offset, 3);
      if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
        return -1;
    }
    return offset;
  }
  getLine() {
    let end = this.lineEndPos;
    if (typeof end !== "number" || end !== -1 && end < this.pos) {
      end = this.buffer.indexOf("\n", this.pos);
      this.lineEndPos = end;
    }
    if (end === -1)
      return this.atEnd ? this.buffer.substring(this.pos) : null;
    if (this.buffer[end - 1] === "\r")
      end -= 1;
    return this.buffer.substring(this.pos, end);
  }
  hasChars(n) {
    return this.pos + n <= this.buffer.length;
  }
  setNext(state) {
    this.buffer = this.buffer.substring(this.pos);
    this.pos = 0;
    this.lineEndPos = null;
    this.next = state;
    return null;
  }
  peek(n) {
    return this.buffer.substr(this.pos, n);
  }
  *parseNext(next) {
    switch (next) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let line = this.getLine();
    if (line === null)
      return this.setNext("stream");
    if (line[0] === BOM) {
      yield* this.pushCount(1);
      line = line.substring(1);
    }
    if (line[0] === "%") {
      let dirEnd = line.length;
      let cs = line.indexOf("#");
      while (cs !== -1) {
        const ch = line[cs - 1];
        if (ch === " " || ch === "	") {
          dirEnd = cs - 1;
          break;
        } else {
          cs = line.indexOf("#", cs + 1);
        }
      }
      while (true) {
        const ch = line[dirEnd - 1];
        if (ch === " " || ch === "	")
          dirEnd -= 1;
        else
          break;
      }
      const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
      yield* this.pushCount(line.length - n);
      this.pushNewline();
      return "stream";
    }
    if (this.atLineEnd()) {
      const sp = yield* this.pushSpaces(true);
      yield* this.pushCount(line.length - sp);
      yield* this.pushNewline();
      return "stream";
    }
    yield DOCUMENT;
    return yield* this.parseLineStart();
  }
  *parseLineStart() {
    const ch = this.charAt(0);
    if (!ch && !this.atEnd)
      return this.setNext("line-start");
    if (ch === "-" || ch === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const s = this.peek(3);
      if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
        yield* this.pushCount(3);
        this.indentValue = 0;
        this.indentNext = 0;
        return s === "---" ? "doc" : "stream";
      }
    }
    this.indentValue = yield* this.pushSpaces(false);
    if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
      this.indentNext = this.indentValue;
    return yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [ch0, ch1] = this.peek(2);
    if (!ch1 && !this.atEnd)
      return this.setNext("block-start");
    if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
      this.indentNext = this.indentValue + 1;
      this.indentValue += n;
      return yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(true);
    const line = this.getLine();
    if (line === null)
      return this.setNext("doc");
    let n = yield* this.pushIndicators();
    switch (line[n]) {
      case "#":
        yield* this.pushCount(line.length - n);
      case void 0:
        yield* this.pushNewline();
        return yield* this.parseLineStart();
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel = 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        return "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        n += yield* this.parseBlockScalarHeader();
        n += yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - n);
        yield* this.pushNewline();
        return yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let nl, sp;
    let indent = -1;
    do {
      nl = yield* this.pushNewline();
      if (nl > 0) {
        sp = yield* this.pushSpaces(false);
        this.indentValue = indent = sp;
      } else {
        sp = 0;
      }
      sp += yield* this.pushSpaces(true);
    } while (nl + sp > 0);
    const line = this.getLine();
    if (line === null)
      return this.setNext("flow");
    if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
      const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
      if (!atFlowEndMarker) {
        this.flowLevel = 0;
        yield FLOW_END;
        return yield* this.parseLineStart();
      }
    }
    let n = 0;
    while (line[n] === ",") {
      n += yield* this.pushCount(1);
      n += yield* this.pushSpaces(true);
      this.flowKey = false;
    }
    n += yield* this.pushIndicators();
    switch (line[n]) {
      case void 0:
        return "flow";
      case "#":
        yield* this.pushCount(line.length - n);
        return "flow";
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel += 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        this.flowKey = true;
        this.flowLevel -= 1;
        return this.flowLevel ? "flow" : "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "flow";
      case '"':
      case "'":
        this.flowKey = true;
        return yield* this.parseQuotedScalar();
      case ":": {
        const next = this.charAt(1);
        if (this.flowKey || isEmpty(next) || next === ",") {
          this.flowKey = false;
          yield* this.pushCount(1);
          yield* this.pushSpaces(true);
          return "flow";
        }
      }
      default:
        this.flowKey = false;
        return yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const quote = this.charAt(0);
    let end = this.buffer.indexOf(quote, this.pos + 1);
    if (quote === "'") {
      while (end !== -1 && this.buffer[end + 1] === "'")
        end = this.buffer.indexOf("'", end + 2);
    } else {
      while (end !== -1) {
        let n = 0;
        while (this.buffer[end - 1 - n] === "\\")
          n += 1;
        if (n % 2 === 0)
          break;
        end = this.buffer.indexOf('"', end + 1);
      }
    }
    const qb = this.buffer.substring(0, end);
    let nl = qb.indexOf("\n", this.pos);
    if (nl !== -1) {
      while (nl !== -1) {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = qb.indexOf("\n", cs);
      }
      if (nl !== -1) {
        end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
      }
    }
    if (end === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      end = this.buffer.length;
    }
    yield* this.pushToIndex(end + 1, false);
    return this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    let i = this.pos;
    while (true) {
      const ch = this.buffer[++i];
      if (ch === "+")
        this.blockScalarKeep = true;
      else if (ch > "0" && ch <= "9")
        this.blockScalarIndent = Number(ch) - 1;
      else if (ch !== "-")
        break;
    }
    return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
  }
  *parseBlockScalar() {
    let nl = this.pos - 1;
    let indent = 0;
    let ch;
    loop:
      for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
        switch (ch) {
          case " ":
            indent += 1;
            break;
          case "\n":
            nl = i2;
            indent = 0;
            break;
          case "\r": {
            const next = this.buffer[i2 + 1];
            if (!next && !this.atEnd)
              return this.setNext("block-scalar");
            if (next === "\n")
              break;
          }
          default:
            break loop;
        }
      }
    if (!ch && !this.atEnd)
      return this.setNext("block-scalar");
    if (indent >= this.indentNext) {
      if (this.blockScalarIndent === -1)
        this.indentNext = indent;
      else {
        this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      }
      do {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = this.buffer.indexOf("\n", cs);
      } while (nl !== -1);
      if (nl === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        nl = this.buffer.length;
      }
    }
    let i = nl + 1;
    ch = this.buffer[i];
    while (ch === " ")
      ch = this.buffer[++i];
    if (ch === "	") {
      while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
        ch = this.buffer[++i];
      nl = i - 1;
    } else if (!this.blockScalarKeep) {
      do {
        let i2 = nl - 1;
        let ch2 = this.buffer[i2];
        if (ch2 === "\r")
          ch2 = this.buffer[--i2];
        const lastChar = i2;
        while (ch2 === " ")
          ch2 = this.buffer[--i2];
        if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
          nl = i2;
        else
          break;
      } while (true);
    }
    yield SCALAR2;
    yield* this.pushToIndex(nl + 1, true);
    return yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const inFlow = this.flowLevel > 0;
    let end = this.pos - 1;
    let i = this.pos - 1;
    let ch;
    while (ch = this.buffer[++i]) {
      if (ch === ":") {
        const next = this.buffer[i + 1];
        if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
          break;
        end = i;
      } else if (isEmpty(ch)) {
        let next = this.buffer[i + 1];
        if (ch === "\r") {
          if (next === "\n") {
            i += 1;
            ch = "\n";
            next = this.buffer[i + 1];
          } else
            end = i;
        }
        if (next === "#" || inFlow && flowIndicatorChars.has(next))
          break;
        if (ch === "\n") {
          const cs = this.continueScalar(i + 1);
          if (cs === -1)
            break;
          i = Math.max(i, cs - 2);
        }
      } else {
        if (inFlow && flowIndicatorChars.has(ch))
          break;
        end = i;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("plain-scalar");
    yield SCALAR2;
    yield* this.pushToIndex(end + 1, true);
    return inFlow ? "flow" : "doc";
  }
  *pushCount(n) {
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos += n;
      return n;
    }
    return 0;
  }
  *pushToIndex(i, allowEmpty) {
    const s = this.buffer.slice(this.pos, i);
    if (s) {
      yield s;
      this.pos += s.length;
      return s.length;
    } else if (allowEmpty)
      yield "";
    return 0;
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "-":
      case "?":
      case ":": {
        const inFlow = this.flowLevel > 0;
        const ch1 = this.charAt(1);
        if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
          if (!inFlow)
            this.indentNext = this.indentValue + 1;
          else if (this.flowKey)
            this.flowKey = false;
          return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        }
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let i = this.pos + 2;
      let ch = this.buffer[i];
      while (!isEmpty(ch) && ch !== ">")
        ch = this.buffer[++i];
      return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
    } else {
      let i = this.pos + 1;
      let ch = this.buffer[i];
      while (ch) {
        if (tagChars.has(ch))
          ch = this.buffer[++i];
        else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
          ch = this.buffer[i += 3];
        } else
          break;
      }
      return yield* this.pushToIndex(i, false);
    }
  }
  *pushNewline() {
    const ch = this.buffer[this.pos];
    if (ch === "\n")
      return yield* this.pushCount(1);
    else if (ch === "\r" && this.charAt(1) === "\n")
      return yield* this.pushCount(2);
    else
      return 0;
  }
  *pushSpaces(allowTabs) {
    let i = this.pos - 1;
    let ch;
    do {
      ch = this.buffer[++i];
    } while (ch === " " || allowTabs && ch === "	");
    const n = i - this.pos;
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos = i;
    }
    return n;
  }
  *pushUntil(test) {
    let i = this.pos;
    let ch = this.buffer[i];
    while (!test(ch))
      ch = this.buffer[++i];
    return yield* this.pushToIndex(i, false);
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/parse/line-counter.js
var LineCounter = class {
  constructor() {
    this.lineStarts = [];
    this.addNewLine = (offset) => this.lineStarts.push(offset);
    this.linePos = (offset) => {
      let low = 0;
      let high = this.lineStarts.length;
      while (low < high) {
        const mid = low + high >> 1;
        if (this.lineStarts[mid] < offset)
          low = mid + 1;
        else
          high = mid;
      }
      if (this.lineStarts[low] === offset)
        return { line: low + 1, col: 1 };
      if (low === 0)
        return { line: 0, col: offset };
      const start = this.lineStarts[low - 1];
      return { line: low, col: offset - start + 1 };
    };
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/parse/parser.js
function includesToken(list, type) {
  for (let i = 0; i < list.length; ++i)
    if (list[i].type === type)
      return true;
  return false;
}
function findNonEmptyIndex(list) {
  for (let i = 0; i < list.length; ++i) {
    switch (list[i].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return i;
    }
  }
  return -1;
}
function isFlowToken(token) {
  switch (token?.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return true;
    default:
      return false;
  }
}
function getPrevProps(parent) {
  switch (parent.type) {
    case "document":
      return parent.start;
    case "block-map": {
      const it = parent.items[parent.items.length - 1];
      return it.sep ?? it.start;
    }
    case "block-seq":
      return parent.items[parent.items.length - 1].start;
    default:
      return [];
  }
}
function getFirstKeyStartProps(prev) {
  if (prev.length === 0)
    return [];
  let i = prev.length;
  loop:
    while (--i >= 0) {
      switch (prev[i].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break loop;
      }
    }
  while (prev[++i]?.type === "space") {
  }
  return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
  if (fc.start.type === "flow-seq-start") {
    for (const it of fc.items) {
      if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
        if (it.key)
          it.value = it.key;
        delete it.key;
        if (isFlowToken(it.value)) {
          if (it.value.end)
            Array.prototype.push.apply(it.value.end, it.sep);
          else
            it.value.end = it.sep;
        } else
          Array.prototype.push.apply(it.start, it.sep);
        delete it.sep;
      }
    }
  }
}
var Parser = class {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(onNewLine) {
    this.atNewLine = true;
    this.atScalar = false;
    this.indent = 0;
    this.offset = 0;
    this.onKeyLine = false;
    this.stack = [];
    this.source = "";
    this.type = "";
    this.lexer = new Lexer();
    this.onNewLine = onNewLine;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(source, incomplete = false) {
    if (this.onNewLine && this.offset === 0)
      this.onNewLine(0);
    for (const lexeme of this.lexer.lex(source, incomplete))
      yield* this.next(lexeme);
    if (!incomplete)
      yield* this.end();
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(source) {
    this.source = source;
    if (this.atScalar) {
      this.atScalar = false;
      yield* this.step();
      this.offset += source.length;
      return;
    }
    const type = tokenType(source);
    if (!type) {
      const message = `Not a YAML token: ${source}`;
      yield* this.pop({ type: "error", offset: this.offset, message, source });
      this.offset += source.length;
    } else if (type === "scalar") {
      this.atNewLine = false;
      this.atScalar = true;
      this.type = "scalar";
    } else {
      this.type = type;
      yield* this.step();
      switch (type) {
        case "newline":
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine)
            this.onNewLine(this.offset + source.length);
          break;
        case "space":
          if (this.atNewLine && source[0] === " ")
            this.indent += source.length;
          break;
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
          if (this.atNewLine)
            this.indent += source.length;
          break;
        case "doc-mode":
        case "flow-error-end":
          return;
        default:
          this.atNewLine = false;
      }
      this.offset += source.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    while (this.stack.length > 0)
      yield* this.pop();
  }
  get sourceToken() {
    const st = {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
    return st;
  }
  *step() {
    const top = this.peek(1);
    if (this.type === "doc-end" && top?.type !== "doc-end") {
      while (this.stack.length > 0)
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!top)
      return yield* this.stream();
    switch (top.type) {
      case "document":
        return yield* this.document(top);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(top);
      case "block-scalar":
        return yield* this.blockScalar(top);
      case "block-map":
        return yield* this.blockMap(top);
      case "block-seq":
        return yield* this.blockSequence(top);
      case "flow-collection":
        return yield* this.flowCollection(top);
      case "doc-end":
        return yield* this.documentEnd(top);
    }
    yield* this.pop();
  }
  peek(n) {
    return this.stack[this.stack.length - n];
  }
  *pop(error) {
    const token = error ?? this.stack.pop();
    if (!token) {
      const message = "Tried to pop an empty stack";
      yield { type: "error", offset: this.offset, source: "", message };
    } else if (this.stack.length === 0) {
      yield token;
    } else {
      const top = this.peek(1);
      if (token.type === "block-scalar") {
        token.indent = "indent" in top ? top.indent : 0;
      } else if (token.type === "flow-collection" && top.type === "document") {
        token.indent = 0;
      }
      if (token.type === "flow-collection")
        fixFlowSeqItems(token);
      switch (top.type) {
        case "document":
          top.value = token;
          break;
        case "block-scalar":
          top.props.push(token);
          break;
        case "block-map": {
          const it = top.items[top.items.length - 1];
          if (it.value) {
            top.items.push({ start: [], key: token, sep: [] });
            this.onKeyLine = true;
            return;
          } else if (it.sep) {
            it.value = token;
          } else {
            Object.assign(it, { key: token, sep: [] });
            this.onKeyLine = !it.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const it = top.items[top.items.length - 1];
          if (it.value)
            top.items.push({ start: [], value: token });
          else
            it.value = token;
          break;
        }
        case "flow-collection": {
          const it = top.items[top.items.length - 1];
          if (!it || it.value)
            top.items.push({ start: [], key: token, sep: [] });
          else if (it.sep)
            it.value = token;
          else
            Object.assign(it, { key: token, sep: [] });
          return;
        }
        default:
          yield* this.pop();
          yield* this.pop(token);
      }
      if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
        const last = token.items[token.items.length - 1];
        if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
          if (top.type === "document")
            top.end = last.start;
          else
            top.items.push({ start: last.start });
          token.items.splice(-1, 1);
        }
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const doc = {
          type: "document",
          offset: this.offset,
          start: []
        };
        if (this.type === "doc-start")
          doc.start.push(this.sourceToken);
        this.stack.push(doc);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(doc) {
    if (doc.value)
      return yield* this.lineEnd(doc);
    switch (this.type) {
      case "doc-start": {
        if (findNonEmptyIndex(doc.start) !== -1) {
          yield* this.pop();
          yield* this.step();
        } else
          doc.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        doc.start.push(this.sourceToken);
        return;
    }
    const bv = this.startBlockValue(doc);
    if (bv)
      this.stack.push(bv);
    else {
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
  }
  *scalar(scalar) {
    if (this.type === "map-value-ind") {
      const prev = getPrevProps(this.peek(2));
      const start = getFirstKeyStartProps(prev);
      let sep;
      if (scalar.end) {
        sep = scalar.end;
        sep.push(this.sourceToken);
        delete scalar.end;
      } else
        sep = [this.sourceToken];
      const map2 = {
        type: "block-map",
        offset: scalar.offset,
        indent: scalar.indent,
        items: [{ start, key: scalar, sep }]
      };
      this.onKeyLine = true;
      this.stack[this.stack.length - 1] = map2;
    } else
      yield* this.lineEnd(scalar);
  }
  *blockScalar(scalar) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        scalar.props.push(this.sourceToken);
        return;
      case "scalar":
        scalar.source = this.source;
        this.atNewLine = true;
        this.indent = 0;
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop();
        yield* this.step();
    }
  }
  *blockMap(map2) {
    const it = map2.items[map2.items.length - 1];
    switch (this.type) {
      case "newline":
        this.onKeyLine = false;
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if (last?.type === "comment")
            end?.push(this.sourceToken);
          else
            map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          it.start.push(this.sourceToken);
        }
        return;
      case "space":
      case "comment":
        if (it.value) {
          map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          if (this.atIndentedComment(it.start, map2.indent)) {
            const prev = map2.items[map2.items.length - 2];
            const end = prev?.value?.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              map2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= map2.indent) {
      const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
      const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
      let start = [];
      if (atNextItem && it.sep && !it.value) {
        const nl = [];
        for (let i = 0; i < it.sep.length; ++i) {
          const st = it.sep[i];
          switch (st.type) {
            case "newline":
              nl.push(i);
              break;
            case "space":
              break;
            case "comment":
              if (st.indent > map2.indent)
                nl.length = 0;
              break;
            default:
              nl.length = 0;
          }
        }
        if (nl.length >= 2)
          start = it.sep.splice(nl[1]);
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start });
            this.onKeyLine = true;
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "explicit-key-ind":
          if (!it.sep && !it.explicitKey) {
            it.start.push(this.sourceToken);
            it.explicitKey = true;
          } else if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start, explicitKey: true });
          } else {
            this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: true }]
            });
          }
          this.onKeyLine = true;
          return;
        case "map-value-ind":
          if (it.explicitKey) {
            if (!it.sep) {
              if (includesToken(it.start, "newline")) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else {
                const start2 = getFirstKeyStartProps(it.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                });
              }
            } else if (it.value) {
              map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start, key: null, sep: [this.sourceToken] }]
              });
            } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
              const start2 = getFirstKeyStartProps(it.start);
              const key = it.key;
              const sep = it.sep;
              sep.push(this.sourceToken);
              delete it.key;
              delete it.sep;
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: start2, key, sep }]
              });
            } else if (start.length > 0) {
              it.sep = it.sep.concat(start, this.sourceToken);
            } else {
              it.sep.push(this.sourceToken);
            }
          } else {
            if (!it.sep) {
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            } else if (it.value || atNextItem) {
              map2.items.push({ start, key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              });
            } else {
              it.sep.push(this.sourceToken);
            }
          }
          this.onKeyLine = true;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (atNextItem || it.value) {
            map2.items.push({ start, key: fs, sep: [] });
            this.onKeyLine = true;
          } else if (it.sep) {
            this.stack.push(fs);
          } else {
            Object.assign(it, { key: fs, sep: [] });
            this.onKeyLine = true;
          }
          return;
        }
        default: {
          const bv = this.startBlockValue(map2);
          if (bv) {
            if (bv.type === "block-seq") {
              if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                yield* this.pop({
                  type: "error",
                  offset: this.offset,
                  message: "Unexpected block-seq-ind on same line with key",
                  source: this.source
                });
                return;
              }
            } else if (atMapIndent) {
              map2.items.push({ start });
            }
            this.stack.push(bv);
            return;
          }
        }
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *blockSequence(seq2) {
    const it = seq2.items[seq2.items.length - 1];
    switch (this.type) {
      case "newline":
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if (last?.type === "comment")
            end?.push(this.sourceToken);
          else
            seq2.items.push({ start: [this.sourceToken] });
        } else
          it.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (it.value)
          seq2.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(it.start, seq2.indent)) {
            const prev = seq2.items[seq2.items.length - 2];
            const end = prev?.value?.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              seq2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (it.value || this.indent <= seq2.indent)
          break;
        it.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== seq2.indent)
          break;
        if (it.value || includesToken(it.start, "seq-item-ind"))
          seq2.items.push({ start: [this.sourceToken] });
        else
          it.start.push(this.sourceToken);
        return;
    }
    if (this.indent > seq2.indent) {
      const bv = this.startBlockValue(seq2);
      if (bv) {
        this.stack.push(bv);
        return;
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *flowCollection(fc) {
    const it = fc.items[fc.items.length - 1];
    if (this.type === "flow-error-end") {
      let top;
      do {
        yield* this.pop();
        top = this.peek(1);
      } while (top?.type === "flow-collection");
    } else if (fc.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          if (!it || it.sep)
            fc.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          if (!it || it.value)
            fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            Object.assign(it, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          if (!it || it.value)
            fc.items.push({ start: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            it.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (!it || it.value)
            fc.items.push({ start: [], key: fs, sep: [] });
          else if (it.sep)
            this.stack.push(fs);
          else
            Object.assign(it, { key: fs, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          fc.end.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(fc);
      if (bv)
        this.stack.push(bv);
      else {
        yield* this.pop();
        yield* this.step();
      }
    } else {
      const parent = this.peek(2);
      if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
        yield* this.pop();
        yield* this.step();
      } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        fixFlowSeqItems(fc);
        const sep = fc.end.splice(1, fc.end.length);
        sep.push(this.sourceToken);
        const map2 = {
          type: "block-map",
          offset: fc.offset,
          indent: fc.indent,
          items: [{ start, key: fc, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map2;
      } else {
        yield* this.lineEnd(fc);
      }
    }
  }
  flowScalar(type) {
    if (this.onNewLine) {
      let nl = this.source.indexOf("\n") + 1;
      while (nl !== 0) {
        this.onNewLine(this.offset + nl);
        nl = this.source.indexOf("\n", nl) + 1;
      }
    }
    return {
      type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(parent) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        start.push(this.sourceToken);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, explicitKey: true }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(start, indent) {
    if (this.type !== "comment")
      return false;
    if (this.indent <= indent)
      return false;
    return start.every((st) => st.type === "newline" || st.type === "space");
  }
  *documentEnd(docEnd) {
    if (this.type !== "doc-mode") {
      if (docEnd.end)
        docEnd.end.push(this.sourceToken);
      else
        docEnd.end = [this.sourceToken];
      if (this.type === "newline")
        yield* this.pop();
    }
  }
  *lineEnd(token) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop();
        yield* this.step();
        break;
      case "newline":
        this.onKeyLine = false;
      case "space":
      case "comment":
      default:
        if (token.end)
          token.end.push(this.sourceToken);
        else
          token.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
    }
  }
};

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/browser/dist/public-api.js
function parseOptions(options) {
  const prettyErrors = options.prettyErrors !== false;
  const lineCounter = options.lineCounter || prettyErrors && new LineCounter() || null;
  return { lineCounter, prettyErrors };
}
function parseDocument(source, options = {}) {
  const { lineCounter, prettyErrors } = parseOptions(options);
  const parser = new Parser(lineCounter?.addNewLine);
  const composer = new Composer(options);
  let doc = null;
  for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
    if (!doc)
      doc = _doc;
    else if (doc.options.logLevel !== "silent") {
      doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  }
  if (prettyErrors && lineCounter) {
    doc.errors.forEach(prettifyError(source, lineCounter));
    doc.warnings.forEach(prettifyError(source, lineCounter));
  }
  return doc;
}
function parse(src, reviver, options) {
  let _reviver = void 0;
  if (typeof reviver === "function") {
    _reviver = reviver;
  } else if (options === void 0 && reviver && typeof reviver === "object") {
    options = reviver;
  }
  const doc = parseDocument(src, options);
  if (!doc)
    return null;
  doc.warnings.forEach((warning) => warn(doc.options.logLevel, warning));
  if (doc.errors.length > 0) {
    if (doc.options.logLevel !== "silent")
      throw doc.errors[0];
    else
      doc.errors = [];
  }
  return doc.toJS(Object.assign({ reviver: _reviver }, options));
}

// src/frameworks/suggestion-engine.ts
var RECIPES = {
  // JavaScript/TypeScript
  react: null,
  nextjs: null,
  vue: null,
  nuxt: null,
  angular: null,
  svelte: null,
  sveltekit: null,
  astro: null,
  remix: null,
  gatsby: null,
  solidjs: null,
  qwik: null,
  fresh: null,
  // Ruby
  rails: null,
  // Python
  django: null,
  flask: null,
  fastapi: null,
  // PHP
  laravel: null,
  symfony: null,
  wordpress: null,
  // Java
  spring: null,
  // C#
  aspnet: null,
  // Go
  go: null,
  // Elixir
  phoenix: null,
  // Hypermedia
  htmx: null,
  hotwire: null,
  // Static Site Generators
  hugo: null,
  jekyll: null,
  eleventy: null,
  pelican: null,
  sphinx: null,
  docusaurus: null,
  // Unknown
  unknown: null
};
var RECIPE_CONTENT = {};
async function loadRecipe(framework) {
  if (framework === "unknown")
    return null;
  if (RECIPES[framework]) {
    return RECIPES[framework];
  }
  if (RECIPE_CONTENT[framework]) {
    try {
      const recipe = parse(RECIPE_CONTENT[framework]);
      RECIPES[framework] = recipe;
      return recipe;
    } catch {
      console.warn(`Failed to parse embedded recipe for ${framework}`);
      return null;
    }
  }
  try {
    const fs = await import("fs");
    const path = await import("path");
    const url = await import("url");
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const recipePath = path.join(__dirname, "recipes", `${framework}.yaml`);
    if (fs.existsSync(recipePath)) {
      const content = fs.readFileSync(recipePath, "utf-8");
      const recipe = parse(content);
      RECIPES[framework] = recipe;
      return recipe;
    }
  } catch {
  }
  return null;
}
async function getFrameworkIssues(frameworkInfo, html, url, options = {}) {
  const recipe = await loadRecipe(frameworkInfo.framework);
  if (!recipe)
    return [];
  const issues = [];
  const indexable = options.indexable ?? true;
  for (const check of recipe.checks) {
    const matched = evaluateCheck(check, html, frameworkInfo, indexable);
    if (matched) {
      issues.push({
        code: check.code,
        severity: check.severity,
        category: "on-page",
        // Framework issues are on-page
        title: check.title,
        description: check.description,
        impact: check.impact || `Framework-specific issue for ${recipe.display_name}`,
        howToFix: check.howToFix,
        affectedUrls: [url],
        details: {
          framework: recipe.display_name,
          frameworkCategory: recipe.category
        }
      });
    }
  }
  return issues;
}
function evaluateCheck(check, html, frameworkInfo, indexable = true) {
  if (check.indexable_only && !indexable) {
    return false;
  }
  if (check.app_router_only && html.includes("__next")) {
    return false;
  }
  if (check.pages_router_only && !html.includes("__next")) {
    return false;
  }
  const detection = check.detection;
  if (!detection) {
    return false;
  }
  if (detection.html_patterns) {
    for (const pattern of detection.html_patterns) {
      if (html.includes(pattern)) {
        return true;
      }
    }
  }
  if (detection.html_missing_patterns) {
    const anyPresent = detection.html_missing_patterns.some((pattern) => html.includes(pattern));
    if (!anyPresent) {
      return true;
    }
  }
  if (detection.missing_content) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (bodyContent.length < 100) {
        return true;
      }
    }
  }
  if (detection.title_in_js && detection.title_not_in_html) {
    const hasHtmlTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
    const hasJsTitle = /document\.title\s*=/.test(html) || /useHead|Helmet|useSeoMeta/.test(html);
    if (!hasHtmlTitle && hasJsTitle) {
      return true;
    }
  }
  return false;
}
function embedRecipe(framework, content) {
  RECIPE_CONTENT[framework] = content;
}

// src/frameworks/embedded-recipes.generated.ts
embedRecipe("angular", `# Angular SEO Recipe
# Angular has SSR support via Angular Universal

framework: angular
display_name: Angular
category: spa
ssr_default: false

seo_challenges:
  - "Client-side rendering by default"
  - "Heavy initial bundle size"
  - "Complex SSR setup (Angular Universal)"
  - "Zone.js can cause performance issues"

checks:
  - code: ANGULAR_NO_UNIVERSAL
    indexable_only: true
    severity: error
    title: "Angular app without Universal (SSR)"
    description: "Client-side Angular apps send empty HTML to crawlers."
    impact: "Your content may not be indexed by search engines"
    howToFix: |
      Add Angular Universal for SSR:

      \`\`\`bash
      ng add @angular/ssr
      \`\`\`

      This adds server-side rendering to your Angular app.
    detection:
      html_patterns:
        - '<app-root></app-root>'
      missing_content: true

  - code: ANGULAR_NO_TITLE_SERVICE
    indexable_only: true
    severity: error
    title: "Not using Title/Meta services"
    description: "Angular has built-in services for managing title and meta tags."
    howToFix: |
      Use Title and Meta services:

      \`\`\`ts
      import { Title, Meta } from '@angular/platform-browser';

      @Component({...})
      export class ProductComponent {
        constructor(
          private title: Title,
          private meta: Meta
        ) {}

        ngOnInit() {
          this.title.setTitle('Product Name | Your Site');
          this.meta.updateTag({ name: 'description', content: 'Product description' });
          this.meta.updateTag({ property: 'og:title', content: 'Product Name' });
        }
      }
      \`\`\`

  - code: ANGULAR_LAZY_LOAD_MISSING
    severity: warning
    title: "Routes not lazy loaded"
    description: "Loading all modules upfront increases initial bundle size."
    howToFix: |
      Use lazy loading for routes:

      \`\`\`ts
      const routes: Routes = [
        {
          path: 'products',
          loadChildren: () => import('./products/products.module')
            .then(m => m.ProductsModule)
        },
        // Or with standalone components
        {
          path: 'about',
          loadComponent: () => import('./about/about.component')
            .then(m => m.AboutComponent)
        }
      ];
      \`\`\`

  - code: ANGULAR_PRERENDER_MISSING
    indexable_only: true
    severity: warning
    title: "Static routes not prerendered"
    description: "Static pages should be prerendered at build time."
    howToFix: |
      Configure prerendering in angular.json:

      \`\`\`json
      {
        "projects": {
          "your-app": {
            "architect": {
              "prerender": {
                "options": {
                  "routes": ["/", "/about", "/contact"]
                }
              }
            }
          }
        }
      }
      \`\`\`

      Run: \`ng run your-app:prerender\`

  - code: ANGULAR_CHANGE_DETECTION
    severity: notice
    title: "Using default change detection"
    description: "OnPush change detection improves performance significantly."
    howToFix: |
      Use OnPush for components:

      \`\`\`ts
      @Component({
        selector: 'app-product',
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: \`...\`
      })
      export class ProductComponent {}
      \`\`\`

  - code: ANGULAR_LARGE_BUNDLE
    severity: warning
    title: "Large initial bundle detected"
    description: "Bundle over 500KB significantly hurts performance."
    howToFix: |
      1. Enable build optimizer:
      \`\`\`json
      // angular.json
      "optimization": true,
      "buildOptimizer": true
      \`\`\`

      2. Analyze bundle:
      \`\`\`bash
      ng build --stats-json
      npx webpack-bundle-analyzer dist/your-app/stats.json
      \`\`\`

      3. Remove unused dependencies

  - code: ANGULAR_NO_IMAGE_DIRECTIVE
    severity: notice
    title: "Not using NgOptimizedImage"
    description: "Angular 15+ has built-in image optimization."
    howToFix: |
      Use NgOptimizedImage directive:

      \`\`\`ts
      import { NgOptimizedImage } from '@angular/common';

      @Component({
        imports: [NgOptimizedImage],
        template: \`
          <img ngSrc="/hero.jpg" width="1200" height="630" priority />
        \`
      })
      \`\`\`

performance_tips:
  - "Use standalone components to reduce bundle"
  - "Enable OnPush change detection"
  - "Lazy load routes"
  - "Use trackBy with ngFor"
  - "Prerender static pages"

migration_paths:
  analog:
    effort: medium
    benefits:
      - "File-based routing"
      - "Full SSR support"
      - "Vite-powered builds"
    guide: "https://analogjs.org/docs/introduction"
`);
embedRecipe("astro", `# Astro SEO Recipe
# Astro is SEO-first by design - zero JS by default, excellent for content sites

framework: astro
display_name: Astro
category: static-first
ssr_default: false  # Static by default, SSR optional

seo_strengths:
  - "Zero JavaScript by default"
  - "Static HTML output"
  - "Excellent performance (100 Lighthouse)"
  - "Content Collections for organized content"
  - "Built-in sitemap and RSS integrations"
  - "Partial hydration (Islands Architecture)"

checks:
  - code: ASTRO_NO_SITEMAP
    severity: warning
    title: "Missing sitemap integration"
    description: "Astro has a built-in sitemap integration."
    howToFix: |
      Add the sitemap integration:

      \`\`\`bash
      npx astro add sitemap
      \`\`\`

      Configure in astro.config.mjs:
      \`\`\`js
      import sitemap from '@astrojs/sitemap';

      export default defineConfig({
        site: 'https://yoursite.com',
        integrations: [sitemap()],
      });
      \`\`\`

  - code: ASTRO_NO_SITE_CONFIG
    severity: error
    title: "Missing site URL configuration"
    description: "The site URL is required for sitemap and canonical URLs."
    howToFix: |
      Add site to astro.config.mjs:

      \`\`\`js
      export default defineConfig({
        site: 'https://yoursite.com',
      });
      \`\`\`

  - code: ASTRO_CLIENT_DIRECTIVE_OVERUSE
    severity: warning
    title: "Overusing client: directives"
    description: "Too many client-side components reduce Astro's performance benefits."
    howToFix: |
      Only hydrate components that need interactivity:

      \`\`\`astro
      <!-- Bad - unnecessary JS -->
      <StaticCard client:load />

      <!-- Good - no JS for static content -->
      <StaticCard />

      <!-- Good - only hydrate when needed -->
      <InteractiveWidget client:visible />
      \`\`\`

      Prefer client:visible over client:load for below-fold content.

  - code: ASTRO_NO_BASE_LAYOUT
    severity: notice
    title: "Pages missing base layout"
    description: "Using a shared layout ensures consistent SEO tags."
    howToFix: |
      Create a BaseLayout.astro:

      \`\`\`astro
      ---
      // src/layouts/BaseLayout.astro
      interface Props {
        title: string;
        description: string;
      }
      const { title, description } = Astro.props;
      ---
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={Astro.url} />
        </head>
        <body>
          <slot />
        </body>
      </html>
      \`\`\`

  - code: ASTRO_NO_ASTRO_SEO
    severity: notice
    title: "Not using @astrolib/seo"
    description: "The astro-seo package provides comprehensive SEO components."
    howToFix: |
      Install astro-seo:

      \`\`\`bash
      npm install astro-seo
      \`\`\`

      \`\`\`astro
      ---
      import { SEO } from 'astro-seo';
      ---
      <SEO
        title="Page Title"
        description="Description"
        openGraph={{
          basic: {
            title: "OG Title",
            type: "website",
            image: "/og-image.jpg",
          }
        }}
        twitter={{
          creator: "@handle"
        }}
      />
      \`\`\`
    detection:
      html_missing_patterns:
        - 'rel="canonical"'

  - code: ASTRO_IMAGE_NOT_OPTIMIZED
    severity: warning
    title: "Images not using Astro Image"
    description: "Use Astro's built-in Image component for optimization."
    howToFix: |
      Use the Image component:

      \`\`\`astro
      ---
      import { Image } from 'astro:assets';
      import heroImage from '../assets/hero.jpg';
      ---
      <Image
        src={heroImage}
        alt="Hero"
        width={1200}
        height={630}
        loading="eager"
      />
      \`\`\`

  - code: ASTRO_NO_CONTENT_COLLECTIONS
    severity: notice
    title: "Not using Content Collections"
    description: "Content Collections provide type-safe content with built-in frontmatter validation."
    howToFix: |
      Define a collection in src/content/config.ts:

      \`\`\`ts
      import { defineCollection, z } from 'astro:content';

      const blog = defineCollection({
        schema: z.object({
          title: z.string(),
          description: z.string(),
          pubDate: z.date(),
        }),
      });

      export const collections = { blog };
      \`\`\`

  - code: ASTRO_SSR_OVERUSE
    severity: notice
    title: "Using SSR when static would work"
    description: "Static pages are faster and cheaper to host."
    howToFix: |
      Use prerender for pages that don't need SSR:

      \`\`\`astro
      ---
      export const prerender = true; // Static generation
      ---
      \`\`\`

      Or set default to static in config:
      \`\`\`js
      export default defineConfig({
        output: 'hybrid', // Static by default, SSR opt-in
      });
      \`\`\`

performance_tips:
  - "Use client:visible instead of client:load for below-fold components"
  - "Leverage Content Collections for type-safe content"
  - "Use View Transitions for smooth navigation"
  - "Optimize images with astro:assets"
  - "Consider using Astro DB for dynamic content"

integrations:
  - "@astrojs/sitemap - Automatic sitemap generation"
  - "@astrojs/rss - RSS feed for blogs"
  - "astro-seo - Comprehensive SEO component"
  - "@astrojs/partytown - Move third-party scripts to web worker"
`);
embedRecipe("django", `# Django SEO Recipe
# Django is the most popular Python web framework

framework: django
display_name: Django
category: server-rendered
ssr_default: true

seo_strengths:
  - "Server-rendered HTML by default"
  - "Built-in sitemap framework"
  - "Admin interface for content management"
  - "Mature ecosystem"

checks:
  - code: DJANGO_NO_SITEMAP
    severity: warning
    title: "Django sitemap framework not configured"
    description: "Django has a built-in sitemap framework that should be used."
    howToFix: |
      Add sitemap to your project:

      \`\`\`python
      # settings.py
      INSTALLED_APPS = [
          'django.contrib.sitemaps',
      ]

      # sitemaps.py
      from django.contrib.sitemaps import Sitemap
      from .models import Post

      class PostSitemap(Sitemap):
          changefreq = "weekly"
          priority = 0.8

          def items(self):
              return Post.objects.filter(published=True)

          def lastmod(self, obj):
              return obj.updated_at

      # urls.py
      from django.contrib.sitemaps.views import sitemap
      from .sitemaps import PostSitemap

      sitemaps = {'posts': PostSitemap}

      urlpatterns = [
          path('sitemap.xml', sitemap, {'sitemaps': sitemaps}),
      ]
      \`\`\`

  - code: DJANGO_NO_META_FRAMEWORK
    indexable_only: true
    severity: warning
    title: "No SEO meta framework detected"
    description: "Use django-meta for consistent meta tag management."
    howToFix: |
      Install django-meta:

      \`\`\`bash
      pip install django-meta
      \`\`\`

      \`\`\`python
      # settings.py
      INSTALLED_APPS = ['meta']

      META_SITE_PROTOCOL = 'https'
      META_USE_OG_PROPERTIES = True
      META_USE_TWITTER_PROPERTIES = True
      \`\`\`

      \`\`\`python
      # In views or models
      from meta.views import MetadataMixin

      class PostDetailView(MetadataMixin, DetailView):
          def get_meta_title(self):
              return self.object.title

          def get_meta_description(self):
              return self.object.excerpt
      \`\`\`
    detection:
      html_missing_patterns:
        - 'property="og:'
        - 'name="twitter:'

  - code: DJANGO_DEBUG_TRUE
    severity: error
    title: "DEBUG mode appears enabled"
    description: "DEBUG=True in production exposes sensitive information and hurts performance."
    howToFix: |
      Ensure DEBUG is False in production:

      \`\`\`python
      # settings.py
      DEBUG = os.environ.get('DEBUG', 'False') == 'True'
      \`\`\`

      Or use django-environ:
      \`\`\`python
      import environ
      env = environ.Env(DEBUG=(bool, False))
      DEBUG = env('DEBUG')
      \`\`\`

  - code: DJANGO_NO_CACHE
    severity: warning
    title: "Caching not configured"
    description: "Django without caching is slower than it should be."
    howToFix: |
      Configure caching in settings.py:

      \`\`\`python
      # Redis (recommended)
      CACHES = {
          'default': {
              'BACKEND': 'django.core.cache.backends.redis.RedisCache',
              'LOCATION': 'redis://127.0.0.1:6379',
          }
      }

      # Use cache in views
      from django.views.decorators.cache import cache_page

      @cache_page(60 * 15)  # 15 minutes
      def my_view(request):
          ...
      \`\`\`

  - code: DJANGO_NO_GZIP
    severity: notice
    title: "GZip middleware not enabled"
    description: "Enable GZip compression for faster page loads."
    howToFix: |
      Add GZip middleware:

      \`\`\`python
      # settings.py
      MIDDLEWARE = [
          'django.middleware.gzip.GZipMiddleware',
          # ... other middleware
      ]
      \`\`\`

  - code: DJANGO_NO_WHITENOISE
    severity: notice
    title: "Static files not optimized"
    description: "Use WhiteNoise for efficient static file serving."
    howToFix: |
      Install and configure WhiteNoise:

      \`\`\`bash
      pip install whitenoise
      \`\`\`

      \`\`\`python
      # settings.py
      MIDDLEWARE = [
          'django.middleware.security.SecurityMiddleware',
          'whitenoise.middleware.WhiteNoiseMiddleware',
          # ...
      ]

      STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
      \`\`\`

performance_tips:
  - "Use select_related/prefetch_related for queries"
  - "Enable template caching in production"
  - "Use django-debug-toolbar in development"
  - "Configure database connection pooling"
  - "Use async views for I/O-bound operations (Django 4.1+)"

recommended_packages:
  seo:
    - "django-meta - Meta tag management"
    - "django-robots - robots.txt management"
  performance:
    - "django-redis - Redis caching"
    - "whitenoise - Static file serving"
    - "django-debug-toolbar - Development profiling"
`);
embedRecipe("laravel", `# Laravel SEO Recipe
# Laravel is the most popular PHP framework

framework: laravel
display_name: Laravel
category: server-rendered
ssr_default: true

seo_strengths:
  - "Server-rendered HTML by default"
  - "Blade templates for clean SEO markup"
  - "Route caching for fast responses"
  - "Built-in CSRF and security"

checks:
  - code: LARAVEL_NO_META_PACKAGE
    indexable_only: true
    severity: warning
    title: "No SEO package detected"
    description: "Laravel benefits from an SEO package like artesaos/seotools."
    howToFix: |
      Install artesaos/seotools:

      \`\`\`bash
      composer require artesaos/seotools
      \`\`\`

      \`\`\`php
      // In controller
      use Artesaos\\SEOTools\\Facades\\SEOMeta;

      SEOMeta::setTitle('Page Title');
      SEOMeta::setDescription('Description');

      // In Blade
      {!! SEOMeta::generate() !!}
      \`\`\`
    detection:
      html_missing_patterns:
        - 'property="og:'

  - code: LARAVEL_NO_SITEMAP
    severity: warning
    title: "No sitemap package detected"
    description: "Use spatie/laravel-sitemap for automatic sitemaps."
    howToFix: |
      \`\`\`bash
      composer require spatie/laravel-sitemap
      \`\`\`

      \`\`\`php
      // Generate sitemap
      use Spatie\\Sitemap\\SitemapGenerator;

      SitemapGenerator::create('https://yoursite.com')
          ->writeToFile(public_path('sitemap.xml'));

      // Or build manually
      use Spatie\\Sitemap\\Sitemap;
      use Spatie\\Sitemap\\Tags\\Url;

      Sitemap::create()
          ->add(Url::create('/')->setPriority(1.0))
          ->add(Url::create('/about'))
          ->writeToFile(public_path('sitemap.xml'));
      \`\`\`

  - code: LARAVEL_INERTIA_NO_SSR
    indexable_only: true
    severity: error
    title: "Inertia.js without SSR"
    description: "Inertia apps are client-rendered by default, losing SEO benefits."
    howToFix: |
      Enable Inertia SSR:

      \`\`\`bash
      php artisan inertia:start-ssr
      \`\`\`

      Configure in config/inertia.php:
      \`\`\`php
      'ssr' => [
          'enabled' => true,
          'url' => 'http://127.0.0.1:13714',
      ],
      \`\`\`

  - code: LARAVEL_NO_RESPONSE_CACHE
    severity: notice
    title: "Response caching not configured"
    description: "Cache full responses for better performance."
    howToFix: |
      Install spatie/laravel-responsecache:

      \`\`\`bash
      composer require spatie/laravel-responsecache
      \`\`\`

      Add middleware:
      \`\`\`php
      // app/Http/Kernel.php
      protected $middlewareGroups = [
          'web' => [
              \\Spatie\\ResponseCache\\Middlewares\\CacheResponse::class,
          ],
      ];
      \`\`\`

  - code: LARAVEL_LIVEWIRE_SEO
    severity: warning
    title: "Livewire components may affect SEO"
    description: "Livewire content loads via JavaScript after initial page load."
    howToFix: |
      For SEO-critical content, use wire:init to load immediately:

      \`\`\`blade
      <div wire:init="loadData">
          @if($data)
              {{-- Content --}}
          @else
              {{-- Loading skeleton --}}
          @endif
      </div>
      \`\`\`

      Or use Alpine.js for client-only interactions.

performance_tips:
  - "Enable route caching: php artisan route:cache"
  - "Enable config caching: php artisan config:cache"
  - "Use query caching with remember()"
  - "Optimize autoloader: composer dump-autoload -o"
  - "Use Laravel Octane for high performance"

recommended_packages:
  seo:
    - "artesaos/seotools - Meta tag management"
    - "spatie/laravel-sitemap - Sitemap generation"
    - "spatie/schema-org - Structured data"
  performance:
    - "spatie/laravel-responsecache - Full page caching"
    - "barryvdh/laravel-debugbar - Development profiling"
`);
embedRecipe("nextjs", `# Next.js SEO Recipe
# Next.js has excellent SEO by default, but there are still common mistakes

framework: nextjs
display_name: Next.js
category: meta-framework
base_framework: react
ssr_default: true

seo_strengths:
  - "Server-side rendering by default"
  - "Static site generation support"
  - "Built-in Image component with optimization"
  - "Automatic code splitting"
  - "File-based routing"
  - "Built-in metadata API (App Router)"

checks:
  # App Router specific
  - code: NEXTJS_NO_METADATA_API
    indexable_only: true
    severity: warning
    title: "Not using Next.js Metadata API"
    description: "Next.js 13+ has a built-in Metadata API that's better than react-helmet."
    howToFix: |
      Use the Metadata API in your layout or page:

      \`\`\`tsx
      // app/page.tsx
      import { Metadata } from 'next';

      export const metadata: Metadata = {
        title: 'Page Title',
        description: 'Page description',
        openGraph: {
          title: 'OG Title',
          description: 'OG Description',
          images: ['/og-image.jpg'],
        },
      };

      // For dynamic metadata
      export async function generateMetadata({ params }): Promise<Metadata> {
        const product = await getProduct(params.id);
        return {
          title: product.name,
          description: product.description,
        };
      }
      \`\`\`
    app_router_only: true
    detection:
      html_missing_patterns:
        - 'property="og:title"'
        - 'property="og:description"'

  - code: NEXTJS_GENERATESTATICPARAMS_MISSING
    severity: warning
    title: "Dynamic routes without generateStaticParams"
    description: "Dynamic routes like [id] should pre-generate static pages for SEO."
    howToFix: |
      Add generateStaticParams to pre-render dynamic pages:

      \`\`\`tsx
      // app/products/[id]/page.tsx
      export async function generateStaticParams() {
        const products = await getProducts();
        return products.map((product) => ({
          id: product.id.toString(),
        }));
      }
      \`\`\`
    app_router_only: true

  # Pages Router specific
  - code: NEXTJS_NO_GETSTATICPROPS
    severity: warning
    title: "Pages without getStaticProps/getServerSideProps"
    description: "Pages fetching data client-side miss SEO benefits of SSR/SSG."
    howToFix: |
      Move data fetching to getStaticProps (for static) or getServerSideProps (for dynamic):

      \`\`\`tsx
      // pages/products.tsx
      export async function getStaticProps() {
        const products = await fetchProducts();
        return {
          props: { products },
          revalidate: 3600, // ISR: regenerate every hour
        };
      }
      \`\`\`
    pages_router_only: true

  # Common issues
  - code: NEXTJS_IMAGE_NOT_USED
    severity: warning
    title: "Using <img> instead of next/image"
    description: "The next/image component provides automatic optimization, lazy loading, and prevents CLS."
    howToFix: |
      Replace <img> with next/image:

      \`\`\`tsx
      import Image from 'next/image';

      // Before
      <img src="/hero.jpg" alt="Hero" />

      // After
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={630}
        priority // for above-the-fold images
      />
      \`\`\`

  - code: NEXTJS_NO_PRIORITY_IMAGE
    severity: notice
    title: "LCP image missing priority prop"
    description: "The largest image above the fold should have priority={true} for faster LCP."
    howToFix: |
      Add priority to your hero/LCP image:

      \`\`\`tsx
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={630}
        priority
      />
      \`\`\`

  - code: NEXTJS_LINK_NO_PREFETCH
    severity: notice
    title: "Link without prefetch consideration"
    description: "Next.js prefetches all links by default, which can waste bandwidth."
    howToFix: |
      Disable prefetch for less important links:

      \`\`\`tsx
      <Link href="/terms" prefetch={false}>
        Terms of Service
      </Link>
      \`\`\`

  - code: NEXTJS_NO_ROBOTS_TXT
    severity: warning
    title: "Missing robots.txt configuration"
    description: "Next.js can generate robots.txt automatically."
    howToFix: |
      App Router - create app/robots.ts:
      \`\`\`tsx
      import { MetadataRoute } from 'next';

      export default function robots(): MetadataRoute.Robots {
        return {
          rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/api/',
          },
          sitemap: 'https://yoursite.com/sitemap.xml',
        };
      }
      \`\`\`

      Pages Router - create public/robots.txt or use next-sitemap package.

  - code: NEXTJS_NO_SITEMAP
    severity: warning
    title: "Missing sitemap configuration"
    description: "Next.js can generate sitemaps automatically."
    howToFix: |
      App Router - create app/sitemap.ts:
      \`\`\`tsx
      import { MetadataRoute } from 'next';

      export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
        const products = await getProducts();

        return [
          { url: 'https://yoursite.com', lastModified: new Date() },
          { url: 'https://yoursite.com/about', lastModified: new Date() },
          ...products.map((product) => ({
            url: \`https://yoursite.com/products/\${product.id}\`,
            lastModified: product.updatedAt,
          })),
        ];
      }
      \`\`\`

  - code: NEXTJS_USE_CLIENT_OVERUSE
    severity: warning
    title: "Overusing 'use client' directive"
    description: "Too many client components reduces SSR benefits."
    howToFix: |
      Keep 'use client' at the leaf level:

      \`\`\`tsx
      // Bad - entire page is client-rendered
      'use client';
      export default function Page() { ... }

      // Good - only interactive parts are client
      // page.tsx (Server Component)
      import ClientButton from './ClientButton';
      export default function Page() {
        return <div>
          <h1>Server rendered content</h1>
          <ClientButton /> {/* Only this is client */}
        </div>
      }
      \`\`\`

  - code: NEXTJS_FONT_NOT_OPTIMIZED
    severity: notice
    title: "Not using next/font for fonts"
    description: "next/font automatically optimizes fonts and prevents CLS."
    howToFix: |
      Use next/font for Google Fonts or local fonts:

      \`\`\`tsx
      import { Inter } from 'next/font/google';

      const inter = Inter({ subsets: ['latin'] });

      export default function RootLayout({ children }) {
        return (
          <html lang="en" className={inter.className}>
            <body>{children}</body>
          </html>
        );
      }
      \`\`\`

  - code: NEXTJS_NO_TRAILING_SLASH_CONFIG
    severity: notice
    title: "Inconsistent trailing slash handling"
    description: "Inconsistent URLs can cause duplicate content issues."
    howToFix: |
      Configure trailingSlash in next.config.js:

      \`\`\`js
      module.exports = {
        trailingSlash: true, // or false
      };
      \`\`\`

performance_tips:
  - "Use React Server Components for static content"
  - "Add priority to LCP images"
  - "Use next/font for fonts"
  - "Enable ISR for frequently updated pages"
  - "Use Route Handlers instead of API routes for server-only logic"

structured_data:
  - type: "JSON-LD in metadata"
    example: |
      \`\`\`tsx
      export const metadata: Metadata = {
        other: {
          'script:ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Your Company',
            url: 'https://yoursite.com',
          }),
        },
      };
      \`\`\`
`);
embedRecipe("nuxt", `# Nuxt SEO Recipe
# Nuxt has excellent SEO capabilities, similar to Next.js for Vue

framework: nuxt
display_name: Nuxt
category: meta-framework
base_framework: vue
ssr_default: true

seo_strengths:
  - "Universal rendering (SSR) by default"
  - "Static site generation support"
  - "Built-in useSeoMeta composable"
  - "Automatic code splitting"
  - "File-based routing"
  - "NuxtImage for image optimization"

checks:
  - code: NUXT_NO_USESEOMETA
    indexable_only: true
    severity: warning
    title: "Not using useSeoMeta composable"
    description: "Nuxt 3 has built-in SEO meta composables that are cleaner than useHead."
    howToFix: |
      Use useSeoMeta for SEO tags:

      \`\`\`vue
      <script setup>
      useSeoMeta({
        title: 'Page Title',
        description: 'Page description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
        ogImage: '/og-image.jpg',
        twitterCard: 'summary_large_image',
      });
      </script>
      \`\`\`

  - code: NUXT_USEFETCH_CLIENT_ONLY
    severity: warning
    title: "Data fetching only on client side"
    description: "Using onMounted for data fetching bypasses SSR benefits."
    howToFix: |
      Use useFetch or useAsyncData instead:

      \`\`\`vue
      <script setup>
      // Bad - client only
      const data = ref(null);
      onMounted(async () => {
        data.value = await $fetch('/api/data');
      });

      // Good - SSR friendly
      const { data } = await useFetch('/api/data');
      </script>
      \`\`\`

  - code: NUXT_NO_NUXT_IMAGE
    severity: warning
    title: "Not using NuxtImage for images"
    description: "@nuxt/image provides automatic optimization and responsive images."
    howToFix: |
      Install and use NuxtImage:

      \`\`\`bash
      npx nuxi module add image
      \`\`\`

      \`\`\`vue
      <template>
        <NuxtImg
          src="/hero.jpg"
          alt="Hero"
          width="1200"
          height="630"
          preload
        />
      </template>
      \`\`\`

  - code: NUXT_NO_ROBOTS
    severity: warning
    title: "Missing robots.txt configuration"
    description: "Use @nuxtjs/robots module for robots.txt."
    howToFix: |
      Install and configure robots module:

      \`\`\`bash
      npm install @nuxtjs/robots
      \`\`\`

      \`\`\`ts
      // nuxt.config.ts
      export default defineNuxtConfig({
        modules: ['@nuxtjs/robots'],
        robots: {
          rules: [
            { UserAgent: '*', Allow: '/' },
            { UserAgent: '*', Disallow: '/api/' },
          ],
          sitemap: 'https://yoursite.com/sitemap.xml',
        },
      });
      \`\`\`

  - code: NUXT_NO_SITEMAP
    severity: warning
    title: "Missing sitemap configuration"
    description: "Use @nuxtjs/sitemap module for automatic sitemap."
    howToFix: |
      Install sitemap module:

      \`\`\`bash
      npm install @nuxtjs/sitemap
      \`\`\`

      \`\`\`ts
      // nuxt.config.ts
      export default defineNuxtConfig({
        modules: ['@nuxtjs/sitemap'],
        sitemap: {
          hostname: 'https://yoursite.com',
        },
      });
      \`\`\`

  - code: NUXT_SPA_MODE
    indexable_only: true
    severity: error
    title: "Nuxt running in SPA mode"
    description: "SPA mode disables SSR, losing SEO benefits."
    howToFix: |
      Remove ssr: false from nuxt.config.ts:

      \`\`\`ts
      export default defineNuxtConfig({
        // Remove this line
        // ssr: false,
      });
      \`\`\`

      If you need client-only components, use <ClientOnly>:
      \`\`\`vue
      <ClientOnly>
        <BrowserOnlyWidget />
      </ClientOnly>
      \`\`\`
    detection:
      html_patterns:
        - '<div id="__nuxt">'
      missing_content: true

  - code: NUXT_NO_PRERENDER
    indexable_only: true
    severity: notice
    title: "Static pages not pre-rendered"
    description: "Static pages could be pre-rendered for better performance."
    howToFix: |
      Enable route prerendering in nuxt.config.ts:

      \`\`\`ts
      export default defineNuxtConfig({
        routeRules: {
          '/about': { prerender: true },
          '/blog/**': { prerender: true },
        },
      });
      \`\`\`

      Or generate a fully static site:
      \`\`\`bash
      nuxt generate
      \`\`\`

performance_tips:
  - "Use useLazyFetch for non-critical data"
  - "Add preload prop to NuxtImg for LCP images"
  - "Use Nuxt DevTools to identify performance issues"
  - "Configure image provider for CDN delivery"
  - "Use route rules for caching strategies"
`);
embedRecipe("rails", `# Ruby on Rails SEO Recipe
# Rails is server-rendered by default, excellent for SEO

framework: rails
display_name: Ruby on Rails
category: server-rendered
ssr_default: true

seo_strengths:
  - "Server-rendered HTML by default"
  - "Turbo for fast navigation without SPA"
  - "Strong conventions reduce mistakes"
  - "Mature gem ecosystem"

checks:
  - code: RAILS_NO_META_TAGS_GEM
    indexable_only: true
    severity: warning
    title: "Not using meta-tags gem"
    description: "The meta-tags gem provides a clean API for SEO tags."
    howToFix: |
      Add meta-tags to Gemfile:

      \`\`\`ruby
      gem 'meta-tags'
      \`\`\`

      Run \`bundle install\`, then:

      \`\`\`ruby
      # app/views/layouts/application.html.erb
      <head>
        <%= display_meta_tags site: 'Your Site' %>
      </head>
      \`\`\`

      \`\`\`ruby
      # In controllers or views
      set_meta_tags title: 'Page Title',
                    description: 'Page description',
                    keywords: 'seo, rails'
      \`\`\`

  - code: RAILS_NO_SITEMAP_GEM
    severity: warning
    title: "Not using sitemap_generator gem"
    description: "sitemap_generator creates SEO-friendly sitemaps automatically."
    howToFix: |
      Add to Gemfile:

      \`\`\`ruby
      gem 'sitemap_generator'
      \`\`\`

      Generate config:
      \`\`\`bash
      rails sitemap:install
      \`\`\`

      Configure config/sitemap.rb:
      \`\`\`ruby
      SitemapGenerator::Sitemap.default_host = "https://yoursite.com"

      SitemapGenerator::Sitemap.create do
        add '/about', changefreq: 'monthly'
        Product.find_each do |product|
          add product_path(product), lastmod: product.updated_at
        end
      end
      \`\`\`

      Generate: \`rails sitemap:refresh\`

  - code: RAILS_NO_CANONICAL
    severity: warning
    title: "Missing canonical URLs"
    description: "Rails apps with multiple URLs for same content need canonicals."
    howToFix: |
      Add canonical tag in layout:

      \`\`\`erb
      <!-- Using meta-tags gem -->
      <%= display_meta_tags canonical: request.original_url %>

      <!-- Or manually -->
      <link rel="canonical" href="<%= request.original_url.split('?').first %>" />
      \`\`\`

  - code: RAILS_TURBO_BREAKS_CRAWLERS
    indexable_only: true
    severity: notice
    title: "Turbo may affect JavaScript-dependent crawlers"
    description: "Turbo Drive updates pages via JavaScript, which some crawlers may miss."
    howToFix: |
      For SEO-critical pages, ensure content is in initial HTML.

      For dynamic content, add data-turbo="false":
      \`\`\`erb
      <%= link_to 'Critical Page', critical_path, data: { turbo: false } %>
      \`\`\`

      Or disable for specific pages:
      \`\`\`erb
      <meta name="turbo-visit-control" content="reload">
      \`\`\`

  - code: RAILS_NO_JSON_LD
    severity: notice
    title: "No structured data detected"
    description: "Add JSON-LD for rich snippets."
    howToFix: |
      Create a helper:

      \`\`\`ruby
      # app/helpers/seo_helper.rb
      module SeoHelper
        def json_ld(data)
          content_tag :script, data.to_json.html_safe,
                      type: 'application/ld+json'
        end
      end
      \`\`\`

      Use in views:
      \`\`\`erb
      <%= json_ld({
        "@context" => "https://schema.org",
        "@type" => "Product",
        "name" => @product.name,
        "description" => @product.description
      }) %>
      \`\`\`
    detection:
      html_missing_patterns:
        - 'application/ld+json'

  - code: RAILS_SLOW_QUERIES
    severity: warning
    title: "N+1 queries may slow pages"
    description: "Slow pages hurt SEO. Use includes/eager_load."
    howToFix: |
      Use bullet gem to detect N+1:

      \`\`\`ruby
      # Gemfile
      gem 'bullet', group: 'development'
      \`\`\`

      Fix with includes:
      \`\`\`ruby
      # Before (N+1)
      @posts = Post.all
      @posts.each { |p| p.author.name }

      # After (2 queries)
      @posts = Post.includes(:author).all
      \`\`\`

  - code: RAILS_NO_CACHING
    severity: notice
    title: "Page caching not configured"
    description: "Rails caching can dramatically improve response times."
    howToFix: |
      Enable caching in production:

      \`\`\`ruby
      # config/environments/production.rb
      config.action_controller.perform_caching = true
      config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] }
      \`\`\`

      Use fragment caching:
      \`\`\`erb
      <% cache @product do %>
        <%= render @product %>
      <% end %>
      \`\`\`

performance_tips:
  - "Use Russian doll caching for nested views"
  - "Enable asset fingerprinting and CDN"
  - "Use Turbo for SPA-like experience"
  - "Profile with rack-mini-profiler"
  - "Use Postgres for full-text search instead of LIKE"

recommended_gems:
  seo:
    - "meta-tags - SEO tag management"
    - "sitemap_generator - XML sitemaps"
  performance:
    - "bullet - N+1 detection"
    - "rack-mini-profiler - Performance profiling"
    - "bootsnap - Faster boot times"
`);
embedRecipe("react", `# React SEO Recipe
# Client-side rendering frameworks are notoriously problematic for SEO

framework: react
display_name: React
category: spa
ssr_default: false

seo_challenges:
  - "Client-side rendering means empty HTML for crawlers"
  - "Dynamic content invisible to search engines"
  - "Slow First Contentful Paint"
  - "No server-side meta tag generation"
  - "JavaScript-dependent routing breaks crawlability"

checks:
  # Critical - these will severely hurt SEO
  - code: REACT_CSR_DETECTED
    indexable_only: true
    severity: error
    title: "Client-side rendered React app detected"
    description: "React apps without SSR send empty HTML to crawlers. Search engines may not index your content."
    impact: "Critical - your content is likely invisible to Google"
    howToFix: |
      Option 1: Migrate to Next.js for automatic SSR/SSG
      Option 2: Add prerendering with react-snap or prerender.io
      Option 3: Use react-helmet-async with a prerender service
    detection:
      html_patterns:
        - '<div id="root"></div>'
        - '<div id="app"></div>'
      missing_content: true  # Body has minimal text content

  - code: REACT_NO_SSR_META
    indexable_only: true
    severity: error
    title: "Meta tags not server-rendered"
    description: "Title and meta description are set client-side and won't be seen by crawlers."
    impact: "Search results will show wrong or missing title/description"
    howToFix: |
      For Vite/CRA: Use a prerender plugin or migrate to Next.js

      Quick fix with vite-plugin-ssr:
      \`\`\`tsx
      // pages/+Head.tsx
      export function Head() {
        return <>
          <title>Your Title</title>
          <meta name="description" content="Your description" />
        </>
      }
      \`\`\`
    detection:
      title_in_js: true
      title_not_in_html: true

  - code: REACT_HYDRATION_MISMATCH
    severity: warning
    title: "Hydration mismatch detected"
    description: "Server HTML differs from client render, causing flicker and potential SEO issues."
    impact: "Can cause content to briefly disappear, confusing crawlers"
    howToFix: |
      Common causes:
      1. Using Date.now() or Math.random() in render
      2. Browser-only APIs like window.localStorage
      3. Different data on server vs client

      Fix: Use useEffect for browser-only code:
      \`\`\`tsx
      const [mounted, setMounted] = useState(false);
      useEffect(() => setMounted(true), []);
      if (!mounted) return null; // or skeleton
      \`\`\`

  # Warnings - important but not critical
  - code: REACT_HELMET_NOT_ASYNC
    severity: warning
    title: "Using react-helmet instead of react-helmet-async"
    description: "react-helmet has memory leaks and doesn't work properly with SSR."
    howToFix: |
      Replace react-helmet with react-helmet-async:
      \`\`\`bash
      npm uninstall react-helmet
      npm install react-helmet-async
      \`\`\`

      Update imports:
      \`\`\`tsx
      // Before
      import { Helmet } from 'react-helmet';

      // After
      import { Helmet, HelmetProvider } from 'react-helmet-async';

      // Wrap app in provider
      <HelmetProvider>
        <App />
      </HelmetProvider>
      \`\`\`

  - code: REACT_ROUTER_NO_SSR
    indexable_only: true
    severity: warning
    title: "React Router without server-side support"
    description: "Client-side routing breaks when crawlers access URLs directly."
    howToFix: |
      Ensure your server returns the same HTML for all routes.

      For static hosting (Netlify, Vercel):
      Add a redirect rule to serve index.html for all routes.

      netlify.toml:
      \`\`\`toml
      [[redirects]]
        from = "/*"
        to = "/index.html"
        status = 200
      \`\`\`

  - code: REACT_NO_PRERENDER
    indexable_only: true
    severity: warning
    title: "No prerendering configured"
    description: "Static pages could be prerendered for better SEO and performance."
    howToFix: |
      Add react-snap for build-time prerendering:
      \`\`\`bash
      npm install react-snap
      \`\`\`

      package.json:
      \`\`\`json
      {
        "scripts": {
          "postbuild": "react-snap"
        },
        "reactSnap": {
          "source": "build"
        }
      }
      \`\`\`

  # Performance-related
  - code: REACT_BUNDLE_TOO_LARGE
    severity: warning
    title: "React bundle too large"
    description: "Large JavaScript bundles delay interactivity and hurt Core Web Vitals."
    howToFix: |
      1. Use React.lazy() for code splitting:
      \`\`\`tsx
      const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

      <Suspense fallback={<Loading />}>
        <HeavyComponent />
      </Suspense>
      \`\`\`

      2. Analyze bundle with source-map-explorer:
      \`\`\`bash
      npm install source-map-explorer
      npx source-map-explorer build/static/js/*.js
      \`\`\`

  - code: REACT_NO_SUSPENSE
    severity: notice
    title: "Not using Suspense for data fetching"
    description: "Without Suspense, content pops in causing layout shifts (CLS)."
    howToFix: |
      Use Suspense with a data fetching library:
      \`\`\`tsx
      <Suspense fallback={<Skeleton />}>
        <DataComponent />
      </Suspense>
      \`\`\`

performance_tips:
  - "Use React.memo() for expensive components"
  - "Lazy load routes with React.lazy()"
  - "Use useMemo/useCallback to prevent unnecessary rerenders"
  - "Consider using Preact for smaller bundle size"
  - "Use production builds (NODE_ENV=production)"

migration_paths:
  nextjs:
    effort: medium
    benefits:
      - "Automatic SSR/SSG"
      - "Built-in Image optimization"
      - "File-based routing"
      - "API routes"
    guide: "https://nextjs.org/docs/migrating/from-create-react-app"

  remix:
    effort: medium
    benefits:
      - "Nested routing with data loading"
      - "Progressive enhancement"
      - "Better error boundaries"
    guide: "https://remix.run/docs/en/main/guides/migrating-react-router-app"

  vite-ssr:
    effort: low
    benefits:
      - "Keep existing code"
      - "Add SSR incrementally"
    guide: "https://vite-plugin-ssr.com/"
`);
embedRecipe("sveltekit", `# SvelteKit SEO Recipe
# SvelteKit has excellent SSR and SSG support with minimal overhead

framework: sveltekit
display_name: SvelteKit
category: meta-framework
base_framework: svelte
ssr_default: true

seo_strengths:
  - "SSR by default"
  - "Excellent performance (small runtime)"
  - "Built-in prerendering"
  - "File-based routing"
  - "Form actions for progressive enhancement"

checks:
  - code: SVELTEKIT_NO_LOAD_FUNCTION
    severity: warning
    title: "Page without load function"
    description: "Data fetching in +page.svelte bypasses SSR. Use +page.server.ts or +page.ts."
    howToFix: |
      Move data fetching to a load function:

      \`\`\`ts
      // src/routes/products/+page.server.ts
      export async function load({ fetch }) {
        const products = await fetch('/api/products').then(r => r.json());
        return { products };
      }
      \`\`\`

      \`\`\`svelte
      <!-- src/routes/products/+page.svelte -->
      <script>
        export let data;
      </script>

      {#each data.products as product}
        <div>{product.name}</div>
      {/each}
      \`\`\`

  - code: SVELTEKIT_NO_LAYOUT_HEAD
    severity: warning
    title: "Missing svelte:head in layout"
    description: "Common meta tags should be in a layout for consistency."
    howToFix: |
      Add svelte:head to your layout:

      \`\`\`svelte
      <!-- src/routes/+layout.svelte -->
      <script>
        import { page } from '$app/stores';
      </script>

      <svelte:head>
        <title>{$page.data.title ?? 'Your Site'}</title>
        <meta name="description" content={$page.data.description ?? 'Default description'} />
        <link rel="canonical" href={$page.url.href} />
      </svelte:head>

      <slot />
      \`\`\`
    detection:
      html_missing_patterns:
        - '<title>'
        - 'name="description"'

  - code: SVELTEKIT_NO_PRERENDER
    indexable_only: true
    severity: notice
    title: "Static pages not prerendered"
    description: "Static pages should be prerendered for best performance."
    howToFix: |
      Add prerender to static pages:

      \`\`\`ts
      // src/routes/about/+page.ts
      export const prerender = true;
      \`\`\`

      Or set default in svelte.config.js:
      \`\`\`js
      kit: {
        prerender: {
          default: true
        }
      }
      \`\`\`

  - code: SVELTEKIT_NO_TRAILING_SLASH
    severity: notice
    title: "Inconsistent trailing slash handling"
    description: "Configure trailing slash to avoid duplicate content."
    howToFix: |
      Set in svelte.config.js:

      \`\`\`js
      kit: {
        trailingSlash: 'never' // or 'always'
      }
      \`\`\`

  - code: SVELTEKIT_ENHANCED_IMAGE
    severity: notice
    title: "Not using enhanced images"
    description: "SvelteKit supports enhanced images with @sveltejs/enhanced-img."
    howToFix: |
      Install enhanced images:

      \`\`\`bash
      npm install @sveltejs/enhanced-img
      \`\`\`

      \`\`\`svelte
      <script>
        import { Image } from '@sveltejs/enhanced-img';
        import heroImage from '$lib/images/hero.jpg';
      </script>

      <Image src={heroImage} alt="Hero" />
      \`\`\`

  - code: SVELTEKIT_NO_SITEMAP
    severity: warning
    title: "Missing sitemap"
    description: "Use svelte-sitemap or generate manually."
    howToFix: |
      Option 1: Use svelte-sitemap
      \`\`\`bash
      npm install svelte-sitemap
      npx svelte-sitemap --domain https://yoursite.com
      \`\`\`

      Option 2: Create src/routes/sitemap.xml/+server.ts:
      \`\`\`ts
      export async function GET() {
        const pages = ['/', '/about', '/products'];
        const sitemap = \`<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            \${pages.map(page => \`
              <url>
                <loc>https://yoursite.com\${page}</loc>
              </url>
            \`).join('')}
          </urlset>\`;
        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' }
        });
      }
      \`\`\`

performance_tips:
  - "Use load functions for SSR data"
  - "Prerender static pages"
  - "Use streaming for slow data sources"
  - "Leverage Svelte's small runtime"
  - "Use form actions for progressive enhancement"
`);
embedRecipe("vue", `# Vue.js SEO Recipe
# Similar challenges to React for client-side rendered apps

framework: vue
display_name: Vue.js
category: spa
ssr_default: false

seo_challenges:
  - "Client-side rendering sends empty HTML to crawlers"
  - "Vue Router requires proper server configuration"
  - "Async components delay content rendering"
  - "No built-in meta tag management"

checks:
  - code: VUE_CSR_DETECTED
    indexable_only: true
    severity: error
    title: "Client-side rendered Vue app detected"
    description: "Vue apps without SSR send empty HTML to crawlers."
    impact: "Your content may not be indexed by search engines"
    howToFix: |
      Option 1: Migrate to Nuxt for automatic SSR/SSG
      Option 2: Add SSR with @vue/server-renderer
      Option 3: Use prerendering with prerender-spa-plugin

      For Nuxt migration, most Vue components work directly.
    detection:
      html_patterns:
        - '<div id="app"></div>'
      missing_content: true

  - code: VUE_NO_META_MANAGEMENT
    indexable_only: true
    severity: error
    title: "No meta tag management library"
    description: "Title and meta description are not dynamically managed."
    howToFix: |
      Install @vueuse/head or vue-meta:

      \`\`\`bash
      npm install @vueuse/head
      \`\`\`

      \`\`\`ts
      // main.ts
      import { createHead } from '@vueuse/head';
      const head = createHead();
      app.use(head);
      \`\`\`

      \`\`\`vue
      <script setup>
      import { useHead } from '@vueuse/head';

      useHead({
        title: 'Page Title',
        meta: [
          { name: 'description', content: 'Page description' },
        ],
      });
      </script>
      \`\`\`

  - code: VUE_ROUTER_HISTORY_MODE
    severity: warning
    title: "Vue Router not in history mode"
    description: "Hash mode (#/) creates ugly URLs and SEO issues."
    howToFix: |
      Use createWebHistory instead of createWebHashHistory:

      \`\`\`ts
      import { createRouter, createWebHistory } from 'vue-router';

      const router = createRouter({
        history: createWebHistory(),
        routes: [...],
      });
      \`\`\`

      Then configure your server to return index.html for all routes.

  - code: VUE_ASYNC_COMPONENT_NO_LOADING
    severity: warning
    title: "Async components without loading state"
    description: "Async components can cause CLS when they pop in."
    howToFix: |
      Provide a loading component:

      \`\`\`ts
      import { defineAsyncComponent } from 'vue';

      const AsyncComp = defineAsyncComponent({
        loader: () => import('./HeavyComponent.vue'),
        loadingComponent: LoadingSpinner,
        delay: 200,
      });
      \`\`\`

  - code: VUE_NO_KEY_ON_LIST
    severity: notice
    title: "v-for without :key attribute"
    description: "Missing keys can cause rendering issues and affect SEO crawling."
    howToFix: |
      Always use :key with v-for:

      \`\`\`vue
      <div v-for="item in items" :key="item.id">
        {{ item.name }}
      </div>
      \`\`\`

  - code: VUE_TRANSITION_CLS
    severity: notice
    title: "Transitions may cause layout shifts"
    description: "CSS transitions that change element size cause CLS."
    howToFix: |
      Use transform instead of width/height changes:

      \`\`\`css
      /* Bad - causes CLS */
      .fade-enter-active { height: 0 to 100px; }

      /* Good - no CLS */
      .fade-enter-active { transform: scaleY(0) to scaleY(1); }
      \`\`\`

performance_tips:
  - "Use Vite for faster development and optimized builds"
  - "Lazy load routes with dynamic imports"
  - "Use v-once for static content"
  - "Use v-memo for expensive list items"
  - "Consider Nuxt for SSR/SSG"

migration_paths:
  nuxt:
    effort: low
    benefits:
      - "Automatic SSR/SSG"
      - "File-based routing"
      - "Auto-imports"
      - "Built-in SEO utilities"
    guide: "https://nuxt.com/docs/migration/overview"
`);
embedRecipe("wordpress", `# WordPress SEO Recipe
# WordPress powers 40%+ of the web - SEO is well-supported with plugins

framework: wordpress
display_name: WordPress
category: cms
ssr_default: true  # PHP renders on server

seo_strengths:
  - "Server-rendered HTML by default"
  - "Mature SEO plugin ecosystem"
  - "Built-in canonical URL support"
  - "Sitemap generation via plugins"
  - "Structured data plugins available"

seo_challenges:
  - "Plugin bloat can slow performance"
  - "Default themes often lack optimization"
  - "Image optimization requires plugins"
  - "Caching needed for performance"

checks:
  - code: WORDPRESS_NO_SEO_PLUGIN
    severity: warning
    title: "No SEO plugin detected"
    description: "WordPress benefits greatly from an SEO plugin like Yoast or Rank Math."
    howToFix: |
      Install an SEO plugin:

      **Yoast SEO** (most popular):
      1. Go to Plugins > Add New
      2. Search "Yoast SEO"
      3. Install and activate

      **Rank Math** (feature-rich free tier):
      1. Go to Plugins > Add New
      2. Search "Rank Math"
      3. Install and activate

      Both provide:
      - Meta title/description management
      - XML sitemap generation
      - Schema markup
      - Content analysis
    detection:
      html_missing_patterns:
        - 'Yoast SEO'
        - 'seo-by-rank-math'
        - 'The SEO Framework'
        - 'All in One SEO'

  - code: WORDPRESS_OUTDATED
    severity: error
    title: "WordPress core is outdated"
    description: "Running outdated WordPress is a security risk and may have SEO bugs."
    howToFix: |
      Update WordPress:
      1. Backup your site first
      2. Go to Dashboard > Updates
      3. Click "Update Now"

      Enable auto-updates in wp-config.php:
      \`\`\`php
      define('WP_AUTO_UPDATE_CORE', true);
      \`\`\`

  - code: WORDPRESS_NO_CACHING
    severity: warning
    title: "No caching plugin detected"
    description: "WordPress without caching is slow, hurting Core Web Vitals."
    howToFix: |
      Install a caching plugin:

      **WP Super Cache** (simple):
      - Easy setup, good for most sites

      **W3 Total Cache** (advanced):
      - More features, steeper learning curve

      **LiteSpeed Cache** (if on LiteSpeed server):
      - Best performance on compatible hosts

  - code: WORDPRESS_LARGE_IMAGES
    severity: warning
    title: "Images not optimized"
    description: "Large images slow down WordPress significantly."
    howToFix: |
      Install an image optimization plugin:

      **ShortPixel** or **Smush**:
      - Compresses existing images
      - Optimizes on upload
      - WebP conversion

      Or use Cloudflare Polish for automatic optimization.

  - code: WORDPRESS_TOO_MANY_PLUGINS
    severity: warning
    title: "Too many plugins installed"
    description: "Each plugin adds overhead. Many sites have 30+ plugins when 10-15 suffice."
    howToFix: |
      Audit your plugins:
      1. Go to Plugins > Installed Plugins
      2. Deactivate plugins not in use
      3. Delete deactivated plugins
      4. Consider consolidating (one SEO plugin, one security plugin)

      Aim for under 20 plugins.

  - code: WORDPRESS_NO_LAZY_LOAD
    severity: notice
    title: "Native lazy loading not enabled"
    description: "WordPress 5.5+ has native lazy loading, but themes may disable it."
    howToFix: |
      Check if lazy loading is enabled:
      \`\`\`php
      // In functions.php, remove if present:
      add_filter('wp_lazy_loading_enabled', '__return_false');
      \`\`\`

      For older WordPress, add:
      \`\`\`php
      add_filter('wp_lazy_loading_enabled', '__return_true');
      \`\`\`

  - code: WORDPRESS_NO_WEBP
    severity: notice
    title: "Not serving WebP images"
    description: "WebP images are 25-35% smaller than JPEG."
    howToFix: |
      Use a plugin that serves WebP:

      1. **ShortPixel**: Auto-converts and serves WebP
      2. **WebP Express**: Converts and configures server

      Or use Cloudflare with Polish enabled for automatic WebP.

  - code: WORDPRESS_NO_PRELOAD_HINTS
    severity: notice
    title: "Missing resource hints"
    description: "Preload hints can speed up critical resources."
    howToFix: |
      Add to your theme's functions.php:

      \`\`\`php
      function add_resource_hints() {
        // Preload critical font
        echo '<link rel="preload" href="/wp-content/themes/yourtheme/fonts/main.woff2" as="font" type="font/woff2" crossorigin>';

        // Preconnect to external domains
        echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
      }
      add_action('wp_head', 'add_resource_hints', 1);
      \`\`\`

  - code: WORDPRESS_BLOCKING_SCRIPTS
    severity: warning
    title: "Render-blocking scripts detected"
    description: "JavaScript in <head> blocks rendering."
    howToFix: |
      Use a plugin like **Autoptimize** or **Asset CleanUp** to:
      - Defer JavaScript
      - Inline critical CSS
      - Combine files

      Or add defer manually in functions.php:
      \`\`\`php
      function defer_scripts($tag, $handle) {
        if (is_admin()) return $tag;
        return str_replace(' src', ' defer src', $tag);
      }
      add_filter('script_loader_tag', 'defer_scripts', 10, 2);
      \`\`\`

  - code: WORDPRESS_NO_SCHEMA
    severity: warning
    title: "No structured data detected"
    description: "Schema markup helps with rich snippets."
    howToFix: |
      **If using Yoast/Rank Math**: Schema is included.

      **Manual schema** in theme:
      \`\`\`php
      function add_organization_schema() {
        if (is_front_page()) {
          echo '<script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Your Company",
            "url": "' . home_url() . '"
          }
          </script>';
        }
      }
      add_action('wp_footer', 'add_organization_schema');
      \`\`\`

performance_tips:
  - "Use a quality managed WordPress host (WP Engine, Kinsta)"
  - "Enable object caching (Redis/Memcached)"
  - "Use a CDN (Cloudflare, Fastly)"
  - "Keep plugins under 20"
  - "Choose a lightweight theme (GeneratePress, Astra)"
  - "Disable unnecessary features (emojis, embeds)"

recommended_plugins:
  seo:
    - "Yoast SEO or Rank Math"
  performance:
    - "WP Super Cache or LiteSpeed Cache"
    - "ShortPixel or Smush (images)"
    - "Autoptimize (JS/CSS)"
  security:
    - "Wordfence or Sucuri"
`);

// src/audit/types.ts
var ISSUE_DEFINITIONS = {
  // ==================== CRAWLABILITY ====================
  ROBOTS_TXT_MISSING: {
    code: "ROBOTS_TXT_MISSING",
    severity: "warning",
    category: "crawlability",
    title: "Missing robots.txt",
    description: "No robots.txt file found at the root of the domain.",
    impact: "Search engines cannot determine crawling rules for your site.",
    howToFix: "Create a robots.txt file at the root of your domain with appropriate directives."
  },
  ROBOTS_TXT_BLOCKS_ALL: {
    code: "ROBOTS_TXT_BLOCKS_ALL",
    severity: "error",
    category: "crawlability",
    title: "robots.txt blocks all crawlers",
    description: 'The robots.txt file contains "Disallow: /" which blocks all search engines.',
    impact: "Your entire site will not be indexed by search engines.",
    howToFix: "Update robots.txt to allow crawling of important pages."
  },
  ROBOTS_TXT_SERVER_ERROR: {
    code: "ROBOTS_TXT_SERVER_ERROR",
    severity: "warning",
    category: "crawlability",
    title: "robots.txt returns a server error",
    description: "Requesting /robots.txt returned a 5xx (or 429) status instead of the file or a 404.",
    impact: 'Google treats a 5xx/429 robots.txt as "disallow everything" and stops crawling the whole site until it gets a real answer.',
    howToFix: "Serve robots.txt with a 200 (or return a 404 if you have none). Check the server/CDN route for /robots.txt."
  },
  SITEMAP_MISSING: {
    code: "SITEMAP_MISSING",
    severity: "warning",
    category: "crawlability",
    title: "Missing XML sitemap",
    description: "No sitemap.xml found at standard locations.",
    impact: "Search engines may not discover all your pages efficiently.",
    howToFix: "Create an XML sitemap and submit it to search engines."
  },
  SITEMAP_NOT_IN_ROBOTS: {
    code: "SITEMAP_NOT_IN_ROBOTS",
    severity: "notice",
    category: "crawlability",
    title: "Sitemap not referenced in robots.txt",
    description: "The sitemap URL is not listed in robots.txt.",
    impact: "Search engines may not find your sitemap automatically.",
    howToFix: 'Add "Sitemap: https://yoursite.com/sitemap.xml" to robots.txt.'
  },
  SITEMAP_LASTMOD_MISSING: {
    code: "SITEMAP_LASTMOD_MISSING",
    severity: "notice",
    category: "crawlability",
    title: "Sitemap missing lastmod dates",
    description: "No <lastmod> tags found on any URL entry in the sitemap.",
    impact: "Search engines rely on lastmod as a freshness signal to prioritize recrawling changed pages.",
    howToFix: "Add a <lastmod> tag (ISO 8601 date) to each <url> entry, reflecting when that page last actually changed."
  },
  SITEMAP_LASTMOD_INVALID: {
    code: "SITEMAP_LASTMOD_INVALID",
    severity: "warning",
    category: "crawlability",
    title: "Sitemap has invalid lastmod dates",
    description: "One or more <lastmod> values are not valid dates, or are set in the future.",
    impact: "Search engines may ignore lastmod entirely for this sitemap once they detect invalid values, losing the freshness signal for every URL in it.",
    howToFix: "Use a real, valid ISO 8601 date (e.g. 2026-01-15 or 2026-01-15T10:00:00Z) reflecting the actual last-changed time - never a placeholder or future date."
  },
  REDIRECT_CHAIN: {
    code: "REDIRECT_CHAIN",
    severity: "warning",
    category: "crawlability",
    title: "Redirect chain detected",
    description: "Multiple redirects before reaching the final destination.",
    impact: "Wastes crawl budget and reduces link equity passed to the final page.",
    howToFix: "Update redirects to point directly to the final destination URL."
  },
  REDIRECT_LOOP: {
    code: "REDIRECT_LOOP",
    severity: "error",
    category: "crawlability",
    title: "Redirect loop detected",
    description: "Redirects create an infinite loop.",
    impact: "Page is completely inaccessible to users and search engines.",
    howToFix: "Fix the redirect configuration to break the loop."
  },
  ORPHAN_PAGE: {
    code: "ORPHAN_PAGE",
    severity: "warning",
    category: "crawlability",
    title: "Orphan page (no internal links)",
    description: "This page has no internal links pointing to it.",
    impact: "Search engines may not discover this page, and it receives no link equity.",
    howToFix: "Add internal links from relevant pages to this page."
  },
  // ==================== INDEXABILITY ====================
  // Base severity for a noindexed page other than the audited root;
  // on-page.ts raises it to 'error' on the site root (a noindexed homepage
  // takes the whole site out of search).
  NOINDEX_TAG: {
    code: "NOINDEX_TAG",
    severity: "warning",
    category: "indexability",
    title: "Page has noindex meta tag",
    description: "The page contains a robots/googlebot meta tag with noindex (or none).",
    impact: "This page will not appear in search results.",
    howToFix: "Remove the noindex directive from the robots meta tag if you want this page indexed."
  },
  NOINDEX_HEADER: {
    code: "NOINDEX_HEADER",
    severity: "warning",
    category: "indexability",
    title: "Page sends X-Robots-Tag: noindex",
    description: "The HTTP response carries an X-Robots-Tag header with noindex (or none).",
    impact: "This page will not appear in search results, whatever the HTML says.",
    howToFix: "Remove noindex from the X-Robots-Tag header in your server, CDN or hosting config."
  },
  HTTP_ERROR_STATUS: {
    code: "HTTP_ERROR_STATUS",
    severity: "error",
    category: "indexability",
    title: "Page returns an HTTP error status",
    description: "The audited URL answered with a 4xx or 5xx status code.",
    impact: "Search engines drop pages that return 4xx, and stop crawling pages (and eventually sites) that keep returning 5xx.",
    howToFix: "Make the URL return 200. For a moved page use a 301 to its new address; for a server error check the application logs."
  },
  CANONICAL_MISSING: {
    code: "CANONICAL_MISSING",
    severity: "warning",
    category: "indexability",
    title: "Missing canonical tag",
    description: "No canonical URL specified for this page.",
    impact: "May cause duplicate content issues if the page is accessible via multiple URLs.",
    howToFix: "Add a self-referencing canonical tag or point to the preferred URL."
  },
  CANONICAL_POINTS_TO_REDIRECT: {
    code: "CANONICAL_POINTS_TO_REDIRECT",
    severity: "error",
    category: "indexability",
    title: "Canonical points to redirect",
    description: "The canonical URL redirects to a different page.",
    impact: "Confuses search engines and may cause indexing issues.",
    howToFix: "Update the canonical to point to the final destination URL."
  },
  CANONICAL_POINTS_TO_4XX: {
    code: "CANONICAL_POINTS_TO_4XX",
    severity: "error",
    category: "indexability",
    title: "Canonical points to 4XX page",
    description: "The canonical URL returns a 4XX error.",
    impact: "Search engines cannot index this page properly.",
    howToFix: "Update the canonical to point to a valid URL."
  },
  MULTIPLE_CANONICALS: {
    code: "MULTIPLE_CANONICALS",
    severity: "error",
    category: "indexability",
    title: "Multiple canonical tags",
    description: "Page has more than one canonical tag.",
    impact: "Search engines may ignore all canonical hints.",
    howToFix: "Remove duplicate canonical tags, keeping only one."
  },
  // ==================== ON-PAGE SEO ====================
  TITLE_MISSING: {
    code: "TITLE_MISSING",
    severity: "error",
    category: "on-page",
    title: "Missing title tag",
    description: "The page has no title tag.",
    impact: "Critical ranking factor missing. Page will have poor search visibility.",
    howToFix: "Add a descriptive title tag (50-60 characters)."
  },
  TITLE_TOO_SHORT: {
    code: "TITLE_TOO_SHORT",
    severity: "warning",
    category: "on-page",
    title: "Title tag too short",
    description: "Title tag is less than 30 characters.",
    impact: "Not utilizing the full space available in search results.",
    howToFix: "Expand the title to 50-60 characters with relevant keywords."
  },
  TITLE_TOO_LONG: {
    code: "TITLE_TOO_LONG",
    severity: "warning",
    category: "on-page",
    title: "Title tag too long",
    description: "Title tag exceeds 60 characters.",
    impact: "Title will be truncated in search results.",
    howToFix: "Shorten the title to under 60 characters."
  },
  TITLE_DUPLICATE: {
    code: "TITLE_DUPLICATE",
    severity: "warning",
    category: "on-page",
    title: "Duplicate title tag",
    description: "Multiple pages have the same title.",
    impact: "Can cause keyword cannibalization and confuse search engines.",
    howToFix: "Ensure each page has a unique, descriptive title."
  },
  META_DESC_MISSING: {
    code: "META_DESC_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing meta description",
    description: "No meta description tag found.",
    impact: "Search engines may use random page content as the snippet.",
    howToFix: "Add a compelling meta description (150-160 characters)."
  },
  META_DESC_TOO_SHORT: {
    code: "META_DESC_TOO_SHORT",
    severity: "notice",
    category: "on-page",
    title: "Meta description too short",
    description: "Meta description is less than 120 characters.",
    impact: "Not fully utilizing the snippet space in search results.",
    howToFix: "Expand to 150-160 characters with a compelling call-to-action."
  },
  META_DESC_TOO_LONG: {
    code: "META_DESC_TOO_LONG",
    severity: "notice",
    category: "on-page",
    title: "Meta description too long",
    description: "Meta description exceeds 160 characters.",
    impact: "Description may be truncated in search results.",
    howToFix: "Shorten to under 160 characters."
  },
  META_DESC_DUPLICATE: {
    code: "META_DESC_DUPLICATE",
    severity: "warning",
    category: "on-page",
    title: "Duplicate meta description",
    description: "Multiple pages have the same meta description.",
    impact: "Reduces the uniqueness of your pages in search results.",
    howToFix: "Write unique meta descriptions for each page."
  },
  H1_MISSING: {
    code: "H1_MISSING",
    severity: "error",
    category: "on-page",
    title: "Missing H1 heading",
    description: "No H1 tag found on the page.",
    impact: "Search engines use H1 to understand the main topic of the page.",
    howToFix: "Add exactly one H1 tag that describes the main content."
  },
  H1_MULTIPLE: {
    code: "H1_MULTIPLE",
    severity: "warning",
    category: "on-page",
    title: "Multiple H1 headings",
    description: "Page has more than one H1 tag.",
    impact: "Can dilute the topical focus of the page.",
    howToFix: "Use only one H1 per page. Use H2-H6 for subheadings."
  },
  H1_DUPLICATE_OF_TITLE: {
    code: "H1_DUPLICATE_OF_TITLE",
    severity: "notice",
    category: "on-page",
    title: "H1 identical to title tag",
    description: "The H1 heading is exactly the same as the title tag.",
    impact: "Missed opportunity to target additional keywords.",
    howToFix: "Consider varying the H1 to cover related keywords."
  },
  HEADING_SKIP: {
    code: "HEADING_SKIP",
    severity: "notice",
    category: "on-page",
    title: "Skipped heading level",
    description: "Heading hierarchy skips levels (e.g., H1 to H3).",
    impact: "May confuse screen readers and reduce content structure clarity.",
    howToFix: "Maintain proper heading hierarchy (H1 > H2 > H3, etc.)."
  },
  H2_MISSING: {
    code: "H2_MISSING",
    severity: "warning",
    category: "on-page",
    title: "No H2 headings found",
    description: "No H2 tags were found on the page.",
    impact: "H2 headings help structure content and are important for SEO and readability.",
    howToFix: "Break your content into sections using H2 headings with relevant keywords."
  },
  // ==================== CONTENT ====================
  THIN_CONTENT: {
    code: "THIN_CONTENT",
    severity: "warning",
    category: "content",
    title: "Thin content",
    description: "Page has less than 300 words of text content.",
    impact: "May be seen as low-quality by search engines.",
    howToFix: "Add more valuable, relevant content to the page."
  },
  DUPLICATE_CONTENT: {
    code: "DUPLICATE_CONTENT",
    severity: "warning",
    category: "content",
    title: "Duplicate content detected",
    description: "Significant content overlap with other pages.",
    impact: "Search engines may filter out duplicate pages from results.",
    howToFix: "Use canonical tags or differentiate the content."
  },
  LOW_TEXT_HTML_RATIO: {
    code: "LOW_TEXT_HTML_RATIO",
    severity: "notice",
    category: "content",
    title: "Low text-to-HTML ratio",
    description: "Text content is less than 10% of total HTML.",
    impact: "May indicate poor content or bloated HTML.",
    howToFix: "Add more text content or reduce unnecessary HTML/scripts."
  },
  // ==================== LINKS ====================
  BROKEN_INTERNAL_LINK: {
    code: "BROKEN_INTERNAL_LINK",
    severity: "error",
    category: "links",
    title: "Broken internal link",
    description: "Internal link points to a page that returns 4XX error.",
    impact: "Poor user experience and wasted crawl budget.",
    howToFix: "Fix the broken link or remove it."
  },
  BROKEN_EXTERNAL_LINK: {
    code: "BROKEN_EXTERNAL_LINK",
    severity: "warning",
    category: "links",
    title: "Broken external link",
    description: "External link points to a page that returns 4XX error.",
    impact: "Poor user experience and potential trust issues.",
    howToFix: "Update or remove the broken external link."
  },
  JS_ONLY_NAVIGATION: {
    code: "JS_ONLY_NAVIGATION",
    severity: "warning",
    category: "links",
    title: "JavaScript-only navigation detected",
    description: "Navigation elements use onClick handlers without proper <a href> links.",
    impact: "Search engine crawlers cannot follow JavaScript-only navigation. These links are invisible to crawlers, preventing page discovery and indexing.",
    howToFix: "Replace onClick navigation with proper <a href> or <Link> components. In React, use react-router Link instead of navigate() in onClick handlers. Ensure all navigation renders as real anchor tags with href attributes."
  },
  TOO_MANY_LINKS: {
    code: "TOO_MANY_LINKS",
    severity: "notice",
    category: "links",
    title: "Too many on-page links",
    description: "Page has more than 100 links.",
    impact: "Dilutes PageRank passed to each linked page.",
    howToFix: "Reduce the number of links to the most important ones."
  },
  NOFOLLOW_INTERNAL: {
    code: "NOFOLLOW_INTERNAL",
    severity: "notice",
    category: "links",
    title: "Nofollow on internal link",
    description: 'Internal link has rel="nofollow" attribute.',
    impact: "Prevents PageRank from flowing to important pages.",
    howToFix: "Remove nofollow from internal links unless intentional."
  },
  // ==================== IMAGES ====================
  IMG_ALT_MISSING: {
    code: "IMG_ALT_MISSING",
    severity: "warning",
    category: "images",
    title: "Image missing alt text",
    description: "Image has no alt attribute.",
    impact: "Poor accessibility and missed SEO opportunity.",
    howToFix: "Add descriptive alt text to all images."
  },
  IMG_ALT_EMPTY: {
    code: "IMG_ALT_EMPTY",
    severity: "notice",
    category: "images",
    title: "Image has empty alt text",
    description: 'Image has alt="" (empty alt attribute).',
    impact: "Acceptable for decorative images but not for content images.",
    howToFix: "Add descriptive alt text if the image conveys information."
  },
  IMG_NO_DIMENSIONS: {
    code: "IMG_NO_DIMENSIONS",
    severity: "notice",
    category: "images",
    title: "Image missing dimensions",
    description: "Image lacks width and height attributes.",
    impact: "Causes layout shift (CLS) when image loads.",
    howToFix: "Add width and height attributes to all images."
  },
  IMG_TOO_LARGE: {
    code: "IMG_TOO_LARGE",
    severity: "warning",
    category: "images",
    title: "Image file too large",
    description: "Image file size exceeds 200KB.",
    impact: "Slows down page load time.",
    howToFix: "Compress and optimize images. Consider WebP format."
  },
  IMG_BROKEN: {
    code: "IMG_BROKEN",
    severity: "error",
    category: "images",
    title: "Broken image",
    description: "Image URL returns 4XX error.",
    impact: "Poor user experience with missing images.",
    howToFix: "Fix the image URL or replace with a working image."
  },
  // ==================== STRUCTURED DATA ====================
  SCHEMA_MISSING: {
    code: "SCHEMA_MISSING",
    severity: "warning",
    category: "structured-data",
    title: "No structured data found",
    description: "Page has no JSON-LD or microdata.",
    impact: "Missing opportunity for rich snippets in search results.",
    howToFix: "Add appropriate Schema.org markup for your content type."
  },
  SCHEMA_INVALID: {
    code: "SCHEMA_INVALID",
    severity: "error",
    category: "structured-data",
    title: "Invalid structured data",
    description: "JSON-LD contains syntax errors.",
    impact: "Search engines cannot parse the structured data.",
    howToFix: "Fix JSON syntax errors and validate with Google Rich Results Test."
  },
  SCHEMA_MISSING_REQUIRED: {
    code: "SCHEMA_MISSING_REQUIRED",
    severity: "warning",
    category: "structured-data",
    title: "Missing required schema properties",
    description: "Schema markup is missing required properties.",
    impact: "May not qualify for rich snippets.",
    howToFix: "Add all required properties for the schema type."
  },
  // ==================== PERFORMANCE ====================
  SLOW_PAGE: {
    code: "SLOW_PAGE",
    severity: "warning",
    category: "performance",
    title: "Slow page load time",
    description: "Page takes more than 3 seconds to load.",
    impact: "High bounce rates and potential ranking penalty.",
    howToFix: "Optimize images, enable caching, minimize CSS/JS."
  },
  SLOW_TTFB: {
    code: "SLOW_TTFB",
    severity: "warning",
    category: "performance",
    title: "Slow Time to First Byte (TTFB)",
    description: "Server response time exceeds 600ms.",
    impact: "Delays entire page load and affects Core Web Vitals.",
    howToFix: "Optimize server configuration, use caching, consider CDN."
  },
  LCP_POOR: {
    code: "LCP_POOR",
    severity: "error",
    category: "performance",
    title: "Poor Largest Contentful Paint (LCP)",
    description: "LCP exceeds 2.5 seconds.",
    impact: "Direct Core Web Vitals ranking factor.",
    howToFix: "Optimize hero images, preload critical resources."
  },
  CLS_POOR: {
    code: "CLS_POOR",
    severity: "error",
    category: "performance",
    title: "Poor Cumulative Layout Shift (CLS)",
    description: "CLS exceeds 0.1.",
    impact: "Direct Core Web Vitals ranking factor.",
    howToFix: "Set image dimensions, avoid inserting content above existing content."
  },
  HTML_TOO_LARGE: {
    code: "HTML_TOO_LARGE",
    severity: "warning",
    category: "performance",
    title: "HTML document too large",
    description: "HTML size exceeds 100KB.",
    impact: "Increases load time and memory usage.",
    howToFix: "Reduce inline CSS/JS, remove unnecessary HTML."
  },
  UNCOMPRESSED: {
    code: "UNCOMPRESSED",
    severity: "warning",
    category: "performance",
    title: "Uncompressed resources",
    description: "Page is not served with gzip/brotli compression.",
    impact: "Larger file transfer sizes slow down the page.",
    howToFix: "Enable gzip or brotli compression on your server."
  },
  NO_CACHE: {
    code: "NO_CACHE",
    severity: "notice",
    category: "performance",
    title: "Missing cache headers",
    description: "Page lacks Cache-Control or Expires headers.",
    impact: "Browser cannot cache resources, causing repeated downloads.",
    howToFix: "Add appropriate cache headers for static resources."
  },
  // ==================== SECURITY ====================
  NOT_HTTPS: {
    code: "NOT_HTTPS",
    severity: "error",
    category: "security",
    title: "Page not served over HTTPS",
    description: "Page is accessible via HTTP instead of HTTPS.",
    impact: "Browser warnings, user distrust, and ranking penalty.",
    howToFix: "Install SSL certificate and redirect HTTP to HTTPS."
  },
  MIXED_CONTENT: {
    code: "MIXED_CONTENT",
    severity: "error",
    category: "security",
    title: "Mixed content",
    description: "HTTPS page loads resources over HTTP.",
    impact: "Browser may block resources or show security warnings.",
    howToFix: "Update all resource URLs to use HTTPS."
  },
  CERT_EXPIRING: {
    code: "CERT_EXPIRING",
    severity: "warning",
    category: "security",
    title: "SSL certificate expiring soon",
    description: "SSL certificate expires within 30 days.",
    impact: "Site will become insecure when certificate expires.",
    howToFix: "Renew your SSL certificate before expiration."
  },
  HSTS_MISSING: {
    code: "HSTS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing HSTS header",
    description: "Strict-Transport-Security header not set.",
    impact: "Users may be vulnerable to downgrade attacks.",
    howToFix: "Add HSTS header to enforce HTTPS."
  },
  // ==================== MOBILE ====================
  VIEWPORT_MISSING: {
    code: "VIEWPORT_MISSING",
    severity: "error",
    category: "mobile",
    title: "Missing viewport meta tag",
    description: "No viewport meta tag found.",
    impact: "Page will not render properly on mobile devices.",
    howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
  },
  VIEWPORT_NOT_RESPONSIVE: {
    code: "VIEWPORT_NOT_RESPONSIVE",
    severity: "warning",
    category: "mobile",
    title: "Non-responsive viewport",
    description: "Viewport uses fixed width instead of device-width.",
    impact: "Page may not adapt to different screen sizes.",
    howToFix: "Use width=device-width in viewport meta tag."
  },
  TAP_TARGETS_TOO_SMALL: {
    code: "TAP_TARGETS_TOO_SMALL",
    severity: "warning",
    category: "mobile",
    title: "Tap targets too small",
    description: "Clickable elements are smaller than 48x48 pixels.",
    impact: "Difficult for mobile users to tap links/buttons.",
    howToFix: "Increase the size of tap targets to at least 48x48 pixels."
  },
  // ==================== INTERNATIONAL ====================
  HREFLANG_MISSING: {
    code: "HREFLANG_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing hreflang tags",
    description: "Multi-language site without hreflang annotations.",
    impact: "Search engines may show wrong language version to users.",
    howToFix: "Add hreflang tags to specify language/region versions."
  },
  HREFLANG_INVALID: {
    code: "HREFLANG_INVALID",
    severity: "warning",
    category: "international",
    title: "Invalid hreflang value",
    description: "Hreflang contains invalid language or region code.",
    impact: "Search engines will ignore the hreflang directive.",
    howToFix: "Use valid ISO 639-1 language and ISO 3166-1 Alpha-2 region codes."
  },
  HREFLANG_NO_RETURN: {
    code: "HREFLANG_NO_RETURN",
    severity: "warning",
    category: "international",
    title: "Missing hreflang return link",
    description: "Hreflang page does not link back to this page.",
    impact: "Hreflang signals may be ignored by search engines.",
    howToFix: "Ensure all hreflang pages have reciprocal links."
  },
  HREFLANG_SELF_MISSING: {
    code: "HREFLANG_SELF_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing self-referencing hreflang",
    description: "Page does not include hreflang pointing to itself.",
    impact: "Best practice to include self-referencing hreflang.",
    howToFix: "Add hreflang for the current page language/region."
  },
  HREFLANG_X_DEFAULT_MISSING: {
    code: "HREFLANG_X_DEFAULT_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing x-default hreflang",
    description: "Multi-language page missing x-default fallback.",
    impact: "Users with unsupported language may not see appropriate version.",
    howToFix: 'Add hreflang="x-default" pointing to your default language page.'
  },
  HREFLANG_TO_NON_200: {
    code: "HREFLANG_TO_NON_200",
    severity: "error",
    category: "international",
    title: "Hreflang points to non-200 page",
    description: "Hreflang URL returns error or redirect.",
    impact: "Search engines cannot serve the alternate language version.",
    howToFix: "Update hreflang to point to valid, accessible URLs."
  },
  // ==================== SOFT 404 ====================
  SOFT_404: {
    code: "SOFT_404",
    severity: "error",
    category: "content",
    title: "Soft 404 detected",
    description: "Page returns 200 but appears to be an error page.",
    impact: "Wastes crawl budget and may index low-value error pages.",
    howToFix: "Return proper 404 status for error pages or add meaningful content."
  },
  // ==================== OPEN GRAPH / SOCIAL ====================
  OG_TITLE_MISSING: {
    code: "OG_TITLE_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph title",
    description: "No og:title meta tag found.",
    impact: "Social shares may display incorrect or missing title.",
    howToFix: 'Add <meta property="og:title" content="Your Title">'
  },
  OG_DESCRIPTION_MISSING: {
    code: "OG_DESCRIPTION_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph description",
    description: "No og:description meta tag found.",
    impact: "Social shares may display incorrect or missing description.",
    howToFix: 'Add <meta property="og:description" content="Your description">'
  },
  OG_IMAGE_MISSING: {
    code: "OG_IMAGE_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph image",
    description: "No og:image meta tag found.",
    impact: "Social shares will not display a preview image.",
    howToFix: 'Add <meta property="og:image" content="https://yoursite.com/image.jpg">'
  },
  OG_IMAGE_TOO_SMALL: {
    code: "OG_IMAGE_TOO_SMALL",
    severity: "notice",
    category: "on-page",
    title: "Open Graph image too small",
    description: "OG image should be at least 1200x630 pixels.",
    impact: "Image may appear low quality on social platforms.",
    howToFix: "Use an image at least 1200x630 pixels for optimal display."
  },
  OG_URL_MISSING: {
    code: "OG_URL_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Open Graph URL",
    description: "No og:url meta tag found.",
    impact: "Social platforms may use inconsistent URL for shares.",
    howToFix: 'Add <meta property="og:url" content="https://yoursite.com/page">'
  },
  OG_TYPE_MISSING: {
    code: "OG_TYPE_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Open Graph type",
    description: "No og:type meta tag found.",
    impact: 'Social platforms default to "website" type.',
    howToFix: 'Add <meta property="og:type" content="website"> (or article, product, etc.)'
  },
  TWITTER_CARD_MISSING: {
    code: "TWITTER_CARD_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Twitter Card tags",
    description: "No twitter:card meta tag found.",
    impact: "Twitter shares may not display optimally.",
    howToFix: 'Add <meta name="twitter:card" content="summary_large_image">'
  },
  TWITTER_IMAGE_MISSING: {
    code: "TWITTER_IMAGE_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Twitter Card image",
    description: "No twitter:image meta tag found.",
    impact: "Twitter shares will not display a preview image.",
    howToFix: 'Add <meta name="twitter:image" content="https://yoursite.com/image.jpg">'
  },
  // ==================== CANONICAL ADVANCED ====================
  CANONICAL_CHAIN: {
    code: "CANONICAL_CHAIN",
    severity: "warning",
    category: "indexability",
    title: "Canonical chain detected",
    description: "Canonical URL points to a page with a different canonical.",
    impact: "Creates confusion for search engines about the preferred URL.",
    howToFix: "Update canonical to point directly to the final preferred URL."
  },
  CANONICAL_CROSS_DOMAIN: {
    code: "CANONICAL_CROSS_DOMAIN",
    severity: "warning",
    category: "indexability",
    title: "Cross-domain canonical",
    description: "Canonical points to a different domain.",
    impact: "Transfers ranking signals to another domain. Ensure this is intentional.",
    howToFix: "Verify cross-domain canonical is intentional or update to same domain."
  },
  CANONICAL_MISMATCH_SITEMAP: {
    code: "CANONICAL_MISMATCH_SITEMAP",
    severity: "warning",
    category: "indexability",
    title: "Canonical URL not in sitemap",
    description: "The canonical URL differs from the sitemap URL.",
    impact: "Conflicting signals about which URL should be indexed.",
    howToFix: "Ensure sitemap contains only canonical URLs."
  },
  // ==================== ANCHOR TEXT ====================
  ANCHOR_TEXT_GENERIC: {
    code: "ANCHOR_TEXT_GENERIC",
    severity: "notice",
    category: "links",
    title: "Generic anchor text detected",
    description: 'Many internal links use generic text like "click here" or "read more".',
    impact: "Misses opportunity to provide context to search engines.",
    howToFix: "Use descriptive anchor text that indicates the target page content."
  },
  ANCHOR_TEXT_OVER_OPTIMIZED: {
    code: "ANCHOR_TEXT_OVER_OPTIMIZED",
    severity: "warning",
    category: "links",
    title: "Over-optimized anchor text",
    description: "Excessive exact-match keyword anchor text detected.",
    impact: "May trigger spam filters and algorithmic penalties.",
    howToFix: "Diversify anchor text with natural variations."
  },
  ANCHOR_TEXT_EMPTY: {
    code: "ANCHOR_TEXT_EMPTY",
    severity: "warning",
    category: "links",
    title: "Empty anchor text",
    description: "Link has no text content (empty anchor).",
    impact: "Provides no context for users or search engines.",
    howToFix: "Add descriptive text to the link or use aria-label for icon links."
  },
  // ==================== PAGINATION ====================
  PAGINATION_NO_LINKS: {
    code: "PAGINATION_NO_LINKS",
    severity: "warning",
    category: "crawlability",
    title: "Pagination without HTML links",
    description: "Paginated content uses JavaScript without HTML fallback links.",
    impact: "Search engines cannot discover paginated content.",
    howToFix: "Add <a href> links for pagination alongside JavaScript."
  },
  PAGINATION_CANONICAL_ISSUE: {
    code: "PAGINATION_CANONICAL_ISSUE",
    severity: "error",
    category: "indexability",
    title: "Pagination canonical points to page 1",
    description: "Paginated pages have canonical pointing to page 1.",
    impact: "Paginated content may not be indexed properly.",
    howToFix: "Each paginated page should self-reference or use View All canonical."
  },
  INFINITE_SCROLL_NO_FALLBACK: {
    code: "INFINITE_SCROLL_NO_FALLBACK",
    severity: "warning",
    category: "crawlability",
    title: "Infinite scroll without fallback",
    description: "Infinite scroll detected without pagination links.",
    impact: "Search engines cannot access content loaded via infinite scroll.",
    howToFix: "Implement replaceState/pushState and provide pagination links."
  },
  // ==================== DUPLICATE/CANNIBALIZATION ====================
  NEAR_DUPLICATE: {
    code: "NEAR_DUPLICATE",
    severity: "warning",
    category: "content",
    title: "Near-duplicate content",
    description: "Page has 90%+ content similarity with another page.",
    impact: "May cause keyword cannibalization and dilute ranking signals.",
    howToFix: "Consolidate pages, differentiate content, or use canonical tags."
  },
  KEYWORD_CANNIBALIZATION: {
    code: "KEYWORD_CANNIBALIZATION",
    severity: "warning",
    category: "content",
    title: "Potential keyword cannibalization",
    description: "Multiple pages target the same primary keyword.",
    impact: "Pages compete against each other in search results.",
    howToFix: "Consolidate pages or differentiate keyword targeting."
  },
  // ==================== LINK ANALYSIS ADVANCED ====================
  LINK_DEPTH_TOO_DEEP: {
    code: "LINK_DEPTH_TOO_DEEP",
    severity: "warning",
    category: "links",
    title: "Page too deep in site structure",
    description: "Page requires more than 3 clicks from homepage.",
    impact: "Deep pages receive less link equity and may be crawled less frequently.",
    howToFix: "Improve internal linking to reduce click depth."
  },
  INTERNAL_REDIRECT: {
    code: "INTERNAL_REDIRECT",
    severity: "notice",
    category: "links",
    title: "Internal link to redirect",
    description: "Internal link points to a URL that redirects.",
    impact: "Wastes crawl budget and dilutes link equity.",
    howToFix: "Update internal links to point directly to final URLs."
  },
  // ==================== JAVASCRIPT SEO ====================
  JS_RENDERED_CONTENT: {
    code: "JS_RENDERED_CONTENT",
    severity: "notice",
    category: "content",
    title: "JavaScript-rendered content detected",
    description: "Significant content only visible after JavaScript execution.",
    impact: "Search engines may not see all content or delay indexing.",
    howToFix: "Consider server-side rendering or prerendering for critical content."
  },
  JS_LINKS_ONLY: {
    code: "JS_LINKS_ONLY",
    severity: "warning",
    category: "links",
    title: "Links only in JavaScript",
    description: "Internal links exist only in rendered DOM, not in source HTML.",
    impact: "Search engines may not discover these links.",
    howToFix: "Ensure important links are in static HTML or use server-side rendering."
  },
  // ==================== FAVICON & MISC ====================
  FAVICON_MISSING: {
    code: "FAVICON_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing favicon",
    description: 'No favicon.ico or link rel="icon" found.',
    impact: "Browser tabs show generic icon; poor brand presence.",
    howToFix: 'Add a favicon.ico or link rel="icon" to your pages.'
  },
  LANG_ATTR_MISSING: {
    code: "LANG_ATTR_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing lang attribute",
    description: "HTML tag lacks lang attribute.",
    impact: "Accessibility issue; browsers/screen readers may use wrong language.",
    howToFix: 'Add lang attribute to HTML tag (e.g., <html lang="en">).'
  },
  // ==================== AI/LLM READINESS ====================
  LLMS_TXT_MISSING: {
    code: "LLMS_TXT_MISSING",
    severity: "notice",
    category: "ai-readiness",
    title: "Missing llms.txt file",
    description: "No llms.txt file found at the root of the domain.",
    impact: "AI crawlers like ChatGPT and Claude may not understand how to best use your content.",
    howToFix: "Create an llms.txt file at your domain root with guidance for AI systems. See llmstxt.org for format."
  },
  LLMS_TXT_INVALID: {
    code: "LLMS_TXT_INVALID",
    severity: "warning",
    category: "ai-readiness",
    title: "Invalid llms.txt format",
    description: "The llms.txt file exists but has invalid format or syntax.",
    impact: "AI crawlers may not be able to parse your AI guidance properly.",
    howToFix: "Validate your llms.txt file format against the specification at llmstxt.org."
  },
  AI_BOT_BLOCKED_ALL: {
    code: "AI_BOT_BLOCKED_ALL",
    severity: "notice",
    category: "ai-readiness",
    title: "All AI bots blocked in robots.txt",
    description: "robots.txt blocks all major AI crawlers (GPTBot, Claude-Web, PerplexityBot, etc.).",
    impact: "Your content will not appear in AI-powered search and assistants.",
    howToFix: "Consider allowing some AI bots if you want visibility in AI-generated responses."
  },
  AI_BOT_GPTBOT_BLOCKED: {
    code: "AI_BOT_GPTBOT_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "GPTBot blocked in robots.txt",
    description: "robots.txt blocks OpenAI's GPTBot crawler.",
    impact: "Your content will not be used to train or cited by ChatGPT.",
    howToFix: 'Remove "User-agent: GPTBot Disallow: /" if you want ChatGPT visibility.'
  },
  AI_BOT_CLAUDEBOT_BLOCKED: {
    code: "AI_BOT_CLAUDEBOT_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "ClaudeBot blocked in robots.txt",
    description: "robots.txt blocks Anthropic's ClaudeBot crawler.",
    impact: "Your content will not be used by Claude AI.",
    howToFix: 'Remove "User-agent: ClaudeBot Disallow: /" if you want Claude visibility.'
  },
  AI_BOT_PERPLEXITY_BLOCKED: {
    code: "AI_BOT_PERPLEXITY_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "PerplexityBot blocked in robots.txt",
    description: "robots.txt blocks Perplexity AI's crawler.",
    impact: "Your content will not appear in Perplexity AI search results.",
    howToFix: 'Remove "User-agent: PerplexityBot Disallow: /" if you want Perplexity visibility.'
  },
  AI_BOT_GOOGLE_EXTENDED_BLOCKED: {
    code: "AI_BOT_GOOGLE_EXTENDED_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "Google-Extended blocked in robots.txt",
    description: "robots.txt blocks Google's AI training crawler (Google-Extended).",
    impact: "Your content will not be used for Bard/Gemini AI training (regular search unaffected).",
    howToFix: 'Remove "User-agent: Google-Extended Disallow: /" if you want Google AI visibility.'
  },
  CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS: {
    code: "CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS",
    severity: "warning",
    category: "ai-readiness",
    title: "No explicit AI crawler rules on a Cloudflare-fronted site",
    description: 'This site appears to be served through Cloudflare but robots.txt has no explicit Allow/Disallow rules for AI crawlers. Cloudflare blocks "mixed-use" AI crawlers by default on ad-hosting zones starting September 15, 2026, and is rolling out Pay Per Crawl / Pay Per Use gating beyond that.',
    impact: "Without an explicit rule, whether AI crawlers (and future citation opportunities in ChatGPT, Claude, Perplexity, etc.) can reach this site now depends on Cloudflare account-level bot-management defaults, not on this codebase \u2014 a silent, invisible-to-git failure mode.",
    howToFix: `Two ways to make your stance explicit, either works: (1) add a Content-Signal line to robots.txt - e.g. "Content-Signal: search=yes,ai-train=no,use=reference" - the format Cloudflare's AI Crawl Control update actually reads, or (2) add explicit User-agent rules for GPTBot, Claude-Web/ClaudeBot, PerplexityBot, and Google-Extended. Either way, confirm the matching allow/block posture in the Cloudflare dashboard under Bot Management \u2192 AI Crawl Control. If you'd rather charge than block, Cloudflare's Pay Per Crawl (AI Crawl Control \u2192 Payments tab) lets you set a per-crawl price instead of a flat allow/deny \u2014 worth a look if you get meaningful AI-crawler traffic.`
  },
  NO_AGENT_EXPERIENCE_SURFACE: {
    code: "NO_AGENT_EXPERIENCE_SURFACE",
    severity: "notice",
    category: "ai-readiness",
    title: "No agent-facing discovery surface found",
    description: "None of the emerging AI-agent discovery conventions were found: llms-full.txt, SKILL.md, a discoverable MCP server, or an OpenAPI spec. This is a genuinely new, low-adoption category as of 2026 \u2014 most sites have none of these yet \u2014 so this is an opportunity, not a compliance failure.",
    impact: "AI agents (not just chatbots answering questions, but agents that browse and act on a user's behalf) increasingly prefer sites that expose machine-readable capabilities over ones that require scraping and guessing at HTML structure. Being an early, discoverable site in this space is a low-competition differentiator right now.",
    howToFix: "Start with whichever fits your site: llms-full.txt (a single Markdown dump of your key content \u2014 measured as fetched roughly 2x more than plain llms.txt), a SKILL.md capability manifest, or an OpenAPI spec at /openapi.json if you already have an API. A discoverable MCP server is the highest-effort, highest-payoff option if your product has one to expose."
  },
  HIGH_JS_RENDERING_RATIO: {
    code: "HIGH_JS_RENDERING_RATIO",
    severity: "warning",
    category: "ai-readiness",
    title: "High JavaScript rendering required",
    description: "More than 50% of page content requires JavaScript to render.",
    impact: "AI crawlers may not see all content; they often use static HTML only.",
    howToFix: "Implement server-side rendering or prerendering for critical content."
  },
  // ==================== PIXEL-BASED META CHECKS ====================
  TITLE_TRUNCATED_SERP: {
    code: "TITLE_TRUNCATED_SERP",
    severity: "warning",
    category: "on-page",
    title: "Title will be truncated in SERP",
    description: "Title exceeds 580 pixels and will be cut off in Google search results.",
    impact: "Important information at the end of your title will not be visible.",
    howToFix: "Shorten title to fit within 580 pixel width (approximately 50-60 characters)."
  },
  META_DESC_TRUNCATED_SERP: {
    code: "META_DESC_TRUNCATED_SERP",
    severity: "notice",
    category: "on-page",
    title: "Meta description will be truncated in SERP",
    description: "Meta description exceeds 920 pixels on desktop.",
    impact: "Your description may be cut off in search results.",
    howToFix: "Shorten description to fit within 920 pixels (approximately 150-160 characters)."
  },
  // ==================== SOCIAL META TAGS (Enhanced) ====================
  TWITTER_TITLE_MISSING: {
    code: "TWITTER_TITLE_MISSING",
    severity: "notice",
    category: "social",
    title: "Missing Twitter Card title",
    description: "No twitter:title meta tag found.",
    impact: "Twitter/X shares will use og:title or page title as fallback.",
    howToFix: 'Add <meta name="twitter:title" content="Your Title">'
  },
  TWITTER_DESCRIPTION_MISSING: {
    code: "TWITTER_DESCRIPTION_MISSING",
    severity: "notice",
    category: "social",
    title: "Missing Twitter Card description",
    description: "No twitter:description meta tag found.",
    impact: "Twitter/X shares will use og:description or meta description as fallback.",
    howToFix: 'Add <meta name="twitter:description" content="Your description">'
  },
  OG_IMAGE_WRONG_DIMENSIONS: {
    code: "OG_IMAGE_WRONG_DIMENSIONS",
    severity: "notice",
    category: "social",
    title: "Open Graph image wrong aspect ratio",
    description: "OG image is not the recommended 1.91:1 aspect ratio (1200x630).",
    impact: "Image may be cropped awkwardly on social platforms.",
    howToFix: "Use an image with 1200x630 pixels (1.91:1 aspect ratio)."
  },
  OG_IMAGE_TOO_LARGE: {
    code: "OG_IMAGE_TOO_LARGE",
    severity: "warning",
    category: "social",
    title: "Open Graph image file too large",
    description: "OG image exceeds 5MB file size limit.",
    impact: "Social platforms may not display the image.",
    howToFix: "Compress the image to under 5MB while maintaining quality."
  },
  SOCIAL_PROFILES_NOT_LINKED: {
    code: "SOCIAL_PROFILES_NOT_LINKED",
    severity: "notice",
    category: "social",
    title: "No social profile links found",
    description: "Page has no links to social media profiles.",
    impact: "Missed opportunity for social proof and brand presence.",
    howToFix: "Add links to your social media profiles (Facebook, Twitter, LinkedIn, etc.)."
  },
  // ==================== LOCAL SEO ====================
  LOCAL_BUSINESS_SCHEMA_MISSING: {
    code: "LOCAL_BUSINESS_SCHEMA_MISSING",
    severity: "notice",
    category: "local-seo",
    title: "Missing LocalBusiness schema",
    description: "No LocalBusiness structured data found.",
    impact: "Local business information won't appear in Google's local knowledge panel.",
    howToFix: "Add LocalBusiness schema with name, address, phone, and hours."
  },
  ORGANIZATION_SCHEMA_MISSING: {
    code: "ORGANIZATION_SCHEMA_MISSING",
    severity: "notice",
    category: "local-seo",
    title: "Missing Organization schema",
    description: "No Organization or Person structured data found.",
    impact: "Search engines may not understand your brand identity.",
    howToFix: "Add Organization schema with logo, contact info, and social profiles."
  },
  NAP_INCONSISTENT: {
    code: "NAP_INCONSISTENT",
    severity: "warning",
    category: "local-seo",
    title: "Inconsistent NAP information",
    description: "Name, Address, Phone detected in multiple formats on page.",
    impact: "Inconsistent business info can hurt local search rankings.",
    howToFix: "Use consistent NAP format across all pages and match your Google Business Profile."
  },
  ADDRESS_NOT_DETECTED: {
    code: "ADDRESS_NOT_DETECTED",
    severity: "notice",
    category: "local-seo",
    title: "No business address detected",
    description: "Could not find a physical address on this page.",
    impact: "Local businesses should display their address for local SEO.",
    howToFix: "Add your business address in a visible location and in LocalBusiness schema."
  },
  PHONE_NOT_DETECTED: {
    code: "PHONE_NOT_DETECTED",
    severity: "notice",
    category: "local-seo",
    title: "No phone number detected",
    description: "Could not find a phone number on this page.",
    impact: "Contact information helps with local SEO and user trust.",
    howToFix: "Add your phone number in visible location and in LocalBusiness schema."
  },
  // ==================== SECURITY HEADERS ====================
  CSP_MISSING: {
    code: "CSP_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Content-Security-Policy header",
    description: "No Content-Security-Policy (CSP) header found.",
    impact: "Site is more vulnerable to XSS and code injection attacks.",
    howToFix: "Add a Content-Security-Policy header to control which resources can be loaded."
  },
  X_FRAME_OPTIONS_MISSING: {
    code: "X_FRAME_OPTIONS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing X-Frame-Options header",
    description: "No X-Frame-Options header found.",
    impact: "Site may be vulnerable to clickjacking attacks.",
    howToFix: "Add X-Frame-Options: DENY or SAMEORIGIN header."
  },
  X_CONTENT_TYPE_OPTIONS_MISSING: {
    code: "X_CONTENT_TYPE_OPTIONS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing X-Content-Type-Options header",
    description: "No X-Content-Type-Options header found.",
    impact: "Browser may MIME-sniff content types, potentially executing malicious files.",
    howToFix: "Add X-Content-Type-Options: nosniff header."
  },
  REFERRER_POLICY_MISSING: {
    code: "REFERRER_POLICY_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Referrer-Policy header",
    description: "No Referrer-Policy header found.",
    impact: "Browser may leak referrer information to third-party sites.",
    howToFix: "Add Referrer-Policy: strict-origin-when-cross-origin header."
  },
  PERMISSIONS_POLICY_MISSING: {
    code: "PERMISSIONS_POLICY_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Permissions-Policy header",
    description: "No Permissions-Policy (formerly Feature-Policy) header found.",
    impact: "Cannot control which browser features your site can use.",
    howToFix: "Add Permissions-Policy header to control camera, microphone, geolocation, etc."
  },
  // ==================== CONTENT FRESHNESS ====================
  CONTENT_STALE: {
    code: "CONTENT_STALE",
    severity: "notice",
    category: "content",
    title: "Content appears stale",
    description: "Last-Modified header shows content over 1 year old.",
    impact: "Search engines may prioritize fresher content in results.",
    howToFix: "Update content regularly and ensure Last-Modified header is accurate."
  },
  NO_LAST_MODIFIED: {
    code: "NO_LAST_MODIFIED",
    severity: "notice",
    category: "content",
    title: "No Last-Modified header",
    description: "Server does not send Last-Modified header.",
    impact: "Browsers and CDNs cannot efficiently cache content.",
    howToFix: "Configure your server to send Last-Modified headers."
  },
  OG_UPDATED_TIME_MISSING: {
    code: "OG_UPDATED_TIME_MISSING",
    severity: "notice",
    category: "content",
    title: "Missing article:modified_time",
    description: "No article:modified_time Open Graph tag found.",
    impact: "Social platforms may not show content update dates.",
    howToFix: 'Add <meta property="article:modified_time" content="2024-01-01T12:00:00Z">'
  },
  // ==================== PERFORMANCE (Enhanced) ====================
  RENDER_BLOCKING_RESOURCES: {
    code: "RENDER_BLOCKING_RESOURCES",
    severity: "warning",
    category: "performance",
    title: "Render-blocking resources detected",
    description: "CSS or JavaScript files block initial page render.",
    impact: "Delays First Contentful Paint and user perception of speed.",
    howToFix: "Inline critical CSS, defer non-critical JS, or use async/defer attributes."
  },
  DOM_SIZE_EXCESSIVE: {
    code: "DOM_SIZE_EXCESSIVE",
    severity: "warning",
    category: "performance",
    title: "Excessive DOM size",
    description: "Page has more than 1500 DOM nodes.",
    impact: "Large DOM increases memory usage and slows style calculations.",
    howToFix: "Simplify page structure, lazy-load content, or paginate long lists."
  },
  DOM_DEPTH_EXCESSIVE: {
    code: "DOM_DEPTH_EXCESSIVE",
    severity: "notice",
    category: "performance",
    title: "Excessive DOM depth",
    description: "DOM tree is more than 32 levels deep.",
    impact: "Deep nesting slows CSS selector matching and layout calculations.",
    howToFix: "Flatten your HTML structure where possible."
  },
  IMAGE_NOT_WEBP_AVIF: {
    code: "IMAGE_NOT_WEBP_AVIF",
    severity: "notice",
    category: "images",
    title: "Images not using modern formats",
    description: "Images use JPEG/PNG instead of WebP/AVIF.",
    impact: "Modern formats provide 25-50% smaller file sizes.",
    howToFix: "Convert images to WebP or AVIF format with fallbacks."
  },
  NO_CDN_DETECTED: {
    code: "NO_CDN_DETECTED",
    severity: "notice",
    category: "performance",
    title: "No CDN detected",
    description: "Static resources are not served from a CDN.",
    impact: "Users far from your server experience slower load times.",
    howToFix: "Use a CDN like Cloudflare, Fastly, or AWS CloudFront."
  },
  // ==================== TECHNOLOGY DETECTION ====================
  WORDPRESS_DETECTED: {
    code: "WORDPRESS_DETECTED",
    severity: "notice",
    category: "on-page",
    title: "WordPress detected",
    description: "Site is built with WordPress CMS.",
    impact: "Informational - WordPress powers 40% of the web.",
    howToFix: "Ensure WordPress core, themes, and plugins are up to date."
  },
  OUTDATED_JQUERY: {
    code: "OUTDATED_JQUERY",
    severity: "warning",
    category: "security",
    title: "Outdated jQuery version detected",
    description: "Page uses a jQuery version with known vulnerabilities.",
    impact: "Site may be vulnerable to security exploits.",
    howToFix: "Update jQuery to the latest version (3.x or higher)."
  },
  OUTDATED_FRAMEWORK: {
    code: "OUTDATED_FRAMEWORK",
    severity: "warning",
    category: "security",
    title: "Outdated JavaScript framework detected",
    description: "Page uses an outdated version of a JavaScript framework.",
    impact: "May have security vulnerabilities or performance issues.",
    howToFix: "Update to the latest stable version of the framework."
  },
  // ==================== KEYWORD DENSITY ====================
  KEYWORD_STUFFING: {
    code: "KEYWORD_STUFFING",
    severity: "warning",
    category: "content",
    title: "Potential keyword stuffing detected",
    description: "A keyword appears more than 3% of total word count.",
    impact: "May trigger search engine spam filters.",
    howToFix: "Write naturally and use keyword variations instead of repetition."
  },
  NO_KEYWORDS_IN_TITLE: {
    code: "NO_KEYWORDS_IN_TITLE",
    severity: "warning",
    category: "on-page",
    title: "Top keywords not in title",
    description: "Most common page keywords are not present in the title tag.",
    impact: "Title may not accurately reflect page content for search engines.",
    howToFix: "Include your primary keyword in the title tag."
  },
  NO_KEYWORDS_IN_H1: {
    code: "NO_KEYWORDS_IN_H1",
    severity: "notice",
    category: "on-page",
    title: "Top keywords not in H1",
    description: "Most common page keywords are not present in the H1 heading.",
    impact: "H1 may not signal page topic effectively.",
    howToFix: "Include your primary keyword in the H1 heading."
  },
  // ==================== ADDITIONAL CHECKS ====================
  AMP_MISSING: {
    code: "AMP_MISSING",
    severity: "notice",
    category: "mobile",
    title: "No AMP version detected",
    description: "Page does not have an Accelerated Mobile Page version.",
    impact: "May load slower on mobile and miss Top Stories carousel eligibility.",
    howToFix: "Consider implementing AMP for content-heavy pages."
  },
  AMP_INVALID: {
    code: "AMP_INVALID",
    severity: "warning",
    category: "mobile",
    title: "Invalid AMP markup",
    description: "AMP page contains validation errors.",
    impact: "Invalid AMP pages may not be served from Google AMP cache.",
    howToFix: "Validate and fix AMP errors using the AMP Validator."
  },
  ADS_TXT_MISSING: {
    code: "ADS_TXT_MISSING",
    severity: "notice",
    category: "crawlability",
    title: "Missing ads.txt file",
    description: "No ads.txt file found for ad inventory authorization.",
    impact: "If running ads, unauthorized sellers may claim your inventory.",
    howToFix: "Create an ads.txt file listing authorized ad sellers."
  },
  ADS_TXT_INVALID: {
    code: "ADS_TXT_INVALID",
    severity: "warning",
    category: "crawlability",
    title: "Invalid ads.txt format",
    description: "ads.txt file contains syntax errors.",
    impact: "Ad platforms may not recognize your authorized sellers.",
    howToFix: "Validate ads.txt format using IAB ads.txt validator."
  },
  DMARC_MISSING: {
    code: "DMARC_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing DMARC record",
    description: "No DMARC DNS record found for email authentication.",
    impact: "Emails from your domain may be spoofed or marked as spam.",
    howToFix: 'Add a DMARC record to your DNS: _dmarc.yourdomain.com TXT "v=DMARC1; p=none"'
  },
  SPF_MISSING: {
    code: "SPF_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing SPF record",
    description: "No SPF DNS record found for email authentication.",
    impact: "Emails from your domain may be marked as spam.",
    howToFix: "Add an SPF record to your DNS with authorized mail servers."
  },
  SAFE_BROWSING_FLAGGED: {
    code: "SAFE_BROWSING_FLAGGED",
    severity: "error",
    category: "security",
    title: "Site flagged by Google Safe Browsing",
    description: "Google has flagged this site for malware or phishing.",
    impact: "Browsers will show warnings and traffic will plummet.",
    howToFix: "Remove malware/phishing content and request review in Search Console."
  },
  PLAINTEXT_EMAIL: {
    code: "PLAINTEXT_EMAIL",
    severity: "notice",
    category: "security",
    title: "Email addresses in plain text",
    description: "Email addresses found in page HTML without obfuscation.",
    impact: "Email addresses can be harvested by spam bots.",
    howToFix: "Use contact forms or obfuscate emails (e.g., name[at]domain.com)."
  },
  DIRECTORY_LISTING_ENABLED: {
    code: "DIRECTORY_LISTING_ENABLED",
    severity: "warning",
    category: "security",
    title: "Directory listing enabled",
    description: "Web server is configured to list directory contents.",
    impact: "Exposes file structure and potentially sensitive files.",
    howToFix: "Disable directory listing in your web server configuration."
  },
  FAVICON_NOT_ICO: {
    code: "FAVICON_NOT_ICO",
    severity: "notice",
    category: "on-page",
    title: "Favicon not in ICO format",
    description: "Favicon is not in the traditional .ico format.",
    impact: "Some older browsers may not display the favicon.",
    howToFix: "Provide favicon.ico at site root in addition to PNG/SVG versions."
  },
  APPLE_TOUCH_ICON_MISSING: {
    code: "APPLE_TOUCH_ICON_MISSING",
    severity: "notice",
    category: "mobile",
    title: "Missing Apple Touch Icon",
    description: "No apple-touch-icon link found.",
    impact: "iOS users adding site to home screen will see a generic icon.",
    howToFix: 'Add <link rel="apple-touch-icon" href="/apple-touch-icon.png">'
  },
  // ==================== ADVANCED SEO CHECKS ====================
  // Featured Snippet Optimization
  FAQ_SCHEMA_MISSING: {
    code: "FAQ_SCHEMA_MISSING",
    severity: "warning",
    category: "structured-data",
    title: "FAQ content without FAQPage schema",
    description: "Question-format headings found but no FAQPage schema markup.",
    impact: "Missing out on FAQ rich results and PAA box opportunities.",
    howToFix: "Add FAQPage structured data for your Q&A content."
  },
  INVERTED_PYRAMID_MISSING: {
    code: "INVERTED_PYRAMID_MISSING",
    severity: "notice",
    category: "content",
    title: "Content not structured for featured snippets",
    description: "First paragraph does not contain a direct answer or summary.",
    impact: "Featured snippets pull from early content; burying answers reduces snippet capture rate.",
    howToFix: "Start with a concise answer (40-80 words) that directly addresses the page topic."
  },
  NO_SNIPPET_BAIT_HEADERS: {
    code: "NO_SNIPPET_BAIT_HEADERS",
    severity: "notice",
    category: "on-page",
    title: "No snippet-targeting headers found",
    description: "Headings do not use patterns that commonly trigger featured snippets.",
    impact: "Missing opportunities for high-visibility snippet placements.",
    howToFix: 'Use headers like "What is [topic]?", "How to [action]", or "X Ways to [achieve goal]".'
  },
  // Internal Link Graph
  NO_CONTEXTUAL_INTERNAL_LINKS: {
    code: "NO_CONTEXTUAL_INTERNAL_LINKS",
    severity: "warning",
    category: "links",
    title: "No contextual internal links",
    description: "All internal links are in navigation/footer. No editorial links in content.",
    impact: "Editorial links in content pass more SEO value than navigational links.",
    howToFix: "Add relevant internal links within your main content to related pages."
  },
  LOW_EDITORIAL_LINKS: {
    code: "LOW_EDITORIAL_LINKS",
    severity: "notice",
    category: "links",
    title: "Few editorial internal links",
    description: "Only a few editorial (in-content) internal links found.",
    impact: "Editorial links with surrounding context provide stronger topical signals.",
    howToFix: "Add 2-5 relevant internal links within your body content."
  },
  FIRST_LINK_GENERIC_ANCHOR: {
    code: "FIRST_LINK_GENERIC_ANCHOR",
    severity: "notice",
    category: "links",
    title: "First link uses generic anchor text",
    description: 'First link to a page uses generic anchor like "click here" or "read more".',
    impact: "Google may prioritize first link anchor for topic signals.",
    howToFix: "Use descriptive, keyword-relevant anchor text for internal links."
  },
  TOO_MANY_INTERNAL_LINKS: {
    code: "TOO_MANY_INTERNAL_LINKS",
    severity: "warning",
    category: "links",
    title: "Excessive internal links",
    description: "Page has over 100 internal links, which may dilute PageRank distribution.",
    impact: "Too many links reduce the value passed to each linked page.",
    howToFix: "Reduce internal links to the most important and relevant pages."
  },
  NO_INTERNAL_LINKS: {
    code: "NO_INTERNAL_LINKS",
    severity: "error",
    category: "links",
    title: "No internal links found",
    description: "Page has no internal links to other pages on the site.",
    impact: "Creates a dead end for users and search engine crawlers.",
    howToFix: "Add relevant internal links to related content."
  },
  // Resource Hints
  MISSING_PRECONNECT: {
    code: "MISSING_PRECONNECT",
    severity: "warning",
    category: "performance",
    title: "Missing preconnect hints for third-party origins",
    description: "Third-party origins used without preconnect hints.",
    impact: "Connection setup to third-party origins adds latency to resource loading.",
    howToFix: "Add preconnect hints for critical third-party origins."
  },
  GOOGLE_FONTS_NO_PRECONNECT: {
    code: "GOOGLE_FONTS_NO_PRECONNECT",
    severity: "warning",
    category: "performance",
    title: "Google Fonts without preconnect",
    description: "Google Fonts are used but preconnect hints are missing.",
    impact: "Adds significant latency to font loading, affecting LCP.",
    howToFix: "Add preconnect hints for fonts.googleapis.com and fonts.gstatic.com."
  },
  HERO_IMAGE_NOT_PRELOADED: {
    code: "HERO_IMAGE_NOT_PRELOADED",
    severity: "notice",
    category: "performance",
    title: "Hero image not preloaded",
    description: "Page has images but none are preloaded for faster LCP.",
    impact: "Preloading LCP images can improve Largest Contentful Paint.",
    howToFix: 'Add <link rel="preload" href="hero-image.jpg" as="image"> for your LCP image.'
  },
  NO_CRITICAL_RESOURCE_PRELOAD: {
    code: "NO_CRITICAL_RESOURCE_PRELOAD",
    severity: "notice",
    category: "performance",
    title: "No critical resources preloaded",
    description: "Page has render-blocking resources but no preload hints.",
    impact: "Preloading critical resources can improve initial render time.",
    howToFix: "Consider preloading critical CSS, fonts, or hero images."
  },
  EXCESSIVE_PRELOADS: {
    code: "EXCESSIVE_PRELOADS",
    severity: "warning",
    category: "performance",
    title: "Too many preload hints",
    description: "Page has more than 10 preload hints.",
    impact: "Preloading too many resources competes for bandwidth and can delay critical resources.",
    howToFix: "Limit preloads to truly critical resources (2-5 maximum)."
  },
  ES_MODULES_NO_MODULEPRELOAD: {
    code: "ES_MODULES_NO_MODULEPRELOAD",
    severity: "notice",
    category: "performance",
    title: "ES modules without modulepreload",
    description: "Page uses ES modules but no modulepreload hints are present.",
    impact: "Modulepreload can parallelize module loading for faster execution.",
    howToFix: 'Add <link rel="modulepreload" href="critical-module.js"> for critical modules.'
  },
  // E-E-A-T Signals
  YMYL_NO_AUTHOR: {
    code: "YMYL_NO_AUTHOR",
    severity: "warning",
    category: "content",
    title: "YMYL content without author information",
    description: "This appears to be YMYL (Your Money Your Life) content but has no visible author.",
    impact: "Google prioritizes E-E-A-T signals heavily for YMYL topics.",
    howToFix: "Add author byline with credentials, bio, and author schema."
  },
  YMYL_NO_EXPERTISE: {
    code: "YMYL_NO_EXPERTISE",
    severity: "warning",
    category: "content",
    title: "YMYL content without expertise signals",
    description: "YMYL content lacks visible expertise indicators (credentials, qualifications).",
    impact: "Expertise is crucial for YMYL content ranking.",
    howToFix: 'Include author credentials, "reviewed by" statements, or cite expert sources.'
  },
  YMYL_NO_CITATIONS: {
    code: "YMYL_NO_CITATIONS",
    severity: "warning",
    category: "content",
    title: "YMYL content without authoritative citations",
    description: "YMYL content has no links to authoritative sources (.gov, .edu, etc.).",
    impact: "Citing authoritative sources builds trust for sensitive topics.",
    howToFix: "Add citations to government, academic, or recognized industry sources."
  },
  NO_ENTITY_IDENTIFIED: {
    code: "NO_ENTITY_IDENTIFIED",
    severity: "notice",
    category: "content",
    title: "No author or organization identified",
    description: "Page lacks clear attribution to an author or organization.",
    impact: "Anonymous content may be seen as less trustworthy.",
    howToFix: "Add author byline or organization information with structured data."
  },
  NO_ORGANIZATION_SCHEMA: {
    code: "NO_ORGANIZATION_SCHEMA",
    severity: "notice",
    category: "structured-data",
    title: "Missing Organization schema",
    description: "No Organization structured data found.",
    impact: "Missed opportunity to establish organizational identity for E-E-A-T.",
    howToFix: "Add Organization schema with name, logo, contact, and social profiles."
  },
  AUTHOR_NO_SCHEMA: {
    code: "AUTHOR_NO_SCHEMA",
    severity: "notice",
    category: "structured-data",
    title: "Author without Person schema",
    description: "Author name is present but no Person structured data.",
    impact: "Person schema helps Google understand author entity relationships.",
    howToFix: "Add Person schema with sameAs links to author profiles."
  },
  NO_MODIFIED_DATE: {
    code: "NO_MODIFIED_DATE",
    severity: "notice",
    category: "content",
    title: "No content modification date",
    description: "Content has published date but no last-modified date.",
    impact: "Modified dates signal content freshness to search engines.",
    howToFix: "Add article:modified_time meta tag or dateModified in schema."
  },
  NO_EXPERIENCE_SIGNALS: {
    code: "NO_EXPERIENCE_SIGNALS",
    severity: "notice",
    category: "content",
    title: "No first-hand experience signals detected",
    description: "Content lacks indicators of personal/first-hand experience.",
    impact: 'The "Experience" in E-E-A-T values authentic, first-hand knowledge.',
    howToFix: "Add personal insights, original photos, or hands-on testing details."
  },
  // IndexNow
  INDEXNOW_NOT_IMPLEMENTED: {
    code: "INDEXNOW_NOT_IMPLEMENTED",
    severity: "notice",
    category: "crawlability",
    title: "IndexNow not implemented",
    description: "Site does not appear to have IndexNow instant indexing set up.",
    impact: "Content changes may take longer to appear in Bing, Yandex, and other search engines.",
    howToFix: "Create a key at indexnow.org and implement the IndexNow protocol."
  },
  INDEXNOW_INVALID_KEY: {
    code: "INDEXNOW_INVALID_KEY",
    severity: "warning",
    category: "crawlability",
    title: "IndexNow key format invalid",
    description: "The IndexNow key does not match expected formats.",
    impact: "IndexNow submissions may fail with invalid key format.",
    howToFix: "Use a valid key format: 32-character hex or UUID format."
  },
  // Content Science (Novel Checks)
  ZIPF_KEYWORD_STUFFING: {
    code: "ZIPF_KEYWORD_STUFFING",
    severity: "warning",
    category: "content",
    title: "Unnatural keyword distribution detected",
    description: "Content deviates from natural language patterns (Zipf's law). Possible keyword stuffing.",
    impact: "Search engines can detect unnatural text patterns, potentially triggering spam filters.",
    howToFix: "Reduce repetition of over-used keywords and use more natural language."
  },
  LOW_CONTENT_ENTROPY: {
    code: "LOW_CONTENT_ENTROPY",
    severity: "warning",
    category: "content",
    title: "Low vocabulary diversity (thin content signal)",
    description: "Content entropy is low, indicating repetitive or thin content.",
    impact: "Low diversity content may be seen as low-quality by search engines.",
    howToFix: "Expand vocabulary, add more unique insights, and reduce repetitive phrases."
  },
  HIGH_CONTENT_REPETITION: {
    code: "HIGH_CONTENT_REPETITION",
    severity: "notice",
    category: "content",
    title: "High content repetition detected",
    description: "Content shows high repetition pattern.",
    impact: "Highly repetitive content provides less value and may hurt engagement.",
    howToFix: "Vary your vocabulary and sentence structures. Avoid repeating the same phrases."
  },
  BM25_KEYWORD_MISSING: {
    code: "BM25_KEYWORD_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Target keyword not found",
    description: "A target keyword is not present in your content at all.",
    impact: "Page unlikely to rank for this keyword without any mention of it.",
    howToFix: "Add natural mentions of the target keyword in your content."
  },
  BM25_KEYWORD_SATURATED: {
    code: "BM25_KEYWORD_SATURATED",
    severity: "notice",
    category: "on-page",
    title: "Keyword over-optimized",
    description: "Keyword found many times. Additional mentions provide diminishing returns.",
    impact: "Over-optimization can trigger spam signals.",
    howToFix: "Use semantic variations and related terms instead of exact repetition."
  },
  // Site Maturity
  NEW_SITE_STRATEGY: {
    code: "NEW_SITE_STRATEGY",
    severity: "notice",
    category: "content",
    title: "New website detected - Authority-first strategy recommended",
    description: "Your site appears to be new (<90 days). Standard SEO advice won't work well.",
    impact: "Creating lots of content without authority is wasted effort.",
    howToFix: "Focus on building 10+ quality backlinks to ONE great page before expanding content."
  },
  CONTENT_AUTHORITY_IMBALANCE: {
    code: "CONTENT_AUTHORITY_IMBALANCE",
    severity: "warning",
    category: "content",
    title: "Content-to-authority imbalance",
    description: "Site has many pages but limited backlink signals. Content is unlikely to rank.",
    impact: "Most of your content may be invisible to search engines due to low domain authority.",
    howToFix: "Stop publishing new content. Focus 100% on link building until you see ranking improvements."
  },
  GROWING_SITE_NO_BLOG: {
    code: "GROWING_SITE_NO_BLOG",
    severity: "notice",
    category: "content",
    title: "Growing site without blog/content hub",
    description: "Site is in growth phase but lacks a blog or content section.",
    impact: "Blog content is essential for attracting backlinks and building topical authority.",
    howToFix: "Create a blog section with linkable content assets (guides, research, tools)."
  },
  // Keyword Cannibalization
  INTERNAL_CANNIBALIZATION_SIGNAL: {
    code: "INTERNAL_CANNIBALIZATION_SIGNAL",
    severity: "warning",
    category: "content",
    title: "Duplicate H1 tags on page",
    description: "Page has multiple H1 tags with duplicates, which can dilute keyword focus.",
    impact: "Multiple similar H1s can confuse search engines about page topic.",
    howToFix: "Use a single, unique H1 that clearly defines the page topic."
  },
  TITLE_H1_KEYWORD_MISMATCH: {
    code: "TITLE_H1_KEYWORD_MISMATCH",
    severity: "warning",
    category: "on-page",
    title: "Title and H1 target different keywords",
    description: "The title tag and H1 heading have no overlapping keywords.",
    impact: "Search engines may be confused about the primary topic of the page.",
    howToFix: "Align title and H1 to target the same primary keyword or topic."
  },
  // ==================== ASSET MINIFICATION ====================
  CSS_NOT_MINIFIED: {
    code: "CSS_NOT_MINIFIED",
    severity: "warning",
    category: "performance",
    title: "CSS files not minified",
    description: "CSS files contain unnecessary whitespace, comments, or unoptimized code.",
    impact: "Unminified CSS increases file size and page load time.",
    howToFix: "Use a CSS minifier (cssnano, clean-css) or ensure build tools minify CSS in production."
  },
  JS_NOT_MINIFIED: {
    code: "JS_NOT_MINIFIED",
    severity: "warning",
    category: "performance",
    title: "JavaScript files not minified",
    description: "JavaScript files contain unnecessary whitespace, comments, or long variable names.",
    impact: "Unminified JavaScript increases file size, parse time, and page load time.",
    howToFix: "Use a JS minifier (Terser, UglifyJS) or ensure build tools minify JS in production."
  },
  // ==================== PAGE RESOURCES ====================
  PAGE_RESOURCES_EXCESSIVE: {
    code: "PAGE_RESOURCES_EXCESSIVE",
    severity: "error",
    category: "performance",
    title: "Excessive number of page resources",
    description: "Page makes over 100 HTTP requests for resources.",
    impact: "Too many HTTP requests cause slow page loads due to connection overhead and browser limits.",
    howToFix: "Combine CSS/JS files, use image sprites, lazy-load resources, remove unused dependencies."
  },
  PAGE_RESOURCES_HIGH: {
    code: "PAGE_RESOURCES_HIGH",
    severity: "warning",
    category: "performance",
    title: "High number of page resources",
    description: "Page makes over 50 HTTP requests for resources.",
    impact: "Many HTTP requests increase page load time, especially on mobile networks.",
    howToFix: "Bundle CSS/JS files, lazy-load images below the fold, consider critical CSS inlining."
  },
  PAGE_RESOURCES_THIRD_PARTY_HIGH: {
    code: "PAGE_RESOURCES_THIRD_PARTY_HIGH",
    severity: "warning",
    category: "performance",
    title: "Many third-party resources",
    description: "Page loads many resources from third-party domains.",
    impact: "Third-party resources add latency and are outside your control.",
    howToFix: "Self-host critical third-party resources when possible. Use preconnect hints for remaining."
  },
  PAGE_RESOURCES_MANY_IFRAMES: {
    code: "PAGE_RESOURCES_MANY_IFRAMES",
    severity: "warning",
    category: "performance",
    title: "Multiple iframes detected",
    description: "Page contains multiple iframes, each loading its own document.",
    impact: "Iframes significantly increase page weight and can block the main thread.",
    howToFix: "Lazy-load iframes below the fold. Consider native embeds or facade patterns."
  },
  // ==================== RESPONSIVE CSS ====================
  RESPONSIVE_NO_VIEWPORT: {
    code: "RESPONSIVE_NO_VIEWPORT",
    severity: "error",
    category: "mobile",
    title: "Missing viewport meta tag",
    description: "No viewport meta tag found for responsive design.",
    impact: "Without viewport meta, mobile browsers render at desktop width and scale down.",
    howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>.'
  },
  RESPONSIVE_NO_MEDIA_QUERIES: {
    code: "RESPONSIVE_NO_MEDIA_QUERIES",
    severity: "warning",
    category: "mobile",
    title: "No CSS media queries detected",
    description: "No @media queries found in stylesheets.",
    impact: "Without media queries, the site uses fixed layouts that do not adapt to screen sizes.",
    howToFix: "Add CSS media queries for different screen sizes. Use mobile-first approach."
  },
  RESPONSIVE_NO_MOBILE_BREAKPOINT: {
    code: "RESPONSIVE_NO_MOBILE_BREAKPOINT",
    severity: "warning",
    category: "mobile",
    title: "No mobile breakpoints detected",
    description: "Media queries exist but none target mobile screen sizes.",
    impact: "Site may not be optimized for mobile devices, hurting majority of traffic.",
    howToFix: "Add media queries for mobile: @media (max-width: 768px) { ... }"
  },
  // ==================== LINKS RATIO ====================
  LINKS_NO_INTERNAL: {
    code: "LINKS_NO_INTERNAL",
    severity: "warning",
    category: "links",
    title: "No internal links found",
    description: "Page has no internal links to other pages on the site.",
    impact: "Internal links help search engines discover pages and distribute link equity.",
    howToFix: "Add relevant internal links to related content or navigation."
  },
  LINKS_NO_EXTERNAL: {
    code: "LINKS_NO_EXTERNAL",
    severity: "notice",
    category: "links",
    title: "No external links found",
    description: "Page has no links to external websites.",
    impact: "Linking to authoritative sources improves credibility and content context.",
    howToFix: "Add links to high-quality external sources that support your content."
  },
  LINKS_RATIO_POOR: {
    code: "LINKS_RATIO_POOR",
    severity: "warning",
    category: "links",
    title: "Poor internal-to-external link ratio",
    description: "Page has more external links than internal links.",
    impact: "Too many external links can dilute page authority and may look spammy.",
    howToFix: "Add more internal links. Aim for at least 2 internal links per external link."
  },
  // ==================== URL SAFETY (Local Hash Database) ====================
  URL_SAFETY_KNOWN_THREAT: {
    code: "URL_SAFETY_KNOWN_THREAT",
    severity: "error",
    category: "security",
    title: "Website URL matches known threat database",
    description: "Your website URL matches entries in the local threat database.",
    impact: "Browsers and security tools may block access to your site. Search engines may remove you from results.",
    howToFix: "Scan your site for malware, remove any malicious content, and request removal from threat databases."
  },
  URL_SAFETY_EXTERNAL_THREAT: {
    code: "URL_SAFETY_EXTERNAL_THREAT",
    severity: "error",
    category: "security",
    title: "External links to known malicious URLs",
    description: "External links point to URLs flagged in threat databases.",
    impact: "Linking to malicious sites harms visitors and damages your reputation and rankings.",
    howToFix: "Remove all links to flagged URLs immediately."
  },
  URL_SAFETY_SUSPICIOUS_DOMAIN: {
    code: "URL_SAFETY_SUSPICIOUS_DOMAIN",
    severity: "warning",
    category: "security",
    title: "Website URL has suspicious characteristics",
    description: "Your URL shows patterns commonly associated with phishing or malicious sites.",
    impact: "Users and security tools may distrust your site.",
    howToFix: "Use a trustworthy domain structure. Avoid patterns that mimic other brands or use suspicious TLDs."
  },
  URL_SAFETY_SUSPICIOUS_EXTERNAL: {
    code: "URL_SAFETY_SUSPICIOUS_EXTERNAL",
    severity: "warning",
    category: "security",
    title: "External links with suspicious characteristics",
    description: "External links show patterns associated with phishing or malicious sites.",
    impact: "Linking to suspicious sites can harm visitors and rankings.",
    howToFix: "Review and remove or replace suspicious external links."
  },
  URL_SAFETY_SHORTENERS: {
    code: "URL_SAFETY_SHORTENERS",
    severity: "notice",
    category: "security",
    title: "External links use URL shorteners",
    description: "External links use URL shorteners, hiding the actual destination.",
    impact: "URL shorteners reduce trust and SEO link value.",
    howToFix: "Replace shortened URLs with direct links to the destination."
  },
  // ==================== FRAMEWORK-SPECIFIC SEO ====================
  REACT_CSR_DETECTED: {
    code: "REACT_CSR_DETECTED",
    severity: "error",
    category: "framework",
    title: "Client-side rendered React app detected",
    description: "React apps without SSR send empty HTML to crawlers. Search engines may not index your content.",
    impact: "Critical - your content is likely invisible to Google.",
    howToFix: "Migrate to Next.js for automatic SSR/SSG, add prerendering with react-snap, or use react-helmet-async with a prerender service."
  },
  NEXTJS_NO_METADATA_API: {
    code: "NEXTJS_NO_METADATA_API",
    severity: "warning",
    category: "framework",
    title: "Not using Next.js Metadata API",
    description: "Next.js 13+ has a built-in Metadata API that is more reliable than third-party solutions.",
    impact: "Missing out on Next.js optimized SEO features.",
    howToFix: "Use export const metadata or generateMetadata in your page/layout files."
  },
  VUE_CSR_DETECTED: {
    code: "VUE_CSR_DETECTED",
    severity: "error",
    category: "framework",
    title: "Client-side rendered Vue app detected",
    description: "Vue apps without SSR send empty HTML to crawlers.",
    impact: "Your content may not be indexed by search engines.",
    howToFix: "Migrate to Nuxt for automatic SSR/SSG, or add SSR with @vue/server-renderer."
  },
  ANGULAR_NO_UNIVERSAL: {
    code: "ANGULAR_NO_UNIVERSAL",
    severity: "error",
    category: "framework",
    title: "Angular app without Universal (SSR)",
    description: "Client-side Angular apps send empty HTML to crawlers.",
    impact: "Your content may not be indexed by search engines.",
    howToFix: "Add Angular Universal for SSR: ng add @angular/ssr"
  },
  WORDPRESS_NO_SEO_PLUGIN: {
    code: "WORDPRESS_NO_SEO_PLUGIN",
    severity: "warning",
    category: "framework",
    title: "No SEO plugin detected",
    description: "WordPress benefits greatly from an SEO plugin like Yoast or Rank Math.",
    impact: "Missing automated SEO features like sitemaps, schema, and meta tag management.",
    howToFix: "Install Yoast SEO or Rank Math plugin."
  },
  WORDPRESS_NO_CACHING: {
    code: "WORDPRESS_NO_CACHING",
    severity: "warning",
    category: "framework",
    title: "No caching plugin detected",
    description: "WordPress without caching is slow, hurting Core Web Vitals.",
    impact: "Poor performance affects user experience and rankings.",
    howToFix: "Install WP Super Cache, W3 Total Cache, or LiteSpeed Cache."
  },
  SPA_EMPTY_BODY: {
    code: "SPA_EMPTY_BODY",
    severity: "error",
    category: "framework",
    title: "Single Page App with empty body",
    description: "Page body contains minimal content, suggesting client-side rendering without SSR.",
    impact: "Search engines see an empty page and cannot index your content.",
    howToFix: "Implement server-side rendering, static site generation, or prerendering."
  },
  FRAMEWORK_OUTDATED: {
    code: "FRAMEWORK_OUTDATED",
    severity: "warning",
    category: "framework",
    title: "Outdated framework version detected",
    description: "Running an outdated version of your framework may have security vulnerabilities and SEO bugs.",
    impact: "Potential security issues and missing SEO improvements.",
    howToFix: "Update to the latest stable version of your framework."
  }
};

// src/utils/http.ts
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_USER_AGENT = "RankCLI/1.0 (+https://rankcli.dev)";
function createTimeoutController(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}
function headersToObject(headers) {
  const obj = {};
  headers.forEach((value, key) => {
    obj[key.toLowerCase()] = value;
  });
  return obj;
}
function looksLikeHtmlFallback(body, contentType) {
  if (contentType && /text\/html/i.test(contentType))
    return true;
  if (typeof body !== "string")
    return false;
  const head = body.trimStart().slice(0, 200).toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html");
}
async function httpGet(url, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    maxRedirects = 5,
    params
  } = config;
  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }
    const separator = url.includes("?") ? "&" : "?";
    finalUrl = `${url}${separator}${searchParams.toString()}`;
  }
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        ...headers
      },
      signal: controller.signal,
      redirect: maxRedirects > 0 ? "follow" : "manual"
    });
    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    clearTimeout(timeoutId);
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
async function httpHead(url, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    maxRedirects = 5
  } = config;
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        ...headers
      },
      signal: controller.signal,
      redirect: maxRedirects > 0 ? "follow" : "manual"
    });
    clearTimeout(timeoutId);
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data: null,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
async function httpPost(url, data, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    auth
  } = config;
  const { controller, timeoutId } = createTimeoutController(timeout);
  const requestHeaders = {
    "User-Agent": DEFAULT_USER_AGENT,
    "Content-Type": "application/json",
    ...headers
  };
  if (auth) {
    const credentials = btoa(`${auth.username}:${auth.password}`);
    requestHeaders["Authorization"] = `Basic ${credentials}`;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : void 0,
      signal: controller.signal
    });
    const contentType = response.headers.get("content-type") || "";
    let responseData;
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    clearTimeout(timeoutId);
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// src/frameworks/signals.ts
var WEIGHT = { DECISIVE: 100, STRONG: 45, WEAK: 15 };
var SCORE_FLOOR = 45;
var SIGNALS = [
  // ---- Meta-frameworks: JavaScript ------------------------------------------------
  { framework: "nextjs", language: "typescript", weight: WEIGHT.DECISIVE, name: "next-build-dir", html: /\/_next\/(static|image|data)\// },
  { framework: "nextjs", language: "typescript", weight: WEIGHT.DECISIVE, name: "next-data", html: /__NEXT_DATA__|self\.__next_f/ },
  { framework: "nextjs", language: "typescript", weight: WEIGHT.DECISIVE, name: "next-mount", html: /<div id=["']__next["']/ },
  { framework: "nextjs", language: "typescript", weight: WEIGHT.DECISIVE, name: "next-powered-by", header: /^x-powered-by: next\.js/ },
  { framework: "nuxt", language: "typescript", weight: WEIGHT.DECISIVE, name: "nuxt-build-dir", html: /\/_nuxt\// },
  { framework: "nuxt", language: "typescript", weight: WEIGHT.DECISIVE, name: "nuxt-payload", html: /__NUXT__|__NUXT_DATA__|<div id="__nuxt"/ },
  { framework: "nuxt", language: "typescript", weight: WEIGHT.DECISIVE, name: "nuxt-powered-by", header: /^x-powered-by: nuxt/ },
  { framework: "astro", language: "typescript", weight: WEIGHT.DECISIVE, name: "astro-build-dir", html: /\/_astro\// },
  { framework: "astro", language: "typescript", weight: WEIGHT.DECISIVE, name: "astro-island", html: /<astro-island|astro-slot|data-astro-(cid|source-file|transition)/ },
  { framework: "astro", language: "typescript", weight: WEIGHT.STRONG, name: "astro-generator", html: /name=["']?generator["']?[^>]*content=["']?Astro/i },
  { framework: "sveltekit", language: "typescript", weight: WEIGHT.DECISIVE, name: "sveltekit-immutable", html: /\/_app\/immutable\// },
  { framework: "sveltekit", language: "typescript", weight: WEIGHT.DECISIVE, name: "sveltekit-runtime", html: /__sveltekit|kit\.start\(/ },
  { framework: "remix", language: "typescript", weight: WEIGHT.DECISIVE, name: "remix-context", html: /__remixContext|__remixManifest|__remixRouteModules/ },
  { framework: "remix", language: "typescript", weight: WEIGHT.STRONG, name: "remix-build-dir", html: /\/build\/_shared\/|\/build\/entry\.client-/ },
  { framework: "gatsby", language: "javascript", weight: WEIGHT.DECISIVE, name: "gatsby-runtime", html: /___gatsby|window\.___chunkMapping/ },
  { framework: "gatsby", language: "javascript", weight: WEIGHT.STRONG, name: "gatsby-page-data", html: /\/page-data\/(app-data\.json|sq\/)/ },
  { framework: "qwik", language: "typescript", weight: WEIGHT.DECISIVE, name: "qwik-container", html: /q:container|q:base|q:version|qwikloader/ },
  { framework: "fresh", language: "typescript", weight: WEIGHT.DECISIVE, name: "fresh-build-dir", html: /\/_frsh\// },
  { framework: "solidjs", language: "typescript", weight: WEIGHT.STRONG, name: "solid-hydration", html: /_\$HY\b|data-hk=["']/ },
  // ---- Base UI libraries: weaker by nature, and that is the point -----------------
  { framework: "angular", language: "typescript", weight: WEIGHT.DECISIVE, name: "angular-version", html: /ng-version=["']/ },
  { framework: "angular", language: "typescript", weight: WEIGHT.DECISIVE, name: "angular-content-attr", html: /_ngcontent-|_nghost-/ },
  { framework: "react", language: "javascript", weight: WEIGHT.STRONG, name: "react-root-marker", html: /data-reactroot|__reactContainer\$|__REACT_DEVTOOLS/ },
  // A Vite-built SPA: an empty mount point plus Vite's hashed entry bundle. Two weak facts
  // that together mean something; either one alone does not.
  { framework: "react", language: "javascript", weight: WEIGHT.WEAK, name: "react-empty-root", html: /<div id="root"><\/div>/ },
  { framework: "react", language: "javascript", weight: WEIGHT.WEAK, name: "react-refresh", html: /RefreshRuntime|react-refresh/ },
  {
    framework: "react",
    language: "javascript",
    weight: WEIGHT.STRONG,
    name: "react-vite-spa",
    // Vite's entry chunk plus React's conventional mount point. Medium confidence by
    // construction: #app instead of #root stays unknown, because Vue, Solid and others use it.
    // Not `<div id="root"></div>`: a prerendered SPA has content inside its mount point, which
    // is what RankCLI's own site does and what the first version of this signal missed.
    allHtml: [/<script[^>]+src=["'][^"']+\.js["']/, /<div id="root"[\s>]/]
  },
  { framework: "vue", language: "javascript", weight: WEIGHT.DECISIVE, name: "vitepress-runtime", html: /__VP_HASH_MAP__|__VP_SITE_DATA__/ },
  { framework: "vue", language: "javascript", weight: WEIGHT.DECISIVE, name: "vue-scoped-style", html: /data-v-[0-9a-f]{6,10}\b/ },
  { framework: "vue", language: "javascript", weight: WEIGHT.WEAK, name: "vue-cloak", html: /v-cloak|<div id="app"><\/div>/ },
  { framework: "svelte", language: "javascript", weight: WEIGHT.WEAK, name: "svelte-class", html: /class=["'][^"']*svelte-[0-9a-z]{6}/ },
  // ---- Ruby -----------------------------------------------------------------------
  // csrf-token alone is emitted by Rails, Laravel, Phoenix and Django. csrf-param is Rails.
  { framework: "rails", language: "ruby", weight: WEIGHT.DECISIVE, name: "rails-csrf-param", html: /name=["']csrf-param["']/ },
  { framework: "rails", language: "ruby", weight: WEIGHT.STRONG, name: "rails-ujs", html: /rails-ujs|turbolinks|data-remote=["']true["']|action_cable|actioncable/ },
  { framework: "rails", language: "ruby", weight: WEIGHT.STRONG, name: "rails-session-cookie", header: /^set-cookie: [^;]*_session=/ },
  { framework: "rails", language: "ruby", weight: WEIGHT.STRONG, name: "rails-app-server", header: /^(server|x-powered-by): (puma|passenger|unicorn|phusion)/ },
  { framework: "hotwire", language: "ruby", weight: WEIGHT.STRONG, name: "turbo-elements", html: /<turbo-frame|<turbo-stream|data-turbo-track/ },
  // ---- Python ---------------------------------------------------------------------
  { framework: "django", language: "python", weight: WEIGHT.DECISIVE, name: "django-csrf-input", html: /name=["']csrfmiddlewaretoken["']/ },
  { framework: "django", language: "python", weight: WEIGHT.DECISIVE, name: "django-csrf-cookie", header: /^set-cookie: csrftoken=/ },
  { framework: "django", language: "python", weight: WEIGHT.STRONG, name: "django-admin-static", html: /\/static\/admin\/(css|js)\// },
  { framework: "django", language: "python", weight: WEIGHT.WEAK, name: "django-wsgi-server", header: /^(server|x-powered-by): (gunicorn|uvicorn|daphne)/ },
  { framework: "flask", language: "python", weight: WEIGHT.STRONG, name: "flask-server", header: /^server: werkzeug/ },
  { framework: "fastapi", language: "python", weight: WEIGHT.STRONG, name: "fastapi-docs", html: /swagger-ui-bundle\.js[\s\S]{0,200}openapi\.json/ },
  // ---- PHP ------------------------------------------------------------------------
  { framework: "wordpress", language: "php", weight: WEIGHT.DECISIVE, name: "wp-paths", html: /\/wp-content\/|\/wp-includes\/|\/wp-json\// },
  { framework: "wordpress", language: "php", weight: WEIGHT.DECISIVE, name: "wp-generator", html: /name=["']?generator["']?[^>]*content=["']?WordPress/i },
  { framework: "wordpress", language: "php", weight: WEIGHT.STRONG, name: "wp-powered-by", header: /^x-powered-by: wordpress/ },
  { framework: "laravel", language: "php", weight: WEIGHT.DECISIVE, name: "laravel-session-cookie", header: /^set-cookie: laravel_session=/ },
  { framework: "laravel", language: "php", weight: WEIGHT.STRONG, name: "laravel-xsrf-cookie", header: /^set-cookie: XSRF-TOKEN=/i },
  { framework: "laravel", language: "php", weight: WEIGHT.STRONG, name: "laravel-livewire", html: /livewire|wire:(click|model|submit)/i },
  { framework: "laravel", language: "php", weight: WEIGHT.WEAK, name: "laravel-vite-build", html: /\/build\/assets\/app-[A-Za-z0-9_-]{8}\.js/ },
  { framework: "symfony", language: "php", weight: WEIGHT.DECISIVE, name: "symfony-profiler", html: /\/_profiler\/|sf-toolbar|sf-dump/ },
  { framework: "symfony", language: "php", weight: WEIGHT.STRONG, name: "symfony-cookie", header: /^set-cookie: (sfsession|symfony)/i },
  // ---- Elixir ---------------------------------------------------------------------
  { framework: "phoenix", language: "elixir", weight: WEIGHT.DECISIVE, name: "phoenix-liveview", html: /phx-(click|submit|change|value|hook|socket|main|track-static)/ },
  { framework: "phoenix", language: "elixir", weight: WEIGHT.STRONG, name: "phoenix-cowboy", header: /^server: cowboy/ },
  // ---- Java / C# / Go -------------------------------------------------------------
  { framework: "spring", language: "java", weight: WEIGHT.STRONG, name: "thymeleaf-attr", html: /\sth:[a-z-]+=/ },
  { framework: "spring", language: "java", weight: WEIGHT.STRONG, name: "spring-server", header: /^server: (apache-coyote|tomcat|jetty)/ },
  { framework: "aspnet", language: "csharp", weight: WEIGHT.DECISIVE, name: "aspnet-verification-token", html: /__RequestVerificationToken|__VIEWSTATE/ },
  { framework: "aspnet", language: "csharp", weight: WEIGHT.STRONG, name: "aspnet-server", header: /^(server: kestrel|x-powered-by: asp\.net|x-aspnet-version:)/ },
  // "gin" used to be tested as a substring of the Server header, which matches nginx - the
  // single most common web server there is. Anchored to the whole value now.
  { framework: "go", language: "go", weight: WEIGHT.STRONG, name: "go-server", header: /^server: (gin|echo|fiber|gorilla)(\/|$| )/ },
  // ---- Hypermedia -----------------------------------------------------------------
  { framework: "htmx", language: "unknown", weight: WEIGHT.STRONG, name: "htmx-attrs", html: /\shx-(get|post|put|delete|trigger|swap|target)=/ },
  { framework: "htmx", language: "unknown", weight: WEIGHT.DECISIVE, name: "htmx-script", html: /htmx(\.min)?\.js|unpkg\.com\/htmx/ },
  // ---- Static site generators: they announce themselves -----------------------------
  { framework: "hugo", language: "go", weight: WEIGHT.DECISIVE, name: "hugo-generator", html: /name=["']?generator["']?[^>]*content=["']?Hugo/i },
  { framework: "hugo", language: "go", weight: WEIGHT.STRONG, name: "hugo-generator-header", header: /^x-generator: hugo/ },
  { framework: "jekyll", language: "ruby", weight: WEIGHT.DECISIVE, name: "jekyll-generator", html: /name=["']?generator["']?[^>]*content=["']?Jekyll/i },
  { framework: "eleventy", language: "javascript", weight: WEIGHT.DECISIVE, name: "eleventy-generator", html: /name=["']?generator["']?[^>]*content=["']?Eleventy/i },
  { framework: "pelican", language: "python", weight: WEIGHT.DECISIVE, name: "pelican-generator", html: /name=["']?generator["']?[^>]*content=["']?Pelican/i },
  // Sphinx: what nearly every Python project's documentation is built with, and the shape
  // flask.palletsprojects.com turned out to be. Structural markers only - not the word
  // "sphinx", which appears in plenty of prose.
  // Validated against docusaurus.io, jestjs.io and redux.js.org - all three carry the mount
  // point and the skip-to-content id. Deliberately not the word "docusaurus", which appears on
  // deno.com purely as a link in a logo list; that near-miss is why this needed a real marker.
  { framework: "docusaurus", language: "typescript", weight: WEIGHT.DECISIVE, name: "docusaurus-root", html: /id=["']__docusaurus/ },
  { framework: "docusaurus", language: "typescript", weight: WEIGHT.STRONG, name: "docusaurus-skip-link", html: /__docusaurus_skipToContent/ },
  { framework: "sphinx", language: "python", weight: WEIGHT.DECISIVE, name: "sphinx-doc-options", html: /_static\/documentation_options\.js/ },
  { framework: "sphinx", language: "python", weight: WEIGHT.STRONG, name: "sphinx-theme-markup", html: /class=["'][^"']*sphinxsidebar|sphinx-highlight|_static\/searchtools\.js/ },
  { framework: "sphinx", language: "python", weight: WEIGHT.STRONG, name: "docutils-generator", html: /name=["']?generator["']?[^>]*content=["']?Docutils/i }
];
function headerLines(headers) {
  if (!headers)
    return "";
  return Object.entries(headers).map(([k, v]) => `${k.toLowerCase()}: ${String(v).toLowerCase()}`).join("\n");
}
function detectFromEvidence(input) {
  const html = input.html ?? "";
  const headers = headerLines(input.headers);
  const byFramework = /* @__PURE__ */ new Map();
  for (const signal of SIGNALS) {
    const headerHit = signal.header && headers && new RegExp(
      signal.header.source,
      signal.header.flags.includes("m") ? signal.header.flags : `${signal.header.flags}m`
    ).test(headers);
    const allHit = signal.allHtml && html && signal.allHtml.every((re) => re.test(html));
    const hit = signal.html && html && signal.html.test(html) || headerHit || allHit;
    if (!hit)
      continue;
    const existing = byFramework.get(signal.framework);
    if (existing) {
      existing.score += signal.weight;
      existing.matched.push(signal.name);
    } else {
      byFramework.set(signal.framework, {
        framework: signal.framework,
        language: signal.language,
        score: signal.weight,
        matched: [signal.name]
      });
    }
  }
  const ranked = [...byFramework.values()].sort((a, b) => b.score - a.score || a.framework.localeCompare(b.framework));
  const best = ranked[0];
  if (!best || best.score < SCORE_FLOOR) {
    return {
      framework: "unknown",
      language: "unknown",
      confidence: "low",
      score: best?.score ?? 0,
      matched: best?.matched ?? [],
      alternatives: ranked
    };
  }
  return {
    framework: best.framework,
    language: best.language,
    confidence: best.score >= WEIGHT.DECISIVE ? "high" : "medium",
    score: best.score,
    matched: best.matched,
    alternatives: ranked.slice(1)
  };
}

// src/frameworks/detector.ts
var PACKAGE_DEPENDENCIES = [
  // Meta-frameworks (check first - more specific)
  { framework: "nextjs", language: "typescript", packages: ["next"], meta_framework: "react" },
  { framework: "gatsby", language: "javascript", packages: ["gatsby"], meta_framework: "react" },
  { framework: "remix", language: "typescript", packages: ["@remix-run/react", "@remix-run/node"], meta_framework: "react" },
  { framework: "nuxt", language: "typescript", packages: ["nuxt", "nuxt3"], meta_framework: "vue" },
  { framework: "sveltekit", language: "typescript", packages: ["@sveltejs/kit"], meta_framework: "svelte" },
  { framework: "astro", language: "typescript", packages: ["astro"] },
  { framework: "solidjs", language: "typescript", packages: ["solid-js", "solid-start"] },
  { framework: "qwik", language: "typescript", packages: ["@builder.io/qwik"] },
  { framework: "eleventy", language: "javascript", packages: ["@11ty/eleventy"] },
  // Base frameworks
  { framework: "react", language: "javascript", packages: ["react", "react-dom"] },
  { framework: "vue", language: "javascript", packages: ["vue"] },
  { framework: "angular", language: "typescript", packages: ["@angular/core"] },
  { framework: "svelte", language: "javascript", packages: ["svelte"] },
  // HTMX (can be used with any backend)
  { framework: "htmx", language: "unknown", packages: ["htmx.org"] }
];
var GEMFILE_DEPENDENCIES = [
  { framework: "rails", language: "ruby", packages: ["rails"] },
  { framework: "hotwire", language: "ruby", packages: ["turbo-rails", "stimulus-rails"], meta_framework: "rails" },
  { framework: "jekyll", language: "ruby", packages: ["jekyll"] }
];
var PYTHON_DEPENDENCIES = [
  { framework: "django", language: "python", packages: ["django", "Django"] },
  { framework: "flask", language: "python", packages: ["flask", "Flask"] },
  { framework: "fastapi", language: "python", packages: ["fastapi", "FastAPI"] },
  { framework: "pelican", language: "python", packages: ["pelican", "Pelican"] }
];
var COMPOSER_DEPENDENCIES = [
  { framework: "laravel", language: "php", packages: ["laravel/framework"] },
  { framework: "symfony", language: "php", packages: ["symfony/framework-bundle", "symfony/symfony"] },
  { framework: "wordpress", language: "php", packages: ["johnpbloch/wordpress-core"] }
];
var JAVA_DEPENDENCIES = [
  { framework: "spring", language: "java", packages: ["spring-boot-starter-web", "org.springframework.boot"] }
];
var DOTNET_DEPENDENCIES = [
  { framework: "aspnet", language: "csharp", packages: ["Microsoft.AspNetCore", "Microsoft.NET.Sdk.Web"] }
];
var GO_DEPENDENCIES = [
  { framework: "hugo", language: "go", packages: ["github.com/gohugoio/hugo"] },
  { framework: "go", language: "go", packages: ["github.com/gin-gonic/gin", "github.com/labstack/echo", "github.com/gofiber/fiber"] }
];
var ELIXIR_DEPENDENCIES = [
  { framework: "phoenix", language: "elixir", packages: [":phoenix", "phoenix"] }
];
function detectFromPackageJson(packageJson) {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  for (const dep of PACKAGE_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (allDeps[pkg]) {
        return {
          framework: dep.framework,
          language: dep.language,
          version: allDeps[pkg],
          confidence: "high",
          detected_from: "package.json",
          meta_framework: dep.meta_framework
        };
      }
    }
  }
  return null;
}
function detectFromGemfile(gemfileContent) {
  const gemPattern = /gem\s+['"]([^'"]+)['"]/g;
  const gems = [];
  let match;
  while ((match = gemPattern.exec(gemfileContent)) !== null) {
    gems.push(match[1]);
  }
  for (const dep of GEMFILE_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (gems.includes(pkg)) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "gemfile",
          meta_framework: dep.meta_framework
        };
      }
    }
  }
  return null;
}
function detectFromPythonDeps(content) {
  for (const dep of PYTHON_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      const pattern = new RegExp(`(^|\\s)${pkg.toLowerCase()}[\\s=<>~!]`, "im");
      if (pattern.test(content.toLowerCase())) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "requirements"
        };
      }
    }
  }
  return null;
}
function detectFromComposerJson(composerJson) {
  const allDeps = {
    ...composerJson.require,
    ...composerJson["require-dev"]
  };
  for (const dep of COMPOSER_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (allDeps[pkg]) {
        return {
          framework: dep.framework,
          language: dep.language,
          version: allDeps[pkg],
          confidence: "high",
          detected_from: "composer"
        };
      }
    }
  }
  return null;
}
function detectFromPomXml(pomContent) {
  for (const dep of JAVA_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (pomContent.includes(pkg)) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "pom"
        };
      }
    }
  }
  return null;
}
function detectFromCsproj(csprojContent) {
  for (const dep of DOTNET_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (csprojContent.includes(pkg)) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "csproj"
        };
      }
    }
  }
  return null;
}
function detectFromGoMod(goModContent) {
  for (const dep of GO_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (goModContent.includes(pkg)) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "go.mod"
        };
      }
    }
  }
  return null;
}
function detectFromMixExs(mixContent) {
  for (const dep of ELIXIR_DEPENDENCIES) {
    for (const pkg of dep.packages) {
      if (mixContent.includes(pkg)) {
        return {
          framework: dep.framework,
          language: dep.language,
          confidence: "high",
          detected_from: "mix.exs"
        };
      }
    }
  }
  return null;
}
function detectFramework(options) {
  if (options.packageJson) {
    const result = detectFromPackageJson(options.packageJson);
    if (result)
      return result;
  }
  if (options.gemfileContent) {
    const result = detectFromGemfile(options.gemfileContent);
    if (result)
      return result;
  }
  if (options.requirementsContent) {
    const result = detectFromPythonDeps(options.requirementsContent);
    if (result)
      return result;
  }
  if (options.composerJson) {
    const result = detectFromComposerJson(options.composerJson);
    if (result)
      return result;
  }
  if (options.pomXmlContent) {
    const result = detectFromPomXml(options.pomXmlContent);
    if (result)
      return result;
  }
  if (options.csprojContent) {
    const result = detectFromCsproj(options.csprojContent);
    if (result)
      return result;
  }
  if (options.goModContent) {
    const result = detectFromGoMod(options.goModContent);
    if (result)
      return result;
  }
  if (options.mixExsContent) {
    const result = detectFromMixExs(options.mixExsContent);
    if (result)
      return result;
  }
  if (options.html || options.headers) {
    const result = detectFromEvidence({ html: options.html, headers: options.headers });
    if (result.framework !== "unknown") {
      return {
        framework: result.framework,
        language: result.language,
        confidence: result.confidence,
        detected_from: options.html ? "html" : "headers"
      };
    }
  }
  if (options.files) {
    if (options.files.some((f) => f.includes("next.config"))) {
      return { framework: "nextjs", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("nuxt.config"))) {
      return { framework: "nuxt", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("astro.config"))) {
      return { framework: "astro", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("svelte.config"))) {
      return { framework: "sveltekit", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("angular.json"))) {
      return { framework: "angular", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("gatsby-config"))) {
      return { framework: "gatsby", language: "javascript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("remix.config"))) {
      return { framework: "remix", language: "typescript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes(".eleventy.js") || f.includes("eleventy.config"))) {
      return { framework: "eleventy", language: "javascript", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f === "wp-config.php")) {
      return { framework: "wordpress", language: "php", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f === "artisan")) {
      return { framework: "laravel", language: "php", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("symfony.lock") || f.includes("config/bundles.php"))) {
      return { framework: "symfony", language: "php", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f === "manage.py")) {
      return { framework: "django", language: "python", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("pelicanconf.py"))) {
      return { framework: "pelican", language: "python", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f === "Gemfile") && options.files.some((f) => f.includes("config/routes.rb"))) {
      return { framework: "rails", language: "ruby", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f === "_config.yml") && options.files.some((f) => f === "Gemfile")) {
      return { framework: "jekyll", language: "ruby", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("hugo.toml") || f.includes("hugo.yaml") || f.includes("config.toml"))) {
      return { framework: "hugo", language: "go", confidence: "high", detected_from: "files" };
    }
    if (options.files.some((f) => f.includes("pom.xml") || f.includes("build.gradle"))) {
      if (options.files.some((f) => f.includes("src/main/resources/application"))) {
        return { framework: "spring", language: "java", confidence: "high", detected_from: "files" };
      }
    }
    if (options.files.some((f) => f.endsWith(".csproj"))) {
      return { framework: "aspnet", language: "csharp", confidence: "medium", detected_from: "files" };
    }
    if (options.files.some((f) => f === "mix.exs") && options.files.some((f) => f.includes("lib") && f.includes("_web"))) {
      return { framework: "phoenix", language: "elixir", confidence: "high", detected_from: "files" };
    }
  }
  return { framework: "unknown", language: "unknown", confidence: "low", detected_from: "html" };
}

// src/audit/checks/crawlability.ts
var LASTMOD_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/;
function validateLastmodValues(content) {
  const matches = content.match(/<lastmod>([^<]*)<\/lastmod>/g) || [];
  let invalidCount = 0;
  const now = Date.now();
  for (const match of matches) {
    const value = match.replace(/<\/?lastmod>/g, "").trim();
    const parsed = LASTMOD_PATTERN.test(value) ? new Date(value) : null;
    if (!parsed || isNaN(parsed.getTime()) || parsed.getTime() > now) {
      invalidCount++;
    }
  }
  return { count: matches.length, invalidCount };
}
async function checkRobotsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/robots.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status >= 500 || response.status === 429) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_SERVER_ERROR,
        affectedUrls: [url],
        details: { status: response.status }
      });
      return {
        issues,
        data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
      };
    }
    if (response.status >= 400) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_MISSING,
        affectedUrls: [url],
        ...response.status !== 404 && { details: { status: response.status } }
      });
      return {
        issues,
        data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
      };
    }
    const content = response.data;
    if (looksLikeHtmlFallback(content, response.headers?.["content-type"])) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_MISSING,
        affectedUrls: [url],
        details: { servedHtml: true }
      });
      return {
        issues,
        data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
      };
    }
    const lines = content.toLowerCase().split("\n");
    let blocksAll = false;
    let currentUserAgent = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("user-agent:")) {
        currentUserAgent = trimmed.split(":")[1].trim();
      }
      if (trimmed === "disallow: /" && currentUserAgent === "*") {
        blocksAll = true;
      }
    }
    if (blocksAll) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_BLOCKS_ALL,
        affectedUrls: [url]
      });
    }
    const sitemapUrls = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("sitemap:")) {
        const sitemapUrl = line.trim().substring(8).trim();
        sitemapUrls.push(sitemapUrl);
      }
    }
    return {
      issues,
      data: {
        exists: true,
        content,
        blocksAll,
        hasSitemap: sitemapUrls.length > 0,
        sitemapUrls
      }
    };
  } catch (error) {
    issues.push({
      ...ISSUE_DEFINITIONS.ROBOTS_TXT_MISSING,
      affectedUrls: [url],
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    });
    return {
      issues,
      data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
    };
  }
}
async function checkSitemap(baseUrl, robotsData) {
  const issues = [];
  const sitemapUrls = robotsData.sitemapUrls.length > 0 ? robotsData.sitemapUrls.slice(0, 3) : [
    new URL("/sitemap.xml", baseUrl).href,
    new URL("/sitemap_index.xml", baseUrl).href
  ];
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await httpGet(sitemapUrl, {
        timeout: 1e4,
        validateStatus: () => true
      });
      const content = response.data;
      if (response.status === 200 && (content.includes("<urlset") || content.includes("<sitemapindex"))) {
        const urlMatches = content.match(/<loc>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        if (!robotsData.hasSitemap) {
          issues.push({
            ...ISSUE_DEFINITIONS.SITEMAP_NOT_IN_ROBOTS,
            affectedUrls: [sitemapUrl]
          });
        }
        const { count: lastmodCount, invalidCount: invalidLastmodCount } = validateLastmodValues(content);
        if (lastmodCount === 0) {
          issues.push({
            ...ISSUE_DEFINITIONS.SITEMAP_LASTMOD_MISSING,
            affectedUrls: [sitemapUrl]
          });
        } else if (invalidLastmodCount > 0) {
          issues.push({
            ...ISSUE_DEFINITIONS.SITEMAP_LASTMOD_INVALID,
            affectedUrls: [sitemapUrl],
            details: { invalidCount: invalidLastmodCount, totalCount: lastmodCount }
          });
        }
        return {
          issues,
          data: { exists: true, url: sitemapUrl, urlCount, errors: [], lastmodCount, invalidLastmodCount }
        };
      }
    } catch {
    }
  }
  issues.push({
    ...ISSUE_DEFINITIONS.SITEMAP_MISSING,
    affectedUrls: [new URL("/sitemap.xml", baseUrl).href]
  });
  return {
    issues,
    data: { exists: false, urlCount: 0, errors: ["No sitemap found"] }
  };
}
async function checkRedirects(url) {
  const issues = [];
  const chain = [url];
  let currentUrl = url;
  let maxRedirects = 10;
  while (maxRedirects > 0) {
    try {
      const response = await httpGet(currentUrl, {
        timeout: 1e4,
        maxRedirects: 0,
        validateStatus: () => true
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.location;
        if (!location)
          break;
        const nextUrl = new URL(location, currentUrl).href;
        if (chain.includes(nextUrl)) {
          issues.push({
            ...ISSUE_DEFINITIONS.REDIRECT_LOOP,
            affectedUrls: chain,
            details: { chain, loopTo: nextUrl }
          });
          break;
        }
        chain.push(nextUrl);
        currentUrl = nextUrl;
        maxRedirects--;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  if (chain.length > 2) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_CHAIN,
      affectedUrls: chain,
      details: { chain, hops: chain.length - 1 }
    });
  }
  return { issues, chain, finalUrl: currentUrl };
}
async function runCrawlabilityChecks(baseUrl) {
  const allIssues = [];
  const robotsResult = await checkRobotsTxt(baseUrl);
  allIssues.push(...robotsResult.issues);
  const sitemapResult = await checkSitemap(baseUrl, robotsResult.data);
  allIssues.push(...sitemapResult.issues);
  const redirectResult = await checkRedirects(baseUrl);
  allIssues.push(...redirectResult.issues);
  return allIssues;
}

// src/audit/checks/on-page.ts
import * as cheerio from "https://esm.sh/cheerio@1.0.0";
var PREVIEW_HOST_SUFFIXES = [".vercel.app", ".netlify.app", ".pages.dev"];
function isPreviewDeploymentHost(hostname) {
  const host = hostname.toLowerCase();
  return PREVIEW_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}
function xRobotsTagHasNoindex(value) {
  if (!value)
    return false;
  const valued = /* @__PURE__ */ new Set(["unavailable_after", "max-snippet", "max-image-preview", "max-video-preview"]);
  let agent = null;
  for (const raw of value.toLowerCase().split(",")) {
    let part = raw.trim();
    const scoped = part.match(/^([a-z0-9_.*-]+)\s*:\s*(.*)$/);
    if (scoped && !valued.has(scoped[1])) {
      agent = scoped[1];
      part = scoped[2].trim();
    }
    if (part === "noindex" || part === "none") {
      if (agent === null || agent === "*" || agent === "googlebot" || agent === "bingbot")
        return true;
    }
  }
  return false;
}
function metaHasNoindex(content) {
  if (!content)
    return false;
  return content.toLowerCase().split(",").some((d) => ["noindex", "none"].includes(d.trim()));
}
function readRobotsDirectives(html, headers) {
  const $ = cheerio.load(html);
  const metaValues = [];
  $("meta[name]").each((_, el) => {
    const name = ($(el).attr("name") || "").toLowerCase();
    if (name === "robots" || name === "googlebot") {
      metaValues.push($(el).attr("content") || "");
    }
  });
  const metaNoindex = metaValues.some(metaHasNoindex);
  const xRobotsTag = headers ? Object.entries(headers).find(([k]) => k.toLowerCase() === "x-robots-tag")?.[1] : void 0;
  const headerNoindex = xRobotsTagHasNoindex(xRobotsTag);
  return { metaValues, metaNoindex, xRobotsTag, headerNoindex, hasNoindex: metaNoindex || headerNoindex };
}
function pageHasNoindex(html, headers) {
  return readRobotsDirectives(html, headers).hasNoindex;
}
function isSiteRoot(url) {
  try {
    const u = new URL(url);
    return (u.pathname === "/" || u.pathname === "") && !u.search;
  } catch {
    return false;
  }
}
function analyzeOnPage(html, url, headers, options = {}) {
  const issues = [];
  const $ = cheerio.load(html);
  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim();
  const canonical = $('link[rel="canonical"]').attr("href");
  const metaRobots = $('meta[name="robots"]').attr("content");
  const { metaValues: robotsMetaValues, metaNoindex, xRobotsTag: headerLookup, headerNoindex, hasNoindex } = readRobotsDirectives(html, headers);
  const h1s = [];
  $("h1").each((_, el) => {
    h1s.push($(el).text().trim());
  });
  const headings = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = parseInt(el.tagName.charAt(1), 10);
    headings.push({ level, text: $(el).text().trim() });
  });
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const textLength = bodyText.length;
  const htmlLength = html.length;
  const textToHtmlRatio = htmlLength > 0 ? textLength / htmlLength * 100 : 0;
  const data = {
    title: title || void 0,
    titleLength: title?.length || 0,
    description,
    descriptionLength: description?.length || 0,
    canonical,
    h1s,
    headings,
    wordCount,
    textToHtmlRatio,
    hasNoindex,
    metaRobots,
    xRobotsTag: headerLookup
  };
  if (!title) {
    issues.push({
      ...ISSUE_DEFINITIONS.TITLE_MISSING,
      affectedUrls: [url]
    });
  } else {
    if (title.length < 30) {
      issues.push({
        ...ISSUE_DEFINITIONS.TITLE_TOO_SHORT,
        affectedUrls: [url],
        details: { title, length: title.length }
      });
    } else if (title.length > 60) {
      issues.push({
        ...ISSUE_DEFINITIONS.TITLE_TOO_LONG,
        affectedUrls: [url],
        details: { title, length: title.length }
      });
    }
  }
  if (!description) {
    issues.push({
      ...ISSUE_DEFINITIONS.META_DESC_MISSING,
      affectedUrls: [url]
    });
  } else {
    if (description.length < 120) {
      issues.push({
        ...ISSUE_DEFINITIONS.META_DESC_TOO_SHORT,
        affectedUrls: [url],
        details: { description, length: description.length }
      });
    } else if (description.length > 160) {
      issues.push({
        ...ISSUE_DEFINITIONS.META_DESC_TOO_LONG,
        affectedUrls: [url],
        details: { description, length: description.length }
      });
    }
  }
  if (!canonical) {
    issues.push({
      ...ISSUE_DEFINITIONS.CANONICAL_MISSING,
      affectedUrls: [url]
    });
  }
  const canonicalCount = $('link[rel="canonical"]').length;
  if (canonicalCount > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.MULTIPLE_CANONICALS,
      affectedUrls: [url],
      details: { count: canonicalCount }
    });
  }
  if (h1s.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_MISSING,
      affectedUrls: [url]
    });
  } else if (h1s.length > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_MULTIPLE,
      affectedUrls: [url],
      details: { h1s, count: h1s.length }
    });
  }
  if (h1s.length === 1 && title && h1s[0].toLowerCase() === title.toLowerCase()) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_DUPLICATE_OF_TITLE,
      affectedUrls: [url],
      details: { h1: h1s[0], title }
    });
  }
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count === 0 && wordCount > 100) {
    issues.push({
      code: "H2_MISSING",
      severity: "warning",
      category: "on-page",
      title: "No H2 headings found",
      description: "No H2 tags were found on the page. H2 headings help structure content and improve readability.",
      impact: "Without H2 headings, search engines and users may find it harder to understand content structure. H2s are important for featuring in search results.",
      howToFix: "Break your content into logical sections using H2 headings. Include relevant keywords naturally in your H2 tags.",
      affectedUrls: [url]
    });
  }
  let previousLevel = 0;
  for (const heading of headings) {
    if (heading.level > previousLevel + 1 && previousLevel > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.HEADING_SKIP,
        affectedUrls: [url],
        details: { from: previousLevel, to: heading.level }
      });
      break;
    }
    previousLevel = heading.level;
  }
  if (wordCount < 300) {
    issues.push({
      ...ISSUE_DEFINITIONS.THIN_CONTENT,
      affectedUrls: [url],
      details: { wordCount }
    });
  }
  if (textToHtmlRatio < 10) {
    issues.push({
      ...ISSUE_DEFINITIONS.LOW_TEXT_HTML_RATIO,
      affectedUrls: [url],
      details: { ratio: textToHtmlRatio.toFixed(1) + "%" }
    });
  }
  const root = options.auditRoot ?? isSiteRoot(url);
  if (metaNoindex) {
    issues.push({
      ...ISSUE_DEFINITIONS.NOINDEX_TAG,
      severity: root ? "error" : "warning",
      affectedUrls: [url],
      details: { metaRobots: robotsMetaValues.join(", "), siteRoot: root }
    });
  }
  if (headerNoindex) {
    let preview = false;
    try {
      preview = isPreviewDeploymentHost(new URL(url).hostname);
    } catch {
    }
    issues.push({
      ...ISSUE_DEFINITIONS.NOINDEX_HEADER,
      severity: preview ? "notice" : root ? "error" : "warning",
      ...preview && {
        description: `${ISSUE_DEFINITIONS.NOINDEX_HEADER.description} This host is a preview-deployment domain (Vercel, Netlify or Cloudflare Pages), which adds this header to non-production deployments automatically - your production domain won't send it.`
      },
      affectedUrls: [url],
      details: { xRobotsTag: headerLookup, siteRoot: root, previewHost: preview }
    });
  }
  return { issues, data };
}

// src/audit/checks/links.ts
import * as cheerio2 from "https://esm.sh/cheerio@1.0.0";
async function analyzeLinks(html, baseUrl, checkBroken = false) {
  const issues = [];
  const $ = cheerio2.load(html);
  const baseHostname = new URL(baseUrl).hostname;
  const internal = [];
  const external = [];
  const brokenInternal = [];
  const brokenExternal = [];
  const jsOnlyNavigation = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    const rel = $(el).attr("rel") || "";
    const nofollow = rel.includes("nofollow");
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      return;
    }
    try {
      const fullUrl = new URL(href, baseUrl).href;
      const linkHostname = new URL(fullUrl).hostname;
      const isInternal = linkHostname === baseHostname;
      if (isInternal) {
        internal.push({ href: fullUrl, text, nofollow });
        if (nofollow) {
          issues.push({
            ...ISSUE_DEFINITIONS.NOFOLLOW_INTERNAL,
            affectedUrls: [baseUrl],
            details: { link: fullUrl, anchorText: text }
          });
        }
      } else {
        external.push({ href: fullUrl, text, nofollow });
      }
    } catch {
    }
  });
  const totalLinks = internal.length + external.length;
  const navPatterns = /navigate|router|history\.push|location\.href|window\.location|goto|redirect/i;
  const navTextPatterns = /^(home|about|contact|pricing|blog|docs|features|products?|services?|sign\s*up|log\s*in|register|dashboard|account|settings|help|faq|support|menu|nav)$/i;
  $("button[onclick], div[onclick], span[onclick], li[onclick]").each((_, el) => {
    const $el = $(el);
    const onclick = $el.attr("onclick") || "";
    const text = $el.text().trim().substring(0, 50);
    if (navPatterns.test(onclick) || navTextPatterns.test(text)) {
      jsOnlyNavigation.push({
        element: el.tagName.toLowerCase(),
        text: text || "(no text)",
        reason: "Element uses onClick for navigation instead of <a href>"
      });
    }
  });
  $("a[onclick]").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") || "";
    const onclick = $el.attr("onclick") || "";
    const text = $el.text().trim().substring(0, 50);
    if ((href === "#" || href === "" || href.startsWith("javascript:")) && onclick) {
      jsOnlyNavigation.push({
        element: "a",
        text: text || "(no text)",
        reason: `Link has href="${href}" with onClick - crawlers cannot follow this`
      });
    }
  });
  $("[data-href], [data-to], [data-link], [data-route]").each((_, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const text = $el.text().trim().substring(0, 50);
    if (tagName !== "a" || !$el.attr("href") || $el.attr("href") === "#") {
      jsOnlyNavigation.push({
        element: tagName,
        text: text || "(no text)",
        reason: "Uses data attribute for routing instead of real href"
      });
    }
  });
  if (jsOnlyNavigation.length > 0) {
    const uniqueNav = jsOnlyNavigation.slice(0, 10);
    issues.push({
      ...ISSUE_DEFINITIONS.JS_ONLY_NAVIGATION,
      affectedUrls: [baseUrl],
      details: {
        count: jsOnlyNavigation.length,
        examples: uniqueNav
      }
    });
  }
  const internalCount = internal.length;
  const externalCount = external.length;
  const internalToExternalRatio = externalCount > 0 ? internalCount / externalCount : null;
  if (totalLinks > 100) {
    issues.push({
      ...ISSUE_DEFINITIONS.TOO_MANY_LINKS,
      affectedUrls: [baseUrl],
      details: { totalLinks, internal: internalCount, external: externalCount }
    });
  }
  if (internalCount === 0 && totalLinks > 0) {
    issues.push({
      code: "LINKS_NO_INTERNAL",
      severity: "warning",
      category: "links",
      title: "No internal links found",
      description: "This page has no internal links to other pages on your site.",
      impact: "Internal links are crucial for SEO. They help search engines discover pages and distribute link equity throughout your site.",
      howToFix: "Add relevant internal links to related content, navigation, or related articles section.",
      affectedUrls: [baseUrl],
      details: { totalLinks, external: externalCount }
    });
  }
  if (externalCount === 0 && totalLinks > 5) {
    issues.push({
      code: "LINKS_NO_EXTERNAL",
      severity: "notice",
      category: "links",
      title: "No external links found",
      description: "This page has no links to external websites.",
      impact: "Linking to high-quality external sources can improve credibility and help search engines understand your content context.",
      howToFix: "Add links to authoritative external sources that support your content. This builds trust and provides value to readers.",
      affectedUrls: [baseUrl],
      details: { totalLinks, internal: internalCount }
    });
  }
  if (externalCount > internalCount && externalCount > 5 && internalCount < 3) {
    issues.push({
      code: "LINKS_RATIO_POOR",
      severity: "warning",
      category: "links",
      title: "Poor internal-to-external link ratio",
      description: `Page has ${externalCount} external links but only ${internalCount} internal links.`,
      impact: "A healthy page should have more internal links than external links. Too many external links can dilute page authority and may look spammy.",
      howToFix: "Add more relevant internal links to balance the ratio. Aim for at least 2-3 internal links for every external link.",
      affectedUrls: [baseUrl],
      details: {
        internal: internalCount,
        external: externalCount,
        ratio: internalToExternalRatio ? `1:${(1 / internalToExternalRatio).toFixed(1)}` : "N/A",
        recommendation: "Aim for a ratio of at least 2:1 (internal:external)"
      }
    });
  }
  if (checkBroken) {
    const internalToCheck = internal.slice(0, 10);
    for (const link of internalToCheck) {
      try {
        const response = await httpHead(link.href, {
          timeout: 5e3,
          maxRedirects: 5,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenInternal.push(link.href);
        }
      } catch {
        brokenInternal.push(link.href);
      }
    }
    const externalToCheck = external.slice(0, 5);
    for (const link of externalToCheck) {
      try {
        const response = await httpHead(link.href, {
          timeout: 5e3,
          maxRedirects: 5,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenExternal.push(link.href);
        }
      } catch {
      }
    }
    for (const brokenLink of brokenInternal) {
      issues.push({
        ...ISSUE_DEFINITIONS.BROKEN_INTERNAL_LINK,
        affectedUrls: [baseUrl],
        details: { brokenLink }
      });
    }
    for (const brokenLink of brokenExternal) {
      issues.push({
        ...ISSUE_DEFINITIONS.BROKEN_EXTERNAL_LINK,
        affectedUrls: [baseUrl],
        details: { brokenLink }
      });
    }
  }
  return {
    issues,
    data: {
      internal,
      external,
      totalLinks,
      brokenInternal,
      brokenExternal,
      jsOnlyNavigation,
      ratio: {
        internal: internalCount,
        external: externalCount,
        internalToExternalRatio
      }
    }
  };
}

// src/audit/checks/images.ts
import * as cheerio3 from "https://esm.sh/cheerio@1.0.0";
async function analyzeImages(html, baseUrl, checkBroken = false) {
  const issues = [];
  const $ = cheerio3.load(html);
  const missingAlt = [];
  const emptyAlt = [];
  const missingDimensions = [];
  const largeImages = [];
  const brokenImages = [];
  let lazyLoaded = 0;
  let withDimensions = 0;
  let total = 0;
  const images = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt");
    const width = $(el).attr("width");
    const height = $(el).attr("height");
    const loading = $(el).attr("loading");
    if (!src || src.startsWith("data:"))
      return;
    total++;
    images.push({ src, alt: alt === void 0 ? null : alt, width, height, loading });
    if (alt === void 0 || alt === null) {
      missingAlt.push({ src });
    } else if (alt === "") {
      emptyAlt.push({ src });
    }
    if (!width || !height) {
      missingDimensions.push({ src });
    } else {
      withDimensions++;
    }
    if (loading === "lazy") {
      lazyLoaded++;
    }
  });
  if (checkBroken) {
    const imagesToCheck = images.slice(0, 10);
    for (const img of imagesToCheck) {
      try {
        const fullUrl = new URL(img.src, baseUrl).href;
        const response = await httpHead(fullUrl, {
          timeout: 5e3,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenImages.push({ src: img.src });
        } else {
          const contentLength = parseInt(response.headers["content-length"] || "0", 10);
          if (contentLength > 200 * 1024) {
            largeImages.push({ src: img.src, size: contentLength });
          }
        }
      } catch {
      }
    }
  }
  if (missingAlt.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_ALT_MISSING,
      affectedUrls: [baseUrl],
      details: {
        count: missingAlt.length,
        images: missingAlt.slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (emptyAlt.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_ALT_EMPTY,
      affectedUrls: [baseUrl],
      details: {
        count: emptyAlt.length,
        images: emptyAlt.slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (missingDimensions.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_NO_DIMENSIONS,
      affectedUrls: [baseUrl],
      details: {
        count: missingDimensions.length,
        images: missingDimensions.slice(0, 5).map((i) => i.src)
      }
    });
  }
  for (const img of largeImages) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_TOO_LARGE,
      affectedUrls: [baseUrl],
      details: {
        src: img.src,
        size: img.size ? `${(img.size / 1024).toFixed(0)}KB` : "Unknown"
      }
    });
  }
  for (const img of brokenImages) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_BROKEN,
      affectedUrls: [baseUrl],
      details: { src: img.src }
    });
  }
  return {
    issues,
    data: {
      total,
      missingAlt,
      emptyAlt,
      missingDimensions,
      largImages: largeImages,
      brokenImages,
      lazyLoaded,
      withDimensions
    }
  };
}

// src/audit/checks/performance.ts
async function analyzePerformance(url) {
  const issues = [];
  const startTime = Date.now();
  try {
    const response = await httpGet(url, {
      headers: {
        "Accept-Encoding": "gzip, deflate, br"
      },
      timeout: 3e4,
      validateStatus: () => true
    });
    const loadTime = Date.now() - startTime;
    const ttfbTime = Math.min(loadTime, loadTime * 0.3);
    const htmlSize = typeof response.data === "string" ? response.data.length : 0;
    const contentEncoding = response.headers["content-encoding"];
    const cacheControl = response.headers["cache-control"];
    const compressed = !!contentEncoding && ["gzip", "deflate", "br"].some((e) => contentEncoding.includes(e));
    const data = {
      loadTime,
      ttfb: ttfbTime || loadTime,
      htmlSize,
      compressed,
      cacheControl,
      contentEncoding
    };
    if (loadTime > 3e3) {
      issues.push({
        ...ISSUE_DEFINITIONS.SLOW_PAGE,
        affectedUrls: [url],
        details: { loadTime: `${(loadTime / 1e3).toFixed(1)}s` }
      });
    }
    if (ttfbTime > 600) {
      issues.push({
        ...ISSUE_DEFINITIONS.SLOW_TTFB,
        affectedUrls: [url],
        details: { ttfb: `${ttfbTime}ms` }
      });
    }
    if (htmlSize > 100 * 1024) {
      issues.push({
        ...ISSUE_DEFINITIONS.HTML_TOO_LARGE,
        affectedUrls: [url],
        details: { size: `${(htmlSize / 1024).toFixed(0)}KB` }
      });
    }
    if (!compressed && htmlSize > 1024) {
      issues.push({
        ...ISSUE_DEFINITIONS.UNCOMPRESSED,
        affectedUrls: [url],
        details: { htmlSize: `${(htmlSize / 1024).toFixed(0)}KB` }
      });
    }
    if (!cacheControl) {
      issues.push({
        ...ISSUE_DEFINITIONS.NO_CACHE,
        affectedUrls: [url]
      });
    }
    return { issues, data };
  } catch (error) {
    return {
      issues: [{
        ...ISSUE_DEFINITIONS.SLOW_PAGE,
        affectedUrls: [url],
        details: { error: error instanceof Error ? error.message : "Request failed" }
      }],
      data: {
        loadTime: 0,
        ttfb: 0,
        htmlSize: 0,
        compressed: false
      }
    };
  }
}
async function fetchCoreWebVitals(url, apiKey) {
  if (!apiKey)
    return null;
  try {
    const response = await httpPost(
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${apiKey}`,
      { url },
      { timeout: 1e4 }
    );
    const metrics = response.data?.record?.metrics;
    if (!metrics)
      return null;
    const getRating = (value, thresholds) => {
      if (value <= thresholds[0])
        return "good";
      if (value <= thresholds[1])
        return "needs-improvement";
      return "poor";
    };
    return {
      lcp: metrics.largest_contentful_paint?.percentiles?.p75 ? {
        value: metrics.largest_contentful_paint.percentiles.p75,
        rating: getRating(metrics.largest_contentful_paint.percentiles.p75, [2500, 4e3])
      } : void 0,
      fid: metrics.first_input_delay?.percentiles?.p75 ? {
        value: metrics.first_input_delay.percentiles.p75,
        rating: getRating(metrics.first_input_delay.percentiles.p75, [100, 300])
      } : void 0,
      cls: metrics.cumulative_layout_shift?.percentiles?.p75 ? {
        value: metrics.cumulative_layout_shift.percentiles.p75,
        rating: getRating(metrics.cumulative_layout_shift.percentiles.p75, [0.1, 0.25])
      } : void 0,
      inp: metrics.interaction_to_next_paint?.percentiles?.p75 ? {
        value: metrics.interaction_to_next_paint.percentiles.p75,
        rating: getRating(metrics.interaction_to_next_paint.percentiles.p75, [200, 500])
      } : void 0
    };
  } catch {
    return null;
  }
}

// src/audit/checks/security.ts
import * as cheerio4 from "https://esm.sh/cheerio@1.0.0";
async function analyzeSecurity(html, url, headers) {
  const issues = [];
  const $ = cheerio4.load(html);
  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === "https:";
  if (!isHttps) {
    issues.push({
      ...ISSUE_DEFINITIONS.NOT_HTTPS,
      affectedUrls: [url]
    });
  }
  const mixedContentUrls = [];
  if (isHttps) {
    $("script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    $('link[rel="stylesheet"][href]').each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http://")) {
        mixedContentUrls.push(href);
      }
    });
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    $("iframe[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    if (mixedContentUrls.length > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.MIXED_CONTENT,
        affectedUrls: [url],
        details: {
          count: mixedContentUrls.length,
          resources: mixedContentUrls.slice(0, 5)
        }
      });
    }
  }
  const hstsHeader = headers["strict-transport-security"];
  const hasHsts = !!hstsHeader;
  let hstsMaxAge;
  if (hstsHeader) {
    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      hstsMaxAge = parseInt(maxAgeMatch[1], 10);
    }
  } else if (isHttps) {
    issues.push({
      ...ISSUE_DEFINITIONS.HSTS_MISSING,
      affectedUrls: [url]
    });
  }
  const data = {
    isHttps,
    hasMixedContent: mixedContentUrls.length > 0,
    mixedContentUrls,
    hasHsts,
    hstsMaxAge
  };
  return { issues, data };
}
async function checkCertificate(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:") {
    return { valid: false, issues };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    await fetch(url, {
      method: "HEAD",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { valid: true, issues };
  } catch (error) {
    return { valid: false, issues };
  }
}

// src/audit/checks/structured-data.ts
import * as cheerio5 from "https://esm.sh/cheerio@1.0.0";
var SCHEMA_REQUIRED_PROPERTIES = {
  "Organization": ["name", "url"],
  "WebSite": ["name", "url"],
  "WebPage": ["name"],
  "Article": ["headline", "author", "datePublished"],
  "BlogPosting": ["headline", "author", "datePublished"],
  "NewsArticle": ["headline", "author", "datePublished"],
  "Product": ["name", "image"],
  "LocalBusiness": ["name", "address"],
  "Person": ["name"],
  "Event": ["name", "startDate", "location"],
  "Recipe": ["name", "image", "recipeIngredient"],
  "FAQPage": ["mainEntity"],
  "HowTo": ["name", "step"],
  "BreadcrumbList": ["itemListElement"],
  "SoftwareApplication": ["name", "operatingSystem"],
  "VideoObject": ["name", "description", "thumbnailUrl", "uploadDate"],
  "ImageObject": ["contentUrl"],
  "Review": ["itemReviewed", "author"],
  "AggregateRating": ["ratingValue", "reviewCount"],
  "Offer": ["price", "priceCurrency"]
};
var SCHEMA_RECOMMENDED_PROPERTIES = {
  "Organization": ["logo", "sameAs", "contactPoint"],
  "Article": ["image", "publisher", "dateModified"],
  "Product": ["description", "offers", "brand", "review", "aggregateRating"],
  "LocalBusiness": ["telephone", "openingHours", "geo"],
  "SoftwareApplication": ["applicationCategory", "offers", "aggregateRating"],
  "VideoObject": ["duration", "embedUrl"]
};
function analyzeStructuredData(html, url) {
  const issues = [];
  const $ = cheerio5.load(html);
  const schemas2 = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (!content)
      return;
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@graph"]) {
          for (const graphItem of item["@graph"]) {
            const schemaItem = validateSchemaItem(graphItem);
            schemas2.push(schemaItem);
          }
        } else {
          const schemaItem = validateSchemaItem(item);
          schemas2.push(schemaItem);
        }
      }
    } catch (e) {
      issues.push({
        ...ISSUE_DEFINITIONS.SCHEMA_INVALID,
        affectedUrls: [url],
        details: {
          error: e instanceof Error ? e.message : "Invalid JSON",
          content: content.substring(0, 200)
        }
      });
    }
  });
  if (schemas2.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  for (const schema4 of schemas2) {
    if (schema4.errors.length > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.SCHEMA_MISSING_REQUIRED,
        affectedUrls: [url],
        details: {
          type: schema4.type,
          missingProperties: schema4.errors
        }
      });
    }
  }
  const schemaTypes = schemas2.map((s) => s.type).filter(Boolean);
  return {
    issues,
    data: {
      schemas: schemas2,
      hasSchema: schemas2.length > 0,
      schemaTypes
    }
  };
}
function validateSchemaItem(item) {
  const type = item["@type"] || "Unknown";
  const errors = [];
  const warnings = [];
  const required = SCHEMA_REQUIRED_PROPERTIES[type] || [];
  for (const prop of required) {
    if (!item[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  }
  const recommended = SCHEMA_RECOMMENDED_PROPERTIES[type] || [];
  for (const prop of recommended) {
    if (!item[prop]) {
      warnings.push(`Missing recommended property: ${prop}`);
    }
  }
  if (type === "BreadcrumbList") {
    const items = item["itemListElement"];
    if (items && Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const crumb = items[i];
        if (!crumb["position"]) {
          errors.push(`Breadcrumb item ${i + 1} missing position`);
        }
        if (!crumb["name"] && !crumb["item"]) {
          errors.push(`Breadcrumb item ${i + 1} missing name or item`);
        }
      }
    }
  }
  if (type === "FAQPage") {
    const mainEntity = item["mainEntity"];
    if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
      errors.push("FAQPage must have at least one question in mainEntity");
    } else {
      for (let i = 0; i < mainEntity.length; i++) {
        const qa = mainEntity[i];
        if (!qa["name"]) {
          errors.push(`FAQ item ${i + 1} missing question (name)`);
        }
        if (!qa["acceptedAnswer"]) {
          errors.push(`FAQ item ${i + 1} missing answer (acceptedAnswer)`);
        }
      }
    }
  }
  if (type === "Product" && item["offers"]) {
    const offers = item["offers"];
    if (!offers["price"] && !offers["lowPrice"]) {
      warnings.push("Product offers should include price");
    }
    if (!offers["availability"]) {
      warnings.push("Product offers should include availability");
    }
  }
  return {
    type,
    data: item,
    errors,
    warnings
  };
}
function suggestSchemaTypes(html, url) {
  const $ = cheerio5.load(html);
  const suggestions = [];
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/" || path === "") {
    suggestions.push("Organization", "WebSite");
  }
  if (path.includes("/blog") || path.includes("/article") || path.includes("/post") || path.includes("/news")) {
    suggestions.push("Article", "BlogPosting");
  }
  if (path.includes("/product") || path.includes("/shop") || path.includes("/item")) {
    suggestions.push("Product");
  }
  if (path.includes("/faq") || path.includes("/help") || $('h2:contains("FAQ"), h3:contains("FAQ")').length > 0) {
    suggestions.push("FAQPage");
  }
  if (path.includes("/contact") || path.includes("/about")) {
    suggestions.push("Organization", "LocalBusiness");
  }
  if (path.includes("/pricing") || $('meta[name="application-name"]').length > 0) {
    suggestions.push("SoftwareApplication");
  }
  if ($('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').length > 0) {
    suggestions.push("BreadcrumbList");
  }
  return [...new Set(suggestions)];
}

// src/audit/checks/mobile.ts
import * as cheerio6 from "https://esm.sh/cheerio@1.0.0";
function analyzeMobile(html, url) {
  const issues = [];
  const $ = cheerio6.load(html);
  const viewportMeta = $('meta[name="viewport"]');
  const hasViewport = viewportMeta.length > 0;
  const viewportContent = viewportMeta.attr("content");
  if (!hasViewport) {
    issues.push({
      ...ISSUE_DEFINITIONS.VIEWPORT_MISSING,
      affectedUrls: [url]
    });
  } else if (viewportContent) {
    const isResponsive = viewportContent.includes("width=device-width");
    if (!isResponsive) {
      const widthMatch = viewportContent.match(/width=(\d+)/);
      if (widthMatch) {
        issues.push({
          ...ISSUE_DEFINITIONS.VIEWPORT_NOT_RESPONSIVE,
          affectedUrls: [url],
          details: {
            viewport: viewportContent,
            fixedWidth: widthMatch[1]
          }
        });
      }
    }
    if (viewportContent.includes("user-scalable=no") || viewportContent.includes("user-scalable=0")) {
      issues.push({
        code: "VIEWPORT_NO_ZOOM",
        severity: "warning",
        category: "mobile",
        title: "Viewport prevents zooming",
        description: "The viewport meta tag disables user scaling.",
        impact: "Users with visual impairments cannot zoom the page.",
        howToFix: "Remove user-scalable=no from the viewport meta tag.",
        affectedUrls: [url]
      });
    }
  }
  let tapTargetIssues = 0;
  $("a, button, input, select, textarea").each((_, el) => {
    const style = $(el).attr("style") || "";
    const heightMatch = style.match(/height:\s*(\d+)px/);
    const widthMatch = style.match(/width:\s*(\d+)px/);
    if (heightMatch && parseInt(heightMatch[1], 10) < 44) {
      tapTargetIssues++;
    }
    if (widthMatch && parseInt(widthMatch[1], 10) < 44) {
      tapTargetIssues++;
    }
  });
  if (tapTargetIssues > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.TAP_TARGETS_TOO_SMALL,
      affectedUrls: [url],
      details: { count: tapTargetIssues }
    });
  }
  let fontSizeIssues = 0;
  $("body *").each((_, el) => {
    const style = $(el).attr("style") || "";
    const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
    if (fontSizeMatch && parseInt(fontSizeMatch[1], 10) < 12) {
      fontSizeIssues++;
    }
  });
  return {
    issues,
    data: {
      hasViewport,
      viewportContent,
      isResponsive: hasViewport && (viewportContent?.includes("width=device-width") || false),
      tapTargetIssues,
      fontSizeIssues
    }
  };
}
function checkMobileResources(html, url) {
  const issues = [];
  const $ = cheerio6.load(html);
  if ($('object[type*="flash"], embed[type*="flash"]').length > 0) {
    issues.push({
      code: "FLASH_CONTENT",
      severity: "error",
      category: "mobile",
      title: "Flash content detected",
      description: "Page contains Flash content which is not supported on mobile devices.",
      impact: "Content is inaccessible on mobile devices and most modern browsers.",
      howToFix: "Replace Flash content with HTML5 alternatives.",
      affectedUrls: [url]
    });
  }
  if ($("object, embed, applet").length > 0) {
    issues.push({
      code: "PLUGINS_DETECTED",
      severity: "notice",
      category: "mobile",
      title: "Plugins detected",
      description: "Page uses plugins which may not work on mobile devices.",
      impact: "Some content may not be accessible on mobile.",
      howToFix: "Consider replacing plugins with standard web technologies.",
      affectedUrls: [url]
    });
  }
  let fixedWidthElements = 0;
  $("*").each((_, el) => {
    const style = $(el).attr("style") || "";
    const widthMatch = style.match(/width:\s*(\d+)px/);
    if (widthMatch && parseInt(widthMatch[1], 10) > 320) {
      fixedWidthElements++;
    }
  });
  if (fixedWidthElements > 5) {
    issues.push({
      code: "POSSIBLE_HORIZONTAL_SCROLL",
      severity: "notice",
      category: "mobile",
      title: "Possible horizontal scrolling",
      description: "Multiple elements have fixed widths that may cause horizontal scrolling on mobile.",
      impact: "Poor mobile user experience.",
      howToFix: "Use responsive widths (percentages, max-width) instead of fixed pixel widths.",
      affectedUrls: [url],
      details: { count: fixedWidthElements }
    });
  }
  return issues;
}

// src/audit/checks/hreflang.ts
import * as cheerio7 from "https://esm.sh/cheerio@1.0.0";
var VALID_LANG_CODES = /* @__PURE__ */ new Set([
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "zh",
  "ko",
  "ar",
  "hi",
  "nl",
  "sv",
  "pl",
  "tr",
  "da",
  "fi",
  "no",
  "cs",
  "el",
  "he",
  "hu",
  "id",
  "ms",
  "th",
  "vi",
  "uk",
  "ro",
  "bg",
  "hr",
  "sk",
  "sl",
  "et",
  "lv",
  "lt",
  "sr",
  "ca",
  "eu",
  "gl",
  "af",
  "sw",
  "x-default"
]);
function isValidHreflang(lang) {
  const parts = lang.toLowerCase().split("-");
  if (parts[0] === "x" && parts[1] === "default")
    return true;
  if (!VALID_LANG_CODES.has(parts[0]))
    return false;
  if (parts[1] && parts[1].length !== 2)
    return false;
  return true;
}
async function analyzeHreflang(html, url, options = {}) {
  const issues = [];
  const $ = cheerio7.load(html);
  const entries = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr("hreflang") || "";
    const href = $(el).attr("href") || "";
    const isValid = isValidHreflang(lang);
    const isSelfReference = normalizeUrl(href) === normalizeUrl(url);
    entries.push({ lang, href, isValid, isSelfReference });
  });
  const hasHreflang = entries.length > 0;
  const hasSelfReference = entries.some((e) => e.isSelfReference);
  const hasXDefault = entries.some((e) => e.lang.toLowerCase() === "x-default");
  const data = {
    hasHreflang,
    entries,
    hasSelfReference,
    hasXDefault
  };
  if (!hasHreflang) {
    return { issues, data };
  }
  const invalidEntries = entries.filter((e) => !e.isValid);
  if (invalidEntries.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_INVALID,
      affectedUrls: [url],
      details: { invalidLanguages: invalidEntries.map((e) => e.lang) }
    });
  }
  if (!hasSelfReference) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_SELF_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasXDefault && entries.length > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_X_DEFAULT_MISSING,
      affectedUrls: [url]
    });
  }
  if (options.validateUrls) {
    for (const entry of entries) {
      if (!entry.isSelfReference && entry.href) {
        try {
          const response = await httpHead(entry.href, {
            timeout: 5e3,
            maxRedirects: 0,
            validateStatus: () => true
          });
          entry.statusCode = response.status;
          if (response.status >= 300) {
            issues.push({
              ...ISSUE_DEFINITIONS.HREFLANG_TO_NON_200,
              affectedUrls: [url],
              details: {
                targetUrl: entry.href,
                lang: entry.lang,
                statusCode: response.status
              }
            });
          }
        } catch {
          entry.statusCode = 0;
          issues.push({
            ...ISSUE_DEFINITIONS.HREFLANG_TO_NON_200,
            affectedUrls: [url],
            details: {
              targetUrl: entry.href,
              lang: entry.lang,
              statusCode: "unreachable"
            }
          });
        }
      }
    }
    for (const entry of entries) {
      if (!entry.isSelfReference && entry.href && entry.statusCode === 200) {
        try {
          const response = await httpGet(entry.href, { timeout: 5e3 });
          const $target = cheerio7.load(response.data);
          const hasReturnLink = $target(`link[rel="alternate"][hreflang][href*="${new URL(url).hostname}"]`).length > 0;
          if (!hasReturnLink) {
            issues.push({
              ...ISSUE_DEFINITIONS.HREFLANG_NO_RETURN,
              affectedUrls: [url],
              details: {
                targetUrl: entry.href,
                lang: entry.lang
              }
            });
          }
        } catch {
        }
      }
    }
  }
  return { issues, data };
}
function normalizeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return urlStr;
  }
}

// src/audit/checks/social-meta.ts
import * as cheerio8 from "https://esm.sh/cheerio@1.0.0";
function analyzeSocialMeta(html, url) {
  const issues = [];
  const $ = cheerio8.load(html);
  const openGraph = {
    title: $('meta[property="og:title"]').attr("content"),
    description: $('meta[property="og:description"]').attr("content"),
    image: $('meta[property="og:image"]').attr("content"),
    url: $('meta[property="og:url"]').attr("content"),
    type: $('meta[property="og:type"]').attr("content"),
    siteName: $('meta[property="og:site_name"]').attr("content")
  };
  const twitter = {
    card: $('meta[name="twitter:card"]').attr("content"),
    title: $('meta[name="twitter:title"]').attr("content"),
    description: $('meta[name="twitter:description"]').attr("content"),
    image: $('meta[name="twitter:image"]').attr("content"),
    site: $('meta[name="twitter:site"]').attr("content"),
    creator: $('meta[name="twitter:creator"]').attr("content")
  };
  const hasFavicon = $('link[rel="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0 || $('link[rel="apple-touch-icon"]').length > 0;
  const langAttribute = $("html").attr("lang");
  const data = {
    openGraph,
    twitter,
    hasFavicon,
    langAttribute
  };
  if (!openGraph.title) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_TITLE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.description) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_DESCRIPTION_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.image) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_IMAGE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.url) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_URL_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.type) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_TYPE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!twitter.card) {
    issues.push({
      ...ISSUE_DEFINITIONS.TWITTER_CARD_MISSING,
      affectedUrls: [url]
    });
  }
  if (!twitter.image && !openGraph.image) {
    issues.push({
      ...ISSUE_DEFINITIONS.TWITTER_IMAGE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasFavicon) {
    issues.push({
      ...ISSUE_DEFINITIONS.FAVICON_MISSING,
      affectedUrls: [url]
    });
  }
  if (!langAttribute) {
    issues.push({
      ...ISSUE_DEFINITIONS.LANG_ATTR_MISSING,
      affectedUrls: [url]
    });
  }
  return { issues, data };
}

// src/audit/checks/soft-404.ts
import * as cheerio9 from "https://esm.sh/cheerio@1.0.0";
var ERROR_PHRASES = [
  "page not found",
  "404",
  "not found",
  "page doesn't exist",
  "page does not exist",
  "no longer available",
  "has been removed",
  "has been deleted",
  "couldn't find",
  "could not find",
  "doesn't exist",
  "does not exist",
  "no results found",
  "nothing found",
  "sorry, we couldn't find",
  "oops",
  "error occurred",
  "something went wrong",
  "page you requested",
  "page you were looking for",
  "this page isn't available",
  "this page is not available",
  "we can't find",
  "we cannot find"
];
var ERROR_TITLE_PATTERNS = [
  /404/i,
  /not found/i,
  /page.*not.*found/i,
  /error/i,
  /oops/i
];
function detectSoft404(html, url, statusCode = 200) {
  const issues = [];
  const $ = cheerio9.load(html);
  const signals = [];
  let score = 0;
  if (statusCode !== 200) {
    return {
      issues,
      data: { isSoft404: false, confidence: 0, signals: [] }
    };
  }
  const title = $("title").text().toLowerCase();
  const bodyText = $("body").text().toLowerCase().replace(/\s+/g, " ");
  const h1 = $("h1").first().text().toLowerCase();
  for (const pattern of ERROR_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      score += 30;
      signals.push(`Title matches error pattern: "${title.substring(0, 50)}"`);
      break;
    }
  }
  for (const pattern of ERROR_TITLE_PATTERNS) {
    if (pattern.test(h1)) {
      score += 25;
      signals.push(`H1 matches error pattern: "${h1.substring(0, 50)}"`);
      break;
    }
  }
  let errorPhraseCount = 0;
  for (const phrase of ERROR_PHRASES) {
    if (bodyText.includes(phrase)) {
      errorPhraseCount++;
      if (errorPhraseCount <= 3) {
        signals.push(`Body contains error phrase: "${phrase}"`);
      }
    }
  }
  score += Math.min(errorPhraseCount * 10, 30);
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 100) {
    score += 15;
    signals.push(`Very thin content: ${wordCount} words`);
  }
  const hasSearchForm = $('form[action*="search"]').length > 0 || $('input[type="search"]').length > 0 || $('input[name="q"]').length > 0 || $('input[name="search"]').length > 0;
  if (hasSearchForm && score > 20) {
    score += 10;
    signals.push("Page has search form (common on 404 pages)");
  }
  const errorClasses = ["error", "404", "not-found", "notfound", "page-error"];
  for (const cls of errorClasses) {
    if ($(`[class*="${cls}"]`).length > 0) {
      score += 10;
      signals.push(`Found error-related CSS class containing "${cls}"`);
      break;
    }
  }
  const confidence = Math.min(score, 100);
  const isSoft404 = confidence >= 50;
  const data = {
    isSoft404,
    confidence,
    signals
  };
  if (isSoft404) {
    issues.push({
      ...ISSUE_DEFINITIONS.SOFT_404,
      affectedUrls: [url],
      details: {
        confidence: `${confidence}%`,
        signals: signals.slice(0, 5)
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/anchor-text.ts
import * as cheerio10 from "https://esm.sh/cheerio@1.0.0";
var GENERIC_ANCHORS = /* @__PURE__ */ new Set([
  "click here",
  "click",
  "here",
  "read more",
  "more",
  "learn more",
  "see more",
  "view more",
  "continue",
  "continue reading",
  "link",
  "this",
  "this link",
  "go",
  "details",
  "more details",
  "more info",
  "info",
  "read",
  "view",
  "see",
  "download",
  "get it",
  "get"
]);
function analyzeAnchorText(html, url) {
  const issues = [];
  const $ = cheerio10.load(html);
  const baseUrl = new URL(url);
  const anchorCounts = {};
  let totalLinks = 0;
  let internalLinks = 0;
  let externalLinks = 0;
  let emptyAnchors = 0;
  let genericAnchors = 0;
  const emptyAnchorUrls = [];
  const genericAnchorExamples = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().toLowerCase();
    const ariaLabel = $(el).attr("aria-label")?.trim();
    const title = $(el).attr("title")?.trim();
    if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    totalLinks++;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      internalLinks++;
    }
    const hasAccessibleText = text.length > 0 || ariaLabel || title;
    if (!hasAccessibleText) {
      emptyAnchors++;
      if (emptyAnchorUrls.length < 5) {
        emptyAnchorUrls.push(href);
      }
      return;
    }
    if (GENERIC_ANCHORS.has(text)) {
      genericAnchors++;
      if (genericAnchorExamples.length < 5) {
        genericAnchorExamples.push(text);
      }
    }
    if (text.length > 0) {
      anchorCounts[text] = (anchorCounts[text] || 0) + 1;
    }
  });
  const topAnchors = Object.entries(anchorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count }));
  const data = {
    totalLinks,
    internalLinks,
    externalLinks,
    emptyAnchors,
    genericAnchors,
    anchorDistribution: anchorCounts,
    topAnchors
  };
  if (emptyAnchors > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_EMPTY,
      affectedUrls: [url],
      details: {
        count: emptyAnchors,
        examples: emptyAnchorUrls
      }
    });
  }
  const genericRatio = totalLinks > 0 ? genericAnchors / totalLinks : 0;
  if (genericAnchors >= 3 && genericRatio > 0.2) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_GENERIC,
      affectedUrls: [url],
      details: {
        count: genericAnchors,
        ratio: `${(genericRatio * 100).toFixed(1)}%`,
        examples: genericAnchorExamples
      }
    });
  }
  const overOptimizedAnchors = [];
  for (const [text, count] of Object.entries(anchorCounts)) {
    if (text.length < 3 || text.length > 50)
      continue;
    if (["home", "about", "contact", "blog", "services", "products"].includes(text))
      continue;
    if (count > 5 && count / internalLinks > 0.15) {
      overOptimizedAnchors.push(`"${text}" (${count} times)`);
    }
  }
  if (overOptimizedAnchors.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_OVER_OPTIMIZED,
      affectedUrls: [url],
      details: {
        overOptimized: overOptimizedAnchors
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/canonical-advanced.ts
import * as cheerio11 from "https://esm.sh/cheerio@1.0.0";
async function analyzeCanonicalAdvanced(html, url, options = {}) {
  const issues = [];
  const $ = cheerio11.load(html);
  const canonicalLink = $('link[rel="canonical"]').attr("href");
  const baseUrl = new URL(url);
  const data = {
    canonical: canonicalLink,
    isSelfReferencing: false,
    isCrossDomain: false
  };
  if (!canonicalLink) {
    return { issues, data };
  }
  let canonicalUrl;
  try {
    canonicalUrl = new URL(canonicalLink, url);
  } catch {
    return { issues, data };
  }
  const normalizedUrl = normalizeUrl2(url);
  const normalizedCanonical = normalizeUrl2(canonicalUrl.href);
  data.isSelfReferencing = normalizedUrl === normalizedCanonical;
  if (canonicalUrl.hostname !== baseUrl.hostname) {
    data.isCrossDomain = true;
    issues.push({
      ...ISSUE_DEFINITIONS.CANONICAL_CROSS_DOMAIN,
      affectedUrls: [url],
      details: {
        canonical: canonicalUrl.href,
        sourceDomain: baseUrl.hostname,
        targetDomain: canonicalUrl.hostname
      }
    });
  }
  if (options.checkChain && !data.isSelfReferencing) {
    const chain = await followCanonicalChain(canonicalUrl.href, [url]);
    if (chain.length > 2) {
      data.canonicalChain = chain;
      data.finalCanonical = chain[chain.length - 1];
      issues.push({
        ...ISSUE_DEFINITIONS.CANONICAL_CHAIN,
        affectedUrls: [url],
        details: {
          chain,
          depth: chain.length
        }
      });
    }
  }
  if (options.sitemapUrls && options.sitemapUrls.length > 0) {
    const sitemapNormalized = options.sitemapUrls.map(normalizeUrl2);
    const urlInSitemap = sitemapNormalized.includes(normalizedUrl);
    const canonicalInSitemap = sitemapNormalized.includes(normalizedCanonical);
    if (urlInSitemap && !canonicalInSitemap && !data.isSelfReferencing) {
      issues.push({
        ...ISSUE_DEFINITIONS.CANONICAL_MISMATCH_SITEMAP,
        affectedUrls: [url],
        details: {
          pageUrl: url,
          canonical: canonicalUrl.href,
          message: "Page is in sitemap but its canonical URL is not"
        }
      });
    }
  }
  return { issues, data };
}
async function followCanonicalChain(url, chain = [], maxDepth = 5) {
  if (chain.length >= maxDepth)
    return chain;
  try {
    const response = await httpGet(url, {
      timeout: 5e3,
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });
    const $ = cheerio11.load(response.data);
    const nextCanonical = $('link[rel="canonical"]').attr("href");
    if (!nextCanonical) {
      return [...chain, url];
    }
    const resolvedCanonical = new URL(nextCanonical, url).href;
    const normalizedCurrent = normalizeUrl2(url);
    const normalizedNext = normalizeUrl2(resolvedCanonical);
    if (normalizedCurrent === normalizedNext) {
      return [...chain, url];
    }
    if (chain.some((u) => normalizeUrl2(u) === normalizedNext)) {
      return [...chain, url, resolvedCanonical + " (circular)"];
    }
    return followCanonicalChain(resolvedCanonical, [...chain, url], maxDepth);
  } catch {
    return [...chain, url];
  }
}
function normalizeUrl2(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/$/, "")}`;
  } catch {
    return urlStr.toLowerCase().replace(/\/$/, "");
  }
}

// src/audit/checks/pagination.ts
import * as cheerio12 from "https://esm.sh/cheerio@1.0.0";
function analyzePagination(html, url, canonical) {
  const issues = [];
  const $ = cheerio12.load(html);
  const nextLink = $('link[rel="next"]').attr("href");
  const prevLink = $('link[rel="prev"]').attr("href");
  const paginationLinks = [];
  const paginationPatterns = [
    /[?&]page=\d+/,
    /[?&]p=\d+/,
    /\/page\/\d+/,
    /\/p\/\d+/,
    /-page-\d+/,
    /\/\d+\/?$/
  ];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const pattern of paginationPatterns) {
      if (pattern.test(href)) {
        try {
          const fullUrl = new URL(href, url).href;
          if (!paginationLinks.includes(fullUrl)) {
            paginationLinks.push(fullUrl);
          }
        } catch {
        }
        break;
      }
    }
  });
  const hasInfiniteScrollScript = html.includes("infinite-scroll") || html.includes("infiniteScroll") || html.includes("infinite_scroll") || $("[data-infinite-scroll]").length > 0 || $("[data-infinite]").length > 0 || $(".infinite-scroll").length > 0;
  const loadMoreSelectors = [
    'button:contains("Load More")',
    'button:contains("Load more")',
    'button:contains("Show More")',
    'button:contains("Show more")',
    'a:contains("Load More")',
    'a:contains("Load more")',
    '[class*="load-more"]',
    '[class*="loadmore"]',
    "[data-load-more]"
  ];
  let hasLoadMoreButton = false;
  for (const selector of loadMoreSelectors) {
    try {
      if ($(selector).length > 0) {
        hasLoadMoreButton = true;
        break;
      }
    } catch {
    }
  }
  let currentPage;
  let totalPages;
  const pageMatch = url.match(/[?&]page=(\d+)|\/page\/(\d+)|[?&]p=(\d+)/);
  if (pageMatch) {
    currentPage = parseInt(pageMatch[1] || pageMatch[2] || pageMatch[3], 10);
  }
  const pageOfPattern = /page\s*(\d+)\s*of\s*(\d+)/i;
  const pageOfMatch = $("body").text().match(pageOfPattern);
  if (pageOfMatch) {
    currentPage = parseInt(pageOfMatch[1], 10);
    totalPages = parseInt(pageOfMatch[2], 10);
  }
  const hasPagination = paginationLinks.length > 0 || nextLink !== void 0 || prevLink !== void 0 || currentPage !== void 0;
  const hasHtmlPaginationLinks = paginationLinks.length > 0;
  const data = {
    hasPagination,
    hasHtmlPaginationLinks,
    hasInfiniteScroll: hasInfiniteScrollScript,
    hasLoadMoreButton,
    paginationLinks,
    relNextPrev: {
      hasNext: !!nextLink,
      hasPrev: !!prevLink,
      nextUrl: nextLink,
      prevUrl: prevLink
    },
    currentPage,
    totalPages
  };
  if (hasInfiniteScrollScript && !hasHtmlPaginationLinks) {
    issues.push({
      ...ISSUE_DEFINITIONS.INFINITE_SCROLL_NO_FALLBACK,
      affectedUrls: [url],
      details: {
        hasLoadMore: hasLoadMoreButton,
        suggestion: "Add <a href> pagination links alongside infinite scroll for SEO"
      }
    });
  }
  if (hasLoadMoreButton && !hasHtmlPaginationLinks && !hasInfiniteScrollScript) {
    issues.push({
      ...ISSUE_DEFINITIONS.PAGINATION_NO_LINKS,
      affectedUrls: [url],
      details: {
        suggestion: 'Ensure "Load More" button also has underlying <a> links'
      }
    });
  }
  if (hasPagination && currentPage && currentPage > 1 && canonical) {
    const isCanonicalToPage1 = !paginationPatterns.some((p) => p.test(canonical));
    const urlHasPageNumber = paginationPatterns.some((p) => p.test(url));
    if (isCanonicalToPage1 && urlHasPageNumber) {
      issues.push({
        ...ISSUE_DEFINITIONS.PAGINATION_CANONICAL_ISSUE,
        affectedUrls: [url],
        details: {
          currentPage,
          canonical,
          suggestion: "Paginated pages should self-reference or point to a View All page"
        }
      });
    }
  }
  return { issues, data };
}

// src/audit/checks/redirect-analysis.ts
async function analyzeRedirects(url, maxHops = 10) {
  const issues = [];
  const chain = [];
  const visitedUrls = /* @__PURE__ */ new Set();
  let currentUrl = url;
  let isLoop = false;
  while (chain.length < maxHops) {
    if (visitedUrls.has(currentUrl)) {
      isLoop = true;
      break;
    }
    visitedUrls.add(currentUrl);
    try {
      const response = await httpHead(currentUrl, {
        timeout: 5e3,
        maxRedirects: 0,
        validateStatus: () => true
      });
      const hop = {
        url: currentUrl,
        statusCode: response.status
      };
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers["location"];
        if (location) {
          hop.location = location;
          chain.push(hop);
          currentUrl = new URL(location, currentUrl).href;
          continue;
        }
      }
      chain.push(hop);
      break;
    } catch (error) {
      chain.push({
        url: currentUrl,
        statusCode: 0
      });
      break;
    }
  }
  const hasRedirect = chain.length > 1;
  const finalUrl = chain.length > 0 ? chain[chain.length - 1].url : url;
  const data = {
    hasRedirect,
    redirectChain: chain,
    isLoop,
    finalUrl,
    totalHops: chain.length - 1
  };
  if (isLoop) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_LOOP,
      affectedUrls: [url],
      details: {
        chain: chain.map((h) => `${h.url} (${h.statusCode})`)
      }
    });
  }
  if (!isLoop && chain.length > 2) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_CHAIN,
      affectedUrls: [url],
      details: {
        chain: chain.map((h) => `${h.url} (${h.statusCode})`),
        hops: chain.length - 1,
        finalUrl
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/ai-readiness.ts
import * as cheerio13 from "https://esm.sh/cheerio@1.0.0";

// src/audit/checks/agent-experience.ts
var SIGNAL_PATHS = [
  { path: "/llms-full.txt", description: "Full-site content dump for AI agents \u2014 the fuller sibling of llms.txt, measured as fetched roughly 2x more often" },
  { path: "/skill.md", description: "SKILL.md capability manifest (Anthropic Agent Skills convention)" },
  { path: "/mcp", description: "MCP (Model Context Protocol) server, discoverable at a conventional path" },
  { path: "/.well-known/mcp.json", description: "MCP server descriptor at the .well-known convention" },
  { path: "/openapi.json", description: "OpenAPI spec \u2014 lets an agent discover and call your API directly instead of scraping HTML" },
  { path: "/.well-known/ai-plugin.json", description: "AI plugin manifest (older but still-referenced convention for agent tool discovery)" }
];
async function fetchBody(baseUrl, path) {
  try {
    const url = new URL(path, baseUrl).href;
    const response = await httpGet(url, {
      timeout: 8e3,
      validateStatus: () => true
    });
    return { status: response.status, body: String(response.data ?? "") };
  } catch {
    return null;
  }
}
async function pathExists(baseUrl, path, fallbackBody) {
  const result = await fetchBody(baseUrl, path);
  if (!result)
    return false;
  if (result.status === 404)
    return false;
  if (result.status < 200 || result.status >= 400)
    return false;
  if (fallbackBody != null && result.body === fallbackBody)
    return false;
  return true;
}
async function checkAgentExperience(baseUrl) {
  const issues = [];
  const probePath = `/__rankcli_ax_probe_${Math.random().toString(36).slice(2)}`;
  const baseline = await fetchBody(baseUrl, probePath);
  const fallbackBody = baseline && baseline.status >= 200 && baseline.status < 400 ? baseline.body : null;
  const signals = await Promise.all(
    SIGNAL_PATHS.map(async ({ path, description }) => ({
      path,
      description,
      present: await pathExists(baseUrl, path, fallbackBody)
    }))
  );
  const presentCount = signals.filter((s) => s.present).length;
  const score = Math.round(presentCount / signals.length * 100);
  if (presentCount === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_AGENT_EXPERIENCE_SURFACE,
      affectedUrls: [baseUrl],
      details: { checkedPaths: SIGNAL_PATHS.map((s) => s.path) }
    });
  }
  return { issues, data: { signals, score } };
}

// src/audit/checks/ai-readiness.ts
var AI_BOTS = {
  GPTBot: "GPTBot",
  "ChatGPT-User": "ChatGPT-User",
  "OAI-SearchBot": "OAI-SearchBot",
  ClaudeBot: "ClaudeBot",
  "Claude-Web": "Claude-Web",
  "anthropic-ai": "anthropic-ai",
  PerplexityBot: "PerplexityBot",
  "Google-Extended": "Google-Extended",
  Bytespider: "Bytespider",
  CCBot: "CCBot"
};
async function checkLlmsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/llms.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      issues.push({
        ...ISSUE_DEFINITIONS.LLMS_TXT_MISSING,
        affectedUrls: [url]
      });
      return {
        issues,
        data: { exists: false, valid: false, errors: ["File not found"] }
      };
    }
    const content = response.data;
    if (looksLikeHtmlFallback(content, response.headers?.["content-type"])) {
      issues.push({
        ...ISSUE_DEFINITIONS.LLMS_TXT_MISSING,
        affectedUrls: [url]
      });
      return { issues, data: { exists: false, valid: false, errors: ["File not found (the site served HTML)"] } };
    }
    const lines = content.split("\n").filter((line) => line.trim());
    const errors = [];
    let valid = true;
    if (lines.length === 0) {
      errors.push("File is empty");
      valid = false;
    } else if (!lines[0].startsWith("#")) {
      errors.push("File should start with a markdown heading (# Site Name)");
      valid = false;
    }
    const hasDescription = content.toLowerCase().includes("## ") || content.length > 50;
    if (!hasDescription) {
      errors.push("File should contain meaningful content describing your site for AI");
      valid = false;
    }
    if (!valid) {
      issues.push({
        ...ISSUE_DEFINITIONS.LLMS_TXT_INVALID,
        affectedUrls: [url],
        details: { errors }
      });
    }
    return {
      issues,
      data: { exists: true, content, valid, errors }
    };
  } catch (error) {
    issues.push({
      ...ISSUE_DEFINITIONS.LLMS_TXT_MISSING,
      affectedUrls: [url],
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    });
    return {
      issues,
      data: { exists: false, valid: false, errors: ["Failed to fetch"] }
    };
  }
}
function parseContentSignal(robotsTxtContent) {
  for (const line of robotsTxtContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("content-signal:")) {
      return trimmed.substring(trimmed.indexOf(":") + 1).trim();
    }
  }
  return null;
}
async function checkAIBotBlocking(baseUrl) {
  const issues = [];
  const url = new URL("/robots.txt", baseUrl).href;
  const blockedBots = [];
  const allowedBots = [];
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      return {
        issues,
        data: {
          robotsExists: false,
          blockedBots: [],
          allowedBots: Object.keys(AI_BOTS),
          allBlocked: false,
          contentSignal: null
        }
      };
    }
    const content = response.data;
    const lines = content.split("\n");
    const contentSignal = parseContentSignal(content);
    let currentUserAgent = "";
    const botRules = {};
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("content-signal:")) {
        continue;
      } else if (trimmed.startsWith("user-agent:")) {
        currentUserAgent = trimmed.split(":")[1].trim();
      } else if (trimmed.startsWith("disallow:")) {
        const path = trimmed.split(":")[1]?.trim() || "";
        for (const [botKey, botName] of Object.entries(AI_BOTS)) {
          if (currentUserAgent === "*" || currentUserAgent === botKey.toLowerCase() || currentUserAgent === botName.toLowerCase()) {
            if (path === "/" || path === "/*") {
              if (!botRules[botKey]) {
                botRules[botKey] = { allowed: false, disallowAll: false };
              }
              if (currentUserAgent !== "*" || currentUserAgent === "*" && !botRules[botKey].allowed) {
                botRules[botKey].disallowAll = true;
              }
            }
          }
        }
      } else if (trimmed.startsWith("allow:")) {
        for (const [botKey] of Object.entries(AI_BOTS)) {
          if (currentUserAgent === botKey.toLowerCase()) {
            if (!botRules[botKey]) {
              botRules[botKey] = { allowed: true, disallowAll: false };
            }
            botRules[botKey].allowed = true;
          }
        }
      }
    }
    for (const [botKey] of Object.entries(AI_BOTS)) {
      const rules = botRules[botKey];
      if (rules?.disallowAll && !rules?.allowed) {
        blockedBots.push(botKey);
      } else {
        allowedBots.push(botKey);
      }
    }
    if (blockedBots.length === Object.keys(AI_BOTS).length) {
      issues.push({
        ...ISSUE_DEFINITIONS.AI_BOT_BLOCKED_ALL,
        affectedUrls: [url],
        details: { blockedBots }
      });
    } else {
      if (blockedBots.includes("GPTBot") || blockedBots.includes("ChatGPT-User")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_GPTBOT_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("ClaudeBot") || blockedBots.includes("Claude-Web") || blockedBots.includes("anthropic-ai")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_CLAUDEBOT_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("PerplexityBot")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_PERPLEXITY_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("Google-Extended")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_GOOGLE_EXTENDED_BLOCKED,
          affectedUrls: [url]
        });
      }
    }
    return {
      issues,
      data: {
        robotsExists: true,
        blockedBots,
        allowedBots,
        allBlocked: blockedBots.length === Object.keys(AI_BOTS).length,
        contentSignal
      }
    };
  } catch (error) {
    return {
      issues,
      data: {
        robotsExists: false,
        blockedBots: [],
        allowedBots: Object.keys(AI_BOTS),
        allBlocked: false,
        contentSignal: null
      }
    };
  }
}
function checkJSRenderingRatio(html, url) {
  const issues = [];
  const $ = cheerio13.load(html);
  $("script, style, noscript").remove();
  const staticText = $("body").text().replace(/\s+/g, " ").trim();
  const staticWordCount = staticText.split(/\s+/).filter((word) => word.length > 0).length;
  const hasReactRoot = $("#root, #app, #__next, [data-reactroot]").length > 0;
  const hasVueApp = $("#app[data-v-app], [data-v-]").length > 0;
  const hasAngularApp = $("[ng-app], [data-ng-app]").length > 0;
  const hasEmptyBody = staticWordCount < 50;
  let ratio = 0;
  if (hasEmptyBody && (hasReactRoot || hasVueApp || hasAngularApp)) {
    ratio = 90;
  } else if (hasReactRoot || hasVueApp || hasAngularApp) {
    ratio = 50;
  } else if (staticWordCount < 100) {
    ratio = 60;
  } else {
    ratio = 10;
  }
  const hasNoScript = $("noscript").length > 0;
  if (hasNoScript && ratio > 50) {
    ratio -= 20;
  }
  if (ratio > 50) {
    issues.push({
      ...ISSUE_DEFINITIONS.HIGH_JS_RENDERING_RATIO,
      affectedUrls: [url],
      details: { ratio: `${ratio}%`, staticWordCount }
    });
  }
  return {
    issues,
    data: { ratio, staticWordCount }
  };
}
async function checkCloudflareAICrawlerGate(baseUrl, botBlocking) {
  const issues = [];
  let behindCloudflare = false;
  try {
    const response = await httpGet(baseUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    const server = response.headers["server"] || "";
    behindCloudflare = server.toLowerCase().includes("cloudflare") || "cf-ray" in response.headers;
  } catch {
    behindCloudflare = false;
  }
  const hasExplicitAIRules = botBlocking.robotsExists && (botBlocking.blockedBots.length > 0 || !!botBlocking.contentSignal);
  const ambiguous = behindCloudflare && !hasExplicitAIRules;
  if (ambiguous) {
    issues.push({
      ...ISSUE_DEFINITIONS.CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS,
      affectedUrls: [baseUrl]
    });
  }
  return {
    issues,
    data: { behindCloudflare, hasExplicitAIRules, ambiguous }
  };
}
async function runAIReadinessChecks(baseUrl, html) {
  const allIssues = [];
  const llmsResult = await checkLlmsTxt(baseUrl);
  allIssues.push(...llmsResult.issues);
  const botResult = await checkAIBotBlocking(baseUrl);
  allIssues.push(...botResult.issues);
  const jsResult = checkJSRenderingRatio(html, baseUrl);
  allIssues.push(...jsResult.issues);
  const cfGateResult = await checkCloudflareAICrawlerGate(baseUrl, botResult.data);
  allIssues.push(...cfGateResult.issues);
  const agentExperienceResult = await checkAgentExperience(baseUrl);
  allIssues.push(...agentExperienceResult.issues);
  return {
    issues: allIssues,
    data: {
      llmsTxt: llmsResult.data,
      botBlocking: botResult.data,
      jsRenderingRatio: jsResult.data.ratio,
      cloudflareAIGate: cfGateResult.data,
      agentExperience: agentExperienceResult.data
    }
  };
}

// src/audit/checks/serp-preview.ts
import * as cheerio14 from "https://esm.sh/cheerio@1.0.0";
var CHAR_WIDTHS = {
  // Lowercase letters
  a: 9,
  b: 9,
  c: 8,
  d: 9,
  e: 9,
  f: 5,
  g: 9,
  h: 9,
  i: 4,
  j: 4,
  k: 8,
  l: 4,
  m: 14,
  n: 9,
  o: 9,
  p: 9,
  q: 9,
  r: 6,
  s: 8,
  t: 5,
  u: 9,
  v: 8,
  w: 12,
  x: 8,
  y: 8,
  z: 7,
  // Uppercase letters
  A: 11,
  B: 10,
  C: 10,
  D: 11,
  E: 9,
  F: 9,
  G: 11,
  H: 11,
  I: 4,
  J: 8,
  K: 10,
  L: 8,
  M: 13,
  N: 11,
  O: 12,
  P: 10,
  Q: 12,
  R: 10,
  S: 10,
  T: 9,
  U: 11,
  V: 10,
  W: 14,
  X: 10,
  Y: 10,
  Z: 9,
  // Numbers
  "0": 9,
  "1": 9,
  "2": 9,
  "3": 9,
  "4": 9,
  "5": 9,
  "6": 9,
  "7": 9,
  "8": 9,
  "9": 9,
  // Common punctuation and spaces
  " ": 4,
  ".": 4,
  ",": 4,
  "!": 4,
  "?": 8,
  "-": 5,
  "_": 8,
  ":": 4,
  ";": 4,
  "'": 3,
  '"': 6,
  "(": 5,
  ")": 5,
  "[": 5,
  "]": 5,
  "/": 5,
  "|": 4,
  "&": 10,
  "@": 14,
  "#": 9,
  "$": 9,
  "%": 12,
  "^": 7,
  "*": 6,
  "+": 9,
  "=": 9
};
var DEFAULT_CHAR_WIDTH = 9;
var TITLE_MAX_PIXELS = 580;
var DESCRIPTION_MAX_PIXELS_DESKTOP = 920;
var DESCRIPTION_MAX_PIXELS_MOBILE = 680;
function calculatePixelWidth(text) {
  let width = 0;
  for (const char of text) {
    width += CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH;
  }
  return width;
}
function truncateToPixels(text, maxPixels) {
  let width = 0;
  let truncated = false;
  for (let i = 0; i < text.length; i++) {
    const charWidth = CHAR_WIDTHS[text[i]] ?? DEFAULT_CHAR_WIDTH;
    if (width + charWidth > maxPixels - 20) {
      truncated = true;
      return { text: text.substring(0, i) + "...", truncated };
    }
    width += charWidth;
  }
  return { text, truncated };
}
function formatSERPUrl(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const breadcrumbs = [domain, ...pathParts];
    const display = breadcrumbs.join(" \u203A ");
    return { display, breadcrumbs };
  } catch {
    return { display: url, breadcrumbs: [url] };
  }
}
function analyzeSERPPreview(html, url) {
  const issues = [];
  const $ = cheerio14.load(html);
  const rawTitle = $("title").text().trim() || "";
  const titlePixels = calculatePixelWidth(rawTitle);
  const titleTruncated = truncateToPixels(rawTitle, TITLE_MAX_PIXELS);
  const rawDescription = $('meta[name="description"]').attr("content")?.trim() || $('meta[property="og:description"]').attr("content")?.trim() || "";
  const descPixelsDesktop = calculatePixelWidth(rawDescription);
  const descPixelsMobile = calculatePixelWidth(rawDescription);
  const descTruncatedDesktop = truncateToPixels(rawDescription, DESCRIPTION_MAX_PIXELS_DESKTOP);
  const descTruncatedMobile = truncateToPixels(rawDescription, DESCRIPTION_MAX_PIXELS_MOBILE);
  const urlData = formatSERPUrl(url);
  if (titleTruncated.truncated) {
    issues.push({
      ...ISSUE_DEFINITIONS.TITLE_TRUNCATED_SERP,
      affectedUrls: [url],
      details: {
        pixelWidth: titlePixels,
        maxPixels: TITLE_MAX_PIXELS,
        charLength: rawTitle.length,
        displayPreview: titleTruncated.text
      }
    });
  }
  if (descTruncatedDesktop.truncated) {
    issues.push({
      ...ISSUE_DEFINITIONS.META_DESC_TRUNCATED_SERP,
      affectedUrls: [url],
      details: {
        pixelWidth: descPixelsDesktop,
        maxPixels: DESCRIPTION_MAX_PIXELS_DESKTOP,
        charLength: rawDescription.length,
        displayPreview: descTruncatedDesktop.text
      }
    });
  }
  const data = {
    title: {
      text: rawTitle,
      charLength: rawTitle.length,
      pixelWidth: titlePixels,
      truncated: titleTruncated.truncated,
      displayText: titleTruncated.text
    },
    description: {
      text: rawDescription,
      charLength: rawDescription.length,
      pixelWidthDesktop: descPixelsDesktop,
      pixelWidthMobile: descPixelsMobile,
      truncatedDesktop: descTruncatedDesktop.truncated,
      truncatedMobile: descTruncatedMobile.truncated,
      displayTextDesktop: descTruncatedDesktop.text,
      displayTextMobile: descTruncatedMobile.text
    },
    url: urlData,
    preview: {
      desktop: generateDesktopPreview(titleTruncated.text, descTruncatedDesktop.text, urlData.display),
      mobile: generateMobilePreview(titleTruncated.text, descTruncatedMobile.text, urlData.display)
    }
  };
  return { issues, data };
}
function generateDesktopPreview(title, description, url) {
  const maxWidth = 60;
  const titleLine = title.length > maxWidth ? title.substring(0, maxWidth - 3) + "..." : title;
  const urlLine = url.length > maxWidth ? url.substring(0, maxWidth - 3) + "..." : url;
  const descLines = wrapText(description, maxWidth);
  return [
    "\u250C" + "\u2500".repeat(maxWidth + 2) + "\u2510",
    "\u2502 " + titleLine.padEnd(maxWidth) + " \u2502",
    "\u2502 " + urlLine.padEnd(maxWidth) + " \u2502",
    ...descLines.map((line) => "\u2502 " + line.padEnd(maxWidth) + " \u2502"),
    "\u2514" + "\u2500".repeat(maxWidth + 2) + "\u2518"
  ].join("\n");
}
function generateMobilePreview(title, description, url) {
  const maxWidth = 40;
  const titleLine = title.length > maxWidth ? title.substring(0, maxWidth - 3) + "..." : title;
  const urlLine = url.length > maxWidth ? url.substring(0, maxWidth - 3) + "..." : url;
  const descLines = wrapText(description, maxWidth);
  return [
    "\u250C" + "\u2500".repeat(maxWidth + 2) + "\u2510",
    "\u2502 " + titleLine.padEnd(maxWidth) + " \u2502",
    "\u2502 " + urlLine.padEnd(maxWidth) + " \u2502",
    ...descLines.slice(0, 2).map((line) => "\u2502 " + line.padEnd(maxWidth) + " \u2502"),
    "\u2514" + "\u2500".repeat(maxWidth + 2) + "\u2518"
  ].join("\n");
}
function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxWidth) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine)
        lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine)
    lines.push(currentLine);
  return lines;
}

// src/audit/checks/local-seo.ts
import * as cheerio15 from "https://esm.sh/cheerio@1.0.0";
var PHONE_PATTERNS = [
  /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  // US/Canada
  /\+?[0-9]{1,3}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
  // International
  /\b[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}\b/g
  // Simple US format
];
var ADDRESS_PATTERNS = [
  /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|circle|cir|place|pl)[\s,]+[\w\s]+,?\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\s*\d{5}/gi,
  /\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/gi
  // Generic US address
];
function extractSchema(html) {
  const $ = cheerio15.load(html);
  let hasLocalBusiness = false;
  let hasOrganization = false;
  let schemaData = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content)
        return;
      const jsonData = JSON.parse(content);
      const schemas2 = Array.isArray(jsonData) ? jsonData : [jsonData];
      for (const schema4 of schemas2) {
        const items = schema4["@graph"] || [schema4];
        for (const item of items) {
          const type = item["@type"];
          const localBusinessTypes = [
            "LocalBusiness",
            "Restaurant",
            "Store",
            "MedicalBusiness",
            "FinancialService",
            "FoodEstablishment",
            "HealthAndBeautyBusiness",
            "HomeAndConstructionBusiness",
            "LegalService",
            "RealEstateAgent",
            "SportsActivityLocation"
          ];
          if (localBusinessTypes.some((t) => type === t || Array.isArray(type) && type.includes(t))) {
            hasLocalBusiness = true;
            schemaData = {
              name: item.name,
              address: formatAddress(item.address),
              phone: item.telephone,
              hours: item.openingHours,
              geo: item.geo ? { lat: item.geo.latitude, lng: item.geo.longitude } : void 0
            };
          }
          if (type === "Organization" || type === "Corporation" || type === "Person") {
            hasOrganization = true;
            if (!schemaData) {
              schemaData = {
                name: item.name,
                address: formatAddress(item.address),
                phone: item.telephone
              };
            }
          }
        }
      }
    } catch {
    }
  });
  return { hasLocalBusiness, hasOrganization, schemaData };
}
function formatAddress(address) {
  if (!address)
    return void 0;
  if (typeof address === "string")
    return address;
  if (typeof address === "object" && address !== null) {
    const a = address;
    return [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry].filter(Boolean).join(", ");
  }
  return void 0;
}
function detectPhones(html) {
  const $ = cheerio15.load(html);
  const text = $("body").text();
  const phones = /* @__PURE__ */ new Set();
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      phones.add(href.replace("tel:", "").trim());
    }
  });
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => phones.add(m.trim()));
    }
  }
  return Array.from(phones).filter((phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  });
}
function detectAddresses(html) {
  const $ = cheerio15.load(html);
  const text = $("body").text();
  const addresses = /* @__PURE__ */ new Set();
  for (const pattern of ADDRESS_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => addresses.add(m.trim()));
    }
  }
  $('[itemprop="address"]').each((_, el) => {
    const addr = $(el).text().trim();
    if (addr)
      addresses.add(addr);
  });
  return Array.from(addresses);
}
function detectSocialProfiles(html) {
  const $ = cheerio15.load(html);
  const profiles = [];
  const socialDomains = [
    "facebook.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "tiktok.com",
    "pinterest.com",
    "github.com"
  ];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href)
      return;
    for (const domain of socialDomains) {
      if (href.includes(domain)) {
        try {
          const url = new URL(href);
          if (!profiles.includes(url.href)) {
            profiles.push(url.href);
          }
        } catch {
        }
        break;
      }
    }
  });
  return profiles;
}
function analyzeLocalSEO(html, url) {
  const issues = [];
  const { hasLocalBusiness, hasOrganization, schemaData } = extractSchema(html);
  const detectedPhones = detectPhones(html);
  const detectedAddresses = detectAddresses(html);
  const socialProfiles = detectSocialProfiles(html);
  if (!hasLocalBusiness) {
    issues.push({
      ...ISSUE_DEFINITIONS.LOCAL_BUSINESS_SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasOrganization && !hasLocalBusiness) {
    issues.push({
      ...ISSUE_DEFINITIONS.ORGANIZATION_SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  const $ = cheerio15.load(html);
  const isBusinessPage = $('a[href^="tel:"]').length > 0 || $('a[href^="mailto:"]').length > 0 || html.toLowerCase().includes("contact") || html.toLowerCase().includes("about us");
  if (isBusinessPage) {
    if (detectedAddresses.length === 0 && !schemaData?.address) {
      issues.push({
        ...ISSUE_DEFINITIONS.ADDRESS_NOT_DETECTED,
        affectedUrls: [url]
      });
    }
    if (detectedPhones.length === 0 && !schemaData?.phone) {
      issues.push({
        ...ISSUE_DEFINITIONS.PHONE_NOT_DETECTED,
        affectedUrls: [url]
      });
    }
  }
  if (socialProfiles.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.SOCIAL_PROFILES_NOT_LINKED,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasLocalBusinessSchema: hasLocalBusiness,
      hasOrganizationSchema: hasOrganization,
      detectedPhones,
      detectedAddresses,
      schemaData,
      socialProfiles
    }
  };
}

// src/audit/checks/security-headers.ts
function parseHSTS(header) {
  if (!header) {
    return { maxAge: null, includeSubdomains: false, preload: false };
  }
  const result = { maxAge: null, includeSubdomains: false, preload: false };
  const maxAgeMatch = header.match(/max-age=(\d+)/i);
  if (maxAgeMatch) {
    result.maxAge = parseInt(maxAgeMatch[1], 10);
  }
  result.includeSubdomains = /includesubdomains/i.test(header);
  result.preload = /preload/i.test(header);
  return result;
}
async function analyzeSecurityHeaders(url) {
  const issues = [];
  try {
    const response = await httpGet(url, {
      timeout: 15e3,
      validateStatus: () => true,
      maxRedirects: 5
    });
    const headers = response.headers;
    let isHttps = false;
    try {
      const parsedUrl = new URL(url);
      isHttps = parsedUrl.protocol === "https:";
    } catch {
      isHttps = url.toLowerCase().startsWith("https://");
    }
    const getHeader = (name) => {
      const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
      return key ? headers[key] : null;
    };
    const hsts = getHeader("strict-transport-security");
    const csp = getHeader("content-security-policy");
    const xFrameOptions = getHeader("x-frame-options");
    const xContentTypeOptions = getHeader("x-content-type-options");
    const referrerPolicy = getHeader("referrer-policy");
    const permissionsPolicy = getHeader("permissions-policy") || getHeader("feature-policy");
    const hstsData = parseHSTS(hsts);
    if (!isHttps) {
      issues.push({
        ...ISSUE_DEFINITIONS.NOT_HTTPS,
        affectedUrls: [url]
      });
    }
    if (isHttps && !hsts) {
      issues.push({
        ...ISSUE_DEFINITIONS.HSTS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!csp) {
      issues.push({
        ...ISSUE_DEFINITIONS.CSP_MISSING,
        affectedUrls: [url]
      });
    }
    if (!xFrameOptions) {
      issues.push({
        ...ISSUE_DEFINITIONS.X_FRAME_OPTIONS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!xContentTypeOptions) {
      issues.push({
        ...ISSUE_DEFINITIONS.X_CONTENT_TYPE_OPTIONS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!referrerPolicy) {
      issues.push({
        ...ISSUE_DEFINITIONS.REFERRER_POLICY_MISSING,
        affectedUrls: [url]
      });
    }
    if (!permissionsPolicy) {
      issues.push({
        ...ISSUE_DEFINITIONS.PERMISSIONS_POLICY_MISSING,
        affectedUrls: [url]
      });
    }
    return {
      issues,
      data: {
        https: isHttps,
        headers: {
          hsts,
          csp,
          xFrameOptions,
          xContentTypeOptions,
          referrerPolicy,
          permissionsPolicy
        },
        hstsMaxAge: hstsData.maxAge,
        hstsIncludesSubdomains: hstsData.includeSubdomains,
        hstsPreload: hstsData.preload
      }
    };
  } catch (error) {
    let isHttps = false;
    try {
      const parsedUrl = new URL(url);
      isHttps = parsedUrl.protocol === "https:";
    } catch {
      isHttps = url.toLowerCase().startsWith("https://");
    }
    return {
      issues,
      data: {
        https: isHttps,
        headers: {
          hsts: null,
          csp: null,
          xFrameOptions: null,
          xContentTypeOptions: null,
          referrerPolicy: null,
          permissionsPolicy: null
        },
        hstsMaxAge: null,
        hstsIncludesSubdomains: false,
        hstsPreload: false
      }
    };
  }
}

// src/audit/checks/content-freshness.ts
import * as cheerio16 from "https://esm.sh/cheerio@1.0.0";
var ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1e3;
function parseDate(dateStr) {
  if (!dateStr)
    return null;
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
  }
  return null;
}
function calculateAgeInDays(date) {
  if (!date)
    return null;
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1e3));
}
function extractDatesFromHtml(html) {
  const $ = cheerio16.load(html);
  const articleModifiedTime = parseDate(
    $('meta[property="article:modified_time"]').attr("content") || $('meta[name="article:modified_time"]').attr("content")
  );
  const articlePublishedTime = parseDate(
    $('meta[property="article:published_time"]').attr("content") || $('meta[name="article:published_time"]').attr("content")
  );
  const ogUpdatedTime = parseDate(
    $('meta[property="og:updated_time"]').attr("content") || $('meta[name="og:updated_time"]').attr("content")
  );
  return {
    articleModifiedTime,
    articlePublishedTime,
    ogUpdatedTime
  };
}
async function analyzeContentFreshness(url, html) {
  const issues = [];
  let lastModified = null;
  try {
    const response = await httpHead(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    const lastModifiedHeader = response.headers["last-modified"];
    lastModified = parseDate(lastModifiedHeader);
  } catch {
  }
  const htmlDates = extractDatesFromHtml(html);
  const dates = [];
  if (lastModified) {
    dates.push({ date: lastModified, source: "last-modified" });
  }
  if (htmlDates.articleModifiedTime) {
    dates.push({ date: htmlDates.articleModifiedTime, source: "article-modified-time" });
  }
  if (htmlDates.ogUpdatedTime) {
    dates.push({ date: htmlDates.ogUpdatedTime, source: "og-updated-time" });
  }
  dates.sort((a, b) => b.date.getTime() - a.date.getTime());
  const mostRecent = dates[0] || null;
  const ageInDays = mostRecent ? calculateAgeInDays(mostRecent.date) : null;
  const isStale = ageInDays !== null && ageInDays > 365;
  if (!lastModified) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_LAST_MODIFIED,
      affectedUrls: [url]
    });
  }
  if (isStale) {
    issues.push({
      ...ISSUE_DEFINITIONS.CONTENT_STALE,
      affectedUrls: [url],
      details: {
        ageInDays,
        lastModified: mostRecent?.date.toISOString(),
        source: mostRecent?.source
      }
    });
  }
  const $ = cheerio16.load(html);
  const isArticle = $("article").length > 0 || $('meta[property="og:type"][content="article"]').length > 0 || $('meta[property="article:published_time"]').length > 0;
  if (isArticle && !htmlDates.articleModifiedTime && !htmlDates.ogUpdatedTime) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_UPDATED_TIME_MISSING,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      lastModified,
      articleModifiedTime: htmlDates.articleModifiedTime,
      articlePublishedTime: htmlDates.articlePublishedTime,
      ogUpdatedTime: htmlDates.ogUpdatedTime,
      ageInDays,
      isStale,
      source: mostRecent?.source || "none"
    }
  };
}

// src/audit/checks/dom-analysis.ts
import * as cheerio17 from "https://esm.sh/cheerio@1.0.0";
var DOM_SIZE_WARNING = 1500;
var DOM_SIZE_ERROR = 3e3;
var DOM_DEPTH_WARNING = 32;
function countNodes($) {
  let count = 0;
  function traverse(node) {
    const el = node;
    if (el.type === "tag")
      count++;
    if (el.children) {
      for (const child of el.children)
        traverse(child);
    }
  }
  $.root().each((_, el) => traverse(el));
  return count;
}
function calculateMaxDepth($) {
  let maxDepth = 0;
  function traverse(element, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const el = element;
    if (el.children) {
      for (const child of el.children) {
        traverse(child, depth + 1);
      }
    }
  }
  const root = $.root();
  root.each((_, el) => traverse(el, 0));
  return maxDepth;
}
function findRenderBlockingResources($) {
  const css = [];
  const js = [];
  $('head link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    const media = $(el).attr("media");
    const disabled = $(el).attr("disabled");
    if (href && media !== "print" && !disabled) {
      css.push(href);
    }
  });
  $("head style").each((_, el) => {
    const content = $(el).html();
    if (content && content.trim().length > 100) {
      css.push("[inline-style]");
    }
  });
  $("head script[src]").each((_, el) => {
    const src = $(el).attr("src");
    const async = $(el).attr("async");
    const defer = $(el).attr("defer");
    const type = $(el).attr("type");
    if (type === "module" || type && !type.includes("javascript")) {
      return;
    }
    if (src && !async && !defer) {
      js.push(src);
    }
  });
  return { css, js };
}
function analyzeDOMStructure(html, url) {
  const issues = [];
  const $ = cheerio17.load(html);
  const nodeCount = countNodes($);
  const maxDepth = calculateMaxDepth($);
  const renderBlockingResources = findRenderBlockingResources($);
  const criticalPathLength = renderBlockingResources.css.length + renderBlockingResources.js.length;
  if (nodeCount > DOM_SIZE_ERROR) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_SIZE_EXCESSIVE,
      severity: "error",
      affectedUrls: [url],
      details: {
        nodeCount,
        threshold: DOM_SIZE_WARNING,
        recommendation: "Reduce DOM size to under 1500 nodes"
      }
    });
  } else if (nodeCount > DOM_SIZE_WARNING) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_SIZE_EXCESSIVE,
      affectedUrls: [url],
      details: {
        nodeCount,
        threshold: DOM_SIZE_WARNING,
        recommendation: "Consider simplifying page structure"
      }
    });
  }
  if (maxDepth > DOM_DEPTH_WARNING) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_DEPTH_EXCESSIVE,
      affectedUrls: [url],
      details: {
        maxDepth,
        threshold: DOM_DEPTH_WARNING
      }
    });
  }
  if (criticalPathLength > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.RENDER_BLOCKING_RESOURCES,
      affectedUrls: [url],
      details: {
        cssFiles: renderBlockingResources.css,
        jsFiles: renderBlockingResources.js,
        totalCount: criticalPathLength,
        recommendation: criticalPathLength > 3 ? "Inline critical CSS and defer non-critical resources" : "Consider using async/defer for scripts"
      }
    });
  }
  return {
    issues,
    data: {
      nodeCount,
      maxDepth,
      renderBlockingResources,
      totalRenderBlockingSize: 0,
      // Would need to fetch resources to calculate
      criticalPathLength
    }
  };
}

// src/audit/checks/modern-images.ts
import * as cheerio18 from "https://esm.sh/cheerio@1.0.0";
var MODERN_FORMATS = [".webp", ".avif"];
var LEGACY_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
function getImageFormat(url) {
  try {
    const pathname = new URL(url, "https://example.com").pathname.toLowerCase();
    const formatMatch = url.match(/[?&](?:format|f)=(\w+)/i);
    if (formatMatch) {
      return "." + formatMatch[1].toLowerCase();
    }
    const extMatch = pathname.match(/\.([a-z0-9]+)$/i);
    if (extMatch) {
      return "." + extMatch[1].toLowerCase();
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
function isModernFormat(format) {
  return MODERN_FORMATS.includes(format.toLowerCase());
}
function extractImages($, baseUrl) {
  const images = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const srcset = $(el).attr("srcset") || "";
    const alt = $(el).attr("alt") || null;
    const width = $(el).attr("width") ? parseInt($(el).attr("width"), 10) : null;
    const height = $(el).attr("height") ? parseInt($(el).attr("height"), 10) : null;
    const loading = $(el).attr("loading") || null;
    if (!src || src.startsWith("data:"))
      return;
    let fullSrc = src;
    try {
      fullSrc = new URL(src, baseUrl).href;
    } catch {
    }
    const format = getImageFormat(fullSrc);
    images.push({
      src: fullSrc,
      alt,
      width,
      height,
      loading,
      format,
      isModernFormat: isModernFormat(format),
      hasDimensions: width !== null && height !== null,
      isLazyLoaded: loading === "lazy" || $(el).attr("data-src") !== void 0
    });
    if (srcset) {
      const srcsetUrls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      for (const srcsetUrl of srcsetUrls) {
        const srcsetFormat = getImageFormat(srcsetUrl);
        if (isModernFormat(srcsetFormat) && !images.some((img) => img.src === srcsetUrl)) {
          images.push({
            src: srcsetUrl,
            alt,
            width: null,
            height: null,
            loading,
            format: srcsetFormat,
            isModernFormat: true,
            hasDimensions: false,
            isLazyLoaded: loading === "lazy"
          });
        }
      }
    }
  });
  $("picture source").each((_, el) => {
    const srcset = $(el).attr("srcset") || "";
    const type = $(el).attr("type") || "";
    if (type.includes("webp") || type.includes("avif")) {
      const srcsetUrls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      for (const srcsetUrl of srcsetUrls) {
        if (!images.some((img) => img.src === srcsetUrl)) {
          images.push({
            src: srcsetUrl,
            alt: null,
            width: null,
            height: null,
            loading: null,
            format: type.includes("webp") ? ".webp" : ".avif",
            isModernFormat: true,
            hasDimensions: false,
            isLazyLoaded: false
          });
        }
      }
    }
  });
  return images;
}
function analyzeModernImages(html, url) {
  const issues = [];
  const $ = cheerio18.load(html);
  const images = extractImages($, url);
  const uniqueImages = images.filter((img, idx, arr) => arr.findIndex((i) => i.src === img.src) === idx);
  const modernFormatCount = uniqueImages.filter((img) => img.isModernFormat).length;
  const legacyFormatCount = uniqueImages.filter(
    (img) => !img.isModernFormat && LEGACY_FORMATS.includes(img.format)
  ).length;
  const hasPictureElements = $("picture").length > 0;
  const hasSourceSet = $("img[srcset]").length > 0 || $("picture source[srcset]").length > 0;
  const totalRelevantImages = modernFormatCount + legacyFormatCount;
  const modernFormatPercentage = totalRelevantImages > 0 ? Math.round(modernFormatCount / totalRelevantImages * 100) : 100;
  if (legacyFormatCount > 0 && !hasPictureElements && !hasSourceSet) {
    const legacyImages = uniqueImages.filter((img) => !img.isModernFormat && LEGACY_FORMATS.includes(img.format));
    issues.push({
      ...ISSUE_DEFINITIONS.IMAGE_NOT_WEBP_AVIF,
      affectedUrls: legacyImages.slice(0, 10).map((img) => img.src),
      details: {
        legacyImageCount: legacyFormatCount,
        modernImageCount: modernFormatCount,
        modernFormatPercentage,
        recommendation: "Convert images to WebP or AVIF format for 25-50% smaller file sizes"
      }
    });
  }
  const imagesWithoutDimensions = uniqueImages.filter(
    (img) => !img.hasDimensions && !img.isLazyLoaded && LEGACY_FORMATS.includes(img.format)
  );
  if (imagesWithoutDimensions.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_NO_DIMENSIONS,
      affectedUrls: imagesWithoutDimensions.slice(0, 10).map((img) => img.src),
      details: {
        count: imagesWithoutDimensions.length
      }
    });
  }
  return {
    issues,
    data: {
      totalImages: uniqueImages.length,
      modernFormatCount,
      legacyFormatCount,
      modernFormatPercentage,
      images: uniqueImages,
      hasSourceSet,
      hasPictureElements
    }
  };
}

// src/audit/checks/tech-detection.ts
import * as cheerio19 from "https://esm.sh/cheerio@1.0.0";
var VULNERABLE_JQUERY = ["1.", "2.0", "2.1", "2.2", "3.0", "3.1", "3.2", "3.3", "3.4"];
function detectTechnologies(html, url, headers) {
  const issues = [];
  const $ = cheerio19.load(html);
  const technologies = [];
  detectCMS($, technologies);
  detectFrameworks($, html, technologies);
  detectLibraries($, html, technologies, issues, url);
  detectAnalytics($, html, technologies);
  if (headers) {
    detectCDN(headers, technologies);
  }
  const cms = technologies.find((t) => t.category === "cms")?.name || null;
  const framework = technologies.find((t) => t.category === "framework")?.name || null;
  const jsLibraries = technologies.filter((t) => t.category === "library").map((t) => t.name);
  const analytics = technologies.filter((t) => t.category === "analytics").map((t) => t.name);
  const cdn = technologies.find((t) => t.category === "cdn")?.name || null;
  return {
    issues,
    data: {
      technologies,
      cms,
      framework,
      jsLibraries,
      analytics,
      cdn,
      serverHeaders: headers || {}
    }
  };
}
function detectCMS($, technologies) {
  if ($('meta[name="generator"][content*="WordPress"]').length > 0 || $('link[href*="wp-content"]').length > 0 || $('script[src*="wp-content"]').length > 0) {
    const version = $('meta[name="generator"]').attr("content")?.match(/WordPress\s+([\d.]+)/)?.[1];
    technologies.push({
      name: "WordPress",
      version,
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Drupal"]').length > 0 || $('script[src*="/drupal"]').length > 0 || $("[data-drupal-selector]").length > 0) {
    technologies.push({
      name: "Drupal",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Joomla"]').length > 0 || $('script[src*="/joomla"]').length > 0) {
    technologies.push({
      name: "Joomla",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="shopify-digital-wallet"]').length > 0 || $('link[href*="cdn.shopify.com"]').length > 0) {
    technologies.push({
      name: "Shopify",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('script[src*="squarespace"]').length > 0 || $('meta[content*="Squarespace"]').length > 0) {
    technologies.push({
      name: "Squarespace",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Wix"]').length > 0 || $('script[src*="wix.com"]').length > 0) {
    technologies.push({
      name: "Wix",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Ghost"]').length > 0) {
    const version = $('meta[name="generator"]').attr("content")?.match(/Ghost\s+([\d.]+)/)?.[1];
    technologies.push({
      name: "Ghost",
      version,
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Hugo"]').length > 0) {
    technologies.push({
      name: "Hugo",
      category: "cms",
      confidence: "high"
    });
  }
}
function detectFrameworks($, html, technologies) {
  if ($("[data-reactroot]").length > 0 || $("[data-react-helmet]").length > 0 || html.includes("__REACT_DEVTOOLS")) {
    technologies.push({
      name: "React",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("#__next").length > 0 || $('script[src*="/_next/"]').length > 0) {
    technologies.push({
      name: "Next.js",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("[data-v-]").length > 0 || html.includes("Vue.js") || $('script[src*="vue"]').length > 0) {
    technologies.push({
      name: "Vue.js",
      category: "framework",
      confidence: "medium"
    });
  }
  if ($("#__nuxt").length > 0 || $('script[src*="/_nuxt/"]').length > 0) {
    technologies.push({
      name: "Nuxt.js",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("[ng-app]").length > 0 || $("[data-ng-app]").length > 0 || $("app-root").length > 0) {
    technologies.push({
      name: "Angular",
      category: "framework",
      confidence: "high"
    });
  }
  if ($('script[src*="svelte"]').length > 0 || html.includes("__svelte")) {
    technologies.push({
      name: "Svelte",
      category: "framework",
      confidence: "medium"
    });
  }
  if ($("[data-astro-source-file]").length > 0 || $('script[src*="/_astro/"]').length > 0) {
    technologies.push({
      name: "Astro",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("#___gatsby").length > 0 || $('script[src*="/gatsby"]').length > 0) {
    technologies.push({
      name: "Gatsby",
      category: "framework",
      confidence: "high"
    });
  }
  if (html.includes("__remixContext") || $('script[src*="remix"]').length > 0) {
    technologies.push({
      name: "Remix",
      category: "framework",
      confidence: "medium"
    });
  }
}
function detectLibraries($, html, technologies, issues, url) {
  const jqueryScript = $('script[src*="jquery"]').attr("src") || "";
  const jqueryVersionMatch = jqueryScript.match(/jquery[.-]?([\d.]+)/i) || html.match(/jQuery\s+v?([\d.]+)/);
  if (jqueryScript || html.includes("jQuery")) {
    const version = jqueryVersionMatch?.[1];
    technologies.push({
      name: "jQuery",
      version,
      category: "library",
      confidence: "high"
    });
    if (version && VULNERABLE_JQUERY.some((v) => version.startsWith(v))) {
      issues.push({
        ...ISSUE_DEFINITIONS.OUTDATED_JQUERY,
        affectedUrls: [url],
        details: { version, recommendation: "Update to jQuery 3.5.0 or later" }
      });
    }
  }
  if ($('link[href*="bootstrap"]').length > 0 || $('script[src*="bootstrap"]').length > 0) {
    const version = ($('link[href*="bootstrap"]').attr("href") || "").match(/bootstrap[.-]?([\d.]+)/)?.[1];
    technologies.push({
      name: "Bootstrap",
      version,
      category: "library",
      confidence: "high"
    });
  }
  if (html.includes("tailwind") || $('[class*="tw-"]').length > 0 || $("style").text().includes("--tw-")) {
    technologies.push({
      name: "Tailwind CSS",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="lodash"]').length > 0 || html.includes("_.VERSION")) {
    technologies.push({
      name: "Lodash",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="gsap"]').length > 0 || html.includes("gsap")) {
    technologies.push({
      name: "GSAP",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="three"]').length > 0 || html.includes("THREE.")) {
    technologies.push({
      name: "Three.js",
      category: "library",
      confidence: "medium"
    });
  }
}
function detectAnalytics($, html, technologies) {
  if (html.includes("gtag") || html.includes("googletagmanager") || $('script[src*="google-analytics"]').length > 0 || $('script[src*="gtag"]').length > 0) {
    technologies.push({
      name: "Google Analytics",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("GTM-") || $('script[src*="googletagmanager.com/gtm"]').length > 0) {
    technologies.push({
      name: "Google Tag Manager",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("fbq(") || $('script[src*="connect.facebook"]').length > 0) {
    technologies.push({
      name: "Facebook Pixel",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("hotjar") || $('script[src*="hotjar"]').length > 0) {
    technologies.push({
      name: "Hotjar",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("mixpanel") || $('script[src*="mixpanel"]').length > 0) {
    technologies.push({
      name: "Mixpanel",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("analytics.js") || $('script[src*="segment"]').length > 0) {
    technologies.push({
      name: "Segment",
      category: "analytics",
      confidence: "medium"
    });
  }
  if ($('script[src*="plausible"]').length > 0) {
    technologies.push({
      name: "Plausible",
      category: "analytics",
      confidence: "high"
    });
  }
  if ($('script[src*="usefathom"]').length > 0) {
    technologies.push({
      name: "Fathom Analytics",
      category: "analytics",
      confidence: "high"
    });
  }
}
function detectCDN(headers, technologies) {
  const serverHeader = headers["server"]?.toLowerCase() || "";
  const viaHeader = headers["via"]?.toLowerCase() || "";
  const cdnHeaders = [
    headers["x-cdn"],
    headers["x-cache"],
    headers["cf-ray"],
    headers["x-amz-cf-id"],
    headers["x-vercel-cache"],
    headers["x-served-by"]
  ].filter(Boolean).join(" ").toLowerCase();
  if (headers["cf-ray"] || serverHeader.includes("cloudflare")) {
    technologies.push({
      name: "Cloudflare",
      category: "cdn",
      confidence: "high"
    });
  }
  if (headers["x-amz-cf-id"] || viaHeader.includes("cloudfront")) {
    technologies.push({
      name: "AWS CloudFront",
      category: "cdn",
      confidence: "high"
    });
  }
  if (headers["x-vercel-cache"] || serverHeader.includes("vercel")) {
    technologies.push({
      name: "Vercel",
      category: "cdn",
      confidence: "high"
    });
  }
  if (cdnHeaders.includes("fastly") || viaHeader.includes("fastly")) {
    technologies.push({
      name: "Fastly",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("akamai") || headers["x-akamai-request-id"]) {
    technologies.push({
      name: "Akamai",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("netlify") || headers["x-nf-request-id"]) {
    technologies.push({
      name: "Netlify",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("github")) {
    technologies.push({
      name: "GitHub Pages",
      category: "cdn",
      confidence: "high"
    });
  }
}

// src/audit/checks/keyword-analysis.ts
import * as cheerio20 from "https://esm.sh/cheerio@1.0.0";
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "us",
  "our",
  "you",
  "your",
  "i",
  "me",
  "my",
  "he",
  "she",
  "him",
  "her",
  "his",
  "not",
  "no",
  "nor",
  "so",
  "if",
  "then",
  "else",
  "when",
  "where",
  "why",
  "how",
  "what",
  "who",
  "which",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "only",
  "own",
  "same",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "about",
  "after",
  "before",
  "above",
  "below",
  "between",
  "into",
  "through",
  "during",
  "under",
  "again",
  "further",
  "once",
  "any",
  "being",
  "because",
  "while"
]);
function extractText($, selector) {
  return $(selector).text().toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
}
function countWords(words) {
  const counts = /* @__PURE__ */ new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return counts;
}
function extractNGrams(words, n) {
  const ngrams = /* @__PURE__ */ new Map();
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(" ");
    const ngramWords = ngram.split(" ");
    if (ngramWords.some((w) => STOP_WORDS.has(w)))
      continue;
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  return ngrams;
}
function analyzeKeywords(html, url) {
  const issues = [];
  const $ = cheerio20.load(html);
  const title = extractText($, "title");
  const h1 = extractText($, "h1");
  const h2 = extractText($, "h2");
  const metaDesc = $('meta[name="description"]').attr("content")?.toLowerCase() || "";
  $("script, style, noscript").remove();
  const bodyText = extractText($, "body");
  const bodyWords = tokenize(bodyText);
  const titleWords = tokenize(title);
  const h1Words = tokenize(h1);
  const h2Words = tokenize(h2);
  const metaDescWords = tokenize(metaDesc);
  const wordCounts = countWords(bodyWords);
  const totalWords = bodyWords.length;
  const topKeywordsMap = [];
  for (const [word, count] of wordCounts) {
    const density = count / totalWords * 100;
    topKeywordsMap.push({
      word,
      count,
      density: Math.round(density * 100) / 100,
      inTitle: titleWords.includes(word),
      inH1: h1Words.includes(word),
      inH2: h2Words.includes(word),
      inMetaDesc: metaDescWords.includes(word)
    });
  }
  topKeywordsMap.sort((a, b) => b.count - a.count);
  const topKeywords = topKeywordsMap.slice(0, 20);
  const twoWordPhrases = extractNGrams(bodyWords, 2);
  const threeWordPhrases = extractNGrams(bodyWords, 3);
  const fourWordPhrases = extractNGrams(bodyWords, 4);
  const sortPhrases = (phrases, n) => {
    return Array.from(phrases).filter(([_, count]) => count >= 2).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([phrase, count]) => ({ phrase, count, wordCount: n }));
  };
  const potentialStuffing = topKeywords.filter((k) => k.density > 3).map((k) => k.word);
  if (potentialStuffing.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.KEYWORD_STUFFING,
      affectedUrls: [url],
      details: {
        keywords: potentialStuffing,
        densities: potentialStuffing.map((k) => {
          const info = topKeywords.find((tk) => tk.word === k);
          return { word: k, density: info?.density };
        })
      }
    });
  }
  const topBodyKeywords = topKeywords.slice(0, 5).map((k) => k.word);
  const keywordsInTitle = topBodyKeywords.filter((k) => titleWords.includes(k));
  if (keywordsInTitle.length === 0 && topBodyKeywords.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_KEYWORDS_IN_TITLE,
      affectedUrls: [url],
      details: {
        topKeywords: topBodyKeywords,
        title,
        recommendation: `Consider including "${topBodyKeywords[0]}" in your title`
      }
    });
  }
  const keywordsInH1 = topBodyKeywords.filter((k) => h1Words.includes(k));
  if (keywordsInH1.length === 0 && topBodyKeywords.length > 0 && h1) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_KEYWORDS_IN_H1,
      affectedUrls: [url],
      details: {
        topKeywords: topBodyKeywords,
        h1,
        recommendation: `Consider including "${topBodyKeywords[0]}" in your H1`
      }
    });
  }
  return {
    issues,
    data: {
      totalWords,
      uniqueWords: wordCounts.size,
      topKeywords,
      topPhrases: {
        twoWord: sortPhrases(twoWordPhrases, 2),
        threeWord: sortPhrases(threeWordPhrases, 3),
        fourWord: sortPhrases(fourWordPhrases, 4)
      },
      keywordDistribution: {
        title: titleWords,
        h1: h1Words,
        h2: h2Words,
        metaDesc: metaDescWords
      },
      potentialStuffing
    }
  };
}

// src/audit/checks/additional-checks.ts
import * as cheerio21 from "https://esm.sh/cheerio@1.0.0";
async function resolveTxtDoH(domain) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/dns-json"
    }
  });
  if (!response.ok) {
    throw new Error(`DNS lookup failed: ${response.status}`);
  }
  const data = await response.json();
  if (!data.Answer || data.Answer.length === 0) {
    return [];
  }
  return data.Answer.map((record) => {
    const txt = record.data.replace(/^"|"$/g, "");
    return [txt];
  });
}
async function checkAdsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/ads.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      return {
        issues,
        data: { exists: false, valid: false, entries: 0, errors: [] }
      };
    }
    const content = response.data;
    const lines = content.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#"));
    const errors = [];
    let validEntries = 0;
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        validEntries++;
      } else if (line.trim()) {
        errors.push(`Invalid line format: ${line.substring(0, 50)}`);
      }
    }
    const valid = errors.length === 0 && validEntries > 0;
    if (!valid && validEntries > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.ADS_TXT_INVALID,
        affectedUrls: [url],
        details: { errors, validEntries }
      });
    }
    return {
      issues,
      data: { exists: true, valid, entries: validEntries, errors }
    };
  } catch {
    return {
      issues,
      data: { exists: false, valid: false, entries: 0, errors: ["Failed to fetch"] }
    };
  }
}
async function checkDMARC(domain) {
  const issues = [];
  try {
    let cleanDomain = domain;
    try {
      cleanDomain = new URL(domain).hostname;
    } catch {
    }
    cleanDomain = cleanDomain.replace(/^www\./, "");
    const dmarcDomain = `_dmarc.${cleanDomain}`;
    const records = await resolveTxtDoH(dmarcDomain);
    const dmarcRecord = records.flat().find((r) => r.startsWith("v=DMARC1"));
    if (dmarcRecord) {
      const policyMatch = dmarcRecord.match(/p=(\w+)/);
      const policy = policyMatch ? policyMatch[1] : null;
      return {
        issues,
        data: { exists: true, policy, record: dmarcRecord }
      };
    } else {
      issues.push({
        ...ISSUE_DEFINITIONS.DMARC_MISSING,
        affectedUrls: [domain]
      });
      return {
        issues,
        data: { exists: false, policy: null, record: null }
      };
    }
  } catch {
    issues.push({
      ...ISSUE_DEFINITIONS.DMARC_MISSING,
      affectedUrls: [domain]
    });
    return {
      issues,
      data: { exists: false, policy: null, record: null }
    };
  }
}
async function checkSPF(domain) {
  const issues = [];
  try {
    let cleanDomain = domain;
    try {
      cleanDomain = new URL(domain).hostname;
    } catch {
    }
    cleanDomain = cleanDomain.replace(/^www\./, "");
    const records = await resolveTxtDoH(cleanDomain);
    const spfRecord = records.flat().find((r) => r.startsWith("v=spf1"));
    if (spfRecord) {
      return {
        issues,
        data: { exists: true, record: spfRecord }
      };
    } else {
      issues.push({
        ...ISSUE_DEFINITIONS.SPF_MISSING,
        affectedUrls: [domain]
      });
      return {
        issues,
        data: { exists: false, record: null }
      };
    }
  } catch {
    return {
      issues,
      data: { exists: false, record: null }
    };
  }
}
function checkAMP(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const ampLink = $('link[rel="amphtml"]').attr("href");
  if (ampLink) {
    return {
      issues,
      data: {
        hasAmpLink: true,
        ampUrl: ampLink,
        ampValid: null
        // Would need to validate the AMP page
      }
    };
  }
  const isAmpPage = $("html[amp]").length > 0 || $("html[\u26A1]").length > 0;
  if (isAmpPage) {
    return {
      issues,
      data: {
        hasAmpLink: false,
        ampUrl: url,
        ampValid: null
      }
    };
  }
  const isArticle = $("article").length > 0 || $('meta[property="og:type"][content="article"]').length > 0 || html.toLowerCase().includes("blog") || html.toLowerCase().includes("news");
  if (isArticle) {
    issues.push({
      ...ISSUE_DEFINITIONS.AMP_MISSING,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasAmpLink: false,
      ampUrl: null,
      ampValid: null
    }
  };
}
function checkPlaintextEmails(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  $("script, style").remove();
  const text = $("body").text();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  const filteredEmails = emails.filter((email) => {
    const lowerEmail = email.toLowerCase();
    return !lowerEmail.includes("example.com") && !lowerEmail.includes("yoursite.com") && !lowerEmail.includes("yourdomain") && !lowerEmail.endsWith(".png") && !lowerEmail.endsWith(".jpg");
  });
  const uniqueEmails = [...new Set(filteredEmails)];
  if (uniqueEmails.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.PLAINTEXT_EMAIL,
      affectedUrls: [url],
      details: {
        emails: uniqueEmails,
        count: uniqueEmails.length
      }
    });
  }
  return { issues, emails: uniqueEmails };
}
function checkAppleTouchIcon(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const hasAppleTouchIcon = $('link[rel="apple-touch-icon"]').length > 0 || $('link[rel="apple-touch-icon-precomposed"]').length > 0;
  if (!hasAppleTouchIcon) {
    issues.push({
      ...ISSUE_DEFINITIONS.APPLE_TOUCH_ICON_MISSING,
      affectedUrls: [url]
    });
  }
  return { issues, exists: hasAppleTouchIcon };
}
function checkFaviconFormat(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const faviconLink = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null;
  if (!faviconLink) {
    return { issues, format: null };
  }
  let format = null;
  const lowerHref = faviconLink.toLowerCase();
  if (lowerHref.endsWith(".ico")) {
    format = "ico";
  } else if (lowerHref.endsWith(".png")) {
    format = "png";
  } else if (lowerHref.endsWith(".svg")) {
    format = "svg";
  } else if (lowerHref.includes("data:image/")) {
    format = "inline";
  } else {
    format = "unknown";
  }
  return { issues, format };
}
async function runAdditionalChecks(url, html) {
  const allIssues = [];
  const [adsTxtResult, dmarcResult, spfResult] = await Promise.all([
    checkAdsTxt(url),
    checkDMARC(url),
    checkSPF(url)
  ]);
  allIssues.push(...adsTxtResult.issues);
  allIssues.push(...dmarcResult.issues);
  allIssues.push(...spfResult.issues);
  const ampResult = checkAMP(html, url);
  allIssues.push(...ampResult.issues);
  const emailResult = checkPlaintextEmails(html, url);
  allIssues.push(...emailResult.issues);
  const touchIconResult = checkAppleTouchIcon(html, url);
  allIssues.push(...touchIconResult.issues);
  const faviconResult = checkFaviconFormat(html, url);
  allIssues.push(...faviconResult.issues);
  return {
    issues: allIssues,
    data: {
      adsTxt: adsTxtResult.data,
      dmarc: dmarcResult.data,
      spf: spfResult.data,
      amp: ampResult.data,
      plaintextEmails: emailResult.emails,
      hasAppleTouchIcon: touchIconResult.exists,
      faviconFormat: faviconResult.format
    }
  };
}

// src/audit/checks/resource-hints.ts
import * as cheerio22 from "https://esm.sh/cheerio@1.0.0";
function extractResourceHints(html) {
  const $ = cheerio22.load(html);
  const hints = [];
  $('link[rel="dns-prefetch"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({ type: "dns-prefetch", href });
    }
  });
  $('link[rel="preconnect"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "preconnect",
        href,
        crossorigin: $(el).attr("crossorigin")
      });
    }
  });
  $('link[rel="prefetch"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "prefetch",
        href,
        as: $(el).attr("as")
      });
    }
  });
  $('link[rel="preload"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "preload",
        href,
        as: $(el).attr("as"),
        crossorigin: $(el).attr("crossorigin")
      });
    }
  });
  $('link[rel="modulepreload"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({ type: "modulepreload", href });
    }
  });
  return hints;
}
function detectThirdPartyDomains(html, pageUrl) {
  const $ = cheerio22.load(html);
  const baseDomain = new URL(pageUrl).hostname;
  const domains = /* @__PURE__ */ new Set();
  $("script[src]").each((_, el) => {
    try {
      const src = $(el).attr("src");
      const url = new URL(src, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  $('link[rel="stylesheet"][href]').each((_, el) => {
    try {
      const href = $(el).attr("href");
      const url = new URL(href, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  $("img[src]").each((_, el) => {
    try {
      const src = $(el).attr("src");
      const url = new URL(src, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  const styleContent = $("style").text();
  const fontUrlMatches = styleContent.match(/url\(['"]?(https?:\/\/[^'")\s]+)/g) || [];
  for (const match of fontUrlMatches) {
    try {
      const url = match.replace(/url\(['"]?/, "");
      const parsed = new URL(url);
      if (parsed.hostname !== baseDomain) {
        domains.add(parsed.origin);
      }
    } catch {
    }
  }
  return [...domains];
}
var CRITICAL_THIRD_PARTIES = {
  "fonts.googleapis.com": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  "fonts.gstatic.com": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  "www.google-analytics.com": ["https://www.google-analytics.com"],
  "www.googletagmanager.com": ["https://www.googletagmanager.com"],
  "cdn.jsdelivr.net": ["https://cdn.jsdelivr.net"],
  "unpkg.com": ["https://unpkg.com"],
  "cdnjs.cloudflare.com": ["https://cdnjs.cloudflare.com"],
  "ajax.googleapis.com": ["https://ajax.googleapis.com"],
  "connect.facebook.net": ["https://connect.facebook.net"],
  "platform.twitter.com": ["https://platform.twitter.com"],
  "www.youtube.com": ["https://www.youtube.com", "https://i.ytimg.com"],
  "player.vimeo.com": ["https://player.vimeo.com"],
  "js.stripe.com": ["https://js.stripe.com"]
};
function findMissingPreconnects(thirdPartyDomains, existingHints) {
  const preconnected = new Set(
    existingHints.filter((h) => h.type === "preconnect" || h.type === "dns-prefetch").map((h) => {
      try {
        return new URL(h.href).origin;
      } catch {
        return h.href;
      }
    })
  );
  const missing2 = [];
  for (const domain of thirdPartyDomains) {
    try {
      const hostname = new URL(domain).hostname;
      const recommended = CRITICAL_THIRD_PARTIES[hostname] || [domain];
      for (const rec of recommended) {
        if (!preconnected.has(rec)) {
          missing2.push(rec);
        }
      }
    } catch {
    }
  }
  return [...new Set(missing2)];
}
function analyzeResourceHints(html, url) {
  const issues = [];
  const hints = extractResourceHints(html);
  const thirdPartyDomains = detectThirdPartyDomains(html, url);
  const missingPreconnects = findMissingPreconnects(thirdPartyDomains, hints);
  const dnsPrefetch = hints.filter((h) => h.type === "dns-prefetch").map((h) => h.href);
  const preconnect = hints.filter((h) => h.type === "preconnect").map((h) => h.href);
  const prefetch = hints.filter((h) => h.type === "prefetch").map((h) => h.href);
  const preload = hints.filter((h) => h.type === "preload");
  const modulepreload = hints.filter((h) => h.type === "modulepreload").map((h) => h.href);
  if (missingPreconnects.length > 0) {
    issues.push({
      code: "MISSING_PRECONNECT",
      severity: "warning",
      category: "performance",
      title: "Missing preconnect hints for third-party origins",
      description: `${missingPreconnects.length} third-party origins used without preconnect hints.`,
      impact: "Connection setup to third-party origins adds latency to resource loading.",
      howToFix: `Add preconnect hints: ${missingPreconnects.slice(0, 3).map((d) => `<link rel="preconnect" href="${d}">`).join(" ")}`,
      affectedUrls: [url],
      details: { missingPreconnects: missingPreconnects.slice(0, 5) }
    });
  }
  const usesGoogleFonts = thirdPartyDomains.some(
    (d) => d.includes("fonts.googleapis.com") || d.includes("fonts.gstatic.com")
  );
  const hasGoogleFontsPreconnect = preconnect.some((h) => h.includes("fonts.googleapis.com")) && preconnect.some((h) => h.includes("fonts.gstatic.com"));
  if (usesGoogleFonts && !hasGoogleFontsPreconnect) {
    issues.push({
      code: "GOOGLE_FONTS_NO_PRECONNECT",
      severity: "warning",
      category: "performance",
      title: "Google Fonts without preconnect",
      description: "Google Fonts are used but preconnect hints are missing.",
      impact: "Adds significant latency to font loading, affecting LCP.",
      howToFix: 'Add: <link rel="preconnect" href="https://fonts.googleapis.com"> and <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      affectedUrls: [url]
    });
  }
  const $ = cheerio22.load(html);
  const hasHeroImage = $("img").first().length > 0;
  const hasImagePreload = preload.some((p) => p.as === "image");
  if (hasHeroImage && !hasImagePreload) {
    issues.push({
      code: "HERO_IMAGE_NOT_PRELOADED",
      severity: "notice",
      category: "performance",
      title: "Hero image not preloaded",
      description: "Page has images but none are preloaded for faster LCP.",
      impact: "Preloading LCP images can improve Largest Contentful Paint.",
      howToFix: 'Add <link rel="preload" href="hero-image.jpg" as="image"> for your LCP image.',
      affectedUrls: [url]
    });
  }
  const hasRenderBlockingCSS = $('link[rel="stylesheet"]').filter((_, el) => !$(el).attr("media") || $(el).attr("media") === "all").length > 0;
  const hasCSSPreload = preload.some((p) => p.as === "style");
  if (hasRenderBlockingCSS && !hasCSSPreload && preload.length === 0) {
    issues.push({
      code: "NO_CRITICAL_RESOURCE_PRELOAD",
      severity: "notice",
      category: "performance",
      title: "No critical resources preloaded",
      description: "Page has render-blocking resources but no preload hints.",
      impact: "Preloading critical resources can improve initial render time.",
      howToFix: "Consider preloading critical CSS, fonts, or hero images.",
      affectedUrls: [url]
    });
  }
  if (preload.length > 10) {
    issues.push({
      code: "EXCESSIVE_PRELOADS",
      severity: "warning",
      category: "performance",
      title: "Too many preload hints",
      description: `Page has ${preload.length} preload hints, which can degrade performance.`,
      impact: "Preloading too many resources competes for bandwidth and can delay critical resources.",
      howToFix: "Limit preloads to truly critical resources (2-5 maximum).",
      affectedUrls: [url]
    });
  }
  const hasESModules = $('script[type="module"]').length > 0;
  if (hasESModules && modulepreload.length === 0) {
    issues.push({
      code: "ES_MODULES_NO_MODULEPRELOAD",
      severity: "notice",
      category: "performance",
      title: "ES modules without modulepreload",
      description: "Page uses ES modules but no modulepreload hints are present.",
      impact: "Modulepreload can parallelize module loading for faster execution.",
      howToFix: 'Add <link rel="modulepreload" href="critical-module.js"> for critical modules.',
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      dnsPrefetch,
      preconnect,
      prefetch,
      preload,
      modulepreload,
      thirdPartyDomains,
      missingPreconnects,
      earlyHints: false,
      http2Push: false
    }
  };
}

// src/audit/checks/indexnow.ts
import * as cheerio23 from "https://esm.sh/cheerio@1.0.0";
async function checkRobotsTxtForIndexNow(baseUrl) {
  try {
    const response = await httpGet(`${new URL(baseUrl).origin}/robots.txt`, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status !== 200) {
      return { found: false, key: null };
    }
    const content = response.data;
    const indexNowPattern = /indexnow[:\s]+([a-f0-9-]+)/i;
    const match = content.match(indexNowPattern);
    if (match) {
      return { found: true, key: match[1] };
    }
    return { found: false, key: null };
  } catch {
    return { found: false, key: null };
  }
}
function isValidIndexNowKey(key) {
  if (key.length < 8 || key.length > 128)
    return false;
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) {
    return true;
  }
  if (/^[a-f0-9]{32}$/i.test(key)) {
    return true;
  }
  if (/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    return true;
  }
  return false;
}
async function findIndexNowKeyFile(baseUrl, possibleKeys) {
  const origin = new URL(baseUrl).origin;
  for (const key of possibleKeys) {
    if (!isValidIndexNowKey(key))
      continue;
    const keyUrl = `${origin}/${key}.txt`;
    try {
      const response = await httpGet(keyUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      if (response.status === 200) {
        const content = response.data.trim();
        if (content === key) {
          return { found: true, url: keyUrl, key };
        }
      }
    } catch {
    }
  }
  return { found: false, url: null, key: null };
}
function checkIndexNowLinkTag(html) {
  const $ = cheerio23.load(html);
  const indexNowLink = $('link[rel="indexnow"]').attr("href") || $('link[rel="index-now"]').attr("href") || $('meta[name="indexnow-key"]').attr("content") || null;
  return { found: !!indexNowLink, href: indexNowLink };
}
function detectIndexNowCMSSupport(html, headers) {
  const $ = cheerio23.load(html);
  const isWordPress = html.includes("wp-content") || html.includes("wp-includes") || $('meta[name="generator"][content*="WordPress"]').length > 0;
  if (isWordPress) {
    if (html.includes("yoast-seo") || html.includes("wordpress-seo")) {
      return "WordPress + Yoast SEO (may have IndexNow)";
    }
    if (html.includes("rank-math") || html.includes("rankmath")) {
      return "WordPress + Rank Math (has IndexNow)";
    }
    return "WordPress (IndexNow plugins available)";
  }
  if (html.includes("wix.com") || html.includes("_wix_browser_sess")) {
    return "Wix (IndexNow built-in)";
  }
  if (headers["cf-ray"] || headers["server"]?.includes("cloudflare")) {
    return "Cloudflare (IndexNow integration available)";
  }
  return null;
}
async function analyzeIndexNow(html, url, headers = {}) {
  const issues = [];
  const origin = new URL(url).origin;
  const linkTag = checkIndexNowLinkTag(html);
  const robotsCheck = await checkRobotsTxtForIndexNow(url);
  const possibleKeys = [];
  if (linkTag.href)
    possibleKeys.push(linkTag.href);
  if (robotsCheck.key)
    possibleKeys.push(robotsCheck.key);
  const keyFile = await findIndexNowKeyFile(url, possibleKeys);
  const cmsPlugin = detectIndexNowCMSSupport(html, headers);
  const data = {
    hasKey: keyFile.found,
    keyFileUrl: keyFile.url,
    keyValue: keyFile.key,
    keyValid: keyFile.key ? isValidIndexNowKey(keyFile.key) : false,
    hasLinkTag: linkTag.found,
    inRobotsTxt: robotsCheck.found,
    cmsPlugin
  };
  if (!keyFile.found && !linkTag.found && !robotsCheck.found) {
    const suggestion = cmsPlugin ? `Your platform (${cmsPlugin}) may support IndexNow. Check for built-in support or plugins.` : "Create a key at indexnow.org, add the key file to your root directory, and submit URLs via the IndexNow API.";
    issues.push({
      code: "INDEXNOW_NOT_IMPLEMENTED",
      severity: "notice",
      category: "crawlability",
      title: "IndexNow not implemented",
      description: "Site does not appear to have IndexNow instant indexing set up.",
      impact: "Content changes may take longer to appear in Bing, Yandex, and other IndexNow-supporting search engines.",
      howToFix: suggestion,
      affectedUrls: [url],
      details: { cmsPlugin }
    });
  } else if (keyFile.found && !data.keyValid) {
    issues.push({
      code: "INDEXNOW_INVALID_KEY",
      severity: "warning",
      category: "crawlability",
      title: "IndexNow key format invalid",
      description: `The IndexNow key "${keyFile.key}" does not match expected formats.`,
      impact: "IndexNow submissions may fail with invalid key format.",
      howToFix: "Use a valid key format: 32-character hex or UUID format.",
      affectedUrls: [keyFile.url || url]
    });
  }
  if (keyFile.found && data.keyValid) {
  }
  return { issues, data };
}

// src/audit/checks/site-maturity.ts
import * as cheerio24 from "https://esm.sh/cheerio@1.0.0";
async function getSSLCertificateAge(url) {
  let https;
  try {
    https = await import("https");
  } catch {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        host: parsedUrl.hostname,
        port: 443,
        method: "GET",
        rejectUnauthorized: false
        // Accept self-signed for checking
      };
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate?.();
        if (cert && cert.valid_from) {
          const validFrom = new Date(cert.valid_from);
          const now = /* @__PURE__ */ new Date();
          const ageDays = Math.floor((now.getTime() - validFrom.getTime()) / (1e3 * 60 * 60 * 24));
          resolve(ageDays);
        } else {
          resolve(null);
        }
      });
      req.on("error", () => resolve(null));
      req.setTimeout(5e3, () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    } catch {
      resolve(null);
    }
  });
}
async function checkWaybackMachine(domain) {
  try {
    const response = await httpGet(
      `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&limit=1&from=1990`,
      {
        timeout: 1e4,
        validateStatus: () => true
      }
    );
    if (response.status === 200 && Array.isArray(response.data) && response.data.length > 1) {
      const timestamp2 = response.data[1]?.[1];
      if (timestamp2) {
        const year = parseInt(timestamp2.substring(0, 4));
        const month = parseInt(timestamp2.substring(4, 6)) - 1;
        const day = parseInt(timestamp2.substring(6, 8));
        return { firstSeen: new Date(year, month, day), snapshots: response.data.length - 1 };
      }
    }
    return { firstSeen: null, snapshots: 0 };
  } catch {
    return { firstSeen: null, snapshots: 0 };
  }
}
async function estimateIndexedPages(url) {
  const origin = new URL(url).origin;
  try {
    const sitemapUrls = [
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
      `${origin}/sitemap-index.xml`
    ];
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await httpGet(sitemapUrl, {
          timeout: 1e4,
          validateStatus: () => true
        });
        if (response.status === 200) {
          const $ = cheerio24.load(response.data, { xmlMode: true });
          const sitemaps = $("sitemap").length;
          if (sitemaps > 0) {
            return sitemaps * 500;
          }
          const urls = $("url").length;
          if (urls > 0) {
            return urls;
          }
        }
      } catch {
      }
    }
    return 0;
  } catch {
    return 0;
  }
}
function analyzeHTMLMaturitySignals(html, url) {
  const $ = cheerio24.load(html);
  const text = $("body").text().toLowerCase();
  const htmlLower = html.toLowerCase();
  const hasBlog = $('a[href*="/blog"]').length > 0 || $('a[href*="/posts"]').length > 0 || $('a[href*="/articles"]').length > 0 || htmlLower.includes("/blog") || $('[class*="blog"]').length > 0;
  const contentIndicators = [];
  if (hasBlog)
    contentIndicators.push("blog");
  if ($('a[href*="/products"], [class*="product"]').length > 0)
    contentIndicators.push("products");
  if ($('a[href*="/services"], [class*="service"]').length > 0)
    contentIndicators.push("services");
  if ($('a[href*="/portfolio"], [class*="portfolio"]').length > 0)
    contentIndicators.push("portfolio");
  if ($('a[href*="/case-stud"], [class*="case"]').length > 0)
    contentIndicators.push("case-studies");
  if ($('a[href*="/testimonial"], [class*="testimonial"]').length > 0)
    contentIndicators.push("testimonials");
  if ($('a[href*="/resource"], [class*="resource"]').length > 0)
    contentIndicators.push("resources");
  const hasMultipleContentTypes = contentIndicators.length >= 3;
  const hasEstablishedBrand = (
    // Social proof
    $('[class*="trust"], [class*="partner"], [class*="client"]').length > 0 || // Press/media mentions
    text.includes("featured in") || text.includes("as seen") || text.includes("trusted by") || // Awards/certifications
    text.includes("award") || text.includes("certified") || // Copyright with year range
    /©\s*\d{4}\s*-\s*\d{4}/.test(text) || // Multiple social links
    $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="facebook.com"]').length >= 2
  );
  return {
    hasBlog,
    hasMultipleContentTypes,
    hasEstablishedBrand,
    contentIndicators
  };
}
function determineStrategy(maturity, authorityIndicators, contentMetrics) {
  const recommendations = [];
  if (maturity === "new") {
    recommendations.push(
      "\u{1F3AF} PRIORITY: Build site authority before creating more content",
      "\u{1F4DD} Create ONE exceptional linkable asset (ultimate guide, original research, tool)",
      "\u{1F517} Focus 80% of effort on link acquisition to your best page",
      "\u23F3 Wait until you have 10+ quality backlinks before content expansion",
      "\u274C AVOID: Publishing lots of content that won't rank without authority"
    );
    return { strategy: "authority-first", recommendations };
  }
  if (maturity === "growing") {
    if (contentMetrics.contentToAuthorityRatio === "content-heavy") {
      recommendations.push(
        "\u26A0\uFE0F Content-to-authority imbalance detected",
        "\u{1F517} Pause content creation and focus on link building",
        "\u{1F4CA} Your content won't rank well without more domain authority",
        "\u{1F3AF} Build 20-50 quality backlinks before adding more pages",
        '\u{1F4A1} Consider "Reverse Silo": Drive links to content assets, then internal link to money pages'
      );
      return { strategy: "authority-first", recommendations };
    }
    recommendations.push(
      "\u{1F680} You're in the growth phase - balance content and links",
      "\u{1F4DD} Create pillar content around 3-5 main topics",
      "\u{1F517} Build 5-10 quality backlinks per month",
      "\u{1F3D7}\uFE0F Establish topic clusters with internal linking",
      "\u{1F4C8} Monitor rankings - optimize pages stuck on page 2"
    );
    return { strategy: "content-expansion", recommendations };
  }
  if (maturity === "established") {
    recommendations.push(
      "\u2705 Site has established authority - focus on optimization",
      "\u{1F50D} Audit existing content for improvement opportunities",
      "\u{1F4CA} Use data to find underperforming pages to refresh",
      "\u{1F3AF} Target more competitive keywords",
      "\u{1F4BC} Consider merger technique: Acquire relevant expired domains",
      "\u{1F517} Focus on earning links naturally through quality content"
    );
    return { strategy: "optimization", recommendations };
  }
  recommendations.push(
    "\u{1F451} Mature site - maintain and defend rankings",
    "\u{1F504} Regularly refresh top-performing content",
    "\u{1F6E1}\uFE0F Monitor for ranking drops and algorithm impacts",
    "\u{1F4C8} Expand into adjacent topics and markets",
    "\u{1F3C6} Focus on brand building and E-E-A-T signals",
    "\u26A1 Optimize for Core Web Vitals and user experience"
  );
  return { strategy: "maintenance", recommendations };
}
async function analyzeSiteMaturity(html, url) {
  const issues = [];
  const domain = new URL(url).hostname;
  const [sslAge, wayback, indexedPages] = await Promise.all([
    getSSLCertificateAge(url),
    checkWaybackMachine(domain),
    estimateIndexedPages(url)
  ]);
  const htmlSignals = analyzeHTMLMaturitySignals(html, url);
  let estimatedAgeDays = null;
  let ageSource = "estimated";
  let ageConfidence = "low";
  if (wayback.firstSeen) {
    estimatedAgeDays = Math.floor((Date.now() - wayback.firstSeen.getTime()) / (1e3 * 60 * 60 * 24));
    ageSource = "wayback";
    ageConfidence = wayback.snapshots > 10 ? "high" : "medium";
  } else if (sslAge !== null && sslAge > 0) {
    estimatedAgeDays = sslAge;
    ageSource = "ssl";
    ageConfidence = "low";
  }
  let maturityLevel;
  if (estimatedAgeDays === null || estimatedAgeDays < 90) {
    maturityLevel = "new";
  } else if (estimatedAgeDays < 365) {
    maturityLevel = "growing";
  } else if (estimatedAgeDays < 730) {
    maturityLevel = "established";
  } else {
    maturityLevel = "mature";
  }
  if (htmlSignals.hasEstablishedBrand && indexedPages > 100) {
    if (maturityLevel === "new")
      maturityLevel = "growing";
    if (maturityLevel === "growing")
      maturityLevel = "established";
  }
  const authorityIndicators = {
    hasBacklinks: wayback.snapshots > 5,
    // Rough proxy
    estimatedBacklinks: wayback.snapshots * 2,
    // Very rough estimate
    hasIndexedPages: indexedPages > 0,
    indexedPagesEstimate: indexedPages,
    hasBrandMentions: htmlSignals.hasEstablishedBrand,
    sslAge
  };
  const contentToAuthorityRatio = indexedPages > 50 && !authorityIndicators.hasBacklinks ? "content-heavy" : indexedPages < 10 && authorityIndicators.hasBacklinks ? "authority-heavy" : "balanced";
  const contentMetrics = {
    pageCount: indexedPages,
    hasMultipleContentTypes: htmlSignals.hasMultipleContentTypes,
    hasBlog: htmlSignals.hasBlog,
    contentToAuthorityRatio
  };
  const { strategy, recommendations } = determineStrategy(maturityLevel, authorityIndicators, contentMetrics);
  if (maturityLevel === "new") {
    issues.push({
      code: "NEW_SITE_STRATEGY",
      severity: "notice",
      category: "content",
      title: "New website detected - Authority-first strategy recommended",
      description: "Your site appears to be new (<90 days). Standard SEO advice won't work well for new sites.",
      impact: "Creating lots of content without authority is wasted effort. Content from new sites rarely ranks.",
      howToFix: "Focus on building 10+ quality backlinks to ONE great page before expanding content. See strategic recommendations.",
      affectedUrls: [url],
      details: {
        estimatedAge: estimatedAgeDays,
        recommendedStrategy: strategy,
        recommendations
      }
    });
  }
  if (contentToAuthorityRatio === "content-heavy") {
    issues.push({
      code: "CONTENT_AUTHORITY_IMBALANCE",
      severity: "warning",
      category: "content",
      title: "Content-to-authority imbalance",
      description: `Site has ~${indexedPages} pages but limited backlink signals. Content is unlikely to rank.`,
      impact: "Most of your content may be invisible to search engines due to low domain authority.",
      howToFix: "Stop publishing new content. Focus 100% on link building until you see ranking improvements.",
      affectedUrls: [url],
      details: {
        indexedPages,
        contentToAuthorityRatio,
        maturityLevel
      }
    });
  }
  if (maturityLevel === "growing" && !htmlSignals.hasBlog) {
    issues.push({
      code: "GROWING_SITE_NO_BLOG",
      severity: "notice",
      category: "content",
      title: "Growing site without blog/content hub",
      description: "Site is in growth phase but lacks a blog or content section.",
      impact: "Blog content is essential for attracting backlinks and building topical authority.",
      howToFix: "Create a blog section with linkable content assets (guides, research, tools).",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      estimatedAge: {
        days: estimatedAgeDays,
        source: ageSource,
        confidence: ageConfidence
      },
      maturityLevel,
      authorityIndicators,
      contentMetrics,
      recommendedStrategy: strategy,
      strategicRecommendations: recommendations
    }
  };
}

// src/audit/checks/tracker-bloat.ts
import * as cheerio25 from "https://esm.sh/cheerio@1.0.0";
var KNOWN_TRACKERS = [
  // Analytics
  { name: "Google Analytics (GA4)", domain: "googletagmanager.com", type: "analytics", impact: "medium" },
  { name: "Google Analytics (Universal)", domain: "google-analytics.com", type: "analytics", impact: "medium" },
  { name: "Google Tag Manager", domain: "googletagmanager.com", type: "analytics", impact: "medium" },
  { name: "Segment", domain: "segment.com", type: "analytics", impact: "medium" },
  { name: "Mixpanel", domain: "mixpanel.com", type: "analytics", impact: "medium" },
  { name: "Amplitude", domain: "amplitude.com", type: "analytics", impact: "medium" },
  { name: "Heap", domain: "heap.io", type: "analytics", impact: "medium" },
  { name: "Plausible", domain: "plausible.io", type: "analytics", impact: "low" },
  { name: "Fathom", domain: "usefathom.com", type: "analytics", impact: "low" },
  { name: "Simple Analytics", domain: "simpleanalytics.com", type: "analytics", impact: "low" },
  { name: "PostHog", domain: "posthog.com", type: "analytics", impact: "medium" },
  // Advertising pixels
  { name: "Facebook Pixel", domain: "connect.facebook.net", type: "advertising", impact: "high" },
  { name: "Meta Pixel", domain: "facebook.com/tr", type: "advertising", impact: "high" },
  { name: "TikTok Pixel", domain: "analytics.tiktok.com", type: "advertising", impact: "high" },
  { name: "Twitter/X Pixel", domain: "static.ads-twitter.com", type: "advertising", impact: "high" },
  { name: "LinkedIn Insight", domain: "snap.licdn.com", type: "advertising", impact: "high" },
  { name: "Pinterest Tag", domain: "pintrk", type: "advertising", impact: "high" },
  { name: "Snapchat Pixel", domain: "sc-static.net", type: "advertising", impact: "high" },
  { name: "Google Ads", domain: "googleadservices.com", type: "advertising", impact: "high" },
  { name: "Google Ads Conversion", domain: "googleads.g.doubleclick.net", type: "advertising", impact: "high" },
  { name: "Microsoft/Bing Ads", domain: "bat.bing.com", type: "advertising", impact: "high" },
  { name: "Criteo", domain: "criteo.com", type: "advertising", impact: "high" },
  { name: "Taboola", domain: "taboola.com", type: "advertising", impact: "high" },
  { name: "Outbrain", domain: "outbrain.com", type: "advertising", impact: "high" },
  // Marketing automation
  { name: "HubSpot", domain: "js.hs-scripts.com", type: "marketing", impact: "high" },
  { name: "HubSpot Analytics", domain: "js.hs-analytics.net", type: "marketing", impact: "high" },
  { name: "Marketo", domain: "munchkin.marketo.net", type: "marketing", impact: "high" },
  { name: "Pardot", domain: "pardot.com", type: "marketing", impact: "high" },
  { name: "ActiveCampaign", domain: "trackcmp.net", type: "marketing", impact: "medium" },
  { name: "Klaviyo", domain: "klaviyo.com", type: "marketing", impact: "medium" },
  { name: "Mailchimp", domain: "chimpstatic.com", type: "marketing", impact: "medium" },
  { name: "Drip", domain: "getdrip.com", type: "marketing", impact: "medium" },
  // Heatmaps & Session Recording
  { name: "Hotjar", domain: "hotjar.com", type: "heatmap", impact: "high" },
  { name: "Crazy Egg", domain: "crazyegg.com", type: "heatmap", impact: "high" },
  { name: "FullStory", domain: "fullstory.com", type: "heatmap", impact: "high" },
  { name: "Lucky Orange", domain: "luckyorange.com", type: "heatmap", impact: "high" },
  { name: "Mouseflow", domain: "mouseflow.com", type: "heatmap", impact: "high" },
  { name: "Clarity", domain: "clarity.ms", type: "heatmap", impact: "medium" },
  { name: "LogRocket", domain: "logrocket.com", type: "heatmap", impact: "high" },
  // Chat widgets
  { name: "Intercom", domain: "intercom.io", type: "chat", impact: "high" },
  { name: "Drift", domain: "drift.com", type: "chat", impact: "high" },
  { name: "Zendesk Chat", domain: "zopim.com", type: "chat", impact: "high" },
  { name: "Crisp", domain: "crisp.chat", type: "chat", impact: "medium" },
  { name: "Tidio", domain: "tidio.co", type: "chat", impact: "medium" },
  { name: "LiveChat", domain: "livechatinc.com", type: "chat", impact: "high" },
  { name: "Freshchat", domain: "freshchat.com", type: "chat", impact: "high" },
  // Social widgets
  { name: "Twitter Widget", domain: "platform.twitter.com", type: "social", impact: "medium" },
  { name: "Facebook SDK", domain: "connect.facebook.net/en_US/sdk.js", type: "social", impact: "high" },
  { name: "Instagram Embed", domain: "instagram.com/embed.js", type: "social", impact: "medium" },
  { name: "LinkedIn Badge", domain: "platform.linkedin.com", type: "social", impact: "medium" },
  { name: "AddThis", domain: "addthis.com", type: "social", impact: "high" },
  { name: "ShareThis", domain: "sharethis.com", type: "social", impact: "high" },
  // Other
  { name: "Cloudflare Web Analytics", domain: "cloudflareinsights.com", type: "analytics", impact: "low" },
  { name: "Sentry", domain: "sentry.io", type: "other", impact: "low" },
  { name: "DataDog RUM", domain: "datadoghq.com", type: "other", impact: "medium" },
  { name: "New Relic", domain: "newrelic.com", type: "other", impact: "medium" },
  { name: "Optimizely", domain: "optimizely.com", type: "other", impact: "high" },
  { name: "VWO", domain: "visualwebsiteoptimizer.com", type: "other", impact: "high" },
  { name: "Google Optimize", domain: "googleoptimize.com", type: "other", impact: "medium" }
];
function detectTrackers(html) {
  const $ = cheerio25.load(html);
  const trackers = [];
  const scripts = $("script");
  scripts.each((_, el) => {
    const $script = $(el);
    const src = $script.attr("src") || "";
    const inlineContent = $script.html() || "";
    if (src) {
      const tracker = identifyTracker(src);
      if (tracker) {
        trackers.push({
          ...tracker,
          scriptUrl: src,
          loadMethod: $script.attr("async") !== void 0 ? "async" : $script.attr("defer") !== void 0 ? "defer" : "sync"
        });
      }
    }
    if (inlineContent) {
      const inlineTrackers = identifyInlineTrackers(inlineContent);
      trackers.push(...inlineTrackers);
    }
  });
  $("img[src], iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    const tracker = identifyTracker(src);
    if (tracker) {
      trackers.push({
        ...tracker,
        scriptUrl: src,
        loadMethod: "sync"
      });
    }
  });
  const uniqueTrackers = Array.from(
    new Map(trackers.map((t) => [t.name, t])).values()
  );
  const byType = {};
  const byImpact = {};
  for (const tracker of uniqueTrackers) {
    byType[tracker.type] = (byType[tracker.type] || 0) + 1;
    byImpact[tracker.impact] = (byImpact[tracker.impact] || 0) + 1;
  }
  const impactScore = calculateImpactScore(uniqueTrackers);
  const recommendations = generateRecommendations(uniqueTrackers, byType);
  return {
    trackers: uniqueTrackers,
    totalCount: uniqueTrackers.length,
    byType,
    byImpact,
    estimatedImpactScore: impactScore,
    recommendations
  };
}
function identifyTracker(url) {
  const urlLower = url.toLowerCase();
  for (const tracker of KNOWN_TRACKERS) {
    if (urlLower.includes(tracker.domain.toLowerCase())) {
      return tracker;
    }
  }
  return null;
}
function identifyInlineTrackers(content) {
  const trackers = [];
  const contentLower = content.toLowerCase();
  if (contentLower.includes("fbq(") || contentLower.includes("facebook-jssdk")) {
    trackers.push({
      name: "Facebook Pixel (inline)",
      domain: "facebook.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("gtag(") && contentLower.includes("config")) {
    trackers.push({
      name: "Google Analytics (inline)",
      domain: "google-analytics.com",
      type: "analytics",
      impact: "medium",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("ttq.") || contentLower.includes("tiktok")) {
    trackers.push({
      name: "TikTok Pixel (inline)",
      domain: "tiktok.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("_linkedin_partner_id") || contentLower.includes("linkedin")) {
    trackers.push({
      name: "LinkedIn Insight (inline)",
      domain: "linkedin.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("hotjar") || contentLower.includes("hjid")) {
    trackers.push({
      name: "Hotjar (inline)",
      domain: "hotjar.com",
      type: "heatmap",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("intercom") && contentLower.includes("app_id")) {
    trackers.push({
      name: "Intercom (inline)",
      domain: "intercom.io",
      type: "chat",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("_hsq") || contentLower.includes("hubspot")) {
    trackers.push({
      name: "HubSpot (inline)",
      domain: "hubspot.com",
      type: "marketing",
      impact: "high",
      loadMethod: "inline"
    });
  }
  return trackers;
}
function calculateImpactScore(trackers) {
  let score = 0;
  for (const tracker of trackers) {
    const baseImpact = tracker.impact === "high" ? 15 : tracker.impact === "medium" ? 8 : 3;
    const loadPenalty = tracker.loadMethod === "sync" ? 1.5 : tracker.loadMethod === "inline" ? 1.2 : 1;
    score += baseImpact * loadPenalty;
  }
  return Math.min(100, Math.round(score));
}
function generateRecommendations(trackers, byType) {
  const recommendations = [];
  if (trackers.length > 5) {
    recommendations.push(
      `Reduce tracker count from ${trackers.length} to 5 or fewer for better page speed`
    );
  }
  if ((byType.advertising || 0) > 2) {
    recommendations.push(
      `Consider consolidating ${byType.advertising} advertising pixels - each one significantly impacts First Input Delay`
    );
  }
  if ((byType.analytics || 0) > 1) {
    recommendations.push(
      `You have ${byType.analytics} analytics tools - consider using just one comprehensive solution`
    );
  }
  if ((byType.heatmap || 0) > 0) {
    recommendations.push(
      `Session recording tools (${byType.heatmap} found) significantly impact performance - use sparingly and only on specific pages`
    );
  }
  if ((byType.chat || 0) > 1) {
    recommendations.push(
      `Multiple chat widgets detected (${byType.chat}) - consolidate to one solution`
    );
  }
  const syncTrackers = trackers.filter((t) => t.loadMethod === "sync");
  if (syncTrackers.length > 0) {
    recommendations.push(
      `${syncTrackers.length} tracker(s) loaded synchronously - add async/defer to improve page load`
    );
  }
  const heavyAnalytics = trackers.filter(
    (t) => t.type === "analytics" && t.impact !== "low"
  );
  if (heavyAnalytics.length > 0 && !trackers.some((t) => t.impact === "low")) {
    recommendations.push(
      "Consider privacy-friendly, lightweight analytics like Plausible, Fathom, or Simple Analytics"
    );
  }
  return recommendations;
}
function analyzeTrackerBloat(html, url) {
  const issues = [];
  const analysis = detectTrackers(html);
  if (analysis.totalCount > 8) {
    issues.push({
      code: "EXCESSIVE_TRACKERS",
      severity: "error",
      category: "performance",
      title: `Excessive third-party trackers (${analysis.totalCount} detected)`,
      description: `Found ${analysis.totalCount} third-party trackers/scripts. Each one adds to page weight and processing time.`,
      impact: `Estimated ${analysis.estimatedImpactScore}% negative impact on Core Web Vitals (First Input Delay, LCP).`,
      howToFix: "Audit your trackers and remove any that are not providing value. Consolidate analytics tools and limit advertising pixels.",
      affectedUrls: [url],
      details: {
        trackers: analysis.trackers.map((t) => t.name),
        byType: analysis.byType,
        impactScore: analysis.estimatedImpactScore
      }
    });
  } else if (analysis.totalCount > 5) {
    issues.push({
      code: "MANY_TRACKERS",
      severity: "warning",
      category: "performance",
      title: `Many third-party trackers (${analysis.totalCount} detected)`,
      description: `Found ${analysis.totalCount} third-party trackers. This may be impacting page performance.`,
      impact: `Estimated ${analysis.estimatedImpactScore}% negative impact on page interactivity.`,
      howToFix: "Review tracker necessity and consider removing underused ones. Prioritize essential analytics and business tools.",
      affectedUrls: [url],
      details: {
        trackers: analysis.trackers.map((t) => t.name),
        byType: analysis.byType
      }
    });
  }
  const syncHighImpact = analysis.trackers.filter(
    (t) => t.loadMethod === "sync" && t.impact === "high"
  );
  if (syncHighImpact.length > 0) {
    issues.push({
      code: "SYNC_TRACKER_LOADING",
      severity: "warning",
      category: "performance",
      title: `High-impact trackers loading synchronously`,
      description: `${syncHighImpact.length} high-impact tracker(s) are loading synchronously, blocking page rendering.`,
      impact: "Synchronous scripts block the parser and significantly delay First Contentful Paint.",
      howToFix: "Add async or defer attributes to tracker scripts, or load them after user interaction.",
      affectedUrls: [url],
      details: {
        scripts: syncHighImpact.map((t) => t.name)
      }
    });
  }
  if ((analysis.byType.heatmap || 0) > 1) {
    issues.push({
      code: "MULTIPLE_SESSION_RECORDERS",
      severity: "warning",
      category: "performance",
      title: `Multiple session recording tools detected`,
      description: `Found ${analysis.byType.heatmap} session recording/heatmap tools. These are among the heaviest trackers.`,
      impact: "Session recorders capture every user interaction and can add 100-500ms to page load time each.",
      howToFix: "Use only one session recording tool, and consider enabling it only for specific pages or user segments.",
      affectedUrls: [url],
      details: {
        tools: analysis.trackers.filter((t) => t.type === "heatmap").map((t) => t.name)
      }
    });
  }
  if ((analysis.byType.advertising || 0) > 3) {
    issues.push({
      code: "TOO_MANY_AD_PIXELS",
      severity: "warning",
      category: "performance",
      title: `Too many advertising pixels (${analysis.byType.advertising} found)`,
      description: `Found ${analysis.byType.advertising} advertising/conversion pixels. Each one makes network requests and runs JavaScript.`,
      impact: "Ad pixels are often the heaviest trackers. More than 3 can add 1-2 seconds to page load time.",
      howToFix: "Consolidate pixels using a tag manager with server-side tracking, or prioritize only your most important ad platforms.",
      affectedUrls: [url],
      details: {
        pixels: analysis.trackers.filter((t) => t.type === "advertising").map((t) => t.name)
      }
    });
  }
  return { issues, data: analysis };
}

// src/audit/checks/client-rendering.ts
import * as cheerio26 from "https://esm.sh/cheerio@1.0.0";
var FRAMEWORK_PATTERNS = {
  "Next.js": [/__NEXT_DATA__/, /next\//, /_next\//],
  "Nuxt": [/__NUXT__/, /nuxt/, /_nuxt\//],
  "Gatsby": [/___gatsby/, /gatsby-/, /gatsby-image/],
  "Remix": [/__remix/, /remix/],
  "SvelteKit": [/__sveltekit/, /svelte/],
  "Angular Universal": [/ng-version/, /angular/],
  "React": [/react-root/, /data-reactroot/, /__REACT/],
  "Vue": [/data-v-/, /Vue\./, /__VUE/],
  "Astro": [/astro-/, /astro:/]
};
var META_MANAGEMENT_PATTERNS = [
  { name: "React Helmet", pattern: /data-react-helmet/i },
  { name: "Next.js Head", pattern: /__NEXT_DATA__.*"head"/i },
  { name: "Vue Meta", pattern: /data-vue-meta/i },
  { name: "Nuxt Head", pattern: /__NUXT__.*"head"/i },
  { name: "Remix Meta", pattern: /__remix_meta/i }
];
var CSR_INDICATORS = [
  // Empty root elements waiting for JS to populate
  { pattern: /<div id="root"><\/div>/i, weight: 3 },
  { pattern: /<div id="app"><\/div>/i, weight: 3 },
  { pattern: /<div id="__next"><\/div>/i, weight: 2 },
  // Empty Next.js (should have content)
  { pattern: /<div id="__nuxt"><\/div>/i, weight: 2 },
  // Empty Nuxt
  { pattern: /<main><\/main>/i, weight: 2 },
  { pattern: /<article><\/article>/i, weight: 2 },
  // Noscript warnings indicating JS dependency
  { pattern: /<noscript>.*(?:enable|require|need).*javascript/i, weight: 3 },
  { pattern: /<noscript>.*(?:won't work|doesn't work)/i, weight: 3 },
  // Very minimal HTML body
  { pattern: /<body[^>]*>\s*<(?:div|script)[^>]*>\s*<\/(?:div|script)>\s*<\/body>/i, weight: 4 },
  // Loading spinners/states in initial HTML
  { pattern: /class="[^"]*loading[^"]*"/i, weight: 1 },
  { pattern: /Loading\.\.\./i, weight: 1 },
  // Client-only component indicators
  { pattern: /data-client-only/i, weight: 2 },
  { pattern: /client:only/i, weight: 2 }
  // Astro client:only
];
var SSR_INDICATORS = [
  // Hydration markers (content was rendered server-side)
  { pattern: /__NEXT_DATA__/, weight: 3 },
  { pattern: /__NUXT__/, weight: 3 },
  { pattern: /data-reactroot/, weight: 2 },
  { pattern: /data-server-rendered/, weight: 3 },
  // Pre-rendered content indicators
  { pattern: /<h1[^>]*>[^<]+<\/h1>/i, weight: 2 },
  { pattern: /<article[^>]*>[^<]{100,}/i, weight: 3 },
  { pattern: /<main[^>]*>[^<]{100,}/i, weight: 3 },
  // Meta content (usually server-rendered)
  { pattern: /<meta property="og:title"[^>]*content="[^"]+"/, weight: 1 },
  { pattern: /<meta name="description"[^>]*content="[^"]+"/, weight: 1 },
  // Structured data
  { pattern: /<script type="application\/ld\+json">/, weight: 2 }
];
function detectFramework2(html) {
  for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(html)) {
        return framework;
      }
    }
  }
  return null;
}
function analyzeRendering(html) {
  const $ = cheerio26.load(html);
  const signals = [];
  const frameworkDetected = detectFramework2(html);
  let csrScore = 0;
  for (const indicator of CSR_INDICATORS) {
    if (indicator.pattern.test(html)) {
      csrScore += indicator.weight;
      signals.push({
        indicator: indicator.pattern.toString(),
        suggests: "csr",
        weight: indicator.weight
      });
    }
  }
  let ssrScore = 0;
  for (const indicator of SSR_INDICATORS) {
    if (indicator.pattern.test(html)) {
      ssrScore += indicator.weight;
      signals.push({
        indicator: indicator.pattern.toString(),
        suggests: "ssr",
        weight: indicator.weight
      });
    }
  }
  const mainContent = $('main, article, [role="main"], .content, #content').text();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const mainContentCharCount = mainContent.length || bodyText.length;
  const hasContentInHTML = mainContentCharCount > 200;
  if (!hasContentInHTML) {
    csrScore += 4;
    signals.push({
      indicator: `Body text only ${mainContentCharCount} chars`,
      suggests: "csr",
      weight: 4
    });
  } else {
    ssrScore += 2;
  }
  const hasHydrationMarkers = /__NEXT_DATA__|__NUXT__|data-reactroot|data-server-rendered/.test(html);
  const hasClientOnlyIndicators = $("[data-client-only], [client\\:only]").length > 0;
  let metaManagement = null;
  for (const { name, pattern } of META_MANAGEMENT_PATTERNS) {
    if (pattern.test(html)) {
      metaManagement = name;
      break;
    }
  }
  const hasDynamicMetaTags = metaManagement !== null || $("meta[data-react-helmet]").length > 0 || $("meta[data-vue-meta]").length > 0;
  const hasH1 = $("h1").length > 0 && $("h1").text().trim().length > 0;
  const hasH2 = $("h2").length > 0;
  const hasMain = $('main, [role="main"]').length > 0;
  const hasArticle = $("article").length > 0;
  const hasSemanticStructure = hasH1 && (hasMain || hasArticle);
  const title = $("title").text().trim();
  const h1Text = $("h1").first().text().trim();
  const firstParagraph = $("p").first().text().trim();
  const keyContentInHTML = title.length > 10 && h1Text.length > 5 && firstParagraph.length > 50;
  const EXPECTED_MIN_CONTENT = 1e3;
  const htmlContentRatio = Math.min(100, mainContentCharCount / EXPECTED_MIN_CONTENT * 100);
  let aiReadableScore = 50;
  if (mainContentCharCount > 2e3)
    aiReadableScore += 20;
  else if (mainContentCharCount > 1e3)
    aiReadableScore += 15;
  else if (mainContentCharCount > 500)
    aiReadableScore += 10;
  else if (mainContentCharCount < 200)
    aiReadableScore -= 20;
  if (hasSemanticStructure)
    aiReadableScore += 15;
  if (hasH1 && hasH2)
    aiReadableScore += 5;
  if (keyContentInHTML)
    aiReadableScore += 15;
  else
    aiReadableScore -= 10;
  if (hasHydrationMarkers || ssrScore > csrScore)
    aiReadableScore += 10;
  if (csrScore > ssrScore + 3)
    aiReadableScore -= 20;
  aiReadableScore = Math.max(0, Math.min(100, aiReadableScore));
  const aiAccessibility = {
    htmlContentRatio: Math.round(htmlContentRatio),
    hasSemanticStructure,
    keyContentInHTML,
    aiReadableScore
  };
  let renderingMethod;
  let confidence;
  if (csrScore > ssrScore + 3) {
    renderingMethod = "csr";
    confidence = csrScore - ssrScore > 6 ? "high" : "medium";
  } else if (ssrScore > csrScore + 3) {
    const isLikelyStatic = html.includes("data-gatsby") || html.includes("astro-") || !html.includes("__NEXT_DATA__") && !html.includes("__NUXT__");
    renderingMethod = isLikelyStatic ? "ssg" : "ssr";
    confidence = ssrScore - csrScore > 6 ? "high" : "medium";
  } else if (hasHydrationMarkers && hasClientOnlyIndicators) {
    renderingMethod = "hybrid";
    confidence = "medium";
  } else {
    renderingMethod = "unknown";
    confidence = "low";
  }
  const recommendations = generateRecommendations2(
    renderingMethod,
    hasContentInHTML,
    mainContentCharCount,
    frameworkDetected
  );
  return {
    renderingMethod,
    confidence,
    signals,
    frameworkDetected,
    hasContentInHTML,
    hasHydrationMarkers,
    hasClientOnlyIndicators,
    mainContentCharCount,
    recommendations,
    metaManagement,
    hasDynamicMetaTags,
    aiAccessibility
  };
}
function generateRecommendations2(renderingMethod, hasContentInHTML, charCount, framework) {
  const recommendations = [];
  if (renderingMethod === "csr") {
    recommendations.push(
      "Critical: Pre-render your pages so crawlers see actual content in the HTML"
    );
    if (framework === "React") {
      recommendations.push(
        "Quick fix: Use Vike (vike.dev) for SSR/SSG - works with Vite, minimal config needed"
      );
      recommendations.push(
        "Alternative: Migrate to Next.js or Remix for built-in SSR/SSG support"
      );
    } else if (framework === "Vue") {
      recommendations.push(
        "Quick fix: Use Vike (vike.dev) for SSR/SSG - works with Vite, minimal config needed"
      );
      recommendations.push(
        "Alternative: Migrate to Nuxt for built-in SSR/SSG support"
      );
    } else if (framework === "Angular Universal") {
      recommendations.push(
        "Enable Angular Universal for server-side rendering"
      );
    } else {
      recommendations.push(
        "Quick fix: Use Vike (vike.dev) for SSR/SSG with any Vite-based framework"
      );
    }
    recommendations.push(
      "Google can render JavaScript, but pre-rendered HTML is more reliable and faster to index"
    );
  }
  if (!hasContentInHTML) {
    recommendations.push(
      `Very little content in initial HTML (${charCount} chars). Search engines may not see your content.`
    );
  }
  if (renderingMethod === "hybrid") {
    recommendations.push(
      "Hybrid rendering detected. Ensure critical SEO content is server-rendered, not client-only."
    );
  }
  return recommendations;
}
function analyzeClientRendering(html, url) {
  const $ = cheerio26.load(html);
  const issues = [];
  const analysis = analyzeRendering(html);
  if (analysis.renderingMethod === "csr" && analysis.confidence !== "low") {
    const howToFixByFramework = analysis.frameworkDetected === "React" ? "Use Vike (vike.dev) to add SSR/SSG to your Vite React app: npm install vike vike-react, then follow the setup guide. Alternatively, migrate to Next.js or Remix." : analysis.frameworkDetected === "Vue" ? "Use Vike (vike.dev) to add SSR/SSG to your Vite Vue app: npm install vike vike-vue, then follow the setup guide. Alternatively, migrate to Nuxt." : "Use Vike (vike.dev) for SSR/SSG with Vite-based frameworks, or use a framework with built-in SSR support (Next.js, Nuxt, Remix, SvelteKit).";
    issues.push({
      code: "CLIENT_SIDE_RENDERING",
      severity: "error",
      category: "crawlability",
      title: "Page relies on client-side rendering",
      description: "This page appears to render content primarily via JavaScript. Search engines may not see your content.",
      impact: "Google can execute JavaScript but it's slower and less reliable. Content may not be indexed properly.",
      howToFix: howToFixByFramework,
      affectedUrls: [url],
      details: {
        confidence: analysis.confidence,
        framework: analysis.frameworkDetected,
        signals: analysis.signals.filter((s) => s.suggests === "csr").slice(0, 5)
      }
    });
  }
  if (!analysis.hasContentInHTML) {
    issues.push({
      code: "EMPTY_BODY_CONTENT",
      severity: "error",
      category: "content",
      title: "Very little content in initial HTML",
      description: `Only ${analysis.mainContentCharCount} characters of text found in the HTML. Content may be loaded via JavaScript.`,
      impact: "Search engines prioritize content in the initial HTML response. JavaScript-loaded content may be missed or delayed.",
      howToFix: "Ensure main page content is present in the server-rendered HTML, not loaded via JavaScript after page load.",
      affectedUrls: [url],
      details: {
        charCount: analysis.mainContentCharCount,
        renderingMethod: analysis.renderingMethod
      }
    });
  }
  if (analysis.frameworkDetected && ["React", "Vue"].includes(analysis.frameworkDetected) && !analysis.hasHydrationMarkers && analysis.mainContentCharCount < 500) {
    issues.push({
      code: "SPA_WITHOUT_SSR",
      severity: "warning",
      category: "crawlability",
      title: `${analysis.frameworkDetected} detected without SSR markers`,
      description: `This appears to be a ${analysis.frameworkDetected} SPA without server-side rendering enabled.`,
      impact: "Single Page Applications without SSR have slower time-to-content for search crawlers.",
      howToFix: analysis.frameworkDetected === "React" ? "Add SSR/SSG using Vike (vike.dev): npm install vike vike-react. Alternative: migrate to Next.js or Remix." : "Add SSR/SSG using Vike (vike.dev): npm install vike vike-vue. Alternative: migrate to Nuxt.",
      affectedUrls: [url],
      details: {
        framework: analysis.frameworkDetected,
        hasHydrationMarkers: analysis.hasHydrationMarkers
      }
    });
  }
  if (analysis.renderingMethod === "ssr" && analysis.confidence !== "low") {
  }
  if (analysis.frameworkDetected && ["React", "Vue"].includes(analysis.frameworkDetected) && !analysis.hasDynamicMetaTags && analysis.renderingMethod !== "csr") {
    const helmetLib = analysis.frameworkDetected === "React" ? "React Helmet" : "Vue Meta";
    const metaTagsPresent = $('meta[name="description"], meta[property="og:title"]').length > 0;
    if (!metaTagsPresent) {
      issues.push({
        code: "SPA_NO_META_MANAGEMENT",
        severity: "warning",
        category: "on-page",
        title: `${analysis.frameworkDetected} app may lack dynamic meta tag management`,
        description: `No ${helmetLib} or similar library detected for managing meta tags in this SPA.`,
        impact: "SPAs need dynamic meta tag management for proper page-specific titles, descriptions, and social tags.",
        howToFix: analysis.frameworkDetected === "React" ? "Use React Helmet, Next.js Head, or Remix meta exports for dynamic meta tags." : "Use Vue Meta, Nuxt Head, or vue-head for dynamic meta tags.",
        affectedUrls: [url],
        details: {
          framework: analysis.frameworkDetected,
          metaManagement: analysis.metaManagement
        }
      });
    }
  }
  if (analysis.aiAccessibility.aiReadableScore < 50) {
    issues.push({
      code: "AI_LOW_HTML_READABILITY",
      severity: "warning",
      category: "ai-readiness",
      title: "Content not optimally accessible to AI systems",
      description: `AI readability score: ${analysis.aiAccessibility.aiReadableScore}/100. AI systems like ChatGPT primarily read raw HTML and may miss JavaScript-rendered content.`,
      impact: "Content may not be properly indexed by AI search systems (ChatGPT, Perplexity, etc.), reducing AI citation likelihood.",
      howToFix: "Ensure key content is in the initial HTML response: 1) Use SSR/SSG, 2) Include title, H1, and main content in HTML, 3) Don't hide content behind JavaScript interactions.",
      affectedUrls: [url],
      details: {
        aiReadableScore: analysis.aiAccessibility.aiReadableScore,
        htmlContentRatio: analysis.aiAccessibility.htmlContentRatio,
        hasSemanticStructure: analysis.aiAccessibility.hasSemanticStructure,
        keyContentInHTML: analysis.aiAccessibility.keyContentInHTML
      }
    });
  }
  if (!analysis.aiAccessibility.hasSemanticStructure && analysis.mainContentCharCount > 500) {
    issues.push({
      code: "AI_NO_SEMANTIC_STRUCTURE",
      severity: "notice",
      category: "ai-readiness",
      title: "Content lacks semantic HTML structure for AI parsing",
      description: "Missing semantic landmarks (<main>, <article>) or heading hierarchy. AI systems use these to identify and extract key content.",
      impact: "AI may not correctly identify the main content area, potentially extracting navigation or footer text instead.",
      howToFix: "Add semantic HTML: wrap main content in <main> or <article>, ensure H1 exists and heading hierarchy is logical (H1 \u2192 H2 \u2192 H3).",
      affectedUrls: [url]
    });
  }
  if (!analysis.aiAccessibility.keyContentInHTML && analysis.renderingMethod !== "csr") {
    issues.push({
      code: "AI_KEY_CONTENT_NOT_IN_HTML",
      severity: "warning",
      category: "ai-readiness",
      title: "Key content elements missing from initial HTML",
      description: "Title, H1, or opening paragraph content is missing or too short in the HTML. AI systems extract these first.",
      impact: "AI may not have access to your primary message, reducing chances of accurate citation.",
      howToFix: "Ensure the initial HTML contains: meaningful <title>, descriptive <h1>, and a substantial first paragraph with your key message.",
      affectedUrls: [url],
      details: {
        hasTitle: $("title").text().trim().length > 10,
        hasH1: $("h1").text().trim().length > 5,
        hasFirstParagraph: $("p").first().text().trim().length > 50
      }
    });
  }
  return { issues, data: analysis };
}

// src/audit/checks/redirect-chain.ts
var MAX_REDIRECTS = 10;
async function traceRedirectChain(url, options = {}) {
  const hops = [];
  let currentUrl = url;
  let chainLength = 0;
  let totalTime = 0;
  const visitedUrls = /* @__PURE__ */ new Set();
  const timeout = options.timeout || 1e4;
  while (chainLength < MAX_REDIRECTS) {
    if (visitedUrls.has(currentUrl)) {
      break;
    }
    visitedUrls.add(currentUrl);
    try {
      const startTime = Date.now();
      const response = await httpGet(currentUrl, {
        timeout,
        maxRedirects: 0,
        // Don't auto-follow, we want to trace manually
        validateStatus: () => true
        // Accept all status codes
      });
      const responseTime = Date.now() - startTime;
      totalTime += responseTime;
      const statusCode = response.status;
      const locationHeader = response.headers.location;
      let redirectTo = null;
      if (locationHeader) {
        try {
          redirectTo = new URL(locationHeader, currentUrl).toString();
        } catch {
          redirectTo = locationHeader;
        }
      }
      hops.push({
        url: currentUrl,
        statusCode,
        statusText: response.statusText || getStatusText(statusCode),
        redirectTo,
        responseTime
      });
      if (statusCode >= 300 && statusCode < 400 && redirectTo) {
        chainLength++;
        currentUrl = redirectTo;
      } else {
        break;
      }
    } catch (error) {
      hops.push({
        url: currentUrl,
        statusCode: 0,
        statusText: error instanceof Error ? error.message : "Network error",
        redirectTo: null,
        responseTime: 0
      });
      break;
    }
  }
  const finalUrl = hops.length > 0 ? hops[hops.length - 1].url : url;
  const issues = analyzeChainIssues(url, hops);
  return {
    originalUrl: url,
    finalUrl,
    hops,
    chainLength: hops.length - 1,
    // Number of redirects (not including final destination)
    totalTime,
    hasHttpsUpgrade: detectHttpsUpgrade(hops),
    hasWwwNormalization: detectWwwNormalization(hops),
    hasTrailingSlashIssue: detectTrailingSlashIssue(hops),
    isInternalLoop: visitedUrls.size !== hops.length,
    issues
  };
}
function getStatusText(code) {
  const statusTexts = {
    200: "OK",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    404: "Not Found",
    500: "Internal Server Error"
  };
  return statusTexts[code] || "Unknown";
}
function detectHttpsUpgrade(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const current = hops[i].url;
    const next = hops[i].redirectTo;
    if (current.startsWith("http://") && next?.startsWith("https://")) {
      return true;
    }
  }
  return false;
}
function detectWwwNormalization(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const currentHost = extractHost(hops[i].url);
    const nextHost = hops[i].redirectTo ? extractHost(hops[i].redirectTo) : null;
    if (currentHost && nextHost) {
      const hasWwwChange = currentHost.startsWith("www.") && !nextHost.startsWith("www.") || !currentHost.startsWith("www.") && nextHost.startsWith("www.");
      if (hasWwwChange) {
        return true;
      }
    }
  }
  return false;
}
function detectTrailingSlashIssue(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const current = new URL(hops[i].url);
    const next = hops[i].redirectTo ? new URL(hops[i].redirectTo) : null;
    if (next && current.pathname !== next.pathname) {
      const pathDiff = current.pathname.endsWith("/") && !next.pathname.endsWith("/") || !current.pathname.endsWith("/") && next.pathname.endsWith("/");
      const normalizedCurrent = current.pathname.replace(/\/$/, "");
      const normalizedNext = next.pathname.replace(/\/$/, "");
      if (pathDiff && normalizedCurrent === normalizedNext) {
        return true;
      }
    }
  }
  return false;
}
function extractHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
function analyzeChainIssues(originalUrl, hops) {
  const issues = [];
  const redirectCount = hops.filter((h) => h.statusCode >= 300 && h.statusCode < 400).length;
  if (redirectCount > 1) {
    issues.push(`Redirect chain detected: ${redirectCount} hops`);
  }
  const has301 = hops.some((h) => h.statusCode === 301 || h.statusCode === 308);
  const has302 = hops.some((h) => h.statusCode === 302 || h.statusCode === 307);
  if (has301 && has302) {
    issues.push("Mixed permanent and temporary redirects");
  }
  const uses302 = hops.some((h) => h.statusCode === 302);
  if (uses302 && redirectCount === 1) {
    issues.push("Consider using 301 (permanent) instead of 302 (temporary)");
  }
  for (const hop of hops) {
    if (hop.responseTime > 500) {
      issues.push(`Slow redirect: ${hop.url} took ${hop.responseTime}ms`);
    }
  }
  if (originalUrl.startsWith("http://")) {
    const finalHop = hops[hops.length - 1];
    if (finalHop && !finalHop.url.startsWith("https://")) {
      issues.push("HTTP URL does not redirect to HTTPS");
    }
  }
  const httpAndWwwRedirects = hops.filter(
    (h) => h.statusCode >= 300 && h.statusCode < 400
  );
  if (httpAndWwwRedirects.length > 1) {
    issues.push("Multiple normalizations (consider combining HTTPS + www redirects)");
  }
  return issues;
}
async function analyzeRedirectChain(url) {
  const issues = [];
  const result = await traceRedirectChain(url);
  if (result.isInternalLoop) {
    issues.push({
      code: "REDIRECT_LOOP",
      severity: "error",
      category: "crawlability",
      title: "Redirect loop detected",
      description: "The URL redirects to itself or creates a circular redirect chain.",
      impact: "Search engines cannot index pages with redirect loops. Users will see an error.",
      howToFix: "Review redirect rules and ensure each URL points to a single final destination.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => h.url)
      }
    });
  }
  if (result.chainLength >= 3) {
    issues.push({
      code: "LONG_REDIRECT_CHAIN",
      severity: "error",
      category: "crawlability",
      title: `Long redirect chain (${result.chainLength} hops)`,
      description: `URL requires ${result.chainLength} redirects before reaching the final destination.`,
      impact: "Long redirect chains slow page load, waste crawl budget, and may lose link equity.",
      howToFix: "Update internal links to point directly to the final URL. Combine redirect rules.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => ({ url: h.url, status: h.statusCode })),
        totalTime: result.totalTime
      }
    });
  } else if (result.chainLength === 2) {
    issues.push({
      code: "REDIRECT_CHAIN",
      severity: "warning",
      category: "crawlability",
      title: "Redirect chain detected (2 hops)",
      description: "URL has an intermediate redirect before reaching the final destination.",
      impact: "Each redirect adds latency and may dilute link equity slightly.",
      howToFix: "Combine redirects into a single hop from source to final destination.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => ({ url: h.url, status: h.statusCode }))
      }
    });
  }
  const uses302 = result.hops.some((h) => h.statusCode === 302 || h.statusCode === 307);
  if (uses302 && result.chainLength > 0) {
    issues.push({
      code: "TEMPORARY_REDIRECT",
      severity: "warning",
      category: "crawlability",
      title: "Temporary redirect (302/307) used",
      description: "URL uses a temporary redirect instead of a permanent redirect.",
      impact: "Temporary redirects may not pass full link equity. Use 301/308 for permanent moves.",
      howToFix: "Change 302/307 redirects to 301/308 if the redirect is permanent.",
      affectedUrls: [url],
      details: {
        redirectType: result.hops.find((h) => h.statusCode === 302 || h.statusCode === 307)?.statusCode
      }
    });
  }
  if (result.hasHttpsUpgrade && result.chainLength === 1) {
  }
  if (result.hasWwwNormalization && result.hasHttpsUpgrade && result.chainLength > 1) {
    issues.push({
      code: "INEFFICIENT_NORMALIZATION",
      severity: "notice",
      category: "crawlability",
      title: "Inefficient HTTP/www normalization",
      description: "Multiple redirects for HTTPS upgrade and www normalization that could be combined.",
      impact: "Extra redirect adds unnecessary latency and server load.",
      howToFix: "Configure server to redirect directly from http://domain to https://www.domain (or vice versa) in one hop.",
      affectedUrls: [url]
    });
  }
  if (result.totalTime > 1e3 && result.chainLength > 0) {
    issues.push({
      code: "SLOW_REDIRECTS",
      severity: "notice",
      category: "performance",
      title: `Slow redirect chain (${result.totalTime}ms total)`,
      description: `Redirect chain took ${result.totalTime}ms to complete.`,
      impact: "Slow redirects negatively impact Time to First Byte and user experience.",
      howToFix: "Optimize server response times and reduce redirect chain length.",
      affectedUrls: [url],
      details: {
        totalTime: result.totalTime,
        hops: result.hops.map((h) => ({ url: h.url, time: h.responseTime }))
      }
    });
  }
  return { issues, data: result };
}

// src/audit/checks/responsive-images.ts
import * as cheerio27 from "https://esm.sh/cheerio@1.0.0";
var MODERN_FORMATS2 = [".webp", ".avif"];
function analyzeImage($, img, index) {
  const $img = $(img);
  const issues = [];
  const src = $img.attr("src") || $img.attr("data-src") || "";
  const alt = $img.attr("alt");
  const width = $img.attr("width");
  const height = $img.attr("height");
  const loading = $img.attr("loading");
  const decoding = $img.attr("decoding");
  const srcset = $img.attr("srcset");
  const sizes = $img.attr("sizes");
  const hasExplicitDimensions = !!(width && height || $img.css("width") || $img.css("height") || $img.attr("style")?.includes("width") || $img.attr("style")?.includes("height"));
  const hasResponsiveSrcset = !!(srcset && srcset.includes("w"));
  const srcLower = src.toLowerCase();
  const usesModernFormat = MODERN_FORMATS2.some((fmt) => srcLower.includes(fmt));
  const isInHeader = $img.closest('header, [class*="hero"], [class*="banner"], [class*="jumbotron"]').length > 0;
  const isAboveFold = index < 3 || isInHeader;
  if (!hasExplicitDimensions) {
    issues.push("Missing width/height attributes (causes CLS)");
  }
  if (alt === void 0 || alt === null) {
    issues.push("Missing alt attribute");
  } else if (alt === "") {
  }
  if (!isAboveFold && loading !== "lazy") {
    issues.push("Below-fold image without lazy loading");
  }
  if (isAboveFold && loading === "lazy") {
    issues.push("Above-fold image with lazy loading (delays LCP)");
  }
  if (!hasResponsiveSrcset && src && !srcLower.includes(".svg")) {
    issues.push("No responsive srcset for different screen sizes");
  }
  if (srcset && !sizes) {
    issues.push("Has srcset but missing sizes attribute");
  }
  if (!usesModernFormat && src && !srcLower.includes(".svg")) {
    issues.push("Using legacy image format instead of WebP/AVIF");
  }
  return {
    src,
    alt: alt ?? null,
    width: width ?? null,
    height: height ?? null,
    loading: loading ?? null,
    decoding: decoding ?? null,
    srcset: srcset ?? null,
    sizes: sizes ?? null,
    isAboveFold,
    hasExplicitDimensions,
    hasResponsiveSrcset,
    usesModernFormat,
    issues
  };
}
function analyzePictureElements($) {
  const pictures = $("picture");
  const pictureCount = pictures.length;
  let hasFormatFallbacks = false;
  pictures.each((_, pic) => {
    const sources = $(pic).find("source");
    const hasWebP = sources.filter((_2, s) => {
      const type = $(s).attr("type") || "";
      const srcset = $(s).attr("srcset") || "";
      return type.includes("webp") || srcset.includes(".webp");
    }).length > 0;
    const hasAvif = sources.filter((_2, s) => {
      const type = $(s).attr("type") || "";
      const srcset = $(s).attr("srcset") || "";
      return type.includes("avif") || srcset.includes(".avif");
    }).length > 0;
    if (hasWebP || hasAvif) {
      hasFormatFallbacks = true;
    }
  });
  return {
    hasPictureElements: pictureCount > 0,
    pictureCount,
    hasFormatFallbacks
  };
}
function detectImageCDN(html) {
  const cdnPatterns = [
    { name: "Cloudinary", pattern: /cloudinary\.com|res\.cloudinary/i },
    { name: "imgix", pattern: /imgix\.net/i },
    { name: "Cloudflare Images", pattern: /imagedelivery\.net|cloudflare-images/i },
    { name: "AWS CloudFront", pattern: /cloudfront\.net/i },
    { name: "Fastly", pattern: /fastly\.net/i },
    { name: "ImageKit", pattern: /imagekit\.io|ik\.imagekit/i },
    { name: "Vercel Image Optimization", pattern: /_next\/image/i },
    { name: "Prismic", pattern: /images\.prismic\.io/i },
    { name: "Contentful", pattern: /images\.ctfassets\.net/i },
    { name: "Sanity", pattern: /cdn\.sanity\.io/i },
    { name: "Shopify CDN", pattern: /cdn\.shopify\.com/i },
    { name: "WordPress Jetpack", pattern: /i\d\.wp\.com/i }
  ];
  const detectedCDNs = [];
  for (const { name, pattern } of cdnPatterns) {
    if (pattern.test(html)) {
      detectedCDNs.push(name);
    }
  }
  return {
    detected: detectedCDNs.length > 0,
    cdns: detectedCDNs
  };
}
function analyzeResponsiveImages(html, url) {
  const $ = cheerio27.load(html);
  const issues = [];
  const images = [];
  const imgElements = $("img");
  imgElements.each((index, img) => {
    const analysis = analyzeImage($, img, index);
    images.push(analysis);
  });
  const pictureData = analyzePictureElements($);
  const cdnData = detectImageCDN(html);
  const totalImages = images.length;
  const imagesWithoutDimensions = images.filter((i) => !i.hasExplicitDimensions).length;
  const imagesWithoutLazyLoad = images.filter((i) => !i.isAboveFold && i.loading !== "lazy").length;
  const imagesWithoutSrcset = images.filter((i) => !i.hasResponsiveSrcset && i.src && !i.src.includes(".svg")).length;
  const imagesWithoutAlt = images.filter((i) => i.alt === null).length;
  const modernFormatCount = images.filter((i) => i.usesModernFormat).length;
  const legacyFormatCount = images.filter(
    (i) => !i.usesModernFormat && i.src && !i.src.includes(".svg")
  ).length;
  const recommendations = [];
  if (!cdnData.detected && totalImages > 3) {
    recommendations.push("Consider using an image CDN (Cloudinary, imgix, Vercel) for automatic optimization");
  }
  if (!pictureData.hasPictureElements && legacyFormatCount > 0) {
    recommendations.push("Use <picture> elements with WebP/AVIF sources and JPEG/PNG fallbacks");
  }
  if (imagesWithoutDimensions > 0) {
    recommendations.push("Add width and height attributes to all images to prevent layout shift");
  }
  if (imagesWithoutLazyLoad > 0) {
    recommendations.push('Add loading="lazy" to below-fold images');
  }
  if (imagesWithoutSrcset > 0) {
    recommendations.push("Add srcset with multiple sizes for responsive images");
  }
  if (imagesWithoutDimensions >= 3) {
    issues.push({
      code: "IMAGES_MISSING_DIMENSIONS",
      severity: "warning",
      category: "performance",
      title: `${imagesWithoutDimensions} images missing width/height attributes`,
      description: `Found ${imagesWithoutDimensions} images without explicit dimensions.`,
      impact: "Missing dimensions cause Cumulative Layout Shift (CLS) when images load.",
      howToFix: "Add width and height attributes to all <img> tags, even with CSS sizing.",
      affectedUrls: [url],
      details: {
        count: imagesWithoutDimensions,
        images: images.filter((i) => !i.hasExplicitDimensions).slice(0, 5).map((i) => i.src)
      }
    });
  } else if (imagesWithoutDimensions > 0) {
    issues.push({
      code: "IMAGES_MISSING_DIMENSIONS",
      // One or two keeps a gradient below the >=3 case rather than flattening both to warning.
      severity: "notice",
      category: "performance",
      title: `${imagesWithoutDimensions} image(s) missing width/height attributes`,
      description: `Found ${imagesWithoutDimensions} images without explicit dimensions.`,
      impact: "Missing dimensions cause Cumulative Layout Shift (CLS) when images load.",
      howToFix: "Add width and height attributes to all <img> tags.",
      affectedUrls: [url],
      details: {
        images: images.filter((i) => !i.hasExplicitDimensions).map((i) => i.src)
      }
    });
  }
  if (imagesWithoutLazyLoad >= 3) {
    issues.push({
      code: "IMAGES_WITHOUT_LAZY_LOAD",
      severity: "warning",
      category: "performance",
      title: `${imagesWithoutLazyLoad} below-fold images without lazy loading`,
      description: `Found ${imagesWithoutLazyLoad} images below the fold that load immediately.`,
      impact: "Eager-loading all images delays initial page load and wastes bandwidth.",
      howToFix: 'Add loading="lazy" to images below the fold. Keep loading="eager" for hero images.',
      affectedUrls: [url],
      details: {
        count: imagesWithoutLazyLoad,
        images: images.filter((i) => !i.isAboveFold && i.loading !== "lazy").slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (imagesWithoutSrcset >= 5 && totalImages >= 5) {
    issues.push({
      code: "NO_RESPONSIVE_IMAGES",
      severity: "warning",
      category: "performance",
      title: "Images lack responsive srcset",
      description: `${imagesWithoutSrcset} of ${totalImages} images don't have srcset for different screen sizes.`,
      impact: "Mobile users download full-size images, wasting bandwidth and slowing load.",
      howToFix: "Add srcset attribute with multiple image sizes (e.g., 320w, 640w, 1280w).",
      affectedUrls: [url],
      details: {
        withoutSrcset: imagesWithoutSrcset,
        total: totalImages
      }
    });
  }
  if (imagesWithoutAlt > 0) {
    issues.push({
      code: "IMAGES_MISSING_ALT",
      severity: "warning",
      category: "on-page",
      // Alt text impacts both accessibility and SEO
      title: `${imagesWithoutAlt} image(s) missing alt attribute`,
      description: `Found ${imagesWithoutAlt} images without alt text.`,
      impact: "Missing alt text hurts accessibility and SEO. Screen readers cannot describe the image.",
      howToFix: 'Add descriptive alt text to all images. Use alt="" only for purely decorative images.',
      affectedUrls: [url],
      details: {
        count: imagesWithoutAlt,
        images: images.filter((i) => i.alt === null).slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (legacyFormatCount > 3 && modernFormatCount === 0 && !pictureData.hasFormatFallbacks) {
    issues.push({
      code: "NO_MODERN_IMAGE_FORMATS",
      severity: "notice",
      category: "performance",
      title: "Not using modern image formats (WebP/AVIF)",
      description: `All ${legacyFormatCount} images use legacy formats (JPEG/PNG) instead of WebP/AVIF.`,
      impact: "WebP is 25-35% smaller than JPEG. AVIF is up to 50% smaller.",
      howToFix: "Use <picture> element to serve WebP/AVIF with JPEG fallback, or use an image CDN.",
      affectedUrls: [url],
      details: {
        legacyCount: legacyFormatCount,
        suggestion: cdnData.detected ? `Your CDN (${cdnData.cdns.join(", ")}) likely supports format conversion.` : "Consider using Cloudinary, imgix, or Vercel Image Optimization."
      }
    });
  }
  const aboveFoldLazy = images.filter((i) => i.isAboveFold && i.loading === "lazy");
  if (aboveFoldLazy.length > 0) {
    issues.push({
      code: "HERO_IMAGE_LAZY",
      severity: "notice",
      category: "performance",
      title: "Above-fold images have lazy loading",
      description: `${aboveFoldLazy.length} hero/above-fold image(s) use loading="lazy" which delays LCP.`,
      impact: "Lazy loading above-fold images increases Largest Contentful Paint time.",
      howToFix: 'Remove loading="lazy" from images visible on initial page load.',
      affectedUrls: [url],
      details: {
        images: aboveFoldLazy.map((i) => i.src)
      }
    });
  }
  return {
    issues,
    data: {
      totalImages,
      imagesWithoutDimensions,
      imagesWithoutLazyLoad,
      imagesWithoutSrcset,
      imagesWithoutAlt,
      modernFormatCount,
      legacyFormatCount,
      images,
      recommendations
    }
  };
}

// src/audit/checks/bing-optimization.ts
import * as cheerio28 from "https://esm.sh/cheerio@1.0.0";
async function analyzeBingOptimization(html, url) {
  const issues = [];
  const $ = cheerio28.load(html);
  const parsedUrl = new URL(url);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  const detectedIssues = [];
  const bingMetaTag = $('meta[name="msvalidate.01"]').attr("content");
  const hasBingMetaTag = !!bingMetaTag && bingMetaTag.length > 0;
  let hasBingSiteAuth = false;
  try {
    const authResponse = await httpGet(`${baseUrl}/BingSiteAuth.xml`, { timeout: 5e3 });
    hasBingSiteAuth = authResponse.status === 200 && authResponse.data.includes("<?xml") && authResponse.data.toLowerCase().includes("users");
  } catch {
  }
  let hasBingIndexNowKey = false;
  try {
    const keyPatterns = [
      `${baseUrl}/indexnow.txt`,
      `${baseUrl}/.well-known/indexnow`
    ];
    for (const keyUrl of keyPatterns) {
      try {
        const keyResponse = await httpGet(keyUrl, { timeout: 5e3 });
        if (keyResponse.status === 200 && keyResponse.data.length >= 8) {
          hasBingIndexNowKey = true;
          break;
        }
      } catch {
      }
    }
  } catch {
  }
  const scripts = $('script[type="application/ld+json"]');
  let bingPlacesDetected = false;
  scripts.each((_, el) => {
    try {
      const jsonText = $(el).html();
      if (jsonText) {
        const data = JSON.parse(jsonText);
        const schemas2 = Array.isArray(data) ? data : [data];
        for (const schema4 of schemas2) {
          if (schema4["@type"] === "LocalBusiness" || schema4["@type"] === "Organization" && schema4.address) {
            bingPlacesDetected = true;
          }
          if (schema4.sameAs) {
            const sameAsUrls = Array.isArray(schema4.sameAs) ? schema4.sameAs : [schema4.sameAs];
            if (sameAsUrls.some((u) => u.includes("bing.com/maps"))) {
              bingPlacesDetected = true;
            }
          }
        }
      }
    } catch {
    }
  });
  let bingSitemapAccessible = false;
  try {
    const sitemapResponse = await httpGet(`${baseUrl}/sitemap.xml`, { timeout: 5e3 });
    bingSitemapAccessible = sitemapResponse.status === 200 && sitemapResponse.data.includes("<?xml");
  } catch {
  }
  if (!hasBingMetaTag && !hasBingSiteAuth) {
    detectedIssues.push("No Bing site verification");
    issues.push({
      code: "BING_NOT_VERIFIED",
      severity: "warning",
      category: "ai-readiness",
      title: "Site not verified with Bing Webmaster Tools",
      description: "ChatGPT Search uses Bing's index. Verifying your site with Bing Webmaster Tools ensures proper indexing and access to Bing-specific SEO tools.",
      impact: "May reduce visibility in ChatGPT Search results and miss Bing-specific optimization opportunities.",
      howToFix: "Add Bing verification: 1) Go to Bing Webmaster Tools, 2) Add your site, 3) Choose verification method (meta tag or XML file), 4) Add the verification code to your site.",
      affectedUrls: [url],
      details: {
        hasBingMetaTag,
        hasBingSiteAuth,
        verificationMethods: [
          'Add <meta name="msvalidate.01" content="YOUR_CODE"> to <head>',
          "Upload BingSiteAuth.xml to root directory"
        ]
      }
    });
  }
  if (!hasBingIndexNowKey) {
    detectedIssues.push("No IndexNow key for Bing");
    issues.push({
      code: "BING_NO_INDEXNOW",
      severity: "notice",
      category: "ai-readiness",
      title: "IndexNow not configured for Bing instant indexing",
      description: "IndexNow enables instant content indexing by Bing (and subsequently ChatGPT Search). Without it, new content may take longer to appear in AI search results.",
      impact: "Content updates may be delayed in Bing's index and ChatGPT Search results.",
      howToFix: "Implement IndexNow: 1) Generate an API key, 2) Host the key file at /indexnow.txt or /.well-known/indexnow, 3) Notify Bing of URL changes via the IndexNow API.",
      affectedUrls: [url],
      details: {
        indexNowEndpoint: "https://www.bing.com/indexnow",
        documentation: "https://www.indexnow.org/documentation"
      }
    });
  }
  if (!bingSitemapAccessible) {
    detectedIssues.push("Sitemap not accessible");
    issues.push({
      code: "BING_SITEMAP_MISSING",
      severity: "warning",
      category: "ai-readiness",
      title: "XML sitemap not accessible for Bing crawling",
      description: "A sitemap helps Bing discover and index all your pages. Without it, some content may not be indexed and thus not appear in ChatGPT Search.",
      impact: "Bing may miss important pages, reducing your AI search coverage.",
      howToFix: "Create and submit an XML sitemap: 1) Generate sitemap.xml with all important URLs, 2) Submit it in Bing Webmaster Tools, 3) Reference it in robots.txt.",
      affectedUrls: [url]
    });
  }
  const hasLocalBusinessSchema = bingPlacesDetected;
  const hasAddressOnPage = $("address").length > 0 || html.toLowerCase().includes("street") || /\d{5}(-\d{4})?/.test(html);
  if (hasAddressOnPage && !hasLocalBusinessSchema) {
    detectedIssues.push("Local business may not be on Bing Places");
    issues.push({
      code: "BING_PLACES_MISSING",
      severity: "notice",
      category: "ai-readiness",
      title: "Local business not optimized for Bing Places",
      description: "Your site appears to have a physical location but may not be listed on Bing Places. Bing Places listings appear in Bing Maps and can be referenced by AI assistants.",
      impact: "Missing local search visibility in Bing and potential AI assistant recommendations for local queries.",
      howToFix: "Claim your Bing Places listing: 1) Go to bingplaces.com, 2) Claim or add your business, 3) Verify ownership, 4) Add complete business information.",
      affectedUrls: [url],
      details: {
        bingPlacesUrl: "https://www.bingplaces.com/",
        recommendation: "Also add sameAs link to your Bing Places listing in Organization schema"
      }
    });
  }
  return {
    issues,
    data: {
      hasBingSiteAuth,
      hasBingMetaTag,
      hasBingIndexNowKey,
      bingPlacesDetected,
      bingSitemapAccessible,
      issues: detectedIssues
    }
  };
}

// src/audit/checks/robots-validation.ts
var STANDARD_DIRECTIVES = [
  "user-agent",
  "disallow",
  "allow",
  "sitemap"
];
var EXTENDED_DIRECTIVES = [
  "crawl-delay",
  "host",
  "clean-param",
  // Yandex
  "request-rate"
  // Some crawlers
];
var ALL_DIRECTIVES = [...STANDARD_DIRECTIVES, ...EXTENDED_DIRECTIVES];
async function validateRobotsTxt(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const robotsUrl = new URL("/robots.txt", parsedUrl.origin).href;
  try {
    const response = await httpGet(robotsUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status >= 400) {
      return {
        issues,
        data: {
          exists: false,
          isValid: true,
          // Missing is not invalid
          lineCount: 0,
          errors: [],
          warnings: [],
          directives: {
            userAgents: [],
            sitemaps: [],
            hasWildcardAgent: false,
            hasCrawlDelay: false
          }
        }
      };
    }
    const content = response.data;
    const validation = parseAndValidate(content);
    if (validation.errors.length > 0) {
      issues.push({
        code: "ROBOTS_TXT_INVALID_SYNTAX",
        severity: "warning",
        category: "crawlability",
        title: "robots.txt contains syntax errors",
        description: `Found ${validation.errors.length} syntax error(s) in robots.txt. Invalid syntax may cause crawlers to misinterpret your rules.`,
        impact: "Search engines may not properly understand your crawling rules, potentially blocking or allowing unintended pages.",
        howToFix: 'Fix the syntax errors in robots.txt. Each directive should be on its own line with format "Directive: value".',
        affectedUrls: [robotsUrl],
        details: {
          errors: validation.errors.map((e) => ({
            line: e.line,
            content: e.content,
            message: e.message
          }))
        }
      });
    }
    if (validation.warnings.length > 0) {
      issues.push({
        code: "ROBOTS_TXT_WARNINGS",
        severity: "notice",
        category: "crawlability",
        title: "robots.txt has potential issues",
        description: `Found ${validation.warnings.length} warning(s) in robots.txt.`,
        impact: "Some crawlers may not recognize non-standard directives.",
        howToFix: "Review the warnings and update if needed.",
        affectedUrls: [robotsUrl],
        details: {
          warnings: validation.warnings.map((w) => ({
            line: w.line,
            content: w.content,
            message: w.message
          }))
        }
      });
    }
    return {
      issues,
      data: {
        exists: true,
        isValid: validation.errors.length === 0,
        lineCount: content.split("\n").length,
        errors: validation.errors,
        warnings: validation.warnings,
        directives: validation.directives
      }
    };
  } catch (error) {
    return {
      issues,
      data: {
        exists: false,
        isValid: true,
        lineCount: 0,
        errors: [],
        warnings: [],
        directives: {
          userAgents: [],
          sitemaps: [],
          hasWildcardAgent: false,
          hasCrawlDelay: false
        }
      }
    };
  }
}
function parseAndValidate(content) {
  const errors = [];
  const warnings = [];
  const userAgents = [];
  const sitemaps = [];
  let hasWildcardAgent = false;
  let hasCrawlDelay = false;
  const lines = content.split("\n");
  let currentUserAgent = null;
  let hasDirectiveAfterUserAgent = false;
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (line === "") {
      continue;
    }
    if (line.startsWith("#")) {
      continue;
    }
    const commentIndex = line.indexOf("#");
    const effectiveLine = commentIndex > 0 ? line.substring(0, commentIndex).trim() : line;
    if (effectiveLine === "") {
      continue;
    }
    const colonIndex = effectiveLine.indexOf(":");
    if (colonIndex === -1) {
      errors.push({
        line: lineNum,
        content: rawLine,
        message: 'Missing colon separator. Format should be "Directive: value"'
      });
      continue;
    }
    const directive = effectiveLine.substring(0, colonIndex).trim().toLowerCase();
    const value = effectiveLine.substring(colonIndex + 1).trim();
    if (!ALL_DIRECTIVES.includes(directive)) {
      errors.push({
        line: lineNum,
        content: rawLine,
        message: `Unknown directive "${directive}". Valid directives: User-agent, Disallow, Allow, Sitemap`
      });
      continue;
    }
    if (EXTENDED_DIRECTIVES.includes(directive) && !STANDARD_DIRECTIVES.includes(directive)) {
      warnings.push({
        line: lineNum,
        content: rawLine,
        message: `"${directive}" is a non-standard directive. Not all crawlers support it.`
      });
    }
    switch (directive) {
      case "user-agent":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "User-agent value cannot be empty"
          });
        } else {
          currentUserAgent = value;
          hasDirectiveAfterUserAgent = false;
          if (!userAgents.includes(value)) {
            userAgents.push(value);
          }
          if (value === "*") {
            hasWildcardAgent = true;
          }
        }
        break;
      case "disallow":
      case "allow":
        if (currentUserAgent === null) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: `${directive} must come after a User-agent directive`
          });
        } else {
          hasDirectiveAfterUserAgent = true;
          if (value && !isValidPath(value)) {
            warnings.push({
              line: lineNum,
              content: rawLine,
              message: `Path "${value}" contains unusual characters`
            });
          }
        }
        break;
      case "sitemap":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Sitemap URL cannot be empty"
          });
        } else if (!isValidUrl(value)) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: `Invalid sitemap URL: "${value}"`
          });
        } else {
          sitemaps.push(value);
        }
        break;
      case "crawl-delay":
        hasCrawlDelay = true;
        if (currentUserAgent === null) {
          warnings.push({
            line: lineNum,
            content: rawLine,
            message: "Crawl-delay should come after a User-agent directive"
          });
        }
        if (value === "" || isNaN(parseFloat(value))) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Crawl-delay must be a number"
          });
        }
        break;
      case "host":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Host value cannot be empty"
          });
        }
        break;
    }
  }
  return {
    errors,
    warnings,
    directives: {
      userAgents,
      sitemaps,
      hasWildcardAgent,
      hasCrawlDelay
    }
  };
}
function isValidPath(path) {
  if (path === "" || path === "*" || path === "$") {
    return true;
  }
  if (!path.startsWith("/") && !path.startsWith("*")) {
    return false;
  }
  if (/[\x00-\x1f]/.test(path)) {
    return false;
  }
  return true;
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// src/audit/checks/llms-txt.ts
var MAX_LINKS_TO_CHECK = 20;
function extractLlmsTxtLinks(content, baseUrl) {
  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  const urls = [];
  for (const match of linkMatches) {
    try {
      const resolved = new URL(match[2], baseUrl);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        urls.push(resolved.href);
      }
    } catch {
    }
  }
  return urls;
}
async function findBrokenLinks(urls) {
  const toCheck = urls.slice(0, MAX_LINKS_TO_CHECK);
  const results = await Promise.all(
    toCheck.map(async (linkUrl) => {
      try {
        const response = await httpGet(linkUrl, {
          timeout: 8e3,
          validateStatus: () => true
        });
        return response.status >= 400 ? linkUrl : null;
      } catch {
        return linkUrl;
      }
    })
  );
  return results.filter((url) => url !== null);
}
async function analyzeLlmsTxt(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const baseUrl = parsedUrl.origin;
  const llmsTxtUrl = new URL("/llms.txt", baseUrl).href;
  const llmsFullUrl = new URL("/llms-full.txt", baseUrl).href;
  let exists = false;
  let fullVersionExists = false;
  let content;
  let structure = {
    hasTitle: false,
    hasDescription: false,
    hasSections: false,
    hasLinks: false,
    linkCount: 0
  };
  let contentLength = 0;
  let brokenLinks = [];
  try {
    const response = await httpGet(llmsTxtUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 200 && !looksLikeHtmlFallback(response.data, response.headers?.["content-type"])) {
      exists = true;
      content = response.data;
      contentLength = content.length;
      structure = analyzeStructure(content);
    }
    const fullResponse = await httpGet(llmsFullUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (fullResponse.status === 200 && !looksLikeHtmlFallback(fullResponse.data, fullResponse.headers?.["content-type"])) {
      fullVersionExists = true;
    }
  } catch {
  }
  if (!exists) {
    issues.push({
      code: "AI_NO_LLMS_TXT",
      severity: "notice",
      category: "ai-readiness",
      title: "No llms.txt file found",
      description: "llms.txt is a proposed standard for providing context to LLMs about your website. Having one helps AI systems better understand and represent your site.",
      impact: "AI systems may have less context about your site, potentially leading to less accurate representations.",
      howToFix: "Create an /llms.txt file with a Markdown description of your site. Include: site name, brief description, and links to key pages. See https://llmstxt.org/ for the specification.",
      affectedUrls: [llmsTxtUrl],
      details: {
        specification: "https://llmstxt.org/",
        exampleFormat: `# Site Name

> Brief description of your site

## About
- [About Us](/about): Learn more about our company

## Products
- [Product A](/products/a): Description of product A
- [Product B](/products/b): Description of product B

## Documentation
- [Docs](/docs): Full documentation`
      }
    });
  } else {
    if (!structure.hasTitle) {
      issues.push({
        code: "AI_LLMS_TXT_NO_TITLE",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt missing title heading",
        description: "Your llms.txt file should start with a # heading containing your site/organization name.",
        impact: "LLMs may not properly identify your site.",
        howToFix: "Add a title heading at the top: # Your Site Name",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (!structure.hasDescription) {
      issues.push({
        code: "AI_LLMS_TXT_NO_DESCRIPTION",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt missing description",
        description: "Your llms.txt should include a brief description (blockquote starting with >) explaining what your site/organization does.",
        impact: "LLMs may not understand your site's purpose.",
        howToFix: "Add a description blockquote after the title: > Brief description of your site",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (!structure.hasLinks || structure.linkCount < 3) {
      issues.push({
        code: "AI_LLMS_TXT_FEW_LINKS",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt has few navigation links",
        description: `Your llms.txt only has ${structure.linkCount} link(s). Include links to your most important pages to help LLMs navigate your content.`,
        impact: "LLMs may miss important content on your site.",
        howToFix: "Add more links in Markdown format: - [Page Title](/path): Brief description",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (contentLength < 200) {
      issues.push({
        code: "AI_LLMS_TXT_TOO_SHORT",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt content is very short",
        description: `Your llms.txt is only ${contentLength} characters. Consider adding more context about your site.`,
        impact: "LLMs may not have enough context to properly represent your site.",
        howToFix: "Expand your llms.txt with more sections, descriptions, and links to key content.",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (structure.hasLinks && content) {
      brokenLinks = await findBrokenLinks(extractLlmsTxtLinks(content, baseUrl));
      if (brokenLinks.length > 0) {
        issues.push({
          code: "AI_LLMS_TXT_BROKEN_LINKS",
          severity: "warning",
          category: "ai-readiness",
          title: "llms.txt links to broken pages",
          description: `${brokenLinks.length} of the links in your llms.txt return an error or don't resolve: ${brokenLinks.slice(0, 5).join(", ")}${brokenLinks.length > 5 ? ", ..." : ""}`,
          impact: "LLMs following these links to understand your site will hit dead ends, undermining the whole point of curating this file.",
          howToFix: "Fix or remove the broken links so llms.txt stays an accurate, trustworthy index of your content.",
          affectedUrls: brokenLinks
        });
      }
    }
  }
  return {
    issues,
    data: {
      exists,
      fullVersionExists,
      content: content?.substring(0, 1e3),
      // Truncate for data
      structure,
      contentLength,
      ...brokenLinks.length > 0 ? { brokenLinks } : {}
    }
  };
}
function analyzeStructure(content) {
  const lines = content.split("\n");
  let hasTitle = false;
  let hasDescription = false;
  let hasSections = false;
  let hasLinks = false;
  let linkCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      hasTitle = true;
    }
    if (trimmed.startsWith(">")) {
      hasDescription = true;
    }
    if (trimmed.startsWith("## ")) {
      hasSections = true;
    }
    const linkMatches = trimmed.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatches) {
      hasLinks = true;
      linkCount += linkMatches.length;
    }
  }
  return {
    hasTitle,
    hasDescription,
    hasSections,
    hasLinks,
    linkCount
  };
}

// src/audit/checks/html-compliance.ts
import * as cheerio29 from "https://esm.sh/cheerio@1.0.0";
async function analyzeHtmlCompliance(html, url, headers) {
  const issues = [];
  const $ = cheerio29.load(html);
  const parsedUrl = new URL(url);
  const doctypeMatch = html.match(/<!DOCTYPE\s+([^>]+)>/i);
  const hasDoctype = doctypeMatch !== null;
  const doctypeValue = doctypeMatch ? doctypeMatch[0] : void 0;
  const isHtml5 = hasDoctype && /<!DOCTYPE\s+html\s*>/i.test(html);
  if (!hasDoctype) {
    issues.push({
      code: "HTML_NO_DOCTYPE",
      severity: "warning",
      category: "on-page",
      title: "Missing DOCTYPE declaration",
      description: "Page is missing a DOCTYPE declaration. This puts browsers in quirks mode and may cause rendering issues.",
      impact: "Browsers may render the page inconsistently. Search engines expect valid HTML.",
      howToFix: "Add <!DOCTYPE html> as the very first line of your HTML document.",
      affectedUrls: [url]
    });
  } else if (!isHtml5) {
    issues.push({
      code: "HTML_OLD_DOCTYPE",
      severity: "notice",
      category: "on-page",
      title: "Using older DOCTYPE",
      description: `Page uses "${doctypeValue}" instead of HTML5 DOCTYPE. HTML5 is the current standard.`,
      impact: "Older doctypes may limit modern HTML features.",
      howToFix: "Change your DOCTYPE to the HTML5 declaration: <!DOCTYPE html>",
      affectedUrls: [url]
    });
  }
  let charsetPresent = false;
  let charsetValue;
  let charsetSource = "none";
  const metaCharset = $("meta[charset]").attr("charset");
  const metaContentType = $('meta[http-equiv="Content-Type"]').attr("content");
  if (metaCharset) {
    charsetPresent = true;
    charsetValue = metaCharset;
    charsetSource = "meta";
  } else if (metaContentType) {
    const charsetMatch = metaContentType.match(/charset=([^\s;]+)/i);
    if (charsetMatch) {
      charsetPresent = true;
      charsetValue = charsetMatch[1];
      charsetSource = "meta";
    }
  }
  if (!charsetPresent && headers) {
    const contentType = headers["content-type"] || headers["Content-Type"];
    if (contentType) {
      const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
      if (charsetMatch) {
        charsetPresent = true;
        charsetValue = charsetMatch[1];
        charsetSource = "header";
      }
    }
  }
  const isUtf8 = charsetValue?.toLowerCase().replace("-", "") === "utf8";
  if (!charsetPresent) {
    issues.push({
      code: "HTML_NO_CHARSET",
      severity: "warning",
      category: "on-page",
      title: "Missing character encoding declaration",
      description: "Page does not specify character encoding. This can cause text display issues.",
      impact: "Characters may display incorrectly. Search engines may misinterpret content.",
      howToFix: 'Add <meta charset="UTF-8"> in the <head> section, before any other elements.',
      affectedUrls: [url]
    });
  } else if (!isUtf8) {
    issues.push({
      code: "HTML_NOT_UTF8",
      severity: "notice",
      category: "on-page",
      title: "Not using UTF-8 encoding",
      description: `Page uses "${charsetValue}" encoding. UTF-8 is recommended for universal character support.`,
      impact: "Some characters may not display correctly. UTF-8 is the web standard.",
      howToFix: 'Change your charset to UTF-8: <meta charset="UTF-8">',
      affectedUrls: [url]
    });
  }
  const faviconLocations = [];
  const faviconFormats = [];
  let hasAppleTouchIcon = false;
  $('link[rel*="icon"]').each((_, el) => {
    const href = $(el).attr("href");
    const rel = $(el).attr("rel") || "";
    const type = $(el).attr("type") || "";
    if (href) {
      faviconLocations.push(href);
      if (href.endsWith(".ico"))
        faviconFormats.push("ico");
      else if (href.endsWith(".png"))
        faviconFormats.push("png");
      else if (href.endsWith(".svg"))
        faviconFormats.push("svg");
      else if (type)
        faviconFormats.push(type);
    }
    if (rel.includes("apple-touch-icon")) {
      hasAppleTouchIcon = true;
    }
  });
  if ($('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').length > 0) {
    hasAppleTouchIcon = true;
  }
  const hasFavicon = faviconLocations.length > 0;
  if (!hasFavicon) {
    try {
      const faviconUrl = new URL("/favicon.ico", parsedUrl.origin).href;
      const response = await httpGet(faviconUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      if (response.status === 200) {
        faviconLocations.push("/favicon.ico");
        faviconFormats.push("ico");
      }
    } catch {
    }
  }
  if (faviconLocations.length === 0) {
    issues.push({
      code: "HTML_NO_FAVICON",
      severity: "notice",
      category: "on-page",
      title: "No favicon found",
      description: "Page does not have a favicon defined. Favicons help with brand recognition and browser tab identification.",
      impact: "Missing favicon affects brand visibility in browser tabs, bookmarks, and search results.",
      howToFix: 'Add a favicon link in <head>: <link rel="icon" href="/favicon.ico"> and consider adding multiple sizes.',
      affectedUrls: [url],
      details: {
        recommendation: "Include multiple formats: ICO for legacy browsers, PNG for modern browsers, and SVG for scalability."
      }
    });
  }
  if (!hasAppleTouchIcon && faviconLocations.length > 0) {
    issues.push({
      code: "HTML_NO_APPLE_TOUCH_ICON",
      severity: "notice",
      category: "mobile",
      title: "No Apple Touch Icon",
      description: "Page does not define an Apple Touch Icon. This icon is used when users add your site to their iOS home screen.",
      impact: "iOS users who bookmark your site won't see a proper app icon.",
      howToFix: 'Add: <link rel="apple-touch-icon" href="/apple-touch-icon.png"> with a 180x180 PNG image.',
      affectedUrls: [url]
    });
  }
  const htmlLang = $("html").attr("lang");
  const langPresent = Boolean(htmlLang);
  if (!langPresent) {
    issues.push({
      code: "HTML_NO_LANG",
      severity: "warning",
      category: "on-page",
      title: "Missing language attribute",
      description: "The <html> element does not have a lang attribute. This helps search engines and screen readers.",
      impact: "Search engines may not properly identify the page language. Accessibility is reduced.",
      howToFix: 'Add lang attribute to <html>: <html lang="en"> (use appropriate language code).',
      affectedUrls: [url]
    });
  }
  const viewportMeta = $('meta[name="viewport"]').attr("content");
  const hasViewport = Boolean(viewportMeta);
  const isResponsive = viewportMeta?.includes("width=device-width") || false;
  if (!hasViewport) {
    issues.push({
      code: "HTML_NO_VIEWPORT",
      severity: "warning",
      category: "mobile",
      title: "Missing viewport meta tag",
      description: "Page does not have a viewport meta tag. This is required for proper mobile rendering.",
      impact: "Page will not render correctly on mobile devices. Fails mobile-friendliness test.",
      howToFix: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1">',
      affectedUrls: [url]
    });
  } else if (!isResponsive) {
    issues.push({
      code: "HTML_FIXED_VIEWPORT",
      severity: "notice",
      category: "mobile",
      title: "Viewport not responsive",
      description: `Viewport is set to "${viewportMeta}" but doesn't include width=device-width for responsive design.`,
      impact: "Page may not scale properly on different screen sizes.",
      howToFix: 'Update viewport to: <meta name="viewport" content="width=device-width, initial-scale=1">',
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      doctype: {
        present: hasDoctype,
        isHtml5,
        value: doctypeValue
      },
      charset: {
        present: charsetPresent,
        isUtf8,
        value: charsetValue,
        source: charsetSource
      },
      favicon: {
        present: faviconLocations.length > 0,
        locations: faviconLocations,
        hasAppleTouchIcon,
        formats: [...new Set(faviconFormats)]
      },
      language: {
        present: langPresent,
        value: htmlLang
      },
      viewport: {
        present: hasViewport,
        value: viewportMeta,
        isResponsive
      }
    }
  };
}

// src/audit/checks/canonical-domain.ts
async function analyzeCanonicalDomain(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const isWww = hostname.startsWith("www.");
  const wwwHostname = isWww ? hostname : `www.${hostname}`;
  const nonWwwHostname = isWww ? hostname.substring(4) : hostname;
  const parts = nonWwwHostname.split(".");
  if (parts.length > 2 && !nonWwwHostname.match(/\.(co|com|org|net|gov)\.[a-z]{2}$/i)) {
    return {
      issues: [],
      data: {
        primaryDomain: hostname,
        wwwVersion: { url: "", status: null, accessible: false },
        nonWwwVersion: { url: "", status: null, accessible: false },
        hasProperRedirect: true,
        // N/A for subdomains
        preferredVersion: "unknown",
        httpsRedirect: { httpToHttps: false, httpsStatus: null }
      }
    };
  }
  const wwwUrl = `https://${wwwHostname}${parsedUrl.pathname}`;
  const nonWwwUrl = `https://${nonWwwHostname}${parsedUrl.pathname}`;
  const [wwwResult, nonWwwResult] = await Promise.all([
    testUrl(wwwUrl),
    testUrl(nonWwwUrl)
  ]);
  let hasProperRedirect = false;
  let preferredVersion = "unknown";
  if (wwwResult.status && wwwResult.status >= 300 && wwwResult.status < 400) {
    if (wwwResult.redirectsTo?.includes(nonWwwHostname)) {
      hasProperRedirect = true;
      preferredVersion = "non-www";
    }
  }
  if (nonWwwResult.status && nonWwwResult.status >= 300 && nonWwwResult.status < 400) {
    if (nonWwwResult.redirectsTo?.includes(wwwHostname)) {
      hasProperRedirect = true;
      preferredVersion = "www";
    }
  }
  const bothAccessible = wwwResult.accessible && nonWwwResult.accessible && wwwResult.status === 200 && nonWwwResult.status === 200;
  if (bothAccessible && !hasProperRedirect) {
    issues.push({
      code: "CANONICAL_WWW_DUPLICATE",
      severity: "warning",
      category: "crawlability",
      title: "Both www and non-www versions accessible",
      description: `Both ${wwwUrl} and ${nonWwwUrl} return 200 OK. This creates duplicate content.`,
      impact: "Search engines may index both versions, diluting page authority and causing ranking issues.",
      howToFix: "Set up a 301 redirect from one version to the other. Most sites prefer non-www, but either works. Configure at server/CDN level.",
      affectedUrls: [wwwUrl, nonWwwUrl],
      details: {
        wwwStatus: wwwResult.status,
        nonWwwStatus: nonWwwResult.status,
        recommendation: "Choose one version as canonical and 301 redirect the other."
      }
    });
  }
  const httpUrl = `http://${hostname}${parsedUrl.pathname}`;
  const httpResult = await testUrl(httpUrl);
  let httpToHttps = false;
  if (httpResult.status && httpResult.status >= 300 && httpResult.status < 400) {
    if (httpResult.redirectsTo?.startsWith("https://")) {
      httpToHttps = true;
    }
  }
  if (!httpToHttps && httpResult.accessible && httpResult.status === 200) {
    issues.push({
      code: "CANONICAL_NO_HTTPS_REDIRECT",
      severity: "warning",
      category: "security",
      title: "HTTP does not redirect to HTTPS",
      description: "The HTTP version of the site is accessible without redirecting to HTTPS.",
      impact: "Duplicate content issues and security concerns. Users may access insecure version.",
      howToFix: "Configure a 301 redirect from HTTP to HTTPS at the server or CDN level.",
      affectedUrls: [httpUrl]
    });
  }
  return {
    issues,
    data: {
      primaryDomain: hostname,
      wwwVersion: {
        url: wwwUrl,
        status: wwwResult.status,
        redirectsTo: wwwResult.redirectsTo,
        accessible: wwwResult.accessible
      },
      nonWwwVersion: {
        url: nonWwwUrl,
        status: nonWwwResult.status,
        redirectsTo: nonWwwResult.redirectsTo,
        accessible: nonWwwResult.accessible
      },
      hasProperRedirect,
      preferredVersion,
      httpsRedirect: {
        httpToHttps,
        httpsStatus: httpResult.status
      }
    }
  };
}
async function testUrl(url) {
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      maxRedirects: 0,
      // Don't follow redirects
      validateStatus: () => true
    });
    const status = response.status;
    const location = response.headers.location || response.headers.Location;
    return {
      status,
      redirectsTo: location,
      accessible: status !== null && status < 500
    };
  } catch (error) {
    return {
      status: null,
      accessible: false
    };
  }
}

// src/audit/checks/caching-headers.ts
var CACHE_RECOMMENDATIONS = {
  html: 0,
  // HTML should generally not be cached or have short TTL
  css: 31536e3,
  // 1 year for versioned assets
  js: 31536e3,
  images: 31536e3,
  fonts: 31536e3,
  minimum: 86400
  // 1 day minimum for static assets
};
async function analyzeCachingHeaders(url, headers) {
  const issues = [];
  let htmlHeaders = headers;
  if (!htmlHeaders) {
    try {
      const response = await httpGet(url, {
        timeout: 1e4,
        validateStatus: () => true
      });
      htmlHeaders = response.headers;
    } catch {
      htmlHeaders = {};
    }
  }
  const htmlCaching = parseCacheHeaders(htmlHeaders);
  if (htmlCaching.maxAge && htmlCaching.maxAge > 3600) {
    issues.push({
      code: "CACHING_HTML_TOO_LONG",
      severity: "notice",
      category: "performance",
      title: "HTML page has long cache duration",
      description: `HTML page has Cache-Control max-age of ${htmlCaching.maxAge} seconds (${Math.round(htmlCaching.maxAge / 3600)} hours). HTML content changes frequently.`,
      impact: "Users may see stale content. Content updates may not appear immediately.",
      howToFix: "Set shorter cache duration for HTML: Cache-Control: no-cache or max-age=0, must-revalidate",
      affectedUrls: [url]
    });
  }
  const staticAssets = [];
  const assetUrls = await getStaticAssetUrls(url);
  let noCaching = 0;
  let shortTtl = 0;
  let properlyConfigured = 0;
  const assetsToCheck = assetUrls.slice(0, 5);
  for (const assetUrl of assetsToCheck) {
    try {
      const assetResponse = await httpGet(assetUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      const assetCaching = parseCacheHeaders(assetResponse.headers);
      const type = getAssetType(assetUrl);
      const assetInfo = {
        url: assetUrl,
        type,
        cacheControl: assetCaching.cacheControl,
        maxAge: assetCaching.maxAge,
        hasCaching: Boolean(assetCaching.cacheControl || assetCaching.expires)
      };
      staticAssets.push(assetInfo);
      if (!assetInfo.hasCaching) {
        noCaching++;
      } else if (assetCaching.maxAge && assetCaching.maxAge < CACHE_RECOMMENDATIONS.minimum) {
        shortTtl++;
      } else {
        properlyConfigured++;
      }
    } catch {
    }
  }
  if (noCaching > 0) {
    issues.push({
      code: "CACHING_STATIC_NO_CACHE",
      severity: "warning",
      category: "performance",
      title: "Static assets missing cache headers",
      description: `${noCaching} static asset(s) have no Cache-Control header. This forces browsers to re-download on every visit.`,
      impact: "Slower page loads for repeat visitors. Increased bandwidth usage.",
      howToFix: "Add Cache-Control headers to static assets. For versioned files (with hash in filename), use: Cache-Control: public, max-age=31536000, immutable",
      affectedUrls: staticAssets.filter((a) => !a.hasCaching).map((a) => a.url),
      details: {
        recommendation: {
          "versioned assets (with hash)": "Cache-Control: public, max-age=31536000, immutable",
          "non-versioned assets": "Cache-Control: public, max-age=86400"
        }
      }
    });
  }
  if (shortTtl > 0) {
    issues.push({
      code: "CACHING_STATIC_SHORT_TTL",
      severity: "notice",
      category: "performance",
      title: "Static assets have short cache duration",
      description: `${shortTtl} static asset(s) have cache duration under 1 day. Consider longer caching for better performance.`,
      impact: "Assets are re-downloaded more often than necessary.",
      howToFix: "Increase max-age for static assets. Use versioned filenames (hash in filename) to enable long-term caching.",
      affectedUrls: staticAssets.filter((a) => a.maxAge && a.maxAge < CACHE_RECOMMENDATIONS.minimum).map((a) => a.url)
    });
  }
  if (!htmlCaching.etag && !htmlCaching.lastModified) {
    issues.push({
      code: "CACHING_NO_VALIDATORS",
      severity: "notice",
      category: "performance",
      title: "Missing cache validators (ETag/Last-Modified)",
      description: "Page is missing both ETag and Last-Modified headers. These allow efficient cache validation.",
      impact: "Browsers cannot efficiently validate if cached content is still fresh.",
      howToFix: "Configure your server to send ETag or Last-Modified headers. Most web servers do this automatically for static files.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      htmlCaching,
      staticAssets,
      issues: {
        noCaching,
        shortTtl,
        properlyConfigured
      }
    }
  };
}
function parseCacheHeaders(headers) {
  const cacheControl = headers["cache-control"] || headers["Cache-Control"];
  const expires = headers["expires"] || headers["Expires"];
  const etag = headers["etag"] || headers["ETag"];
  const lastModified = headers["last-modified"] || headers["Last-Modified"];
  let maxAge;
  let isPublic = false;
  let isPrivate = false;
  let noStore = false;
  let noCache = false;
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
    if (maxAgeMatch) {
      maxAge = parseInt(maxAgeMatch[1], 10);
    }
    const lowerCC = cacheControl.toLowerCase();
    isPublic = lowerCC.includes("public");
    isPrivate = lowerCC.includes("private");
    noStore = lowerCC.includes("no-store");
    noCache = lowerCC.includes("no-cache");
  }
  return {
    cacheControl,
    expires,
    etag,
    lastModified,
    maxAge,
    isPublic,
    isPrivate,
    noStore,
    noCache
  };
}
async function getStaticAssetUrls(pageUrl) {
  const assets = [];
  try {
    const response = await httpGet(pageUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    const html = response.data;
    const baseUrl = new URL(pageUrl);
    const cssMatches = html.match(/href="([^"]+\.css[^"]*)"/gi);
    if (cssMatches) {
      for (const match of cssMatches.slice(0, 2)) {
        const href = match.match(/href="([^"]+)"/)?.[1];
        if (href) {
          try {
            assets.push(new URL(href, baseUrl).href);
          } catch {
          }
        }
      }
    }
    const jsMatches = html.match(/src="([^"]+\.js[^"]*)"/gi);
    if (jsMatches) {
      for (const match of jsMatches.slice(0, 2)) {
        const src = match.match(/src="([^"]+)"/)?.[1];
        if (src) {
          try {
            assets.push(new URL(src, baseUrl).href);
          } catch {
          }
        }
      }
    }
    const imgMatches = html.match(/src="([^"]+\.(png|jpg|jpeg|gif|webp|svg)[^"]*)"/gi);
    if (imgMatches) {
      for (const match of imgMatches.slice(0, 1)) {
        const src = match.match(/src="([^"]+)"/)?.[1];
        if (src) {
          try {
            assets.push(new URL(src, baseUrl).href);
          } catch {
          }
        }
      }
    }
  } catch {
  }
  return assets;
}
function getAssetType(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".css"))
    return "css";
  if (lowerUrl.includes(".js"))
    return "javascript";
  if (lowerUrl.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)/))
    return "image";
  if (lowerUrl.match(/\.(woff|woff2|ttf|otf|eot)/))
    return "font";
  return "other";
}

// src/audit/checks/dom-size.ts
import * as cheerio30 from "https://esm.sh/cheerio@1.0.0";
var THRESHOLDS = {
  totalElements: {
    warning: 1500,
    error: 3e3
  },
  maxDepth: {
    warning: 32,
    error: 64
  },
  maxChildren: {
    warning: 60,
    error: 120
  }
};
function analyzeDomSize(html, url) {
  const issues = [];
  const $ = cheerio30.load(html);
  const allElements = $("*");
  const totalElements = allElements.length;
  let maxDepth = 0;
  let deepestPath = [];
  function getDepth(element, path) {
    const children = element.children();
    if (children.length === 0) {
      if (path.length > maxDepth) {
        maxDepth = path.length;
        deepestPath = [...path];
      }
      return path.length;
    }
    let maxChildDepth = path.length;
    children.each((_, child) => {
      const $child = $(child);
      const tagName = child.type === "tag" ? child.name : "";
      if (tagName) {
        const childPath = [...path, tagName];
        const childDepth = getDepth($child, childPath);
        if (childDepth > maxChildDepth) {
          maxChildDepth = childDepth;
        }
      }
    });
    return maxChildDepth;
  }
  const $body = $("body");
  if ($body.length > 0) {
    getDepth($body, ["body"]);
  }
  let maxChildren = 0;
  let widestSelector = "";
  allElements.each((_, element) => {
    const $el = $(element);
    const directChildren = $el.children().length;
    if (directChildren > maxChildren) {
      maxChildren = directChildren;
      const tagName = element.type === "tag" ? element.name : "";
      const id = $el.attr("id");
      const className = $el.attr("class")?.split(" ")[0];
      widestSelector = id ? `#${id}` : className ? `${tagName}.${className}` : tagName;
    }
  });
  const elementBreakdown = {
    divs: $("div").length,
    spans: $("span").length,
    tables: $("table").length,
    lists: $("ul, ol, li").length,
    forms: $("form").length,
    inputs: $("input, select, textarea").length,
    images: $("img").length,
    scripts: $("script").length,
    svgs: $("svg").length
  };
  if (totalElements > THRESHOLDS.totalElements.error) {
    issues.push({
      code: "DOM_SIZE_EXCESSIVE",
      severity: "error",
      category: "performance",
      title: "Excessive DOM size",
      description: `Page has ${totalElements.toLocaleString()} DOM elements (threshold: ${THRESHOLDS.totalElements.error.toLocaleString()}). This severely impacts performance.`,
      impact: "Significantly slower rendering, increased memory usage, and degraded interactivity. Users on low-end devices will experience major lag.",
      howToFix: "Reduce DOM complexity: virtualize long lists, lazy-load content, remove unnecessary wrapper elements, use CSS instead of extra markup.",
      affectedUrls: [url],
      details: {
        totalElements,
        breakdown: elementBreakdown,
        suggestions: getDomReductionSuggestions(elementBreakdown)
      }
    });
  } else if (totalElements > THRESHOLDS.totalElements.warning) {
    issues.push({
      code: "DOM_SIZE_LARGE",
      severity: "warning",
      category: "performance",
      title: "Large DOM size",
      description: `Page has ${totalElements.toLocaleString()} DOM elements (recommended: <${THRESHOLDS.totalElements.warning.toLocaleString()}).`,
      impact: "Slower style calculations, layout operations, and JavaScript performance.",
      howToFix: "Consider reducing DOM size: remove unnecessary elements, lazy-load off-screen content, virtualize long lists.",
      affectedUrls: [url],
      details: {
        totalElements,
        threshold: THRESHOLDS.totalElements.warning
      }
    });
  }
  if (maxDepth > THRESHOLDS.maxDepth.warning) {
    issues.push({
      code: "DOM_DEPTH_EXCESSIVE",
      severity: maxDepth > THRESHOLDS.maxDepth.error ? "error" : "warning",
      category: "performance",
      title: "Excessive DOM depth",
      description: `Maximum DOM depth is ${maxDepth} levels (recommended: <${THRESHOLDS.maxDepth.warning}).`,
      impact: "Deep nesting increases style calculation time and can cause stack overflow in some browsers.",
      howToFix: "Flatten your HTML structure. Remove unnecessary wrapper divs. Use CSS flexbox/grid instead of nested containers.",
      affectedUrls: [url],
      details: {
        maxDepth,
        deepestPath: deepestPath.slice(0, 10).join(" > ") + (deepestPath.length > 10 ? "..." : "")
      }
    });
  }
  if (maxChildren > THRESHOLDS.maxChildren.warning) {
    issues.push({
      code: "DOM_CHILDREN_EXCESSIVE",
      severity: maxChildren > THRESHOLDS.maxChildren.error ? "error" : "warning",
      category: "performance",
      title: "Element has too many children",
      description: `An element has ${maxChildren} direct children (recommended: <${THRESHOLDS.maxChildren.warning}).`,
      impact: "Adding/removing children triggers expensive layout recalculations.",
      howToFix: "Break large lists into smaller chunks. Use virtual scrolling for long lists. Group items into sections.",
      affectedUrls: [url],
      details: {
        maxChildren,
        element: widestSelector
      }
    });
  }
  return {
    issues,
    data: {
      totalElements,
      maxDepth,
      maxChildren,
      deepestPath,
      widestElement: {
        selector: widestSelector,
        childCount: maxChildren
      },
      elementBreakdown
    }
  };
}
function getDomReductionSuggestions(breakdown) {
  const suggestions = [];
  if (breakdown.divs > 500) {
    suggestions.push(`High div count (${breakdown.divs}): Review wrapper divs that may be unnecessary`);
  }
  if (breakdown.spans > 200) {
    suggestions.push(`High span count (${breakdown.spans}): Consider if all spans are needed for styling`);
  }
  if (breakdown.tables > 10) {
    suggestions.push(`Multiple tables (${breakdown.tables}): Consider CSS grid/flexbox for layouts`);
  }
  if (breakdown.lists > 100) {
    suggestions.push(`Many list items (${breakdown.lists}): Consider virtualizing long lists`);
  }
  if (breakdown.svgs > 50) {
    suggestions.push(`Many SVGs (${breakdown.svgs}): Consider SVG sprites or icon fonts`);
  }
  return suggestions;
}

// src/audit/checks/image-dimensions.ts
import * as cheerio31 from "https://esm.sh/cheerio@1.0.0";
function analyzeImageDimensions(html, url) {
  const issues = [];
  const $ = cheerio31.load(html);
  const images = $("img");
  const totalImages = images.length;
  let withDimensions = 0;
  let withoutDimensions = 0;
  let aspectRatioSet = 0;
  const missingDimensions = [];
  images.each((_, img) => {
    const $img = $(img);
    const src = $img.attr("src") || $img.attr("data-src") || "";
    const widthAttr = $img.attr("width");
    const heightAttr = $img.attr("height");
    const style = $img.attr("style") || "";
    const hasWidthAttr = Boolean(widthAttr);
    const hasHeightAttr = Boolean(heightAttr);
    const hasStyleWidth = /width\s*:/i.test(style);
    const hasStyleHeight = /height\s*:/i.test(style);
    const hasAspectRatio = /aspect-ratio\s*:/i.test(style);
    const className = $img.attr("class") || "";
    const hasWidth = hasWidthAttr || hasStyleWidth;
    const hasHeight = hasHeightAttr || hasStyleHeight;
    const hasBothDimensions = hasWidth && hasHeight || hasAspectRatio;
    if (hasBothDimensions) {
      withDimensions++;
      if (hasAspectRatio) {
        aspectRatioSet++;
      }
    } else {
      withoutDimensions++;
      if (src && !src.includes("data:image/") && !src.includes("placeholder")) {
        const parent = $img.parent();
        const parentTag = parent.length > 0 ? parent[0].name || "" : "";
        const parentClass = parent.attr("class")?.split(" ")[0] || "";
        const context = parentClass ? `${parentTag}.${parentClass}` : parentTag;
        missingDimensions.push({
          src: truncateSrc(src),
          hasWidth,
          hasHeight,
          hasAspectRatio,
          context
        });
      }
    }
  });
  if (withoutDimensions > 0) {
    const percentage = Math.round(withoutDimensions / totalImages * 100);
    if (percentage > 50) {
      issues.push({
        code: "IMAGES_MANY_MISSING_DIMENSIONS",
        severity: "warning",
        category: "performance",
        title: "Most images missing explicit dimensions",
        description: `${withoutDimensions} of ${totalImages} images (${percentage}%) don't have width and height attributes. This causes layout shifts.`,
        impact: "High Cumulative Layout Shift (CLS). Content jumps around as images load, frustrating users.",
        howToFix: 'Add width and height attributes to all <img> tags. Use CSS aspect-ratio for responsive images. Example: <img src="..." width="800" height="600">',
        affectedUrls: [url],
        details: {
          totalImages,
          withDimensions,
          withoutDimensions,
          examples: missingDimensions.slice(0, 5)
        }
      });
    } else if (withoutDimensions > 0) {
      issues.push({
        code: "IMAGES_MISSING_DIMENSIONS",
        severity: "notice",
        category: "performance",
        title: "Some images missing explicit dimensions",
        description: `${withoutDimensions} of ${totalImages} image(s) don't have width and height attributes.`,
        impact: "May cause layout shifts when images load, affecting CLS score.",
        howToFix: 'Add width and height attributes: <img src="..." width="800" height="600">. For responsive images, also use CSS: img { max-width: 100%; height: auto; }',
        affectedUrls: [url],
        details: {
          images: missingDimensions.slice(0, 10)
        }
      });
    }
  }
  if (withDimensions > 0 && aspectRatioSet === 0) {
    issues.push({
      code: "IMAGES_NO_ASPECT_RATIO",
      severity: "notice",
      category: "performance",
      title: "Consider using CSS aspect-ratio for images",
      description: "Images have width/height but no CSS aspect-ratio. The aspect-ratio property provides better responsive behavior.",
      impact: "Minor - existing dimensions prevent CLS, but aspect-ratio offers better control.",
      howToFix: "Add CSS aspect-ratio for responsive images: img { aspect-ratio: 16/9; width: 100%; height: auto; }",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      totalImages,
      withDimensions,
      withoutDimensions,
      missingDimensions: missingDimensions.slice(0, 20),
      aspectRatioSet
    }
  };
}
function truncateSrc(src) {
  const cleanSrc = src.split("?")[0];
  if (cleanSrc.length > 60) {
    return cleanSrc.substring(0, 30) + "..." + cleanSrc.substring(cleanSrc.length - 25);
  }
  return cleanSrc;
}

// src/audit/checks/color-contrast.ts
import * as cheerio32 from "https://esm.sh/cheerio@1.0.0";
var KNOWN_LOW_CONTRAST_PAIRS = [
  { fg: "#999999", bg: "#ffffff", ratio: 2.85 },
  { fg: "#888888", bg: "#ffffff", ratio: 3.54 },
  { fg: "#aaaaaa", bg: "#ffffff", ratio: 2.32 },
  { fg: "#cccccc", bg: "#ffffff", ratio: 1.61 },
  { fg: "#666666", bg: "#000000", ratio: 5.74 },
  { fg: "#777777", bg: "#000000", ratio: 4.48 },
  { fg: "gray", bg: "white", ratio: 3.95 },
  { fg: "silver", bg: "white", ratio: 1.77 },
  { fg: "lightgray", bg: "white", ratio: 1.46 }
];
var NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  navy: [0, 0, 128],
  yellow: [255, 255, 0],
  orange: [255, 165, 0],
  purple: [128, 0, 128],
  pink: [255, 192, 203],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  transparent: [255, 255, 255]
  // Treat as white for calculation
};
function inheritedBackground($el) {
  for (const ancestor of $el.parents().toArray()) {
    const style = ancestor.attribs?.style;
    if (!style)
      continue;
    const match = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
    if (!match)
      continue;
    const value = match[1].trim();
    if (!/^(transparent|none)$/i.test(value))
      return value;
  }
  return null;
}
function analyzeColorContrast(html, url) {
  const issues = [];
  const $ = cheerio32.load(html);
  const potentialIssues = [];
  let elementsAnalyzed = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let cannotDetermine = 0;
  const textElements = $("p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label, div");
  textElements.each((_, element) => {
    const $el = $(element);
    const style = $el.attr("style") || "";
    if (!style) {
      cannotDetermine++;
      return;
    }
    elementsAnalyzed++;
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bgMatch = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
    const foreground = colorMatch ? colorMatch[1].trim() : null;
    const background = bgMatch ? bgMatch[1].trim() : inheritedBackground($el);
    if (!foreground) {
      cannotDetermine++;
      return;
    }
    if (!background) {
      cannotDetermine++;
      return;
    }
    const bgColor = background;
    const fgRgb = parseColor(foreground);
    const bgRgb = parseColor(bgColor);
    if (!fgRgb || !bgRgb) {
      cannotDetermine++;
      return;
    }
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const fontSize = style.match(/font-size\s*:\s*(\d+)(?:px|pt)?/i);
    const fontWeight = style.match(/font-weight\s*:\s*(\d+|bold)/i);
    const isLargeText = fontSize && parseInt(fontSize[1]) >= 18 || fontSize && parseInt(fontSize[1]) >= 14 && fontWeight && (fontWeight[1] === "bold" || parseInt(fontWeight[1]) >= 700);
    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;
    let wcagLevel = "none";
    if (ratio >= aaaThreshold) {
      wcagLevel = "AAA";
      passedChecks++;
    } else if (ratio >= aaThreshold) {
      wcagLevel = "AA";
      passedChecks++;
    } else {
      failedChecks++;
      const tagName = element.name;
      const id = $el.attr("id");
      const className = $el.attr("class")?.split(" ")[0];
      const selector = id ? `#${id}` : className ? `${tagName}.${className}` : tagName;
      potentialIssues.push({
        selector,
        foreground,
        background: bgColor,
        contrastRatio: Math.round(ratio * 100) / 100,
        wcagLevel,
        isLargeText: isLargeText || false
      });
    }
  });
  const styleTag = $("style").text();
  for (const pair of KNOWN_LOW_CONTRAST_PAIRS) {
    if (styleTag.includes(pair.fg) && styleTag.includes(pair.bg)) {
    }
  }
  if (potentialIssues.length > 0) {
    const criticalIssues = potentialIssues.filter((i) => i.contrastRatio < 3);
    const moderateIssues = potentialIssues.filter((i) => i.contrastRatio >= 3 && i.contrastRatio < 4.5);
    if (criticalIssues.length > 0) {
      issues.push({
        code: "A11Y_CONTRAST_CRITICAL",
        severity: "error",
        category: "accessibility",
        title: "Critical color contrast issues",
        description: `Found ${criticalIssues.length} element(s) with very low contrast (below 3:1). This text may be unreadable for many users.`,
        impact: "Users with low vision or color blindness cannot read this content. Fails WCAG accessibility requirements.",
        howToFix: "Increase contrast by using darker text on light backgrounds or lighter text on dark backgrounds. Use a contrast checker tool to verify 4.5:1 ratio minimum.",
        affectedUrls: [url],
        details: {
          issues: criticalIssues.slice(0, 5),
          recommendation: "WCAG AA requires 4.5:1 contrast for normal text, 3:1 for large text."
        }
      });
    }
    if (moderateIssues.length > 0) {
      issues.push({
        code: "A11Y_CONTRAST_LOW",
        severity: "warning",
        category: "accessibility",
        title: "Low color contrast detected",
        description: `Found ${moderateIssues.length} element(s) with contrast below WCAG AA standard (4.5:1).`,
        impact: "May be difficult to read for users with visual impairments.",
        howToFix: "Adjust colors to achieve at least 4.5:1 contrast ratio for normal text.",
        affectedUrls: [url],
        details: {
          issues: moderateIssues.slice(0, 5)
        }
      });
    }
  }
  if (cannotDetermine > elementsAnalyzed * 0.8) {
    issues.push({
      code: "A11Y_CONTRAST_UNDETERMINED",
      severity: "notice",
      category: "accessibility",
      title: "Color contrast could not be fully analyzed",
      description: "Most text colors are set via CSS stylesheets rather than inline styles. Full contrast checking requires browser rendering.",
      impact: "Potential contrast issues may exist that were not detected.",
      howToFix: "Use browser DevTools (Lighthouse accessibility audit) or dedicated tools like axe-core for comprehensive contrast checking.",
      affectedUrls: [url],
      details: {
        elementsAnalyzed,
        cannotDetermine,
        recommendation: "Run Lighthouse accessibility audit for complete contrast analysis."
      }
    });
  }
  return {
    issues,
    data: {
      elementsAnalyzed,
      potentialIssues,
      passedChecks,
      failedChecks,
      cannotDetermine
    }
  };
}
function parseColor(color) {
  const trimmed = color.trim().toLowerCase();
  if (NAMED_COLORS[trimmed]) {
    return NAMED_COLORS[trimmed];
  }
  const hexMatch = trimmed.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3])
    ];
  }
  const hslMatch = trimmed.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }
  return null;
}
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0)
        t += 1;
      if (t > 1)
        t -= 1;
      if (t < 1 / 6)
        return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2)
        return q2;
      if (t < 2 / 3)
        return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function getRelativeLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function calculateContrastRatio(fg, bg) {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// src/audit/checks/asset-minification.ts
import * as cheerio33 from "https://esm.sh/cheerio@1.0.0";
function isMinified(content, type) {
  const lines = content.split("\n");
  const totalLines = lines.length;
  const avgLineLength = totalLines > 0 ? content.length / totalLines : 0;
  const whitespaceCount = (content.match(/\s/g) || []).length;
  const whitespaceRatio = content.length > 0 ? whitespaceCount / content.length : 0;
  let hasComments = false;
  if (type === "css") {
    hasComments = /\/\*[\s\S]*?\*\//.test(content);
  } else {
    hasComments = /\/\/[^\n]*|\/\*[\s\S]*?\*\//.test(content);
  }
  const isMinifiedByLineLength = avgLineLength > 500;
  const isMinifiedByWhitespace = whitespaceRatio < 0.1;
  const isMinifiedByComments = !hasComments;
  const score = (isMinifiedByLineLength ? 1 : 0) + (isMinifiedByWhitespace ? 1 : 0) + (isMinifiedByComments ? 1 : 0);
  const isSingleLineMinified = totalLines <= 2 && avgLineLength > 100;
  return {
    isMinified: score >= 2 || isSingleLineMinified,
    indicators: {
      avgLineLength: Math.round(avgLineLength),
      whitespaceRatio: Math.round(whitespaceRatio * 100) / 100,
      hasComments
    }
  };
}
function extractAssetUrls(html, baseUrl) {
  const $ = cheerio33.load(html);
  const base = new URL(baseUrl);
  const css = [];
  const js = [];
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:")) {
      try {
        const fullUrl = new URL(href, base).href;
        if (new URL(fullUrl).hostname === base.hostname) {
          css.push(fullUrl);
        }
      } catch {
      }
    }
  });
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      try {
        const fullUrl = new URL(src, base).href;
        if (new URL(fullUrl).hostname === base.hostname) {
          js.push(fullUrl);
        }
      } catch {
      }
    }
  });
  return { css, js };
}
async function analyzeAssetMinification(html, url) {
  const issues = [];
  const assetUrls = extractAssetUrls(html, url);
  const cssFiles = [];
  const jsFiles = [];
  const cssToCheck = assetUrls.css.slice(0, 3);
  const cssPromises = cssToCheck.map(async (cssUrl) => {
    try {
      const response = await httpGet(cssUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const content = response.data;
        const { isMinified: minified, indicators } = isMinified(content, "css");
        cssFiles.push({
          url: cssUrl,
          size: content.length,
          isMinified: minified,
          indicators
        });
      }
    } catch {
    }
  });
  const jsToCheck = assetUrls.js.slice(0, 3);
  const jsPromises = jsToCheck.map(async (jsUrl) => {
    try {
      const response = await httpGet(jsUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const content = response.data;
        const { isMinified: minified, indicators } = isMinified(content, "js");
        jsFiles.push({
          url: jsUrl,
          size: content.length,
          isMinified: minified,
          indicators
        });
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all([...cssPromises, ...jsPromises]),
    new Promise((resolve) => setTimeout(resolve, 8e3))
    // 8s overall timeout
  ]);
  const unminifiedCss = cssFiles.filter((f) => !f.isMinified);
  const unminifiedJs = jsFiles.filter((f) => !f.isMinified);
  const cssSavings = unminifiedCss.reduce((sum, f) => sum + Math.round(f.size * 0.4), 0);
  const jsSavings = unminifiedJs.reduce((sum, f) => sum + Math.round(f.size * 0.4), 0);
  if (unminifiedCss.length > 0) {
    issues.push({
      code: "CSS_NOT_MINIFIED",
      severity: "warning",
      category: "performance",
      title: "CSS files not minified",
      description: `${unminifiedCss.length} CSS file(s) appear to not be minified. Minification removes whitespace and comments to reduce file size.`,
      impact: `Unminified CSS increases page load time. Potential savings: ~${Math.round(cssSavings / 1024)}KB.`,
      howToFix: "Use a CSS minifier like cssnano, clean-css, or build tools (Vite, Webpack) to minify CSS files. Most bundlers do this automatically in production builds.",
      affectedUrls: unminifiedCss.map((f) => f.url),
      details: {
        files: unminifiedCss.map((f) => ({
          url: f.url,
          size: `${Math.round(f.size / 1024)}KB`,
          avgLineLength: f.indicators.avgLineLength,
          whitespaceRatio: `${Math.round(f.indicators.whitespaceRatio * 100)}%`,
          hasComments: f.indicators.hasComments
        }))
      }
    });
  }
  if (unminifiedJs.length > 0) {
    issues.push({
      code: "JS_NOT_MINIFIED",
      severity: "warning",
      category: "performance",
      title: "JavaScript files not minified",
      description: `${unminifiedJs.length} JavaScript file(s) appear to not be minified. Minification removes whitespace, comments, and shortens variable names.`,
      impact: `Unminified JavaScript increases page load time and parsing time. Potential savings: ~${Math.round(jsSavings / 1024)}KB.`,
      howToFix: "Use a JS minifier like Terser, UglifyJS, or build tools (Vite, Webpack, esbuild) to minify JavaScript. Most bundlers do this automatically in production builds.",
      affectedUrls: unminifiedJs.map((f) => f.url),
      details: {
        files: unminifiedJs.map((f) => ({
          url: f.url,
          size: `${Math.round(f.size / 1024)}KB`,
          avgLineLength: f.indicators.avgLineLength,
          whitespaceRatio: `${Math.round(f.indicators.whitespaceRatio * 100)}%`,
          hasComments: f.indicators.hasComments
        }))
      }
    });
  }
  return {
    issues,
    data: {
      cssFiles,
      jsFiles,
      totalCssFiles: assetUrls.css.length,
      totalJsFiles: assetUrls.js.length,
      unminifiedCss: unminifiedCss.length,
      unminifiedJs: unminifiedJs.length,
      potentialSavings: {
        css: cssSavings,
        js: jsSavings
      }
    }
  };
}

// src/audit/checks/page-resources.ts
import * as cheerio34 from "https://esm.sh/cheerio@1.0.0";
function analyzePageResources(html, url) {
  const issues = [];
  const $ = cheerio34.load(html);
  const baseUrl = new URL(url);
  const baseHostname = baseUrl.hostname;
  const stylesheets = [];
  const scripts = [];
  const images = [];
  const fonts = [];
  const iframes = [];
  const thirdPartyDomains = /* @__PURE__ */ new Set();
  let firstParty = 0;
  let thirdParty = 0;
  function isFirstParty(resourceUrl) {
    try {
      const resourceHostname = new URL(resourceUrl, url).hostname;
      return resourceHostname === baseHostname || resourceHostname.endsWith(`.${baseHostname}`);
    } catch {
      return true;
    }
  }
  function trackOrigin(resourceUrl) {
    if (isFirstParty(resourceUrl)) {
      firstParty++;
    } else {
      thirdParty++;
      try {
        const domain = new URL(resourceUrl, url).hostname;
        thirdPartyDomains.add(domain);
      } catch {
      }
    }
  }
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:")) {
      stylesheets.push(href);
      trackOrigin(href);
    }
  });
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      scripts.push(src);
      trackOrigin(src);
    }
  });
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      images.push(src);
      trackOrigin(src);
    }
  });
  $("img[srcset], source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset) {
      const urls = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
      for (const srcUrl of urls) {
        if (srcUrl && !srcUrl.startsWith("data:") && !images.includes(srcUrl)) {
          images.push(srcUrl);
          trackOrigin(srcUrl);
        }
      }
    }
  });
  $('link[rel="preload"][as="font"], link[href*=".woff"], link[href*=".woff2"], link[href*=".ttf"], link[href*=".otf"]').each(
    (_, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("data:")) {
        fonts.push(href);
        trackOrigin(href);
      }
    }
  );
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("about:") && !src.startsWith("javascript:")) {
      iframes.push(src);
      trackOrigin(src);
    }
  });
  let other = 0;
  $('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"]').each((_, el) => {
    const href = $(el).attr("href");
    const as = $(el).attr("as");
    if (href && !href.startsWith("data:")) {
      if (as !== "font" && as !== "style" && !stylesheets.includes(href) && !fonts.includes(href)) {
        other++;
        trackOrigin(href);
      }
    }
  });
  const total = stylesheets.length + scripts.length + images.length + fonts.length + iframes.length + other;
  if (total > 100) {
    issues.push({
      code: "PAGE_RESOURCES_EXCESSIVE",
      severity: "error",
      category: "performance",
      title: "Excessive number of page resources",
      description: `Page requests ${total} resources. This significantly impacts load time due to connection overhead and browser limits.`,
      impact: "Too many HTTP requests cause slow page loads, poor Core Web Vitals, and high bounce rates. Each request has DNS, TCP, and TLS overhead.",
      howToFix: "Combine CSS/JS files, use image sprites or inline small images, lazy-load non-critical resources, remove unused dependencies.",
      affectedUrls: [url],
      details: {
        total,
        breakdown: {
          stylesheets: stylesheets.length,
          scripts: scripts.length,
          images: images.length,
          fonts: fonts.length,
          iframes: iframes.length,
          other
        },
        recommendation: "Aim for under 50 total requests for optimal performance."
      }
    });
  } else if (total > 50) {
    issues.push({
      code: "PAGE_RESOURCES_HIGH",
      severity: "warning",
      category: "performance",
      title: "High number of page resources",
      description: `Page requests ${total} resources. Consider reducing for better performance.`,
      impact: "Many HTTP requests increase page load time, especially on mobile networks.",
      howToFix: "Bundle CSS/JS files, lazy-load images below the fold, consider critical CSS inlining.",
      affectedUrls: [url],
      details: {
        total,
        breakdown: {
          stylesheets: stylesheets.length,
          scripts: scripts.length,
          images: images.length,
          fonts: fonts.length,
          iframes: iframes.length,
          other
        }
      }
    });
  }
  if (thirdParty > 20) {
    issues.push({
      code: "PAGE_RESOURCES_THIRD_PARTY_HIGH",
      severity: "warning",
      category: "performance",
      title: "Many third-party resources",
      description: `Page loads ${thirdParty} resources from ${thirdPartyDomains.size} third-party domains.`,
      impact: "Third-party resources are outside your control and add latency. They can also be a privacy/security concern.",
      howToFix: "Self-host critical third-party resources when possible. Use preconnect hints for remaining third-party origins.",
      affectedUrls: [url],
      details: {
        thirdPartyCount: thirdParty,
        domains: Array.from(thirdPartyDomains).slice(0, 10)
      }
    });
  }
  if (iframes.length > 3) {
    issues.push({
      code: "PAGE_RESOURCES_MANY_IFRAMES",
      severity: "warning",
      category: "performance",
      title: "Multiple iframes detected",
      description: `Page contains ${iframes.length} iframes. Each iframe loads its own document and resources.`,
      impact: "Iframes significantly increase page weight and can block the main thread.",
      howToFix: "Lazy-load iframes that are below the fold. Consider native embeds or facade patterns for video/widget iframes.",
      affectedUrls: [url],
      details: {
        iframeCount: iframes.length,
        iframes: iframes.slice(0, 5)
      }
    });
  }
  return {
    issues,
    data: {
      total,
      byType: {
        stylesheets: stylesheets.length,
        scripts: scripts.length,
        images: images.length,
        fonts: fonts.length,
        iframes: iframes.length,
        other
      },
      byOrigin: {
        firstParty,
        thirdParty
      },
      thirdPartyDomains: Array.from(thirdPartyDomains),
      details: {
        stylesheets,
        scripts,
        images: images.slice(0, 20),
        // Limit for data size
        fonts,
        iframes
      }
    }
  };
}

// src/audit/checks/responsive-css.ts
import * as cheerio35 from "https://esm.sh/cheerio@1.0.0";
function extractMediaQueries(css) {
  const mediaQueries = [];
  const regex = /@media\s*([^{]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    mediaQueries.push(match[1].trim());
  }
  return mediaQueries;
}
function classifyBreakpoints(mediaQueries) {
  const breakpoints = /* @__PURE__ */ new Set();
  let hasMobile = false;
  let hasTablet = false;
  let hasDesktop = false;
  for (const query of mediaQueries) {
    const widthMatches = query.match(/(?:min|max)-width\s*:\s*(\d+)(?:px|em|rem)?/gi);
    if (widthMatches) {
      for (const match of widthMatches) {
        const valueMatch = match.match(/(\d+)/);
        if (valueMatch) {
          const value = parseInt(valueMatch[1], 10);
          breakpoints.add(`${value}px`);
          if (value <= 480) {
            hasMobile = true;
          } else if (value <= 768) {
            hasMobile = true;
          } else if (value <= 1024) {
            hasTablet = true;
          } else {
            hasDesktop = true;
          }
        }
      }
    }
    if (/screen\s+and/i.test(query)) {
    }
    if (/print/i.test(query)) {
      continue;
    }
  }
  return {
    hasMobile,
    hasTablet,
    hasDesktop,
    breakpoints: Array.from(breakpoints).sort((a, b) => parseInt(a) - parseInt(b))
  };
}
async function analyzeResponsiveCss(html, url) {
  const issues = [];
  const $ = cheerio35.load(html);
  const baseUrl = new URL(url);
  const viewportMeta = $('meta[name="viewport"]').attr("content");
  const hasViewport = !!viewportMeta;
  const allMediaQueries = [];
  const externalSources = [];
  let inlineCount = 0;
  $("style").each((_, el) => {
    const css = $(el).text();
    const queries = extractMediaQueries(css);
    if (queries.length > 0) {
      allMediaQueries.push(...queries);
      inlineCount += queries.length;
    }
  });
  const cssLinks = $('link[rel="stylesheet"][href]').toArray().slice(0, 3).map((el) => $(el).attr("href")).filter((href) => {
    if (!href || href.startsWith("data:"))
      return false;
    try {
      const cssHostname = new URL(href, url).hostname;
      return cssHostname === baseUrl.hostname;
    } catch {
      return false;
    }
  });
  const cssPromises = cssLinks.map(async (cssUrl) => {
    try {
      const fullUrl = new URL(cssUrl, url).href;
      const response = await httpGet(fullUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const queries = extractMediaQueries(response.data);
        if (queries.length > 0) {
          allMediaQueries.push(...queries);
          externalSources.push(cssUrl);
        }
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all(cssPromises),
    new Promise((resolve) => setTimeout(resolve, 6e3))
    // 6s overall timeout
  ]);
  const hasMediaQueries = allMediaQueries.length > 0;
  const { hasMobile, hasTablet, hasDesktop, breakpoints } = classifyBreakpoints(allMediaQueries);
  if (!hasViewport) {
    issues.push({
      code: "RESPONSIVE_NO_VIEWPORT",
      severity: "error",
      category: "mobile",
      title: "Missing viewport meta tag",
      description: "No viewport meta tag found. This is required for responsive design to work properly.",
      impact: "Without a viewport meta tag, mobile browsers will render the page at desktop width and scale down, making it unusable.",
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.',
      affectedUrls: [url]
    });
  }
  if (!hasMediaQueries) {
    issues.push({
      code: "RESPONSIVE_NO_MEDIA_QUERIES",
      severity: "warning",
      category: "mobile",
      title: "No CSS media queries detected",
      description: "No @media queries found in inline styles or first-party stylesheets.",
      impact: "Without media queries, the site likely uses fixed layouts that do not adapt to different screen sizes. This hurts mobile usability and SEO.",
      howToFix: "Add CSS media queries to adapt layout for different screen sizes. Consider using a mobile-first approach with min-width breakpoints.",
      affectedUrls: [url],
      details: {
        suggestion: "Common breakpoints: 480px (mobile), 768px (tablet), 1024px (desktop)"
      }
    });
  } else if (!hasMobile && !hasTablet) {
    issues.push({
      code: "RESPONSIVE_NO_MOBILE_BREAKPOINT",
      severity: "warning",
      category: "mobile",
      title: "No mobile breakpoints detected",
      description: `Found ${allMediaQueries.length} media queries but none target mobile screen sizes (\u2264768px).`,
      impact: "Site may not be optimized for mobile devices, which affects majority of web traffic and Google mobile-first indexing.",
      howToFix: "Add media queries for mobile devices. Example: @media (max-width: 768px) { ... } or use min-width for mobile-first.",
      affectedUrls: [url],
      details: {
        detectedBreakpoints: breakpoints
      }
    });
  }
  return {
    issues,
    data: {
      hasViewport,
      viewportContent: viewportMeta,
      hasMediaQueries,
      mediaQueryCount: allMediaQueries.length,
      mediaQuerySources: {
        inline: inlineCount,
        external: externalSources
      },
      breakpoints,
      hasMobileBreakpoint: hasMobile,
      hasTabletBreakpoint: hasTablet,
      hasDesktopBreakpoint: hasDesktop
    }
  };
}

// src/audit/checks/directory-listing.ts
var COMMON_DIRECTORIES = [
  "/images/",
  "/img/",
  "/assets/",
  "/static/",
  "/uploads/",
  "/files/",
  "/media/",
  "/css/",
  "/js/",
  "/scripts/",
  "/fonts/",
  "/backup/",
  "/temp/",
  "/tmp/"
];
var DIRECTORY_LISTING_PATTERNS = [
  // Apache
  /<title>Index of/i,
  /Parent Directory/i,
  /<h1>Index of/i,
  /\[DIR\]/i,
  /\[PARENTDIR\]/i,
  // Nginx
  /<title>Index of.*<\/title>/i,
  /autoindex/i,
  // IIS
  /\[To Parent Directory\]/i,
  /<title>.*- \/<\/title>/i,
  // Generic
  /Directory listing for/i,
  /<pre>.*<a href="[^"]*">[^<]*<\/a>.*<\/pre>/is
];
function isDirectoryListing(html) {
  return DIRECTORY_LISTING_PATTERNS.some((pattern) => pattern.test(html));
}
function detectServerType(headers) {
  const server = headers.server || headers.Server;
  if (server) {
    if (/apache/i.test(server))
      return "Apache";
    if (/nginx/i.test(server))
      return "Nginx";
    if (/iis/i.test(server))
      return "IIS";
    if (/cloudflare/i.test(server))
      return "Cloudflare";
    return server;
  }
  return void 0;
}
async function analyzeDirectoryListing(url) {
  const issues = [];
  const baseUrl = new URL(url);
  const baseOrigin = baseUrl.origin;
  const vulnerableDirectories = [];
  const checkedDirectories = [];
  let serverType;
  const directoriesToCheck = COMMON_DIRECTORIES.slice(0, 6);
  const checkPromises = directoriesToCheck.map(async (dir) => {
    const dirUrl = `${baseOrigin}${dir}`;
    checkedDirectories.push(dir);
    try {
      const response = await httpGet(dirUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.headers) {
        const detectedServer = detectServerType(response.headers);
        if (detectedServer && !serverType) {
          serverType = detectedServer;
        }
      }
      if (response.status === 200 && typeof response.data === "string") {
        if (isDirectoryListing(response.data)) {
          vulnerableDirectories.push(dir);
        }
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all(checkPromises),
    new Promise((resolve) => setTimeout(resolve, 8e3))
    // 8s overall timeout
  ]);
  const directoryListingEnabled = vulnerableDirectories.length > 0;
  if (directoryListingEnabled) {
    issues.push({
      code: "DIRECTORY_LISTING_ENABLED",
      severity: "warning",
      category: "security",
      title: "Directory listing enabled",
      description: `${vulnerableDirectories.length} director${vulnerableDirectories.length === 1 ? "y" : "ies"} expose file listings. This reveals your site structure and potentially sensitive files.`,
      impact: "Attackers can discover backup files, configuration files, or hidden content. This is a security vulnerability and information disclosure risk.",
      howToFix: serverType === "Apache" ? 'Add "Options -Indexes" to your .htaccess file or Apache configuration.' : serverType === "Nginx" ? 'Remove or set "autoindex off" in your Nginx configuration.' : "Disable directory listing in your web server configuration. Add index files to directories.",
      affectedUrls: vulnerableDirectories.map((dir) => `${baseOrigin}${dir}`),
      details: {
        vulnerableDirectories,
        serverType,
        checkedCount: checkedDirectories.length,
        recommendation: "Ensure all directories have an index.html or index.php, or disable directory listing at the server level."
      }
    });
  }
  return {
    issues,
    data: {
      directoryListingEnabled,
      vulnerableDirectories,
      checkedDirectories,
      serverType
    }
  };
}

// src/audit/checks/url-safety.ts
function fnv1aHash(str) {
  let hash = 2166136261;
  const FNV_PRIME = 16777619;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
var ThreatDatabase = class {
  hashPrefixes = /* @__PURE__ */ new Set();
  domainPrefixes = /* @__PURE__ */ new Set();
  lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  sources = ["builtin-patterns"];
  constructor() {
    this.initializeBuiltinData();
  }
  /**
   * Initialize with built-in threat patterns
   * These are hashes of known malicious URL patterns
   */
  initializeBuiltinData() {
    const knownBadPatterns = [
      // Example pattern hashes - in production, load from file or Supabase
      // Format: FNV-1a hash prefix of canonical URL
    ];
    for (const prefix of knownBadPatterns) {
      this.hashPrefixes.add(prefix);
    }
  }
  /**
   * Compute canonical form of URL (similar to Google Safe Browsing)
   * - Lowercase hostname
   * - Remove default ports
   * - Normalize path
   * - Remove fragments
   */
  canonicalizeUrl(urlString) {
    try {
      const url = new URL(urlString);
      let canonical = url.protocol + "//" + url.hostname.toLowerCase();
      if (url.port && !(url.protocol === "http:" && url.port === "80" || url.protocol === "https:" && url.port === "443")) {
        canonical += ":" + url.port;
      }
      let path = url.pathname;
      if (path === "/") {
        canonical += "/";
      } else {
        path = path.replace(/\/+/g, "/");
        canonical += path;
      }
      if (url.search) {
        canonical += url.search;
      }
      return canonical;
    } catch {
      return null;
    }
  }
  /**
   * Compute hash of URL and return prefix
   * Uses FNV-1a for cross-platform compatibility (Node.js, Deno, browser)
   */
  computeHashPrefix(url) {
    return fnv1aHash(url);
  }
  /**
   * Compute hash prefix for domain only
   */
  computeDomainHashPrefix(hostname) {
    return fnv1aHash(hostname.toLowerCase());
  }
  /**
   * Check if URL matches any hash in the database
   */
  checkUrl(urlString) {
    const canonical = this.canonicalizeUrl(urlString);
    if (!canonical) {
      return { matched: false };
    }
    const urlPrefix = this.computeHashPrefix(canonical);
    if (this.hashPrefixes.has(urlPrefix)) {
      return { matched: true, prefix: urlPrefix, matchType: "exact" };
    }
    try {
      const url = new URL(urlString);
      const domainPrefix = this.computeDomainHashPrefix(url.hostname);
      if (this.domainPrefixes.has(domainPrefix)) {
        return { matched: true, prefix: domainPrefix, matchType: "domain" };
      }
    } catch {
    }
    return { matched: false };
  }
  /**
   * Add hashes from URLhaus CSV data
   * Format: id,dateadded,url,url_status,last_online,threat,tags,urlhaus_link,reporter
   */
  loadFromUrlhausCsv(csvData) {
    const lines = csvData.split("\n");
    let added = 0;
    for (const line of lines) {
      if (line.startsWith("#") || line.startsWith("id,"))
        continue;
      const parts = line.split(",");
      if (parts.length >= 3) {
        const url = parts[2].replace(/"/g, "");
        const canonical = this.canonicalizeUrl(url);
        if (canonical) {
          const prefix = this.computeHashPrefix(canonical);
          this.hashPrefixes.add(prefix);
          added++;
        }
      }
    }
    this.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    if (!this.sources.includes("urlhaus")) {
      this.sources.push("urlhaus");
    }
    return added;
  }
  /**
   * Add a list of URLs to the database
   */
  addUrls(urls) {
    let added = 0;
    for (const url of urls) {
      const canonical = this.canonicalizeUrl(url);
      if (canonical) {
        const prefix = this.computeHashPrefix(canonical);
        if (!this.hashPrefixes.has(prefix)) {
          this.hashPrefixes.add(prefix);
          added++;
        }
      }
    }
    return added;
  }
  /**
   * Add domains to the blocklist
   */
  addDomains(domains) {
    let added = 0;
    for (const domain of domains) {
      const prefix = this.computeDomainHashPrefix(domain);
      if (!this.domainPrefixes.has(prefix)) {
        this.domainPrefixes.add(prefix);
        added++;
      }
    }
    return added;
  }
  /**
   * Bulk load hash prefixes directly (for Supabase integration)
   * This is used when loading from the threat_hashes table
   */
  loadHashPrefixes(hashes) {
    let added = 0;
    for (const hash of hashes) {
      if (hash.hash_type === "url") {
        if (!this.hashPrefixes.has(hash.hash_prefix)) {
          this.hashPrefixes.add(hash.hash_prefix);
          added++;
        }
      } else if (hash.hash_type === "domain") {
        if (!this.domainPrefixes.has(hash.hash_prefix)) {
          this.domainPrefixes.add(hash.hash_prefix);
          added++;
        }
      }
    }
    this.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    if (!this.sources.includes("supabase")) {
      this.sources.push("supabase");
    }
    return added;
  }
  /**
   * Clear all hashes (useful before reloading)
   */
  clear() {
    this.hashPrefixes.clear();
    this.domainPrefixes.clear();
    this.sources = [];
  }
  /**
   * Check if database has been populated
   */
  isPopulated() {
    return this.hashPrefixes.size > 0 || this.domainPrefixes.size > 0;
  }
  /**
   * Get database statistics
   */
  getStats() {
    return {
      prefixCount: this.hashPrefixes.size + this.domainPrefixes.size,
      lastUpdated: this.lastUpdated,
      sources: this.sources
    };
  }
};
var threatDb = new ThreatDatabase();
var POPULAR_DOMAINS = [
  "google",
  "facebook",
  "amazon",
  "apple",
  "microsoft",
  "paypal",
  "netflix",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "github",
  "dropbox",
  "adobe",
  "salesforce",
  "stripe",
  "shopify",
  "wordpress",
  "cloudflare",
  "aws",
  "azure",
  "slack",
  "zoom",
  "docusign"
];
var SUSPICIOUS_TLDS = [
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".gq",
  // Free TLDs abused for phishing
  ".xyz",
  ".top",
  ".work",
  ".click",
  ".link",
  ".download",
  ".zip",
  ".mov"
  // New TLDs that can be confusing
];
var SUSPICIOUS_EXTENSIONS = [
  ".exe",
  ".msi",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".jar",
  ".scr",
  ".pif",
  ".application",
  ".hta",
  ".cpl",
  ".msc",
  ".wsf"
];
var HOMOGRAPH_CHARS = {
  "a": ["\u0430", "\u0251", "\u03B1"],
  // Cyrillic а, Latin alpha
  "c": ["\u0441", "\u03F2"],
  // Cyrillic с
  "e": ["\u0435", "\u0451"],
  // Cyrillic е
  "o": ["\u043E", "\u03BF"],
  // Cyrillic о, Greek omicron
  "p": ["\u0440"],
  // Cyrillic р
  "x": ["\u0445"],
  // Cyrillic х
  "y": ["\u0443"]
  // Cyrillic у
};
function containsHomographs(str) {
  for (const [_, lookalikes] of Object.entries(HOMOGRAPH_CHARS)) {
    for (const char of lookalikes) {
      if (str.includes(char))
        return true;
    }
  }
  return false;
}
function levenshteinDistance(a, b) {
  if (a.length === 0)
    return b.length;
  if (b.length === 0)
    return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++)
    matrix[i] = [i];
  for (let j = 0; j <= a.length; j++)
    matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
function checkTyposquatting(hostname) {
  const parts = hostname.toLowerCase().split(".");
  const mainDomain = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  for (const popular of POPULAR_DOMAINS) {
    if (mainDomain === popular)
      continue;
    const distance = levenshteinDistance(mainDomain, popular);
    if (distance > 0 && distance <= 2) {
      return `Possible typosquat of "${popular}"`;
    }
    if (mainDomain.includes(popular) && mainDomain !== popular) {
      if (mainDomain.includes("-") || mainDomain.includes("secure") || mainDomain.includes("login") || mainDomain.includes("account")) {
        return `Suspicious variation of "${popular}"`;
      }
    }
  }
  return null;
}
function analyzeUrlPatterns(urlString) {
  const reasons = [];
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      reasons.push("Uses IP address instead of domain");
    }
    for (const tld of SUSPICIOUS_TLDS) {
      if (hostname.endsWith(tld)) {
        reasons.push(`Suspicious TLD: ${tld}`);
        break;
      }
    }
    if (hostname.split(".").length > 4) {
      reasons.push("Excessive subdomains");
    }
    const typosquat = checkTyposquatting(hostname);
    if (typosquat)
      reasons.push(typosquat);
    if (containsHomographs(hostname)) {
      reasons.push("Contains look-alike Unicode characters");
    }
    for (const ext of SUSPICIOUS_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        reasons.push(`Dangerous file type: ${ext}`);
        break;
      }
    }
    if (urlString.includes("@")) {
      reasons.push("Contains @ symbol (may obscure destination)");
    }
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some((s) => hostname === s || hostname.endsWith("." + s))) {
      reasons.push("URL shortener (destination hidden)");
    }
  } catch {
    reasons.push("Malformed URL");
  }
  if (reasons.length === 0)
    return null;
  let riskLevel = "medium";
  const highRisk = ["homograph", "IP address", "typosquat", "Dangerous file"];
  if (reasons.some((r) => highRisk.some((h) => r.toLowerCase().includes(h.toLowerCase())))) {
    riskLevel = "high";
  }
  if (reasons.length >= 3)
    riskLevel = "high";
  return { url: urlString, reasons, riskLevel };
}
function analyzeUrlSafety(url, externalLinks = []) {
  const issues = [];
  const matchedUrls = [];
  const patternMatches = [];
  const allUrls = [url, ...externalLinks];
  for (const checkUrl of allUrls) {
    const hashResult = threatDb.checkUrl(checkUrl);
    if (hashResult.matched) {
      matchedUrls.push({
        url: checkUrl,
        hashPrefix: hashResult.prefix,
        matchType: hashResult.matchType
      });
    }
    const patternResult = analyzeUrlPatterns(checkUrl);
    if (patternResult) {
      patternMatches.push(patternResult);
    }
  }
  if (matchedUrls.length > 0) {
    const mainSiteMatched = matchedUrls.some((m) => m.url === url);
    if (mainSiteMatched) {
      issues.push({
        code: "URL_SAFETY_KNOWN_THREAT",
        severity: "error",
        category: "security",
        title: "Website URL matches known threat database",
        description: "Your website URL matches entries in the threat database. This indicates your site may have been compromised or flagged.",
        impact: "Browsers and security tools will block access to your site. Search engines will remove you from results.",
        howToFix: "Scan your site for malware, remove any malicious content, and request removal from threat databases.",
        affectedUrls: [url],
        details: {
          matchedHash: matchedUrls.find((m) => m.url === url)?.hashPrefix
        }
      });
    }
    const externalMatches = matchedUrls.filter((m) => m.url !== url);
    if (externalMatches.length > 0) {
      issues.push({
        code: "URL_SAFETY_EXTERNAL_THREAT",
        severity: "error",
        category: "security",
        title: "External links to known malicious URLs",
        description: `${externalMatches.length} external link(s) point to URLs in the threat database.`,
        impact: "Linking to malicious sites harms visitors and damages your reputation and rankings.",
        howToFix: "Remove all links to flagged URLs immediately.",
        affectedUrls: externalMatches.map((m) => m.url)
      });
    }
  }
  const highRiskPatterns = patternMatches.filter((p) => p.riskLevel === "high");
  if (highRiskPatterns.some((p) => p.url === url)) {
    const mainPattern = highRiskPatterns.find((p) => p.url === url);
    issues.push({
      code: "URL_SAFETY_SUSPICIOUS_DOMAIN",
      severity: "warning",
      category: "security",
      title: "Website URL has suspicious characteristics",
      description: `Your URL shows patterns associated with malicious sites: ${mainPattern.reasons.join("; ")}`,
      impact: "Users and security tools may distrust your site.",
      howToFix: "Use a trustworthy domain structure. Avoid patterns that mimic other brands.",
      affectedUrls: [url],
      details: { reasons: mainPattern.reasons }
    });
  }
  const suspiciousExternal = highRiskPatterns.filter((p) => p.url !== url);
  if (suspiciousExternal.length > 0) {
    issues.push({
      code: "URL_SAFETY_SUSPICIOUS_EXTERNAL",
      severity: "warning",
      category: "security",
      title: "External links with suspicious characteristics",
      description: `${suspiciousExternal.length} external link(s) show suspicious patterns.`,
      impact: "Linking to suspicious sites can harm visitors and rankings.",
      howToFix: "Review and remove or replace suspicious external links.",
      affectedUrls: suspiciousExternal.map((p) => p.url),
      details: {
        suspiciousLinks: suspiciousExternal.map((p) => ({
          url: p.url,
          reasons: p.reasons
        }))
      }
    });
  }
  const shortenerMatches = patternMatches.filter(
    (p) => p.reasons.some((r) => r.includes("shortener"))
  );
  if (shortenerMatches.length > 0) {
    issues.push({
      code: "URL_SAFETY_SHORTENERS",
      severity: "notice",
      category: "security",
      title: "External links use URL shorteners",
      description: `${shortenerMatches.length} link(s) use URL shorteners, hiding destinations.`,
      impact: "URL shorteners reduce trust and SEO link value.",
      howToFix: "Replace shortened URLs with direct links.",
      affectedUrls: shortenerMatches.map((p) => p.url)
    });
  }
  return {
    issues,
    data: {
      checkedUrls: allUrls.length,
      matchedUrls,
      databaseInfo: threatDb.getStats(),
      patternMatches
    }
  };
}
var urlSafetyDatabase = {
  /**
   * Load URLs from URLhaus CSV format
   */
  loadFromUrlhausCsv: (csv) => threatDb.loadFromUrlhausCsv(csv),
  /**
   * Add URLs to the blocklist
   */
  addUrls: (urls) => threatDb.addUrls(urls),
  /**
   * Add domains to the blocklist
   */
  addDomains: (domains) => threatDb.addDomains(domains),
  /**
   * Bulk load hash prefixes (for Supabase integration)
   * Call this with data from: SELECT hash_prefix, hash_type FROM threat_hashes WHERE is_active = TRUE
   */
  loadHashPrefixes: (hashes) => threatDb.loadHashPrefixes(hashes),
  /**
   * Clear all hashes (useful before reloading from fresh data)
   */
  clear: () => threatDb.clear(),
  /**
   * Check if database has been populated with threat data
   */
  isPopulated: () => threatDb.isPopulated(),
  /**
   * Get database statistics
   */
  getStats: () => threatDb.getStats()
};

// src/audit/checks/tracking-verification.ts
import * as cheerio36 from "https://esm.sh/cheerio@1.0.0";
function analyzeTrackingVerification(html, url) {
  const issues = [];
  const $ = cheerio36.load(html);
  const ga4Match = html.match(/gtag\s*\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/i) || html.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/i);
  const hasGa4 = !!ga4Match;
  const ga4MeasurementId = ga4Match ? ga4Match[1] : void 0;
  const gtmMatch = html.match(/googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/i);
  const hasGtm = !!gtmMatch;
  const gtmContainerId = gtmMatch ? gtmMatch[1] : void 0;
  const hasGtmNoscript = /googletagmanager\.com\/ns\.html\?id=GTM-[A-Z0-9]+/i.test(html);
  const gscMeta = $('meta[name="google-site-verification"]').attr("content");
  const hasGscVerification = !!(gscMeta && gscMeta.length > 10);
  const bingMeta = $('meta[name="msvalidate.01"]').attr("content");
  const hasBingVerification = !!(bingMeta && bingMeta.length > 10);
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const hasMicrodata = $('[itemtype*="schema.org"]').length > 0;
  const hasJsonLd = jsonLdScripts.length > 0;
  const schemaTypes = [];
  let hasValidJson = true;
  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed["@type"]) {
          schemaTypes.push(parsed["@type"]);
        }
      }
    } catch {
      hasValidJson = false;
    }
  });
  const data = {
    ga4: { detected: hasGa4, measurementId: ga4MeasurementId },
    gtm: { detected: hasGtm, containerId: gtmContainerId, hasNoscript: hasGtmNoscript },
    gsc: { verified: hasGscVerification, verificationCode: gscMeta },
    bing: { verified: hasBingVerification, verificationCode: bingMeta },
    schemaOrg: { detected: hasJsonLd || hasMicrodata, types: schemaTypes, hasValidJson },
    sitemap: { inRobotsTxt: false }
    // Set later if we check robots.txt
  };
  if (!hasGa4 && !hasGtm) {
    issues.push({
      code: "GA4_MISSING",
      severity: "warning",
      category: "on-page",
      title: "Google Analytics 4 not detected",
      description: "No GA4 tracking code found. GA4 is essential for measuring organic traffic and conversions.",
      impact: "Cannot measure SEO impact without analytics tracking.",
      howToFix: "Add GA4 tracking code to your site. Get your measurement ID from analytics.google.com.",
      affectedUrls: [url]
    });
  }
  if (!hasGscVerification) {
    issues.push({
      code: "GSC_VERIFICATION_MISSING",
      severity: "warning",
      category: "on-page",
      title: "Google Search Console verification not found",
      description: "No GSC verification meta tag detected. GSC provides essential data about your search performance.",
      impact: "Missing critical insights into Google search visibility, impressions, and clicks.",
      howToFix: "Add your GSC verification meta tag to the <head> section. Get it from search.google.com/search-console.",
      affectedUrls: [url]
    });
  }
  if (!hasBingVerification) {
    issues.push({
      code: "BING_VERIFICATION_MISSING",
      severity: "notice",
      category: "on-page",
      title: "Bing Webmaster Tools verification not found",
      description: "No Bing verification meta tag detected. Bing/Yahoo account for 5-8% of search traffic.",
      impact: "Missing insights on Bing/Yahoo search traffic.",
      howToFix: "Add Bing Webmaster Tools verification for insights on Bing/Yahoo traffic. Get it from bing.com/webmasters.",
      affectedUrls: [url]
    });
  }
  if (!hasGtm) {
    issues.push({
      code: "GTM_MISSING",
      severity: "notice",
      category: "on-page",
      title: "Google Tag Manager not detected",
      description: "GTM not found. While not required, GTM makes it easier to manage tracking tags without code changes.",
      impact: "Tag management requires developer involvement for each change.",
      howToFix: "Consider using GTM for easier tag management. It allows marketing to add tags without developer help.",
      affectedUrls: [url]
    });
  } else if (!hasGtmNoscript) {
    issues.push({
      code: "GTM_NOSCRIPT_MISSING",
      severity: "notice",
      category: "on-page",
      title: "GTM noscript fallback missing",
      description: "GTM is installed but the noscript fallback is missing. This is needed for users with JavaScript disabled.",
      impact: "Users with JS disabled won't be tracked.",
      howToFix: "Add the GTM noscript tag immediately after the opening <body> tag.",
      affectedUrls: [url]
    });
  }
  if (!hasJsonLd && !hasMicrodata) {
    issues.push({
      code: "SCHEMA_ORG_MISSING",
      severity: "warning",
      category: "structured-data",
      title: "No structured data found",
      description: "No Schema.org structured data detected. Structured data helps search engines understand your content and can enable rich snippets.",
      impact: "Missing opportunity for rich results in search (stars, images, FAQs, etc.).",
      howToFix: "Add JSON-LD structured data for your content type (Organization, Product, Article, etc.).",
      affectedUrls: [url]
    });
  } else if (hasJsonLd && !hasValidJson) {
    issues.push({
      code: "SCHEMA_ORG_INVALID",
      severity: "error",
      category: "structured-data",
      title: "Invalid JSON-LD structured data",
      description: "One or more JSON-LD scripts contain invalid JSON. This will prevent search engines from parsing your structured data.",
      impact: "Structured data is being ignored due to syntax errors.",
      howToFix: "Fix the JSON syntax errors in your structured data. Use the Rich Results Test to validate.",
      affectedUrls: [url]
    });
  }
  return { issues, data };
}

// src/audit/engine.ts
function sameUrl(a, b) {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    const path = (u) => u.pathname.replace(/\/+$/, "") || "/";
    return ua.origin === ub.origin && path(ua) === path(ub) && ua.search === ub.search;
  } catch {
    return a === b;
  }
}
async function runFullAudit(options) {
  const { url, checkBrokenLinks = false, checkHreflangUrls = false, checkCanonicalChain = false, cruxApiKey, checksLimit = 280, premiumChecks } = options;
  const auditRoot = isSiteRoot(url) || sameUrl(url, options.auditRootUrl ?? url);
  const allIssues = [];
  const pages = [];
  const tier = checksLimit <= 50 ? "free" : checksLimit <= 100 ? "registered" : "paid";
  const runPremiumChecks = tier === "paid" && !!premiumChecks;
  const runExtendedChecks = tier !== "free";
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  console.error(`
\u{1F50D} Running comprehensive SEO audit on ${url}...
`);
  const withTimeout = async (name, promise, timeoutMs) => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${name} timed out`)), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  };
  console.error("\u{1F4CB} Phase 1: Crawlability checks + page fetch (parallel)...");
  const [crawlabilityResult, fetchResult] = await Promise.all([
    // robots.txt, sitemaps and the redirect chain run one after another; a site that is slow
    // on each could hold the page for minutes, so the whole group gets 45s.
    withTimeout("Crawlability checks", runCrawlabilityChecks(url), 45e3).catch((err) => {
      console.error("Crawlability check failed:", err);
      return [];
    }),
    httpGet(url, {
      timeout: 3e4,
      validateStatus: () => true
    }).catch((err) => {
      console.error("Main page fetch failed:", err instanceof Error ? { message: err.message, cause: err.cause } : err);
      return { error: err, data: "", headers: {} };
    })
  ]);
  allIssues.push(...crawlabilityResult);
  if ("error" in fetchResult) {
    const err = fetchResult.error;
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    const errorCause = err instanceof Error && err.cause ? ` (${String(err.cause)})` : "";
    allIssues.push({
      code: "FETCH_ERROR",
      severity: "error",
      category: "indexability",
      // Not crawlability - robots/sitemap checks may have succeeded
      title: "Page fetch failed",
      description: `Could not load page content: ${errorMsg}${errorCause}. Only robots.txt and sitemap checks were performed.`,
      impact: "Cannot perform full SEO audit without page HTML content.",
      howToFix: "Verify the URL is accessible, the server is responding, and there are no firewall/geo blocks.",
      affectedUrls: [url],
      details: { error: errorMsg, cause: errorCause || void 0 }
    });
    return createReport(url, domain, allIssues, pages, { kind: "unreachable" });
  }
  const statusCode = fetchResult.status;
  if (statusCode >= 400) {
    const blocked = statusCode === 401 || statusCode === 403 || statusCode === 429;
    allIssues.push({
      ...ISSUE_DEFINITIONS.HTTP_ERROR_STATUS,
      title: `Page returns HTTP ${statusCode}`,
      description: `The audited URL answered with HTTP ${statusCode}${fetchResult.statusText ? ` ${fetchResult.statusText}` : ""}. Page content checks were skipped - they would only be grading the error page.${blocked ? " This status often means a firewall or bot protection (Cloudflare, Vercel, etc.) is refusing automated clients: check that search engine crawlers get the page, and allowlist the RankCLI user agent or audit a preview URL." : ""}`,
      affectedUrls: [url],
      details: { statusCode, ...blocked && { likelyBotProtection: true } }
    });
    pages.push({ url, statusCode, wordCount: 0, loadTime: 0, issues: allIssues.map((i) => i.code) });
    return createReport(url, domain, allIssues, pages, { kind: "http-error", statusCode });
  }
  const body = typeof fetchResult.data === "string" ? fetchResult.data : JSON.stringify(fetchResult.data ?? "");
  const html = body.replace(/<\/?noscript[^>]*>/gi, "");
  const headers = fetchResult.headers;
  console.error(`\u{1F4DD} Phase 2: Running synchronous HTML checks (tier: ${tier}, limit: ${checksLimit})...`);
  const onPageResult = analyzeOnPage(html, url, headers, { auditRoot });
  const structuredDataResult = analyzeStructuredData(html, url);
  const mobileResult = analyzeMobile(html, url);
  const mobileResourceIssues = checkMobileResources(html, url);
  const socialResult = analyzeSocialMeta(html, url);
  const soft404Result = detectSoft404(html, url, statusCode);
  const serpResult = analyzeSERPPreview(html, url);
  const domResult = analyzeDOMStructure(html, url);
  const techResult = detectTechnologies(html, url, headers);
  const keywordResult = analyzeKeywords(html, url);
  const paginationResult = analyzePagination(html, url, onPageResult.data.canonical);
  const urlSafetyResult = analyzeUrlSafety(url);
  const domSizeResult = analyzeDomSize(html, url);
  const imageDimensionsResult = analyzeImageDimensions(html, url);
  const trackingResult = analyzeTrackingVerification(html, url);
  const anchorResult = runExtendedChecks ? analyzeAnchorText(html, url) : { issues: [], data: {} };
  const localSeoResult = runExtendedChecks ? analyzeLocalSEO(html, url) : { issues: [], data: {} };
  const modernImageResult = runExtendedChecks ? analyzeModernImages(html, url) : { issues: [], data: {} };
  const resourceHintResult = runExtendedChecks ? analyzeResourceHints(html, url) : { issues: [], data: {} };
  const trackerResult = runExtendedChecks ? analyzeTrackerBloat(html, url) : { issues: [], data: {} };
  const csrResult = runExtendedChecks ? analyzeClientRendering(html, url) : { issues: [], data: {} };
  const responsiveImgResult = runExtendedChecks ? analyzeResponsiveImages(html, url) : { issues: [], data: {} };
  const colorContrastResult = runExtendedChecks ? analyzeColorContrast(html, url) : { issues: [], data: {} };
  const pageResourcesResult = runExtendedChecks ? analyzePageResources(html, url) : { issues: [], data: {} };
  const snippetResult = runPremiumChecks ? premiumChecks.analyzeFeaturedSnippet(html, url) : { issues: [], data: {} };
  const linkGraphResult = runPremiumChecks ? premiumChecks.analyzeInternalLinkGraph(html, url) : { issues: [], data: {} };
  const eeatResult = runPremiumChecks ? premiumChecks.analyzeEEATSignals(html, url) : { issues: [], data: {} };
  const contentScienceResult = runPremiumChecks ? premiumChecks.analyzeContentScience(html, url) : { issues: [], data: {} };
  const cannibalizationResult = runPremiumChecks ? premiumChecks.analyzeKeywordCannibalizationSinglePage(html, url) : { issues: [], data: {} };
  const conversionResult = runPremiumChecks ? premiumChecks.analyzeConversionElements(html, url) : { issues: [], data: {} };
  const keywordPlacementResult = runPremiumChecks ? premiumChecks.analyzeKeywordPlacement(html, url) : { issues: [], data: {} };
  const clusterResult = runPremiumChecks ? premiumChecks.analyzeTopicalClusters(html, url) : { issues: [], data: {} };
  const platformResult = runPremiumChecks ? premiumChecks.analyzePlatformPresence(html, url) : { issues: [], data: {} };
  const toolResult = runPremiumChecks ? premiumChecks.analyzeInteractiveTools(html, url) : { issues: [], data: {} };
  const funnelResult = runPremiumChecks ? premiumChecks.analyzeFunnelIntent(html, url) : { issues: [], data: {} };
  const navboostResult = runPremiumChecks ? premiumChecks.analyzeNavBoostSignals(html, url) : { issues: [], data: {} };
  const entityResult = runPremiumChecks ? premiumChecks.analyzeEntitySEO(html, url) : { issues: [], data: {} };
  const qdfFreshnessResult = runPremiumChecks ? premiumChecks.analyzeFreshnessSignals(html, url) : { issues: [], data: {} };
  const aiContentStructureResult = runPremiumChecks ? premiumChecks.analyzeAIContentStructure(html, url) : { issues: [], data: {} };
  const ragChunkReadinessResult = runPremiumChecks ? premiumChecks.analyzeRAGChunkReadiness(html, url) : { issues: [], data: {} };
  const citationQualityResult = runPremiumChecks ? premiumChecks.analyzeCitationQuality(html, url) : { issues: [], data: {} };
  const answerConcisenessResult = runPremiumChecks ? premiumChecks.analyzeAnswerConciseness(html, url) : { issues: [], data: {} };
  const brandMentionResult = runPremiumChecks ? premiumChecks.analyzeBrandMentionOptimization(html, url) : { issues: [], data: {} };
  const citationWorthinessResult = runPremiumChecks ? premiumChecks.analyzeAICitationWorthiness(html, url) : { issues: [], data: {} };
  const reviewEcosystemResult = runPremiumChecks ? premiumChecks.analyzeReviewEcosystem(html, url) : { issues: [], data: {} };
  allIssues.push(
    ...onPageResult.issues,
    ...structuredDataResult.issues,
    ...mobileResult.issues,
    ...mobileResourceIssues,
    ...socialResult.issues,
    ...soft404Result.issues,
    ...anchorResult.issues,
    ...serpResult.issues,
    ...localSeoResult.issues,
    ...domResult.issues,
    ...modernImageResult.issues,
    ...techResult.issues,
    ...keywordResult.issues,
    ...snippetResult.issues,
    ...linkGraphResult.issues,
    ...resourceHintResult.issues,
    ...eeatResult.issues,
    ...contentScienceResult.issues,
    ...cannibalizationResult.issues,
    ...trackerResult.issues,
    ...csrResult.issues,
    ...responsiveImgResult.issues,
    ...conversionResult.issues,
    ...keywordPlacementResult.issues,
    ...clusterResult.issues,
    ...platformResult.issues,
    ...toolResult.issues,
    ...funnelResult.issues,
    ...navboostResult.issues,
    ...entityResult.issues,
    ...qdfFreshnessResult.issues,
    ...aiContentStructureResult.issues,
    ...ragChunkReadinessResult.issues,
    ...citationQualityResult.issues,
    ...answerConcisenessResult.issues,
    ...brandMentionResult.issues,
    ...citationWorthinessResult.issues,
    ...reviewEcosystemResult.issues,
    ...domSizeResult.issues,
    ...imageDimensionsResult.issues,
    ...colorContrastResult.issues,
    ...pageResourcesResult.issues,
    ...urlSafetyResult.issues,
    ...paginationResult.issues,
    ...trackingResult.issues
  );
  if (!structuredDataResult.data.hasSchema) {
    const suggestions = suggestSchemaTypes(html, url);
    if (suggestions.length > 0 && structuredDataResult.issues.length > 0) {
      const lastSchemaIssue = structuredDataResult.issues[structuredDataResult.issues.length - 1];
      lastSchemaIssue.details = {
        ...lastSchemaIssue.details,
        suggestedTypes: suggestions
      };
    }
  }
  console.error("\u{1F517} Phase 3: Running async checks (parallel)...");
  const safeAsync = async (name, fn, timeoutMs = 1e4) => {
    try {
      const result = await withTimeout(name, fn(), timeoutMs);
      return result.issues;
    } catch (err) {
      console.error(`${name} failed:`, err);
      return [];
    }
  };
  const safeAsyncIssues = async (name, fn, timeoutMs = 1e4) => {
    try {
      return await withTimeout(name, fn(), timeoutMs);
    } catch (err) {
      console.error(`${name} failed:`, err);
      return [];
    }
  };
  let perfData = { loadTime: 0 };
  const performancePromise = analyzePerformance(url).then((result) => {
    perfData = result.data;
    return result.issues;
  }).catch((err) => {
    console.error("Performance check failed:", err);
    return [];
  });
  const asyncChecks = [];
  asyncChecks.push(safeAsync("Links", () => analyzeLinks(html, url, checkBrokenLinks)));
  asyncChecks.push(safeAsync("Images", () => analyzeImages(html, url, checkBrokenLinks)));
  asyncChecks.push(performancePromise);
  asyncChecks.push(safeAsync("Security", () => analyzeSecurity(html, url, headers)));
  asyncChecks.push(safeAsyncIssues("Certificate", async () => (await checkCertificate(url)).issues));
  asyncChecks.push(safeAsync("Redirects", () => analyzeRedirects(url)));
  asyncChecks.push(safeAsync("Robots Validation", () => validateRobotsTxt(url)));
  asyncChecks.push(safeAsync("Canonical Domain", () => analyzeCanonicalDomain(url)));
  asyncChecks.push(safeAsyncIssues("Framework Detection", async () => {
    const frameworkInfo = detectFramework({ html, headers });
    if (frameworkInfo.framework === "unknown")
      return [];
    return getFrameworkIssues(frameworkInfo, html, url, {
      indexable: !pageHasNoindex(html, headers)
    });
  }));
  if (runExtendedChecks) {
    asyncChecks.push(safeAsync("Hreflang", () => analyzeHreflang(html, url, { validateUrls: checkHreflangUrls })));
    asyncChecks.push(safeAsync("Canonical Advanced", () => analyzeCanonicalAdvanced(html, url, { checkChain: checkCanonicalChain })));
    asyncChecks.push(safeAsync("Security Headers", () => analyzeSecurityHeaders(url)));
    asyncChecks.push(safeAsync("Caching Headers", () => analyzeCachingHeaders(url, headers)));
    asyncChecks.push(safeAsync("HTML Compliance", () => analyzeHtmlCompliance(html, url, headers)));
    asyncChecks.push(safeAsync("Redirect Chain", () => analyzeRedirectChain(url)));
    asyncChecks.push(safeAsync("Asset Minification", () => analyzeAssetMinification(html, url)));
    asyncChecks.push(safeAsync("Responsive CSS", () => analyzeResponsiveCss(html, url)));
    asyncChecks.push(safeAsync("Directory Listing", () => analyzeDirectoryListing(url)));
  }
  if (runPremiumChecks) {
    asyncChecks.push(safeAsync("AI Readiness", () => runAIReadinessChecks(url, html)));
    asyncChecks.push(safeAsync("Content Freshness", () => analyzeContentFreshness(url, html)));
    asyncChecks.push(safeAsync("Additional Checks", () => runAdditionalChecks(url, html)));
    asyncChecks.push(safeAsync("IndexNow", () => analyzeIndexNow(html, url, headers)));
    asyncChecks.push(safeAsync("Site Maturity", () => analyzeSiteMaturity(html, url)));
    asyncChecks.push(safeAsync("Bing Optimization", () => analyzeBingOptimization(html, url)));
    asyncChecks.push(safeAsync("LLMs.txt", () => analyzeLlmsTxt(url)));
    if (cruxApiKey) {
      asyncChecks.push(safeAsyncIssues("Core Web Vitals", async () => {
        const cwv = await fetchCoreWebVitals(url, cruxApiKey);
        const issues = [];
        if (cwv) {
          if (cwv.lcp?.rating === "poor") {
            issues.push({
              code: "LCP_POOR",
              severity: "error",
              category: "performance",
              title: "Poor Largest Contentful Paint (LCP)",
              description: `LCP is ${cwv.lcp.value}ms (should be under 2500ms)`,
              impact: "Direct Core Web Vitals ranking factor.",
              howToFix: "Optimize hero images, preload critical resources, improve server response time.",
              affectedUrls: [url],
              details: { lcp: cwv.lcp }
            });
          }
          if (cwv.cls?.rating === "poor") {
            issues.push({
              code: "CLS_POOR",
              severity: "error",
              category: "performance",
              title: "Poor Cumulative Layout Shift (CLS)",
              description: `CLS is ${cwv.cls.value} (should be under 0.1)`,
              impact: "Direct Core Web Vitals ranking factor.",
              howToFix: "Set image dimensions, avoid inserting content above existing content.",
              affectedUrls: [url],
              details: { cls: cwv.cls }
            });
          }
        }
        return issues;
      }));
    }
  }
  const asyncResults = await Promise.all(asyncChecks);
  for (const issues of asyncResults) {
    allIssues.push(...issues);
  }
  pages.push({
    url,
    statusCode,
    title: onPageResult.data.title,
    description: onPageResult.data.description,
    canonical: onPageResult.data.canonical,
    h1: onPageResult.data.h1s,
    wordCount: onPageResult.data.wordCount,
    loadTime: perfData.loadTime,
    issues: allIssues.map((i) => i.code)
  });
  console.error("\n\u2705 Audit complete!\n");
  return createReport(url, domain, allIssues, pages);
}
function createReport(url, domain, issues, pages, pageFailure) {
  const healthScore = calculateHealthScore(issues);
  if (pageFailure) {
    for (const key of Object.keys(healthScore)) {
      if (key !== "crawlability")
        healthScore[key] = 0;
    }
  }
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const notices = issues.filter((i) => i.severity === "notice").length;
  const totalPossibleChecks = 310;
  const passed = Math.max(0, totalPossibleChecks - errors - warnings);
  return {
    url,
    domain,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    crawlStats: {
      totalUrls: 1,
      crawledUrls: pageFailure?.kind === "unreachable" ? 0 : 1,
      errorUrls: pageFailure ? 1 : 0,
      redirectUrls: 0,
      blockedUrls: 0
    },
    healthScore,
    issues,
    pages,
    summary: {
      errors,
      warnings,
      notices,
      passed
    }
  };
}
function calculateHealthScore(issues) {
  const weights = { critical: 15, error: 10, warning: 3, info: 1, notice: 1 };
  const categoryDeductions = {
    crawlability: 0,
    indexability: 0,
    "on-page": 0,
    content: 0,
    links: 0,
    images: 0,
    "structured-data": 0,
    performance: 0,
    security: 0,
    mobile: 0,
    international: 0,
    "ai-readiness": 0,
    "social": 0,
    "local-seo": 0,
    "accessibility": 0
  };
  for (const issue of issues) {
    const deduction = weights[issue.severity];
    categoryDeductions[issue.category] = (categoryDeductions[issue.category] || 0) + deduction;
  }
  const crawlability = Math.max(0, 100 - categoryDeductions.crawlability * 5);
  const indexability = Math.max(0, 100 - categoryDeductions.indexability * 5);
  const onPage = Math.max(0, 100 - categoryDeductions["on-page"] * 3);
  const content = Math.max(0, 100 - categoryDeductions.content * 3);
  const links = Math.max(0, 100 - categoryDeductions.links * 3);
  const performance = Math.max(0, 100 - categoryDeductions.performance * 4);
  const security = Math.max(0, 100 - categoryDeductions.security * 5);
  const aiReadiness = Math.max(0, 100 - categoryDeductions["ai-readiness"] * 1);
  const social = Math.max(0, 100 - categoryDeductions.social * 2);
  const localSeo = Math.max(0, 100 - categoryDeductions["local-seo"] * 2);
  const accessibility = Math.max(0, 100 - categoryDeductions.accessibility * 4);
  const overall = Math.round(
    crawlability * 0.11 + indexability * 0.11 + onPage * 0.16 + content * 0.07 + links * 0.07 + performance * 0.11 + security * 0.11 + aiReadiness * 0.06 + social * 0.05 + localSeo * 0.05 + accessibility * 0.1
  );
  return {
    overall,
    crawlability,
    indexability,
    onPage,
    content,
    links,
    performance,
    security,
    aiReadiness,
    social,
    localSeo,
    accessibility
  };
}
function formatReport(report) {
  const lines = [];
  lines.push("");
  lines.push("\u2550".repeat(70));
  lines.push("  SEO AUDIT REPORT");
  lines.push("\u2550".repeat(70));
  lines.push(`  URL: ${report.url}`);
  lines.push(`  Domain: ${report.domain}`);
  lines.push(`  Time: ${report.timestamp}`);
  lines.push("\u2550".repeat(70));
  lines.push("");
  lines.push("\u{1F4CA} HEALTH SCORE");
  lines.push("\u2500".repeat(70));
  lines.push(`  Overall: ${report.healthScore.overall}/100 ${getScoreEmoji(report.healthScore.overall)}`);
  lines.push("");
  lines.push("  Category Scores:");
  lines.push(`    Crawlability:  ${report.healthScore.crawlability}/100`);
  lines.push(`    Indexability:  ${report.healthScore.indexability}/100`);
  lines.push(`    On-Page SEO:   ${report.healthScore.onPage}/100`);
  lines.push(`    Content:       ${report.healthScore.content}/100`);
  lines.push(`    Links:         ${report.healthScore.links}/100`);
  lines.push(`    Performance:   ${report.healthScore.performance}/100`);
  lines.push(`    Security:      ${report.healthScore.security}/100`);
  lines.push(`    AI Readiness:  ${report.healthScore.aiReadiness}/100`);
  lines.push(`    Social:        ${report.healthScore.social}/100`);
  lines.push(`    Local SEO:     ${report.healthScore.localSeo}/100`);
  lines.push(`    Accessibility: ${report.healthScore.accessibility}/100`);
  lines.push("");
  lines.push("\u{1F4CB} SUMMARY");
  lines.push("\u2500".repeat(70));
  lines.push(`  \u274C Errors:   ${report.summary.errors}`);
  lines.push(`  \u26A0\uFE0F  Warnings: ${report.summary.warnings}`);
  lines.push(`  \u2139\uFE0F  Notices:  ${report.summary.notices}`);
  lines.push(`  \u2705 Passed:   ${report.summary.passed}`);
  lines.push("");
  const issuesByCategory = groupIssuesByCategory(report.issues);
  for (const [category, issues] of Object.entries(issuesByCategory)) {
    if (issues.length === 0)
      continue;
    lines.push(`\u{1F4C1} ${category.toUpperCase()}`);
    lines.push("\u2500".repeat(70));
    for (const issue of issues) {
      const icon = issue.severity === "error" ? "\u274C" : issue.severity === "warning" ? "\u26A0\uFE0F" : "\u2139\uFE0F";
      lines.push(`  ${icon} ${issue.title}`);
      lines.push(`     ${issue.description}`);
      if (issue.howToFix) {
        lines.push(`     \u2192 ${issue.howToFix}`);
      }
      lines.push("");
    }
  }
  lines.push("\u2550".repeat(70));
  return lines.join("\n");
}
function getScoreEmoji(score) {
  if (score >= 90)
    return "\u{1F7E2} Excellent";
  if (score >= 70)
    return "\u{1F7E1} Good";
  if (score >= 50)
    return "\u{1F7E0} Needs Work";
  return "\u{1F534} Poor";
}
function groupIssuesByCategory(issues) {
  const grouped = {};
  for (const issue of issues) {
    if (!grouped[issue.category]) {
      grouped[issue.category] = [];
    }
    grouped[issue.category].push(issue);
  }
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => {
      const order = { critical: 0, error: 1, warning: 2, info: 3, notice: 4 };
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
    });
  }
  return grouped;
}

// ../agent-runtime-premium/src/checks/featured-snippet.ts
import * as cheerio37 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/internal-link-graph.ts
import * as cheerio38 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/eeat-signals.ts
import * as cheerio39 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/content-science.ts
import * as cheerio40 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/keyword-cannibalization.ts
import * as cheerio41 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/conversion-elements.ts
import * as cheerio42 from "https://esm.sh/cheerio@1.0.0";
var CTA_PATTERNS = [
  /get (started|quote|help|access|now)/i,
  /start (now|free|today|here)/i,
  /sign up/i,
  /subscribe/i,
  /contact us/i,
  /book (a |now|today|call|demo|meeting)/i,
  /schedule/i,
  /request (a |quote|demo|call)/i,
  /free (trial|quote|consultation|estimate)/i,
  /buy now/i,
  /add to cart/i,
  /shop now/i,
  /learn more/i,
  /download/i,
  /try (it |now|free)/i,
  /call (us|now|today)/i,
  /chat (with us|now)/i
];
var TESTIMONIAL_SELECTORS = [
  ".testimonial",
  ".testimonials",
  '[class*="testimonial"]',
  ".review",
  ".reviews",
  '[class*="review"]',
  ".quote",
  '[class*="customer-quote"]',
  ".client-feedback",
  '[class*="feedback"]',
  'blockquote[class*="testimonial"]'
];
var CLIENT_LOGO_SELECTORS = [
  ".client-logos",
  ".clients",
  '[class*="client-logo"]',
  ".partner-logos",
  ".partners",
  '[class*="partner"]',
  ".trusted-by",
  '[class*="trusted"]',
  ".as-seen-in",
  '[class*="featured-in"]',
  ".logo-wall",
  ".logo-carousel"
];
function analyzeAboveFold(html) {
  const $ = cheerio42.load(html);
  const header = $("header").first();
  const hero = $('.hero, [class*="hero"], .banner, [class*="banner"], .jumbotron, [class*="landing"]').first();
  const firstSection = $("main > section, main > div, body > section").first();
  const headerHtml = header.html() || "";
  const heroOrSectionHtml = hero.length ? hero.html() || "" : firstSection.html() || "";
  const aboveFoldHtml = headerHtml + heroOrSectionHtml;
  const $above = cheerio42.load(aboveFoldHtml);
  const h1 = $("h1").first();
  const hasHeadline = h1.length > 0;
  const headlineText = h1.text().trim() || null;
  const ctaTexts = [];
  $("a, button").each((_, el) => {
    const text = $(el).text().trim();
    for (const pattern of CTA_PATTERNS) {
      if (pattern.test(text)) {
        ctaTexts.push(text);
        break;
      }
    }
  });
  const forms = $("form");
  let formType = null;
  if (forms.length > 0) {
    const formHtml = forms.first().html()?.toLowerCase() || "";
    if (formHtml.includes("calculator") || formHtml.includes("estimate")) {
      formType = "calculator";
    } else if (formHtml.includes("search") || formHtml.includes("query")) {
      formType = "search";
    } else if (formHtml.includes("email") && formHtml.includes("subscribe")) {
      formType = "signup";
    } else if (formHtml.includes("phone") || formHtml.includes("contact") || formHtml.includes("message")) {
      formType = "contact";
    } else {
      formType = "other";
    }
  }
  const hasSocialProofAbove = $('[class*="testimonial"], [class*="review"], [class*="rating"], [class*="trust"]').length > 0;
  const socialProofTypes = [];
  if ($('[class*="rating"], [class*="star"]').length > 0)
    socialProofTypes.push("ratings");
  if ($('[class*="testimonial"]').length > 0)
    socialProofTypes.push("testimonials");
  if ($('[class*="client-logo"], [class*="trusted"]').length > 0)
    socialProofTypes.push("client-logos");
  const hasHeroImage = hero.find("img").length > 0 || $("header img").length > 0;
  const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  let score = 0;
  if (hasHeadline)
    score += 25;
  if (ctaTexts.length > 0)
    score += 25;
  if (forms.length > 0)
    score += 20;
  if (hasSocialProofAbove)
    score += 15;
  if (hasHeroImage || hasVideo)
    score += 15;
  return {
    hasHeadline,
    headlineText,
    hasCTA: ctaTexts.length > 0,
    ctaCount: ctaTexts.length,
    ctaTexts: [...new Set(ctaTexts)].slice(0, 5),
    hasForm: forms.length > 0,
    formType,
    hasSocialProof: hasSocialProofAbove,
    socialProofTypes,
    hasHeroImage,
    hasVideo,
    estimatedAboveFoldScore: score
  };
}
function analyzeSocialProof(html) {
  const $ = cheerio42.load(html);
  const text = $("body").text().toLowerCase();
  let testimonialCount = 0;
  for (const selector of TESTIMONIAL_SELECTORS) {
    testimonialCount += $(selector).length;
  }
  const hasTestimonials = testimonialCount > 0;
  const reviewElements = $('[class*="review"], [itemtype*="Review"]');
  const hasReviews = reviewElements.length > 0;
  const reviewCount = reviewElements.length;
  const ratingElements = $('[class*="rating"], [class*="star"], [itemprop="ratingValue"]');
  const hasRatings = ratingElements.length > 0;
  let averageRating = null;
  const ratingValue = $('[itemprop="ratingValue"]').first().text();
  if (ratingValue) {
    const parsed = parseFloat(ratingValue);
    if (!isNaN(parsed))
      averageRating = parsed;
  }
  let clientLogoCount = 0;
  for (const selector of CLIENT_LOGO_SELECTORS) {
    const container = $(selector);
    if (container.length > 0) {
      clientLogoCount = container.find("img").length || 1;
      break;
    }
  }
  const hasClientLogos = clientLogoCount > 0;
  const hasCaseStudies = $('a[href*="case-stud"], [class*="case-study"]').length > 0 || text.includes("case study") || text.includes("case studies");
  const hasAwards = $('[class*="award"]').length > 0 || text.includes("award-winning") || text.includes("winner");
  const hasCertifications = $('[class*="certif"], [class*="accredit"]').length > 0 || /certified|accredited|licensed/i.test(text);
  const hasTrustBadges = $('[class*="trust-badge"], [class*="security-badge"], [class*="guarantee"]').length > 0;
  const statisticsFound = [];
  const statPatterns = [
    /(\d+(?:,\d{3})*\+?)\s*(customers?|clients?|users?|businesses?)/gi,
    /(\d+(?:,\d{3})*\+?)\s*(years?)\s*(of experience|in business)/gi,
    /(\d+)%\s*(satisfaction|success|increase|growth)/gi,
    /\$(\d+(?:,\d{3})*(?:\.\d+)?[MBK]?)\s*(saved|recovered|generated)/gi
  ];
  for (const pattern of statPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      statisticsFound.push(...matches.slice(0, 3));
    }
  }
  const hasStatistics = statisticsFound.length > 0;
  let score = 0;
  if (hasTestimonials)
    score += 20;
  if (hasReviews)
    score += 15;
  if (hasRatings)
    score += 10;
  if (hasClientLogos)
    score += 15;
  if (hasCaseStudies)
    score += 15;
  if (hasAwards || hasCertifications)
    score += 10;
  if (hasTrustBadges)
    score += 5;
  if (hasStatistics)
    score += 10;
  return {
    hasTestimonials,
    testimonialCount,
    hasReviews,
    reviewCount,
    hasRatings,
    averageRating,
    hasClientLogos,
    clientLogoCount,
    hasCaseStudies,
    hasAwards,
    hasCertifications,
    hasTrustBadges,
    hasStatistics,
    statisticsFound: [...new Set(statisticsFound)].slice(0, 5),
    socialProofScore: Math.min(100, score)
  };
}
function detectEngagementTriggers(html) {
  const $ = cheerio42.load(html);
  const htmlLower = html.toLowerCase();
  const calculatorTypes = [];
  const calcPatterns = [
    { pattern: /calculator/i, type: "calculator" },
    { pattern: /estimator/i, type: "estimator" },
    { pattern: /roi.*calculator|calculator.*roi/i, type: "ROI calculator" },
    { pattern: /price.*calculator|cost.*calculator/i, type: "price calculator" },
    { pattern: /mortgage.*calculator/i, type: "mortgage calculator" },
    { pattern: /loan.*calculator/i, type: "loan calculator" },
    { pattern: /bmi.*calculator/i, type: "BMI calculator" },
    { pattern: /quote.*tool|instant.*quote/i, type: "quote tool" }
  ];
  for (const { pattern, type } of calcPatterns) {
    if (pattern.test(htmlLower)) {
      calculatorTypes.push(type);
    }
  }
  const hasCalculator = calculatorTypes.length > 0;
  const hasQuiz = $('[class*="quiz"], [id*="quiz"]').length > 0 || /quiz|assessment|self-test/i.test(htmlLower);
  const interactiveTypes = [];
  if ($('input[type="range"], .slider, [class*="slider"]').length > 0)
    interactiveTypes.push("slider");
  if ($('[class*="configurator"], [class*="customizer"]').length > 0)
    interactiveTypes.push("configurator");
  if ($('canvas, [class*="chart"], [class*="graph"]').length > 0)
    interactiveTypes.push("charts/graphs");
  if ($('[class*="map"], #map, .map').length > 0)
    interactiveTypes.push("interactive map");
  if ($('[class*="filter"], [class*="sort"]').length > 0)
    interactiveTypes.push("filters");
  const hasInteractiveElement = interactiveTypes.length > 0;
  const videos = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"], [class*="video-embed"]');
  const hasEmbeddedVideo = videos.length > 0;
  const videoCount = videos.length;
  const hasExpandableContent = $('details, [class*="accordion"], [class*="collapsible"], [class*="expandable"]').length > 0;
  const hasTabsOrAccordion = $('[role="tablist"], [class*="tabs"], [class*="tab-content"]').length > 0;
  const hasChatWidget = $('[class*="chat-widget"], [class*="live-chat"], [id*="chat"]').length > 0 || /intercom|drift|crisp|zendesk|livechat|tidio/i.test(html);
  let score = 0;
  if (hasCalculator)
    score += 25;
  if (hasQuiz)
    score += 20;
  if (hasInteractiveElement)
    score += 15;
  if (hasEmbeddedVideo)
    score += 20;
  if (hasExpandableContent || hasTabsOrAccordion)
    score += 10;
  if (hasChatWidget)
    score += 10;
  return {
    hasCalculator,
    calculatorTypes,
    hasQuiz,
    hasInteractiveElement,
    interactiveTypes,
    hasEmbeddedVideo,
    videoCount,
    hasExpandableContent,
    hasTabsOrAccordion,
    hasChatWidget,
    engagementScore: Math.min(100, score)
  };
}
function detectPageType(html, url) {
  const $ = cheerio42.load(html);
  const text = $("body").text().toLowerCase();
  const urlLower = url.toLowerCase();
  let commercialSignals = 0;
  let informationalSignals = 0;
  if (/\/product|\/service|\/pricing|\/buy|\/shop|\/contact/i.test(urlLower))
    commercialSignals += 2;
  if (/\/blog|\/article|\/guide|\/how-to|\/what-is|\/learn/i.test(urlLower))
    informationalSignals += 2;
  if (/buy now|add to cart|get quote|contact us|free consultation/i.test(text))
    commercialSignals += 2;
  if ($("form").length > 0)
    commercialSignals += 1;
  if (/pricing|price|\$\d+/i.test(text))
    commercialSignals += 1;
  if (/table of contents|in this article|what you.ll learn/i.test(text))
    informationalSignals += 2;
  if ($("article").length > 0)
    informationalSignals += 1;
  if (text.length > 3e3)
    informationalSignals += 1;
  if (commercialSignals > informationalSignals + 1)
    return "commercial";
  if (informationalSignals > commercialSignals + 1)
    return "informational";
  if (commercialSignals > 0 && informationalSignals > 0)
    return "mixed";
  return "unknown";
}
function analyzeConversionElements(html, url) {
  const issues = [];
  const aboveFold = analyzeAboveFold(html);
  const socialProof = analyzeSocialProof(html);
  const engagementTriggers = detectEngagementTriggers(html);
  const pageType = detectPageType(html, url);
  const recommendations = [];
  if (pageType === "commercial" || pageType === "mixed") {
    if (!aboveFold.hasCTA) {
      issues.push({
        code: "COMMERCIAL_NO_CTA",
        severity: "warning",
        category: "content",
        title: "Commercial page without clear CTA",
        description: "This appears to be a commercial page but has no clear call-to-action.",
        impact: "Without a CTA, visitors have no clear next step. 80% of users only see above-the-fold content.",
        howToFix: 'Add a prominent CTA button above the fold (e.g., "Get Free Quote", "Contact Us", "Start Free Trial").',
        affectedUrls: [url],
        details: { pageType }
      });
      recommendations.push("Add prominent CTA button above the fold");
    }
    if (!aboveFold.hasForm && pageType === "commercial") {
      issues.push({
        code: "COMMERCIAL_NO_FORM",
        severity: "notice",
        category: "content",
        title: "Commercial page without lead capture form",
        description: "This commercial page lacks a visible form for lead capture.",
        impact: "Forms above the fold significantly increase conversion rates.",
        howToFix: "Add a contact form, quote request, or signup form visible without scrolling.",
        affectedUrls: [url]
      });
      recommendations.push("Add lead capture form above the fold");
    }
    if (!socialProof.hasTestimonials && !socialProof.hasReviews) {
      issues.push({
        code: "NO_SOCIAL_PROOF",
        severity: "warning",
        category: "content",
        title: "No testimonials or reviews found",
        description: "Page lacks testimonials, reviews, or other social proof.",
        impact: "97% of consumers look at reviews. Testimonials can increase conversions by 34%.",
        howToFix: "Add customer testimonials, reviews, ratings, or case studies to build trust.",
        affectedUrls: [url],
        details: { socialProofScore: socialProof.socialProofScore }
      });
      recommendations.push("Add customer testimonials or reviews");
    }
    if (!socialProof.hasClientLogos && pageType === "commercial") {
      recommendations.push('Add client/partner logos for credibility ("Trusted by...")');
    }
  }
  if (!engagementTriggers.hasEmbeddedVideo && !engagementTriggers.hasInteractiveElement) {
    issues.push({
      code: "NO_ENGAGEMENT_TRIGGERS",
      severity: "notice",
      category: "content",
      title: "No engagement triggers found",
      description: "Page lacks interactive elements, videos, or calculators.",
      impact: "Interactive content increases dwell time, a user signal that influences rankings.",
      howToFix: "Add video content, calculators, interactive tools, or expandable sections.",
      affectedUrls: [url],
      details: { engagementScore: engagementTriggers.engagementScore }
    });
    recommendations.push("Add video or interactive elements to increase engagement");
  }
  if (pageType === "commercial" && !engagementTriggers.hasCalculator) {
    const isServicePage = /service|pricing|quote|cost|estimate/i.test(url + html);
    if (isServicePage) {
      recommendations.push("Consider adding a calculator or instant quote tool");
    }
  }
  if (!aboveFold.hasHeadline) {
    issues.push({
      code: "NO_VISIBLE_HEADLINE",
      severity: "warning",
      category: "on-page",
      title: "No H1 headline visible",
      description: "Page appears to lack a visible H1 headline above the fold.",
      impact: "80% of visitors only read headlines. A strong headline is critical for engagement.",
      howToFix: "Add a clear, compelling H1 headline that communicates the page value proposition.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      aboveFold,
      socialProof,
      engagementTriggers,
      pageType,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/keyword-placement.ts
import * as cheerio43 from "https://esm.sh/cheerio@1.0.0";
function inferTargetKeywords(html, url) {
  const $ = cheerio43.load(html);
  const keywords = [];
  const title = $("title").text().trim();
  if (title) {
    const cleanTitle = title.split(/[|\-–—]/)[0]?.trim() || title;
    if (cleanTitle.length > 3 && cleanTitle.length < 100) {
      keywords.push(cleanTitle.toLowerCase());
    }
  }
  const h1 = $("h1").first().text().trim();
  if (h1 && h1.length > 3 && h1.length < 100) {
    keywords.push(h1.toLowerCase());
  }
  try {
    const urlPath = new URL(url).pathname;
    const slug = urlPath.split("/").filter((p) => p.length > 0).pop();
    if (slug) {
      const cleanSlug = slug.replace(/[-_]/g, " ").replace(/\.(html?|php|aspx?)$/i, "");
      if (cleanSlug.length > 3) {
        keywords.push(cleanSlug.toLowerCase());
      }
    }
  } catch {
  }
  const wordCounts = /* @__PURE__ */ new Map();
  for (const kw of keywords) {
    const words = kw.split(/\s+/).filter((w) => w.length > 2);
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  return [...new Set(keywords)].slice(0, 3);
}
function analyzeUrlKeyword(url, keywords) {
  try {
    const parsedUrl = new URL(url);
    const urlSlug = parsedUrl.pathname.toLowerCase();
    const slugWords = urlSlug.replace(/[-_/]/g, " ").trim();
    let containsKeyword = false;
    let keywordInUrl = null;
    for (const keyword of keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      const significantWords = kwWords.filter((w) => w.length > 2);
      const matchCount = significantWords.filter((w) => slugWords.includes(w)).length;
      if (matchCount >= Math.ceil(significantWords.length * 0.7)) {
        containsKeyword = true;
        keywordInUrl = keyword;
        break;
      }
    }
    const isCleanUrl = !urlSlug.includes("?") && !urlSlug.includes("=") && !/\d{5,}/.test(urlSlug) && // No long ID numbers
    urlSlug.length < 100;
    const hasDynamicParams = parsedUrl.search.length > 0;
    return {
      containsKeyword,
      keywordInUrl,
      urlSlug,
      isCleanUrl,
      hasDynamicParams
    };
  } catch {
    return {
      containsKeyword: false,
      keywordInUrl: null,
      urlSlug: "",
      isCleanUrl: false,
      hasDynamicParams: false
    };
  }
}
function analyzeTitleKeyword(html, keywords) {
  const $ = cheerio43.load(html);
  const title = $("title").text().trim().toLowerCase();
  if (!title) {
    return {
      hasExactMatch: false,
      hasPartialMatch: false,
      titleMatchScore: 0,
      position: "none"
    };
  }
  let hasExactMatch = false;
  let hasPartialMatch = false;
  let position = "none";
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    if (title.includes(kwLower)) {
      hasExactMatch = true;
      const index = title.indexOf(kwLower);
      if (index === 0 || index < 5) {
        position = "start";
      } else if (index > title.length - kwLower.length - 10) {
        position = "end";
      } else {
        position = "middle";
      }
      break;
    }
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => title.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.6)) {
      hasPartialMatch = true;
      position = "middle";
    }
  }
  let titleMatchScore = 0;
  if (hasExactMatch) {
    titleMatchScore = position === "start" ? 100 : position === "middle" ? 80 : 60;
  } else if (hasPartialMatch) {
    titleMatchScore = 40;
  }
  return {
    hasExactMatch,
    hasPartialMatch,
    titleMatchScore,
    position
  };
}
function analyzeH1Keyword(html, keywords) {
  const $ = cheerio43.load(html);
  const h1 = $("h1").first().text().trim();
  const h1Lower = h1.toLowerCase();
  let hasExactMatch = false;
  let hasPartialMatch = false;
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    if (h1Lower.includes(kwLower)) {
      hasExactMatch = true;
      break;
    }
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => h1Lower.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.6)) {
      hasPartialMatch = true;
    }
  }
  return {
    hasExactMatch,
    hasPartialMatch,
    h1Text: h1 || null
  };
}
function analyzeFirstParagraph(html, keywords) {
  const $ = cheerio43.load(html);
  const paragraphs = $("main p, article p, .content p, #content p, body > div p").toArray();
  let firstParagraph = "";
  for (const p of paragraphs) {
    const text = $(p).text().trim();
    if (text.length > 50) {
      firstParagraph = text;
      break;
    }
  }
  if (!firstParagraph) {
    firstParagraph = $("p").first().text().trim();
  }
  const firstParagraphLower = firstParagraph.toLowerCase();
  const words = firstParagraphLower.split(/\s+/);
  let hasKeyword = false;
  let keywordPosition = null;
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    const kwWords = kwLower.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (kwWords.some((kw) => words[i].includes(kw))) {
        hasKeyword = true;
        keywordPosition = i;
        break;
      }
    }
    if (hasKeyword)
      break;
  }
  return {
    hasKeyword,
    keywordPosition,
    firstParagraphPreview: firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? "..." : ""),
    isWithinFirst100Words: hasKeyword && keywordPosition !== null && keywordPosition < 100
  };
}
function analyzeMetaDescription(html, keywords) {
  const $ = cheerio43.load(html);
  const metaDesc = $('meta[name="description"]').attr("content")?.trim().toLowerCase() || "";
  if (!metaDesc) {
    return { hasKeyword: false, position: "none" };
  }
  let hasKeyword = false;
  let position = "none";
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => metaDesc.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.5)) {
      hasKeyword = true;
      const firstMatch = kwWords.find((w) => metaDesc.includes(w));
      if (firstMatch) {
        const index = metaDesc.indexOf(firstMatch);
        if (index < 30) {
          position = "start";
        } else if (index > metaDesc.length - 50) {
          position = "end";
        } else {
          position = "middle";
        }
      }
      break;
    }
  }
  return { hasKeyword, position };
}
function analyzeKeywordPlacement(html, url) {
  const issues = [];
  const detectedKeywords = inferTargetKeywords(html, url);
  const urlAnalysis = analyzeUrlKeyword(url, detectedKeywords);
  const titleAnalysis = analyzeTitleKeyword(html, detectedKeywords);
  const h1Analysis = analyzeH1Keyword(html, detectedKeywords);
  const firstParagraphAnalysis = analyzeFirstParagraph(html, detectedKeywords);
  const metaDescriptionAnalysis = analyzeMetaDescription(html, detectedKeywords);
  let overallPlacementScore = 0;
  if (urlAnalysis.containsKeyword)
    overallPlacementScore += 20;
  if (titleAnalysis.hasExactMatch)
    overallPlacementScore += 25;
  else if (titleAnalysis.hasPartialMatch)
    overallPlacementScore += 10;
  if (h1Analysis.hasExactMatch)
    overallPlacementScore += 20;
  else if (h1Analysis.hasPartialMatch)
    overallPlacementScore += 10;
  if (firstParagraphAnalysis.isWithinFirst100Words)
    overallPlacementScore += 20;
  else if (firstParagraphAnalysis.hasKeyword)
    overallPlacementScore += 10;
  if (metaDescriptionAnalysis.hasKeyword)
    overallPlacementScore += 15;
  if (!urlAnalysis.containsKeyword && urlAnalysis.urlSlug.length > 1) {
    issues.push({
      code: "URL_MISSING_KEYWORD",
      severity: "warning",
      category: "on-page",
      title: "URL does not contain target keyword",
      description: `The URL slug "${urlAnalysis.urlSlug}" doesn't include the apparent target keyword.`,
      impact: "URLs with keywords help Google understand page relevance. This is a ranking signal.",
      howToFix: "Include the primary keyword phrase in the URL (e.g., /keyword-phrase/ instead of /page123/).",
      affectedUrls: [url],
      details: {
        currentSlug: urlAnalysis.urlSlug,
        inferredKeywords: detectedKeywords
      }
    });
  }
  if (urlAnalysis.hasDynamicParams) {
    issues.push({
      code: "URL_HAS_PARAMS",
      severity: "notice",
      category: "on-page",
      title: "URL contains query parameters",
      description: "The URL has query parameters which create a less clean URL structure.",
      impact: "Clean, keyword-rich URLs are preferred by search engines and users.",
      howToFix: "Use URL rewriting to create clean, parameter-free URLs where possible.",
      affectedUrls: [url]
    });
  }
  if (!titleAnalysis.hasExactMatch && detectedKeywords.length > 0) {
    issues.push({
      code: "TITLE_KEYWORD_MISMATCH",
      severity: "warning",
      category: "on-page",
      title: "Title tag missing exact keyword match",
      description: "The title tag doesn't contain the exact target keyword phrase.",
      impact: `Google's leaked documents reveal a "title match score" that measures keyword alignment.`,
      howToFix: "Include the exact target keyword phrase in the title, preferably near the beginning.",
      affectedUrls: [url],
      details: {
        titleMatchScore: titleAnalysis.titleMatchScore,
        position: titleAnalysis.position
      }
    });
  }
  if (!firstParagraphAnalysis.hasKeyword) {
    issues.push({
      code: "FIRST_PARA_NO_KEYWORD",
      severity: "warning",
      category: "on-page",
      title: "Primary keyword not in first paragraph",
      description: "The target keyword doesn't appear in the opening paragraph.",
      impact: "Including keywords early in content signals relevance to search engines.",
      howToFix: "Add the primary keyword naturally within the first 100 words of your content.",
      affectedUrls: [url],
      details: {
        preview: firstParagraphAnalysis.firstParagraphPreview
      }
    });
  } else if (!firstParagraphAnalysis.isWithinFirst100Words) {
    issues.push({
      code: "KEYWORD_TOO_FAR",
      severity: "notice",
      category: "on-page",
      title: "Keyword appears late in first paragraph",
      description: `Keyword found at word position ${firstParagraphAnalysis.keywordPosition}, ideally should be in first 100 words.`,
      impact: "Earlier keyword placement may slightly improve relevance signals.",
      howToFix: "Move the keyword mention closer to the beginning of your content.",
      affectedUrls: [url]
    });
  }
  if (!h1Analysis.hasExactMatch && !h1Analysis.hasPartialMatch && h1Analysis.h1Text) {
    issues.push({
      code: "H1_MISSING_KEYWORD",
      severity: "notice",
      category: "on-page",
      title: "H1 doesn't contain target keyword",
      description: `The H1 "${h1Analysis.h1Text}" doesn't include the target keyword.`,
      impact: "H1 is a strong on-page signal for topic relevance.",
      howToFix: "Include the primary keyword in your H1 headline.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      detectedKeywords,
      urlAnalysis,
      titleAnalysis,
      h1Analysis,
      firstParagraphAnalysis,
      metaDescriptionAnalysis,
      overallPlacementScore
    }
  };
}

// ../agent-runtime-premium/src/checks/topical-clusters.ts
import * as cheerio44 from "https://esm.sh/cheerio@1.0.0";
function getLinkContext($, link) {
  const parents = link.parents().toArray();
  for (const parent of parents) {
    const tagName = parent.tagName?.toLowerCase();
    const className = ($(parent).attr("class") || "").toLowerCase();
    const id = ($(parent).attr("id") || "").toLowerCase();
    if (tagName === "nav" || className.includes("nav") || className.includes("menu") || id.includes("nav") || id.includes("menu")) {
      return "navigation";
    }
    if (tagName === "footer" || className.includes("footer") || id.includes("footer")) {
      return "footer";
    }
    if (tagName === "aside" || className.includes("sidebar") || className.includes("widget") || id.includes("sidebar")) {
      return "sidebar";
    }
    if (tagName === "main" || tagName === "article" || className.includes("content") || className.includes("post") || className.includes("entry") || id.includes("content")) {
      return "content";
    }
  }
  return "content";
}
function getLinkDestination(href, baseUrl) {
  if (!href || href.startsWith("#")) {
    return "anchor";
  }
  try {
    const linkUrl = new URL(href, baseUrl);
    const currentUrl = new URL(baseUrl);
    if (linkUrl.hostname === currentUrl.hostname) {
      return "internal";
    }
    return "external";
  } catch {
    if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
      return "internal";
    }
    return "external";
  }
}
function isDoFollow(rel) {
  if (!rel)
    return true;
  const relValues = rel.toLowerCase().split(/\s+/);
  return !relValues.includes("nofollow") && !relValues.includes("sponsored") && !relValues.includes("ugc");
}
function extractLinks(html, url) {
  const $ = cheerio44.load(html);
  const internalLinks = [];
  const externalLinks = [];
  const anchorLinks = [];
  $("a[href]").each((_, element) => {
    const $link = $(element);
    const href = $link.attr("href") || "";
    const anchorText = $link.text().trim();
    const rel = $link.attr("rel");
    const destination = getLinkDestination(href, url);
    const context = getLinkContext($, $link);
    const doFollow = isDoFollow(rel);
    const link = {
      href,
      anchorText,
      context,
      isDoFollow: doFollow,
      destination
    };
    if (destination === "internal") {
      internalLinks.push(link);
    } else if (destination === "external") {
      externalLinks.push(link);
    } else {
      anchorLinks.push(link);
    }
  });
  return { internalLinks, externalLinks, anchorLinks };
}
function detectClusterSignals($) {
  const hasBreadcrumbs = $(
    '[class*="breadcrumb"], [id*="breadcrumb"], nav[aria-label*="breadcrumb"], [itemtype*="BreadcrumbList"], .breadcrumbs'
  ).length > 0;
  const hasRelatedPosts = $(
    '[class*="related"], [class*="similar"], [class*="recommended"], [id*="related"], h2:contains("Related"), h3:contains("Related"), h2:contains("You might also"), h2:contains("Similar")'
  ).length > 0;
  const hasCategoryLinks = $(
    '[class*="categor"], [class*="tag-"], [rel="tag"], a[href*="/category/"], a[href*="/tag/"], a[href*="/topic/"]'
  ).length > 0;
  return {
    hasHubStructure: false,
    // Calculated later
    hasSpokeLinks: false,
    // Calculated later
    hasBreadcrumbs,
    hasRelatedPosts,
    hasCategoryLinks,
    internalToExternalRatio: 0
    // Calculated later
  };
}
function calculateOrphanRisk(contentLinks, uniqueDestinations, clusterSignals) {
  let score = 0;
  if (contentLinks >= 5)
    score += 3;
  else if (contentLinks >= 2)
    score += 2;
  else if (contentLinks >= 1)
    score += 1;
  if (uniqueDestinations >= 5)
    score += 2;
  else if (uniqueDestinations >= 2)
    score += 1;
  if (clusterSignals.hasBreadcrumbs)
    score += 1;
  if (clusterSignals.hasRelatedPosts)
    score += 2;
  if (clusterSignals.hasCategoryLinks)
    score += 1;
  if (score >= 6)
    return "low";
  if (score >= 3)
    return "medium";
  return "high";
}
function analyzeTopicalClusters(html, url) {
  const $ = cheerio44.load(html);
  const issues = [];
  const { internalLinks, externalLinks, anchorLinks } = extractLinks(html, url);
  const contentInternalLinks = internalLinks.filter((l) => l.context === "content");
  const contentExternalLinks = externalLinks.filter((l) => l.context === "content");
  const uniqueInternalHrefs = new Set(
    internalLinks.map((l) => {
      try {
        return new URL(l.href, url).pathname;
      } catch {
        return l.href;
      }
    })
  );
  const anchorTexts = internalLinks.filter((l) => l.anchorText.length > 0);
  const avgAnchorTextLength = anchorTexts.length > 0 ? anchorTexts.reduce((sum, l) => sum + l.anchorText.length, 0) / anchorTexts.length : 0;
  const hasExactMatchAnchors = internalLinks.some((l) => {
    const text = l.anchorText.toLowerCase();
    return text.split(" ").length >= 3 && l.context === "content";
  });
  const clusterSignals = detectClusterSignals($);
  const totalContentLinks = contentInternalLinks.length + contentExternalLinks.length;
  clusterSignals.internalToExternalRatio = totalContentLinks > 0 ? contentInternalLinks.length / totalContentLinks : 1;
  clusterSignals.hasHubStructure = contentInternalLinks.length >= 5;
  clusterSignals.hasSpokeLinks = clusterSignals.hasRelatedPosts || clusterSignals.hasCategoryLinks;
  const orphanPageRisk = calculateOrphanRisk(
    contentInternalLinks.length,
    uniqueInternalHrefs.size,
    clusterSignals
  );
  const recommendations = [];
  if (contentInternalLinks.length < 3) {
    recommendations.push("Add more contextual internal links within your content");
  }
  if (!clusterSignals.hasBreadcrumbs) {
    recommendations.push("Add breadcrumb navigation for better site structure");
  }
  if (!clusterSignals.hasRelatedPosts) {
    recommendations.push('Add a "Related Posts" or "Similar Articles" section');
  }
  if (!clusterSignals.hasCategoryLinks) {
    recommendations.push("Link to category or topic pages to strengthen clusters");
  }
  if (clusterSignals.internalToExternalRatio < 0.5) {
    recommendations.push("Balance your link profile - add more internal links");
  }
  if (contentInternalLinks.length === 0) {
    issues.push({
      code: "NO_CONTENT_INTERNAL_LINKS",
      severity: "warning",
      category: "on-page",
      title: "No internal links in page content",
      description: "The main content area has no links to other pages on your site.",
      impact: "Internal links help search engines discover pages and understand site structure. They also pass PageRank.",
      howToFix: "Add 3-5 contextual internal links within your content to related pages.",
      affectedUrls: [url]
    });
  } else if (contentInternalLinks.length < 3) {
    issues.push({
      code: "FEW_CONTENT_INTERNAL_LINKS",
      severity: "notice",
      category: "on-page",
      title: "Few internal links in content",
      description: `Only ${contentInternalLinks.length} internal link(s) in the main content area.`,
      impact: "More contextual internal links strengthen topical clusters and help users discover content.",
      howToFix: "Add relevant internal links where they naturally fit in your content.",
      affectedUrls: [url],
      details: {
        currentCount: contentInternalLinks.length,
        recommended: "3-5 minimum"
      }
    });
  }
  if (!clusterSignals.hasBreadcrumbs) {
    issues.push({
      code: "NO_BREADCRUMBS",
      severity: "notice",
      category: "on-page",
      title: "No breadcrumb navigation detected",
      description: "Page lacks breadcrumb navigation for hierarchical context.",
      impact: "Breadcrumbs improve UX, help search engines understand site structure, and can appear in SERPs.",
      howToFix: "Add breadcrumb navigation with Schema.org BreadcrumbList markup.",
      affectedUrls: [url]
    });
  }
  if (!clusterSignals.hasRelatedPosts && !clusterSignals.hasCategoryLinks) {
    issues.push({
      code: "NO_RELATED_CONTENT",
      severity: "notice",
      category: "on-page",
      title: "No related content section",
      description: 'Page has no "Related Posts" or similar content discovery section.',
      impact: "Related content sections reduce bounce rate, increase pageviews, and strengthen topic clusters.",
      howToFix: "Add a section linking to related articles, products, or category pages.",
      affectedUrls: [url]
    });
  }
  if (orphanPageRisk === "high") {
    issues.push({
      code: "HIGH_ORPHAN_RISK",
      severity: "warning",
      category: "on-page",
      title: "Page may be an orphan page",
      description: "This page has very few internal links, making it hard to discover.",
      impact: "Orphan pages are difficult for search engines to find and may not get indexed.",
      howToFix: "Ensure this page is linked from navigation, category pages, or related content.",
      affectedUrls: [url],
      details: {
        contentLinks: contentInternalLinks.length,
        uniqueDestinations: uniqueInternalHrefs.size
      }
    });
  }
  if (contentExternalLinks.length > contentInternalLinks.length * 2 && contentExternalLinks.length >= 5) {
    issues.push({
      code: "EXTERNAL_LINK_HEAVY",
      severity: "notice",
      category: "on-page",
      title: "More external links than internal links",
      description: `${contentExternalLinks.length} external links vs ${contentInternalLinks.length} internal links in content.`,
      impact: "While citing sources is good, heavy external linking may dilute PageRank passed to your own pages.",
      howToFix: "Balance external citations with internal links to your own related content.",
      affectedUrls: [url],
      details: {
        externalLinks: contentExternalLinks.length,
        internalLinks: contentInternalLinks.length,
        ratio: clusterSignals.internalToExternalRatio.toFixed(2)
      }
    });
  }
  return {
    issues,
    data: {
      currentUrl: url,
      internalLinks,
      externalLinks,
      anchorLinks,
      linkMetrics: {
        totalLinks: internalLinks.length + externalLinks.length + anchorLinks.length,
        internalLinkCount: internalLinks.length,
        externalLinkCount: externalLinks.length,
        contentLinks: contentInternalLinks.length,
        uniqueInternalDestinations: uniqueInternalHrefs.size,
        avgAnchorTextLength: Math.round(avgAnchorTextLength),
        hasExactMatchAnchors
      },
      clusterSignals,
      orphanPageRisk,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/platform-presence.ts
import * as cheerio45 from "https://esm.sh/cheerio@1.0.0";
var PLATFORM_PATTERNS = [
  {
    name: "YouTube",
    urlPatterns: [/youtube\.com/, /youtu\.be/],
    embedPatterns: [/youtube\.com\/embed/, /youtube-nocookie\.com/],
    priority: "high"
  },
  {
    name: "TikTok",
    urlPatterns: [/tiktok\.com/],
    embedPatterns: [/tiktok\.com\/embed/],
    priority: "high"
  },
  {
    name: "Twitter/X",
    urlPatterns: [/twitter\.com/, /x\.com/],
    embedPatterns: [/platform\.twitter\.com/],
    priority: "high"
  },
  {
    name: "LinkedIn",
    urlPatterns: [/linkedin\.com/],
    priority: "high"
  },
  {
    name: "Reddit",
    urlPatterns: [/reddit\.com/, /redd\.it/],
    priority: "high"
  },
  {
    name: "Facebook",
    urlPatterns: [/facebook\.com/, /fb\.com/, /fb\.me/],
    embedPatterns: [/facebook\.com\/plugins/],
    priority: "medium"
  },
  {
    name: "Instagram",
    urlPatterns: [/instagram\.com/, /instagr\.am/],
    embedPatterns: [/instagram\.com\/embed/],
    priority: "medium"
  },
  {
    name: "Pinterest",
    urlPatterns: [/pinterest\.com/, /pin\.it/],
    priority: "medium"
  },
  {
    name: "GitHub",
    urlPatterns: [/github\.com/],
    priority: "medium"
  },
  {
    name: "Medium",
    urlPatterns: [/medium\.com/],
    priority: "low"
  },
  {
    name: "Spotify",
    urlPatterns: [/spotify\.com/, /open\.spotify\.com/],
    embedPatterns: [/open\.spotify\.com\/embed/],
    priority: "medium"
  },
  {
    name: "Apple Podcasts",
    urlPatterns: [/podcasts\.apple\.com/],
    priority: "medium"
  },
  {
    name: "Discord",
    urlPatterns: [/discord\.gg/, /discord\.com/],
    priority: "low"
  },
  {
    name: "Twitch",
    urlPatterns: [/twitch\.tv/],
    embedPatterns: [/player\.twitch\.tv/],
    priority: "low"
  },
  {
    name: "Vimeo",
    urlPatterns: [/vimeo\.com/],
    embedPatterns: [/player\.vimeo\.com/],
    priority: "low"
  },
  {
    name: "ProductHunt",
    urlPatterns: [/producthunt\.com/],
    priority: "medium"
  },
  {
    name: "Substack",
    urlPatterns: [/substack\.com/],
    priority: "low"
  },
  {
    name: "Amazon",
    urlPatterns: [/amazon\.com/, /amzn\.to/],
    priority: "medium"
  }
];
function getLinkLocation($, element) {
  const parents = element.parents().toArray();
  for (const parent of parents) {
    const tagName = parent.tagName?.toLowerCase();
    const className = ($(parent).attr("class") || "").toLowerCase();
    if (tagName === "header" || className.includes("header"))
      return "header";
    if (tagName === "footer" || className.includes("footer"))
      return "footer";
    if (tagName === "aside" || className.includes("sidebar"))
      return "sidebar";
    if (tagName === "main" || tagName === "article" || className.includes("content"))
      return "content";
  }
  return "content";
}
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  for (const platform of PLATFORM_PATTERNS) {
    if (platform.urlPatterns.some((p) => p.test(urlLower))) {
      return platform.name;
    }
  }
  return null;
}
function getLinkType(url, platform) {
  const urlLower = url.toLowerCase();
  const profilePatterns = [
    /youtube\.com\/@/,
    /youtube\.com\/c\//,
    /youtube\.com\/channel\//,
    /twitter\.com\/[^/]+$/,
    /x\.com\/[^/]+$/,
    /linkedin\.com\/company\//,
    /linkedin\.com\/in\//,
    /instagram\.com\/[^/]+\/?$/,
    /tiktok\.com\/@/,
    /facebook\.com\/[^/]+\/?$/,
    /github\.com\/[^/]+\/?$/,
    /reddit\.com\/user\//,
    /reddit\.com\/r\/[^/]+\/?$/,
    /pinterest\.com\/[^/]+\/?$/
  ];
  if (profilePatterns.some((p) => p.test(urlLower))) {
    return "profile";
  }
  const embedPatterns = [
    /embed/,
    /player\./,
    /plugins/
  ];
  if (embedPatterns.some((p) => p.test(urlLower))) {
    return "embed";
  }
  return "content";
}
function extractPlatformLinks(html) {
  const $ = cheerio45.load(html);
  const links = [];
  $("a[href]").each((_, element) => {
    const $el = $(element);
    const href = $el.attr("href") || "";
    const platform = detectPlatform(href);
    if (platform) {
      links.push({
        platform,
        url: href,
        type: getLinkType(href, platform),
        location: getLinkLocation($, $el)
      });
    }
  });
  return links;
}
function detectEmbeddedContent(html) {
  const $ = cheerio45.load(html);
  const embeds = /* @__PURE__ */ new Map();
  $("iframe[src]").each((_, element) => {
    const src = $(element).attr("src") || "";
    const platform = detectPlatform(src);
    if (platform) {
      embeds.set(platform, (embeds.get(platform) || 0) + 1);
    }
  });
  $("embed[src]").each((_, element) => {
    const src = $(element).attr("src") || "";
    const platform = detectPlatform(src);
    if (platform) {
      embeds.set(platform, (embeds.get(platform) || 0) + 1);
    }
  });
  if (html.includes("twitter-tweet") || html.includes("twitter-timeline")) {
    embeds.set("Twitter/X", (embeds.get("Twitter/X") || 0) + 1);
  }
  if (html.includes("tiktok-embed")) {
    embeds.set("TikTok", (embeds.get("TikTok") || 0) + 1);
  }
  return Array.from(embeds.entries()).map(([platform, count]) => ({ platform, count }));
}
function extractSchemaProfiles(html) {
  const $ = cheerio45.load(html);
  const sameAsUrls = [];
  let hasOrganizationSchema = false;
  let hasPersonSchema = false;
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const content = $(element).html() || "";
      const jsonData = JSON.parse(content);
      const processSchema = (schema4) => {
        if (schema4["@type"] === "Organization") {
          hasOrganizationSchema = true;
        }
        if (schema4["@type"] === "Person") {
          hasPersonSchema = true;
        }
        if (schema4.sameAs) {
          if (Array.isArray(schema4.sameAs)) {
            sameAsUrls.push(...schema4.sameAs);
          } else if (typeof schema4.sameAs === "string") {
            sameAsUrls.push(schema4.sameAs);
          }
        }
      };
      if (Array.isArray(jsonData)) {
        jsonData.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            processSchema(item);
          }
        });
      } else if (typeof jsonData === "object" && jsonData !== null) {
        processSchema(jsonData);
        if (Array.isArray(jsonData["@graph"])) {
          jsonData["@graph"].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              processSchema(item);
            }
          });
        }
      }
    } catch {
    }
  });
  return { sameAsUrls, hasOrganizationSchema, hasPersonSchema };
}
function calculateCrossPlatformScore(platformCount, hasHighPriorityPlatforms, hasSchemaProfiles, hasEmbeddedContent) {
  let score = 0;
  score += Math.min(platformCount * 10, 50);
  if (hasHighPriorityPlatforms) {
    score += 30;
  }
  if (hasSchemaProfiles) {
    score += 10;
  }
  if (hasEmbeddedContent) {
    score += 10;
  }
  return Math.min(score, 100);
}
function analyzePlatformPresence(html, url) {
  const issues = [];
  const platformLinks = extractPlatformLinks(html);
  const detectedPlatforms = [...new Set(platformLinks.map((l) => l.platform))];
  const socialProfiles = platformLinks.filter((l) => l.type === "profile").map((l) => ({
    platform: l.platform,
    url: l.url,
    hasSchemaMarkup: false
    // Updated below
  }));
  const embeddedContent = detectEmbeddedContent(html);
  const schemaData = extractSchemaProfiles(html);
  socialProfiles.forEach((profile) => {
    profile.hasSchemaMarkup = schemaData.sameAsUrls.some(
      (schemaUrl) => schemaUrl.toLowerCase().includes(profile.platform.toLowerCase())
    );
  });
  const hasHighPriority = (name) => detectedPlatforms.includes(name);
  const metrics = {
    totalPlatforms: detectedPlatforms.length,
    hasYouTube: hasHighPriority("YouTube"),
    hasTikTok: hasHighPriority("TikTok"),
    hasTwitter: hasHighPriority("Twitter/X"),
    hasLinkedIn: hasHighPriority("LinkedIn"),
    hasReddit: hasHighPriority("Reddit"),
    hasFacebook: hasHighPriority("Facebook"),
    hasInstagram: hasHighPriority("Instagram"),
    hasPinterest: hasHighPriority("Pinterest"),
    hasPodcast: hasHighPriority("Spotify") || hasHighPriority("Apple Podcasts"),
    hasGitHub: hasHighPriority("GitHub")
  };
  const highPriorityPlatforms = PLATFORM_PATTERNS.filter((p) => p.priority === "high").map((p) => p.name);
  const hasHighPriorityPlatforms = highPriorityPlatforms.some((p) => detectedPlatforms.includes(p));
  const crossPlatformScore = calculateCrossPlatformScore(
    detectedPlatforms.length,
    hasHighPriorityPlatforms,
    schemaData.sameAsUrls.length > 0,
    embeddedContent.length > 0
  );
  const recommendations = [];
  if (!metrics.hasYouTube) {
    recommendations.push("Add YouTube presence - video content ranks on both YouTube and Google");
  }
  if (!metrics.hasTikTok) {
    recommendations.push("Consider TikTok for short-form video discovery (high reach for B2C)");
  }
  if (!metrics.hasTwitter) {
    recommendations.push("Create Twitter/X presence for real-time engagement and brand visibility");
  }
  if (!metrics.hasLinkedIn) {
    recommendations.push("LinkedIn is essential for B2B - add company page link");
  }
  if (schemaData.sameAsUrls.length === 0) {
    recommendations.push("Add sameAs property to your Organization schema with social profile URLs");
  }
  if (socialProfiles.length === 0) {
    issues.push({
      code: "NO_SOCIAL_PROFILES",
      severity: "warning",
      category: "social",
      title: "No social media profile links detected",
      description: "Page has no visible links to social media profiles.",
      impact: "Cross-platform presence builds brand trust and provides additional discovery channels.",
      howToFix: "Add links to your social media profiles in the header, footer, or contact section.",
      affectedUrls: [url]
    });
  }
  if (!hasHighPriorityPlatforms && detectedPlatforms.length > 0) {
    issues.push({
      code: "NO_HIGH_PRIORITY_PLATFORMS",
      severity: "notice",
      category: "social",
      title: "Missing high-priority platform links",
      description: "No links to YouTube, TikTok, Twitter/X, LinkedIn, or Reddit detected.",
      impact: "These platforms have the highest reach and impact for SEO diversification.",
      howToFix: "Prioritize creating presence on YouTube, Twitter/X, and LinkedIn (using RICE framework).",
      affectedUrls: [url],
      details: {
        currentPlatforms: detectedPlatforms,
        recommendedPlatforms: highPriorityPlatforms
      }
    });
  }
  if (schemaData.sameAsUrls.length === 0 && socialProfiles.length > 0) {
    issues.push({
      code: "NO_SCHEMA_SAMEAS",
      severity: "notice",
      category: "social",
      title: "Social profiles not in schema.org markup",
      description: "Social media links found but not included in Organization/Person schema.",
      impact: "Schema sameAs helps search engines understand your brand's official social presence.",
      howToFix: "Add sameAs array to your Organization or Person schema with all social profile URLs.",
      affectedUrls: [url],
      details: {
        profilesFound: socialProfiles.map((p) => p.platform),
        schemaUrls: schemaData.sameAsUrls
      }
    });
  }
  if (!metrics.hasYouTube && detectedPlatforms.length >= 2) {
    issues.push({
      code: "NO_YOUTUBE_PRESENCE",
      severity: "notice",
      category: "social",
      title: "No YouTube channel linked",
      description: "Multiple social platforms linked but YouTube is missing.",
      impact: "YouTube is the second largest search engine. Video content ranks in both YouTube and Google.",
      howToFix: "Create a YouTube channel and link to it from your website.",
      affectedUrls: [url]
    });
  }
  if (embeddedContent.length === 0 && detectedPlatforms.length > 0) {
    issues.push({
      code: "NO_EMBEDDED_SOCIAL",
      severity: "notice",
      category: "social",
      title: "No embedded social content",
      description: "Social profiles linked but no embedded videos, tweets, or posts.",
      impact: "Embedded content increases engagement time and shows fresh, active social presence.",
      howToFix: "Embed relevant YouTube videos, Twitter feeds, or TikTok videos in your content.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      detectedPlatforms,
      platformLinks,
      socialProfiles,
      embeddedContent,
      metrics,
      schemaPresence: {
        hasSameAs: schemaData.sameAsUrls.length > 0,
        sameAsUrls: schemaData.sameAsUrls,
        hasOrganizationSchema: schemaData.hasOrganizationSchema,
        hasPersonSchema: schemaData.hasPersonSchema
      },
      crossPlatformScore,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/interactive-tools.ts
import * as cheerio46 from "https://esm.sh/cheerio@1.0.0";
var CALCULATOR_PATTERNS = [
  /calculator/i,
  /estimator/i,
  /cost-calc/i,
  /price-calc/i,
  /roi-calc/i,
  /savings/i,
  /compute/i
];
var WIDGET_PATTERNS = [
  /widget/i,
  /tool/i,
  /generator/i,
  /builder/i,
  /creator/i,
  /converter/i,
  /checker/i,
  /analyzer/i,
  /finder/i
];
var CONFIGURATOR_PATTERNS = [
  /configurator/i,
  /customizer/i,
  /designer/i,
  /planner/i,
  /selector/i,
  /picker/i
];
function detectCalculators($) {
  const calculators = [];
  const calcElements = $('[class*="calc"], [id*="calc"], [class*="estimat"], [id*="estimat"], [data-tool="calculator"]');
  calcElements.each((_, el) => {
    const $el = $(el);
    const hasInputs = $el.find('input, select, [type="range"]').length > 0;
    if (hasInputs) {
      calculators.push({
        type: "calculator",
        description: $el.attr("aria-label") || $el.find("h2, h3, h4").first().text().trim() || "Calculator widget",
        location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
        hasUserInput: true
      });
    }
  });
  $("form").each((_, form) => {
    const $form = $(form);
    const formText = ($form.attr("class") || "") + ($form.attr("id") || "") + $form.text();
    if (CALCULATOR_PATTERNS.some((p) => p.test(formText))) {
      const hasInputs = $form.find('input[type="number"], input[type="range"], select').length > 0;
      if (hasInputs) {
        calculators.push({
          type: "calculator",
          description: $form.attr("aria-label") || $form.find("h2, h3, h4").first().text().trim() || "Calculator form",
          location: $form.attr("id") || "form",
          hasUserInput: true
        });
      }
    }
  });
  return calculators;
}
function detectQuizzes($) {
  const quizzes = [];
  const quizElements = $('[class*="quiz"], [id*="quiz"], [class*="assessment"], [data-component="quiz"]');
  quizElements.each((_, el) => {
    const $el = $(el);
    quizzes.push({
      type: "quiz",
      description: $el.attr("aria-label") || $el.find("h2, h3").first().text().trim() || "Quiz/Assessment",
      location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
      hasUserInput: true
    });
  });
  const questionContainers = $('[class*="question"], [data-question]');
  if (questionContainers.length >= 3) {
    quizzes.push({
      type: "quiz",
      description: "Multi-question assessment",
      location: "multiple-questions",
      hasUserInput: true
    });
  }
  return quizzes;
}
function detectWidgets($, html) {
  const widgets = [];
  WIDGET_PATTERNS.forEach((pattern) => {
    const elements = $(`[class*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"], [id*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"]`);
    elements.each((_, el) => {
      const $el = $(el);
      const hasInteraction = $el.find('input, button, select, [onclick], [role="button"]').length > 0;
      if (hasInteraction) {
        widgets.push({
          type: "widget",
          description: $el.attr("aria-label") || $el.attr("title") || pattern.source,
          location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
          hasUserInput: hasInteraction
        });
      }
    });
  });
  CONFIGURATOR_PATTERNS.forEach((pattern) => {
    if (pattern.test(html)) {
      const elements = $(`[class*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"]`);
      elements.each((_, el) => {
        const $el = $(el);
        widgets.push({
          type: "tool",
          description: "Product configurator/customizer",
          location: $el.attr("id") || "configurator",
          hasUserInput: true
        });
      });
    }
  });
  return widgets;
}
function detectCodePlaygrounds($, html) {
  const playgrounds = [];
  const playgroundPatterns = [
    { name: "CodePen", pattern: /codepen\.io\/.*\/embed/i },
    { name: "CodeSandbox", pattern: /codesandbox\.io\/embed/i },
    { name: "JSFiddle", pattern: /jsfiddle\.net.*\/embed/i },
    { name: "Replit", pattern: /replit\.com.*embed/i },
    { name: "StackBlitz", pattern: /stackblitz\.com\/edit/i }
  ];
  for (const { name, pattern } of playgroundPatterns) {
    if (pattern.test(html)) {
      playgrounds.push({
        type: "interactive",
        description: `${name} code playground`,
        location: "embed",
        hasUserInput: true
      });
    }
  }
  if (html.includes("monaco-editor") || html.includes("CodeMirror")) {
    playgrounds.push({
      type: "interactive",
      description: "Code editor widget",
      location: "embedded",
      hasUserInput: true
    });
  }
  return playgrounds;
}
function detectChatWidgets(html) {
  const chatWidgets = [];
  const chatPatterns = [
    { name: "Intercom", pattern: /intercom\.com|intercomcdn/i },
    { name: "Drift", pattern: /drift\.com|js\.driftt/i },
    { name: "Zendesk", pattern: /zendesk\.com|zdassets/i },
    { name: "Crisp", pattern: /crisp\.chat/i },
    { name: "LiveChat", pattern: /livechat\.com|livechatinc/i },
    { name: "Tawk.to", pattern: /tawk\.to/i },
    { name: "HubSpot Chat", pattern: /hs-scripts\.com.*chat/i },
    { name: "Freshdesk", pattern: /freshdesk\.com/i }
  ];
  for (const { name, pattern } of chatPatterns) {
    if (pattern.test(html)) {
      chatWidgets.push({
        type: "widget",
        description: `${name} chat widget`,
        location: "global",
        hasUserInput: true
      });
    }
  }
  return chatWidgets;
}
function detectVideoEmbeds($, html) {
  const videos = [];
  if (html.includes("youtube.com/embed") || html.includes("youtube-nocookie.com/embed")) {
    const youtubeEmbeds = $('iframe[src*="youtube"]');
    videos.push({
      type: "embed",
      description: `${youtubeEmbeds.length} YouTube video(s) embedded`,
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("player.vimeo.com")) {
    videos.push({
      type: "embed",
      description: "Vimeo video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("wistia.com") || html.includes("wistia.net")) {
    videos.push({
      type: "embed",
      description: "Wistia video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("loom.com/embed")) {
    videos.push({
      type: "embed",
      description: "Loom video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  const html5Videos = $("video");
  if (html5Videos.length > 0) {
    videos.push({
      type: "embed",
      description: `${html5Videos.length} HTML5 video(s)`,
      location: "content",
      hasUserInput: false
    });
  }
  return videos;
}
function calculateDwellTimeScore(data) {
  let score = 0;
  if (data.dwellTimeSignals.hasCalculator)
    score += 25;
  if (data.dwellTimeSignals.hasQuiz)
    score += 20;
  if (data.dwellTimeSignals.hasConfigurator)
    score += 25;
  if (data.dwellTimeSignals.hasCodePlayground)
    score += 15;
  if (data.dwellTimeSignals.hasVideoEmbed)
    score += 15;
  if (data.dwellTimeSignals.hasInteractiveWidget)
    score += 10;
  if (data.dwellTimeSignals.hasChatWidget)
    score += 5;
  return Math.min(score, 100);
}
function analyzeInteractiveTools(html, url) {
  const $ = cheerio46.load(html);
  const issues = [];
  const calculators = detectCalculators($);
  const quizzes = detectQuizzes($);
  const widgets = detectWidgets($, html);
  const codePlaygrounds = detectCodePlaygrounds($, html);
  const chatWidgets = detectChatWidgets(html);
  const videoEmbeds = detectVideoEmbeds($, html);
  const allTools = [
    ...calculators,
    ...quizzes,
    ...widgets,
    ...codePlaygrounds,
    ...chatWidgets,
    ...videoEmbeds
  ];
  const uniqueTools = allTools.filter(
    (tool, index, self) => index === self.findIndex((t) => t.location === tool.location && t.type === tool.type)
  );
  const dwellTimeSignals = {
    hasCalculator: calculators.length > 0,
    hasQuiz: quizzes.length > 0,
    hasInteractiveWidget: widgets.length > 0,
    hasVideoEmbed: videoEmbeds.length > 0,
    hasCodePlayground: codePlaygrounds.length > 0,
    hasConfigurator: widgets.some((w) => w.description.toLowerCase().includes("configurator")),
    hasChatWidget: chatWidgets.length > 0
  };
  const partialData = {
    hasInteractiveTools: uniqueTools.length > 0,
    tools: uniqueTools,
    dwellTimeSignals,
    toolCount: uniqueTools.length
  };
  const dwellTimeScore = calculateDwellTimeScore(partialData);
  const recommendations = [];
  if (!dwellTimeSignals.hasCalculator && !dwellTimeSignals.hasQuiz) {
    recommendations.push("Add an interactive calculator or quiz to boost dwell time and generate backlinks");
  }
  if (!dwellTimeSignals.hasVideoEmbed) {
    recommendations.push("Embed a YouTube video to increase engagement and dwell time");
  }
  if (!dwellTimeSignals.hasInteractiveWidget && !dwellTimeSignals.hasConfigurator) {
    recommendations.push("Consider adding a free tool (generator, checker, converter) as a link magnet");
  }
  const isServicePage = /services?|pricing|product/i.test(url) || $("h1").text().toLowerCase().match(/service|pricing|product/);
  const isBlogPage = /blog|article|post/i.test(url);
  if (isServicePage && uniqueTools.length === 0) {
    issues.push({
      code: "NO_INTERACTIVE_TOOLS",
      severity: "notice",
      category: "content",
      title: "Service page lacks interactive tools",
      description: "This service/product page has no interactive elements like calculators or configurators.",
      impact: "Interactive tools increase dwell time by 2-3x and are powerful link magnets for backlink acquisition.",
      howToFix: "Add a relevant calculator (ROI, cost estimator, savings) or product configurator to the page.",
      affectedUrls: [url],
      details: {
        pageType: "service/product",
        recommendation: "Consider adding a pricing calculator, ROI estimator, or product configurator"
      }
    });
  }
  if (isBlogPage && !dwellTimeSignals.hasVideoEmbed) {
    issues.push({
      code: "BLOG_NO_VIDEO",
      severity: "notice",
      category: "content",
      title: "Blog post lacks video content",
      description: "This blog post has no embedded video content.",
      impact: "Embedded YouTube videos increase dwell time and can appear in video search results.",
      howToFix: "Create and embed a YouTube video that summarizes or expands on the blog content.",
      affectedUrls: [url]
    });
  }
  if (dwellTimeScore < 20 && uniqueTools.length === 0) {
    issues.push({
      code: "LOW_DWELL_TIME_SIGNALS",
      severity: "notice",
      category: "content",
      title: "Page lacks dwell time optimization",
      description: "No interactive tools, calculators, quizzes, or video embeds detected.",
      impact: "Interactive content significantly increases time on page, a user engagement signal.",
      howToFix: "Add at least one interactive element: calculator, quiz, embedded video, or free tool.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasInteractiveTools: uniqueTools.length > 0,
      tools: uniqueTools,
      dwellTimeSignals,
      toolCount: uniqueTools.length,
      dwellTimeScore,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/funnel-intent.ts
import * as cheerio47 from "https://esm.sh/cheerio@1.0.0";
var TOFU_PATTERNS = {
  url: [
    /\/blog\//i,
    /\/article/i,
    /\/guide/i,
    /\/tutorial/i,
    /\/how-to/i,
    /\/what-is/i,
    /\/learn/i,
    /\/tips/i,
    /\/explained/i,
    /\/introduction/i,
    /\/beginners?/i
  ],
  title: [
    /^how to/i,
    /^what is/i,
    /^what are/i,
    /^why /i,
    /^when /i,
    /^guide to/i,
    /complete guide/i,
    /beginner'?s? guide/i,
    /ultimate guide/i,
    /\d+ tips/i,
    /\d+ ways/i,
    /\d+ things/i,
    /explained/i,
    /introduction to/i,
    /learn /i,
    /understanding/i
  ],
  content: [
    /in this article/i,
    /in this guide/i,
    /we'll explain/i,
    /we'll cover/i,
    /you'll learn/i,
    /let's explore/i,
    /let's dive/i,
    /did you know/i,
    /according to/i,
    /research shows/i,
    /studies show/i
  ]
};
var MOFU_PATTERNS = {
  url: [
    /\/compare/i,
    /\/comparison/i,
    /\/vs/i,
    /\/versus/i,
    /\/alternative/i,
    /\/review/i,
    /\/pros-cons/i,
    /\/features/i,
    /\/solutions/i,
    /\/case-stud/i
  ],
  title: [
    /vs\.?$/i,
    /versus/i,
    /comparison/i,
    /compared/i,
    /alternative/i,
    /review/i,
    /pros and cons/i,
    /which is better/i,
    /best .* for/i,
    /top \d+/i,
    /\d+ best/i,
    /how .* compares/i,
    /should you/i
  ],
  content: [
    /let'?s compare/i,
    /in comparison/i,
    /alternative to/i,
    /pros:/i,
    /cons:/i,
    /advantages:/i,
    /disadvantages:/i,
    /key features/i,
    /feature comparison/i,
    /case study/i,
    /our client/i,
    /we helped/i
  ]
};
var BOFU_PATTERNS = {
  url: [
    /\/pricing/i,
    /\/buy/i,
    /\/purchase/i,
    /\/order/i,
    /\/sign-?up/i,
    /\/register/i,
    /\/demo/i,
    /\/trial/i,
    /\/quote/i,
    /\/contact/i,
    /\/get-started/i,
    /\/checkout/i,
    /\/hire/i,
    /\/services?$/i
  ],
  title: [
    /pricing/i,
    /buy /i,
    /purchase/i,
    /order /i,
    /sign up/i,
    /get started/i,
    /free trial/i,
    /request .* demo/i,
    /book .* call/i,
    /schedule/i,
    /get .* quote/i,
    /contact us/i,
    /hire /i,
    /\$\d+/,
    /per month/i,
    /\/mo\b/i
  ],
  content: [
    /add to cart/i,
    /buy now/i,
    /purchase now/i,
    /sign up now/i,
    /get started/i,
    /start.*trial/i,
    /request.*demo/i,
    /book.*call/i,
    /schedule.*meeting/i,
    /contact.*today/i,
    /limited.*offer/i,
    /special.*price/i,
    /money.*back.*guarantee/i,
    /free.*shipping/i,
    /plans.*pricing/i,
    /per user/i,
    /per month/i,
    /billed annually/i,
    /\$\d+/
  ],
  elements: [
    'form[action*="checkout"]',
    'form[action*="purchase"]',
    'form[action*="subscribe"]',
    'button[data-action="buy"]',
    '[class*="pricing-table"]',
    '[class*="price-card"]',
    '[class*="checkout"]',
    '[class*="add-to-cart"]'
  ]
};
function calculateStageScore(url, title, content, $, patterns) {
  let score = 0;
  const signals = [];
  for (const pattern of patterns.url) {
    if (pattern.test(url)) {
      score += 15;
      signals.push(`URL: ${pattern.source}`);
    }
  }
  for (const pattern of patterns.title) {
    if (pattern.test(title)) {
      score += 12;
      signals.push(`Title: ${pattern.source}`);
    }
  }
  for (const pattern of patterns.content) {
    if (pattern.test(content)) {
      score += 5;
      signals.push(`Content: ${pattern.source}`);
    }
  }
  if (patterns.elements) {
    for (const selector of patterns.elements) {
      if ($(selector).length > 0) {
        score += 10;
        signals.push(`Element: ${selector}`);
      }
    }
  }
  return { score, signals: signals.slice(0, 5) };
}
function determinePageType($, url) {
  if (/\/blog\//i.test(url))
    return "blog-post";
  if (/\/product/i.test(url))
    return "product-page";
  if (/\/services?/i.test(url))
    return "service-page";
  if (/\/pricing/i.test(url))
    return "pricing-page";
  if (/\/about/i.test(url))
    return "about-page";
  if (/\/contact/i.test(url))
    return "contact-page";
  if (/\/case-stud/i.test(url))
    return "case-study";
  if ($('[class*="pricing"]').length > 0)
    return "pricing-page";
  if ($('[class*="product"]').length > 0)
    return "product-page";
  if ($("article").length > 0)
    return "article";
  if ($('[class*="blog"]').length > 0)
    return "blog-post";
  if ($('[class*="cart"]').length > 0 || $('[class*="checkout"]').length > 0)
    return "e-commerce";
  return "general";
}
function calculateAIOverviewRisk(stage, pageType) {
  if (stage === "tofu") {
    return "high";
  }
  if (pageType === "blog-post" || pageType === "article") {
    return "high";
  }
  if (stage === "mofu") {
    return "medium";
  }
  return "low";
}
function analyzeFunnelIntent(html, url) {
  const $ = cheerio47.load(html);
  const issues = [];
  const title = $("title").text().trim() + " " + $("h1").first().text().trim();
  const bodyText = $("body").text().toLowerCase();
  const tofuResult = calculateStageScore(url, title, bodyText, $, TOFU_PATTERNS);
  const mofuResult = calculateStageScore(url, title, bodyText, $, MOFU_PATTERNS);
  const bofuResult = calculateStageScore(url, title, bodyText, $, BOFU_PATTERNS);
  const totalScore = tofuResult.score + mofuResult.score + bofuResult.score || 1;
  const informationalScore = Math.round(tofuResult.score / totalScore * 100);
  const considerationScore = Math.round(mofuResult.score / totalScore * 100);
  const conversionScore = Math.round(bofuResult.score / totalScore * 100);
  let detectedStage;
  let confidence;
  if (bofuResult.score > tofuResult.score && bofuResult.score > mofuResult.score) {
    detectedStage = "bofu";
    confidence = conversionScore;
  } else if (mofuResult.score > tofuResult.score) {
    detectedStage = "mofu";
    confidence = considerationScore;
  } else if (tofuResult.score > 0) {
    detectedStage = "tofu";
    confidence = informationalScore;
  } else {
    detectedStage = "mixed";
    confidence = 50;
  }
  const pageType = determinePageType($, url);
  const aiOverviewRisk = calculateAIOverviewRisk(detectedStage, pageType);
  const recommendations = [];
  if (detectedStage === "tofu") {
    recommendations.push("Consider adding conversion elements (CTAs, forms) to capture leads");
    recommendations.push("Link to MOFU/BOFU pages (comparisons, pricing) to guide users down the funnel");
    if (aiOverviewRisk === "high") {
      recommendations.push("Add unique data, case studies, or expert opinions that AI cannot replicate");
    }
  }
  if (detectedStage === "mofu") {
    recommendations.push("Add clear CTAs to BOFU pages (pricing, demos, trials)");
    recommendations.push("Include social proof (testimonials, case studies) to build trust");
  }
  if (detectedStage === "mixed") {
    recommendations.push("Clarify the page's primary intent - is this informational, comparison, or conversion focused?");
    recommendations.push("Consider splitting into multiple focused pages for better SEO");
  }
  if (aiOverviewRisk === "high" && detectedStage === "tofu") {
    issues.push({
      code: "TOFU_AI_OVERVIEW_RISK",
      severity: "notice",
      category: "content",
      title: "Content at risk of AI overview displacement",
      description: "This informational content may be answered directly by AI overviews, reducing click-through.",
      impact: "Google AI overviews are increasingly answering informational queries directly in SERPs.",
      howToFix: "Add unique value: original data, expert opinions, case studies, or interactive tools that AI cannot replicate.",
      affectedUrls: [url],
      details: {
        funnelStage: "tofu",
        aiOverviewRisk,
        recommendation: "Focus on MOFU/BOFU content or add unique differentiating content"
      }
    });
  }
  if (detectedStage === "tofu") {
    const hasConversionLinks = $('a[href*="pricing"], a[href*="demo"], a[href*="trial"], a[href*="contact"], a[href*="buy"]').length > 0;
    if (!hasConversionLinks) {
      issues.push({
        code: "TOFU_NO_FUNNEL_LINKS",
        severity: "notice",
        category: "content",
        title: "Informational page lacks conversion path",
        description: "This TOFU content has no links to pricing, demo, trial, or contact pages.",
        impact: "Users may leave without entering the sales funnel. Missing revenue opportunity.",
        howToFix: "Add contextual CTAs linking to MOFU/BOFU pages (comparisons, pricing, demos).",
        affectedUrls: [url]
      });
    }
  }
  if (detectedStage === "bofu") {
    const hasSocialProof = $('[class*="testimonial"], [class*="review"], [class*="case-study"], [class*="trust"]').length > 0 || bodyText.includes("testimonial") || bodyText.includes("customer said");
    if (!hasSocialProof) {
      issues.push({
        code: "BOFU_NO_SOCIAL_PROOF",
        severity: "warning",
        category: "content",
        title: "Conversion page lacks social proof",
        description: "This pricing/sales page has no visible testimonials, reviews, or case studies.",
        impact: "97% of consumers look at reviews before buying. Social proof can increase conversions by 34%.",
        howToFix: "Add customer testimonials, case study results, trust badges, or review ratings.",
        affectedUrls: [url],
        details: {
          funnelStage: "bofu",
          pageType
        }
      });
    }
  }
  if (detectedStage === "mixed" && confidence < 40) {
    issues.push({
      code: "MIXED_FUNNEL_INTENT",
      severity: "notice",
      category: "content",
      title: "Unclear page intent",
      description: "This page has mixed signals - unclear if informational, comparison, or conversion focused.",
      impact: "Mixed intent pages may rank poorly because search engines cannot determine primary purpose.",
      howToFix: "Focus on one primary intent per page. Create separate pages for different funnel stages.",
      affectedUrls: [url],
      details: {
        scores: { tofu: informationalScore, mofu: considerationScore, bofu: conversionScore }
      }
    });
  }
  return {
    issues,
    data: {
      detectedStage,
      confidence,
      signals: {
        tofu: tofuResult.signals,
        mofu: mofuResult.signals,
        bofu: bofuResult.signals
      },
      metrics: {
        informationalScore,
        considerationScore,
        conversionScore
      },
      pageType,
      aiOverviewRisk,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/navboost-signals.ts
import * as cheerio48 from "https://esm.sh/cheerio@1.0.0";
function analyzeClickOptimization($) {
  const title = $("title").text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const hasClearTitle = title.length > 10 && title.length <= 60;
  const titleTruncated = title.length > 60;
  const hasCompellingMetaDesc = metaDesc.length >= 70 && metaDesc.length <= 160;
  const metaDescTruncated = metaDesc.length > 160;
  const hasPowerWords = /free|best|guide|how to|ultimate|proven|secret|new|exclusive/i.test(title + " " + metaDesc);
  const hasNumbers = /\d+/.test(title);
  const hasYear = /202[4-9]|203\d/.test(title + " " + metaDesc);
  let ctrScore = 0;
  if (hasClearTitle)
    ctrScore += 2;
  if (hasCompellingMetaDesc)
    ctrScore += 2;
  if (hasPowerWords)
    ctrScore += 1;
  if (hasNumbers)
    ctrScore += 1;
  if (hasYear)
    ctrScore += 1;
  const estimatedCTRPotential = ctrScore >= 5 ? "high" : ctrScore >= 3 ? "medium" : "low";
  return {
    hasClearTitle,
    hasCompellingMetaDesc,
    titleTruncated,
    metaDescTruncated,
    estimatedCTRPotential
  };
}
function analyzeEngagementSignals($, html) {
  const hasTableOfContents = $('[class*="toc"], [id*="toc"], [class*="table-of-contents"], nav[aria-label*="content"]').length > 0 || $('a[href^="#"]').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return /^(\d+\.?\s*)?[a-z]/i.test(text) && text.length > 3;
  }).length >= 3;
  const hasJumpLinks = $('a[href^="#"]').length >= 3;
  const contentSections = $("h2, h3").length;
  const bodyText = $("body").text();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedScrollDepth = wordCount > 2e3 ? "deep" : wordCount > 800 ? "medium" : "shallow";
  const hasProgressIndicator = $('[class*="progress"], [class*="reading-progress"], [role="progressbar"]').length > 0;
  const hasStickyNavigation = $('[class*="sticky"], [class*="fixed"], [style*="position: sticky"], [style*="position: fixed"]').filter((_, el) => {
    return $(el).find("nav, a").length > 0;
  }).length > 0;
  return {
    hasTableOfContents,
    hasJumpLinks,
    estimatedScrollDepth,
    hasProgressIndicator,
    hasStickyNavigation,
    contentSections
  };
}
function analyzeBounceRiskFactors($, html) {
  const title = $("title").text().toLowerCase();
  const h1 = $("h1").first().text().toLowerCase();
  const firstParagraph = $("p").first().text().toLowerCase();
  const hasAboveFoldContent = $("h1").length > 0 && ($("p").first().text().length > 50 || $("main, article, .content").first().text().length > 100);
  const hasSlowLoadingIndicators = $('script[src*="bundle"], script[src*="vendor"]').length > 5 || $('img:not([loading="lazy"])').length > 10;
  const hasPopupRisk = html.includes("modal") || html.includes("popup") || html.includes("newsletter-overlay") || $('[class*="popup"], [class*="modal"]').length > 0;
  const hasIntrusiveAds = $('[class*="ad-"], [id*="ad-"], [class*="advertisement"]').length > 3 || html.includes("interstitial");
  const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
  const matchingWords = titleWords.filter(
    (w) => h1.includes(w) || firstParagraph.includes(w)
  );
  const contentMatchesTitle = matchingWords.length >= Math.ceil(titleWords.length * 0.5);
  const hasImmediateValue = firstParagraph.length > 100 || $("main p, article p").first().text().length > 100;
  return {
    hasAboveFoldContent,
    hasSlowLoadingIndicators,
    hasPopupRisk,
    hasIntrusiveAds,
    contentMatchesTitle,
    hasImmediateValue
  };
}
function analyzeDwellTimeFactors($, html) {
  const bodyText = $("main, article, .content, body").text();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);
  const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"]').length > 0;
  const hasInteractiveElements = $('form, [class*="calculator"], [class*="quiz"], [class*="interactive"], input, select').length > 0;
  const contentDepth = wordCount > 2e3 ? "comprehensive" : wordCount > 800 ? "moderate" : "thin";
  const hasRelatedContent = $('[class*="related"], [class*="recommended"], [class*="similar"]').length > 0 || $("a").filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes("related") || text.includes("see also") || text.includes("read next");
  }).length > 0;
  return {
    estimatedReadTime,
    hasVideo,
    hasInteractiveElements,
    contentDepth,
    hasRelatedContent
  };
}
function calculateNavBoostScore(click, engagement, bounce, dwell) {
  let score = 50;
  if (click.estimatedCTRPotential === "high")
    score += 20;
  else if (click.estimatedCTRPotential === "medium")
    score += 10;
  if (click.titleTruncated)
    score -= 5;
  if (click.metaDescTruncated)
    score -= 3;
  if (engagement.hasTableOfContents)
    score += 10;
  if (engagement.hasJumpLinks)
    score += 5;
  if (engagement.contentSections >= 5)
    score += 5;
  if (!bounce.hasAboveFoldContent)
    score -= 10;
  if (bounce.hasPopupRisk)
    score -= 5;
  if (bounce.hasIntrusiveAds)
    score -= 10;
  if (!bounce.contentMatchesTitle)
    score -= 5;
  if (bounce.hasImmediateValue)
    score += 5;
  if (dwell.hasVideo)
    score += 10;
  if (dwell.hasInteractiveElements)
    score += 5;
  if (dwell.contentDepth === "comprehensive")
    score += 5;
  else if (dwell.contentDepth === "thin")
    score -= 5;
  if (dwell.hasRelatedContent)
    score += 5;
  return Math.max(0, Math.min(100, score));
}
function analyzeNavBoostSignals(html, url) {
  const $ = cheerio48.load(html);
  const issues = [];
  const clickOptimization = analyzeClickOptimization($);
  const engagementSignals = analyzeEngagementSignals($, html);
  const bounceRiskFactors = analyzeBounceRiskFactors($, html);
  const dwellTimeFactors = analyzeDwellTimeFactors($, html);
  const overallNavBoostScore = calculateNavBoostScore(
    clickOptimization,
    engagementSignals,
    bounceRiskFactors,
    dwellTimeFactors
  );
  const recommendations = [];
  if (clickOptimization.estimatedCTRPotential !== "high") {
    recommendations.push("Optimize title/meta for higher CTR: use power words, numbers, or current year");
  }
  if (!engagementSignals.hasTableOfContents && engagementSignals.contentSections >= 5) {
    recommendations.push("Add table of contents for long-form content to improve engagement");
  }
  if (bounceRiskFactors.hasPopupRisk) {
    recommendations.push("Delay or remove popup modals to reduce bounce rate");
  }
  if (!dwellTimeFactors.hasRelatedContent) {
    recommendations.push("Add related content section to increase session duration");
  }
  if (clickOptimization.estimatedCTRPotential === "low") {
    issues.push({
      code: "LOW_CTR_POTENTIAL",
      severity: "warning",
      category: "on-page",
      title: "Title and meta description have low CTR potential",
      description: "The title and meta description lack compelling elements that drive clicks.",
      impact: "NavBoost uses click data as a ranking signal. Higher CTR improves rankings over time.",
      howToFix: "Add power words (free, best, ultimate), numbers, or current year to increase CTR.",
      affectedUrls: [url],
      details: {
        ctrPotential: clickOptimization.estimatedCTRPotential,
        titleTruncated: clickOptimization.titleTruncated
      }
    });
  }
  if (!bounceRiskFactors.hasAboveFoldContent || !bounceRiskFactors.hasImmediateValue) {
    issues.push({
      code: "HIGH_BOUNCE_RISK",
      severity: "warning",
      category: "content",
      title: "Page has high bounce risk signals",
      description: "The page lacks above-fold content or immediate value for visitors.",
      impact: "NavBoost tracks bounce rate. >70% bounce with <30s sessions hurts rankings.",
      howToFix: "Add compelling content above the fold that delivers immediate value to visitors.",
      affectedUrls: [url],
      details: {
        hasAboveFoldContent: bounceRiskFactors.hasAboveFoldContent,
        hasImmediateValue: bounceRiskFactors.hasImmediateValue
      }
    });
  }
  if (bounceRiskFactors.hasPopupRisk) {
    issues.push({
      code: "POPUP_BOUNCE_RISK",
      severity: "notice",
      category: "content",
      title: "Popup/modal detected - potential bounce risk",
      description: "Popups detected that may cause visitors to leave immediately.",
      impact: "Intrusive interstitials increase bounce rate and hurt NavBoost signals.",
      howToFix: "Delay popups by 30+ seconds, or use exit-intent only. Avoid fullscreen overlays.",
      affectedUrls: [url]
    });
  }
  if (dwellTimeFactors.contentDepth === "thin" && dwellTimeFactors.estimatedReadTime < 3) {
    issues.push({
      code: "LOW_DWELL_TIME_CONTENT",
      severity: "notice",
      category: "content",
      title: "Thin content may result in low dwell time",
      description: `Estimated read time is only ${dwellTimeFactors.estimatedReadTime} minute(s).`,
      impact: 'Google tracks "lastLongestClicks" - longer sessions signal quality content.',
      howToFix: "Add comprehensive content, videos, or interactive elements to increase time on page.",
      affectedUrls: [url],
      details: {
        estimatedReadTime: dwellTimeFactors.estimatedReadTime,
        contentDepth: dwellTimeFactors.contentDepth
      }
    });
  }
  if (engagementSignals.estimatedScrollDepth === "deep" && !engagementSignals.hasTableOfContents) {
    issues.push({
      code: "LONG_CONTENT_NO_TOC",
      severity: "notice",
      category: "content",
      title: "Long content lacks table of contents",
      description: "Long-form content without navigation aids may cause users to abandon the page.",
      impact: "Table of contents improves engagement signals by helping users find relevant sections.",
      howToFix: "Add a table of contents with jump links to major sections.",
      affectedUrls: [url],
      details: {
        contentSections: engagementSignals.contentSections,
        scrollDepth: engagementSignals.estimatedScrollDepth
      }
    });
  }
  return {
    issues,
    data: {
      clickOptimization,
      engagementSignals,
      bounceRiskFactors,
      dwellTimeFactors,
      overallNavBoostScore,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/entity-seo.ts
import * as cheerio49 from "https://esm.sh/cheerio@1.0.0";
function extractEntitySignals($, html) {
  let hasOrganizationSchema = false;
  let hasPersonSchema = false;
  let hasProductSchema = false;
  let hasSameAsReferences = false;
  let hasMainEntityOfPage = false;
  let hasAboutReference = false;
  const sameAsUrls = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html() || "";
      const data = JSON.parse(content);
      const processSchema = (schema4) => {
        const type = schema4["@type"];
        if (type === "Organization" || type === "Corporation" || type === "LocalBusiness") {
          hasOrganizationSchema = true;
        }
        if (type === "Person") {
          hasPersonSchema = true;
        }
        if (type === "Product" || type === "SoftwareApplication") {
          hasProductSchema = true;
        }
        if (schema4.sameAs) {
          hasSameAsReferences = true;
          if (Array.isArray(schema4.sameAs)) {
            sameAsUrls.push(...schema4.sameAs);
          } else if (typeof schema4.sameAs === "string") {
            sameAsUrls.push(schema4.sameAs);
          }
        }
        if (schema4.mainEntityOfPage) {
          hasMainEntityOfPage = true;
        }
        if (schema4.about) {
          hasAboutReference = true;
        }
      };
      if (Array.isArray(data)) {
        data.forEach((item) => processSchema(item));
      } else if (data["@graph"]) {
        data["@graph"].forEach(processSchema);
      } else {
        processSchema(data);
      }
    } catch {
    }
  });
  return {
    hasOrganizationSchema,
    hasPersonSchema,
    hasProductSchema,
    hasSameAsReferences,
    sameAsUrls,
    hasMainEntityOfPage,
    hasAboutReference
  };
}
function analyzeEntityClarity($, html) {
  const title = $("title").text().trim();
  const h1 = $("h1").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const firstParagraph = $("p").first().text().trim();
  let primaryEntityType = null;
  const bodyText = $("body").text().toLowerCase();
  if (/company|corporation|business|agency|firm/i.test(bodyText)) {
    primaryEntityType = "Organization";
  } else if (/product|software|tool|app|service/i.test(h1 + " " + title)) {
    primaryEntityType = "Product/Software";
  } else if (/person|author|founder|ceo|expert/i.test(bodyText)) {
    primaryEntityType = "Person";
  }
  const titleWords = title.split(/[\s|—-]+/).filter((w) => w.length > 3);
  const h1Words = h1.split(/[\s|—-]+/).filter((w) => w.length > 3);
  const properNouns = [...title.matchAll(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)].map((m) => m[0]);
  const entityNameConsistency = properNouns.length > 0 && properNouns.some((name) => h1.includes(name) || firstParagraph.includes(name));
  const hasWikipediaStyleIntro = /is (a|an|the)\s+\w+/i.test(firstParagraph) || /\w+ is (a|an) (software|company|tool|platform|service|agency)/i.test(firstParagraph);
  const hasEntityDefinition = hasWikipediaStyleIntro || firstParagraph.length > 100;
  const brandName = properNouns[0] || title.split(/[|—-]/)[0].trim();
  const entityMentionCount = brandName ? (bodyText.match(new RegExp(brandName.toLowerCase(), "g")) || []).length : 0;
  return {
    primaryEntityType,
    entityNameConsistency,
    hasEntityDefinition,
    hasWikipediaStyleIntro,
    entityMentionCount
  };
}
function analyzeTopicalCoverage($, html) {
  const bodyText = $("body").text();
  const relationshipPatterns = [
    /integrates? with/i,
    /works? with/i,
    /similar to/i,
    /alternative to/i,
    /compared to/i,
    /partner(s|ship)? with/i,
    /competitor/i,
    /used by/i,
    /trusted by/i
  ];
  const hasEntityRelationships = relationshipPatterns.some((p) => p.test(bodyText));
  const allProperNouns = bodyText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const uniqueEntities = [...new Set(allProperNouns)].filter((e) => e.length > 3);
  const relatedEntityCount = Math.min(uniqueEntities.length, 50);
  const hasRelatedEntities = relatedEntityCount > 5;
  let topicalDepthScore = 0;
  if (hasEntityRelationships)
    topicalDepthScore += 30;
  if (relatedEntityCount >= 10)
    topicalDepthScore += 30;
  else if (relatedEntityCount >= 5)
    topicalDepthScore += 15;
  if ($("h2, h3").length >= 5)
    topicalDepthScore += 20;
  if (bodyText.length > 5e3)
    topicalDepthScore += 20;
  return {
    hasRelatedEntities,
    relatedEntityCount,
    hasEntityRelationships,
    topicalDepthScore: Math.min(topicalDepthScore, 100)
  };
}
function analyzeKnowledgePanelSignals($, html) {
  const bodyText = $("body").text().toLowerCase();
  const schemaText = $('script[type="application/ld+json"]').text();
  return {
    hasCompanyInfo: /about us|about the company|our story|who we are/i.test(bodyText) || /Organization|Corporation/i.test(schemaText),
    hasFounderInfo: /founder|founded by|ceo|chief executive/i.test(bodyText),
    hasHeadquarters: /headquarters|based in|located in|office/i.test(bodyText) || /address/i.test(schemaText),
    hasIndustryMention: /industry|sector|market|specializ/i.test(bodyText),
    hasDateFounded: /founded in|established in|since \d{4}|founded \d{4}/i.test(bodyText) || /foundingDate/i.test(schemaText)
  };
}
function calculateEntitySEOScore(signals, clarity, coverage, kpSignals) {
  let score = 0;
  if (signals.hasOrganizationSchema || signals.hasPersonSchema)
    score += 10;
  if (signals.hasSameAsReferences)
    score += 10;
  if (signals.hasMainEntityOfPage)
    score += 5;
  if (signals.hasAboutReference)
    score += 5;
  if (clarity.primaryEntityType)
    score += 10;
  if (clarity.entityNameConsistency)
    score += 10;
  if (clarity.hasWikipediaStyleIntro)
    score += 10;
  score += Math.round(coverage.topicalDepthScore * 0.2);
  const kpCount = Object.values(kpSignals).filter(Boolean).length;
  score += kpCount * 4;
  return Math.min(score, 100);
}
function analyzeEntitySEO(html, url) {
  const $ = cheerio49.load(html);
  const issues = [];
  const entitySignals = extractEntitySignals($, html);
  const entityClarity = analyzeEntityClarity($, html);
  const topicalCoverage = analyzeTopicalCoverage($, html);
  const knowledgePanelSignals = analyzeKnowledgePanelSignals($, html);
  const entitySEOScore = calculateEntitySEOScore(
    entitySignals,
    entityClarity,
    topicalCoverage,
    knowledgePanelSignals
  );
  const recommendations = [];
  if (!entitySignals.hasOrganizationSchema && !entitySignals.hasPersonSchema) {
    recommendations.push("Add Organization or Person schema to establish entity identity");
  }
  if (!entitySignals.hasSameAsReferences) {
    recommendations.push("Add sameAs references to official social profiles and Wikipedia/Wikidata");
  }
  if (!entityClarity.hasWikipediaStyleIntro) {
    recommendations.push("Add a Wikipedia-style definition in the first paragraph (Entity is a...)");
  }
  if (!entitySignals.hasMainEntityOfPage) {
    recommendations.push("Specify mainEntityOfPage in schema to clarify what the page is about");
  }
  if (!entitySignals.hasOrganizationSchema && !entitySignals.hasPersonSchema && !entitySignals.hasProductSchema) {
    issues.push({
      code: "NO_ENTITY_SCHEMA",
      severity: "warning",
      category: "structured-data",
      title: "Missing entity schema (Organization/Person/Product)",
      description: "No schema markup defining the primary entity on this page.",
      impact: "Entity schema helps Google understand what/who this page is about for Knowledge Graph.",
      howToFix: "Add Organization, Person, or Product schema with complete properties.",
      affectedUrls: [url]
    });
  }
  if (!entitySignals.hasSameAsReferences && (entitySignals.hasOrganizationSchema || entitySignals.hasPersonSchema)) {
    issues.push({
      code: "NO_SAMEAS_REFERENCES",
      severity: "notice",
      category: "structured-data",
      title: "Entity schema missing sameAs references",
      description: "Entity schema found but no sameAs links to authoritative sources.",
      impact: "sameAs helps Google connect your entity to Knowledge Graph entries (Wikipedia, social profiles).",
      howToFix: "Add sameAs array with links to Wikipedia, Wikidata, LinkedIn, Twitter, Crunchbase, etc.",
      affectedUrls: [url],
      details: {
        hasOrganization: entitySignals.hasOrganizationSchema,
        hasPerson: entitySignals.hasPersonSchema
      }
    });
  }
  if (!entityClarity.hasWikipediaStyleIntro) {
    issues.push({
      code: "NO_ENTITY_DEFINITION",
      severity: "notice",
      category: "content",
      title: "Missing entity definition in content",
      description: "First paragraph lacks a clear definition of the primary entity.",
      impact: "Clear entity definitions help AI systems extract and cite your content correctly.",
      howToFix: 'Start content with "[Entity Name] is a [type] that [does what]" pattern.',
      affectedUrls: [url]
    });
  }
  if (!entityClarity.entityNameConsistency && entityClarity.entityMentionCount < 3) {
    issues.push({
      code: "LOW_ENTITY_CONSISTENCY",
      severity: "notice",
      category: "content",
      title: "Entity name not consistently used",
      description: "The primary entity name doesn't appear consistently across title, H1, and content.",
      impact: "Consistent entity naming strengthens topical signals for Knowledge Graph.",
      howToFix: "Ensure the exact entity name appears in title, H1, and first paragraph.",
      affectedUrls: [url],
      details: {
        entityMentionCount: entityClarity.entityMentionCount
      }
    });
  }
  if (!entitySignals.hasMainEntityOfPage && entitySignals.hasOrganizationSchema) {
    issues.push({
      code: "NO_MAIN_ENTITY_OF_PAGE",
      severity: "notice",
      category: "structured-data",
      title: "Schema missing mainEntityOfPage property",
      description: "Entity schema doesn't specify what the page is primarily about.",
      impact: "mainEntityOfPage helps Google understand the primary topic of each page.",
      howToFix: "Add mainEntityOfPage property pointing to the current URL or a @id reference.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      entitySignals,
      entityClarity,
      topicalCoverage,
      knowledgePanelSignals,
      entitySEOScore,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/freshness-signals.ts
import * as cheerio50 from "https://esm.sh/cheerio@1.0.0";
function extractDateSignals($, html) {
  const now = /* @__PURE__ */ new Date();
  let schemaDatePublished = null;
  let schemaDateModified = null;
  let hasSchemaDatePublished = false;
  let hasSchemaDateModified = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html() || "";
      const data = JSON.parse(content);
      const processSchema = (schema4) => {
        if (schema4.datePublished) {
          hasSchemaDatePublished = true;
          schemaDatePublished = schema4.datePublished;
        }
        if (schema4.dateModified) {
          hasSchemaDateModified = true;
          schemaDateModified = schema4.dateModified;
        }
      };
      if (Array.isArray(data)) {
        data.forEach((item) => processSchema(item));
      } else if (data["@graph"]) {
        data["@graph"].forEach(processSchema);
      } else {
        processSchema(data);
      }
    } catch {
    }
  });
  const metaDatePublished = $('meta[property="article:published_time"], meta[name="date"], meta[name="pubdate"]').attr("content");
  const metaDateModified = $('meta[property="article:modified_time"], meta[name="lastmod"]').attr("content");
  const datePatterns = [
    /(?:published|posted|written|created)(?:\s+on)?:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i,
    /(?:updated|modified|last\s+updated|revised)(?:\s+on)?:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{4}-\d{2}-\d{2})/
  ];
  const bodyText = $("body").text();
  let visibleDateOnPage = null;
  for (const pattern of datePatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      visibleDateOnPage = match[1] || match[0];
      break;
    }
  }
  let daysSincePublished = null;
  let daysSinceModified = null;
  const publishedDate = schemaDatePublished || metaDatePublished;
  if (publishedDate) {
    try {
      const date = new Date(publishedDate);
      daysSincePublished = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
    } catch {
    }
  }
  const modifiedDate = schemaDateModified || metaDateModified;
  if (modifiedDate) {
    try {
      const date = new Date(modifiedDate);
      daysSinceModified = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
    } catch {
    }
  }
  return {
    hasDatePublished: !!(metaDatePublished || schemaDatePublished),
    hasDateModified: !!(metaDateModified || schemaDateModified),
    hasSchemaDatePublished,
    hasSchemaDateModified,
    visibleDateOnPage,
    schemaDatePublished,
    schemaDateModified,
    daysSincePublished,
    daysSinceModified
  };
}
function analyzeFreshnessIndicators($, html) {
  const bodyText = $("body").text();
  const title = $("title").text();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const hasCurrentYearMention = bodyText.includes(currentYear.toString()) || title.includes(currentYear.toString());
  const recentDatePatterns = [
    new RegExp(`(${currentYear}|${currentYear - 1})`),
    /this year|this month|recently|latest|newest|updated/i
  ];
  const hasRecentDateReferences = recentDatePatterns.some((p) => p.test(bodyText));
  const hasUpdateNotice = /updated?:?\s*(on|in)?\s*\w+\s+\d{1,2},?\s+\d{4}/i.test(bodyText) || /last\s+(?:updated|modified|revised)/i.test(bodyText) || $('[class*="update"], [class*="modified"]').length > 0;
  const hasChangeLog = /changelog|change\s+log|revision\s+history|update\s+history/i.test(bodyText) || $('[id*="changelog"], [class*="changelog"]').length > 0;
  const hasVersionNumber = /v?\d+\.\d+(\.\d+)?|version\s+\d+/i.test(bodyText);
  let contentFreshnessSignal = "unknown";
  if (hasCurrentYearMention && hasRecentDateReferences) {
    contentFreshnessSignal = "fresh";
  } else if (/\d{4}/.test(title) && !new RegExp(`(${currentYear}|${currentYear - 1})`).test(title)) {
    contentFreshnessSignal = "dated";
  } else if (/guide|tutorial|how\s+to|tips|basics|fundamentals/i.test(title)) {
    contentFreshnessSignal = "evergreen";
  }
  return {
    hasCurrentYearMention,
    hasRecentDateReferences,
    hasUpdateNotice,
    hasChangeLog,
    hasVersionNumber,
    contentFreshnessSignal
  };
}
function analyzeQDFRelevance($, html) {
  const title = $("title").text().toLowerCase();
  const bodyText = $("body").text().toLowerCase();
  const qdfIndicators = [];
  let updateFrequency = "monthly";
  if (/news|breaking|announcement|release|launch/i.test(title)) {
    qdfIndicators.push("News/announcement topic");
    updateFrequency = "daily";
  }
  if (/\d{4}|trends?|statistics?|data|report/i.test(title)) {
    qdfIndicators.push("Year-specific or data content");
    updateFrequency = "quarterly";
  }
  if (/review|comparison|vs\.?|alternative/i.test(title)) {
    qdfIndicators.push("Review/comparison content");
    updateFrequency = "monthly";
  }
  if (/price|pricing|cost/i.test(title)) {
    qdfIndicators.push("Pricing information");
    updateFrequency = "monthly";
  }
  if (/best|top\s+\d+/i.test(title)) {
    qdfIndicators.push("Best-of list content");
    updateFrequency = "quarterly";
  }
  if (/election|score|result|update/i.test(bodyText)) {
    qdfIndicators.push("Time-sensitive topic signals");
    updateFrequency = "weekly";
  }
  return {
    isLikelyQDFTopic: qdfIndicators.length > 0,
    qdfIndicators,
    updateFrequencyRecommendation: updateFrequency
  };
}
function analyzeAICitationOptimization(dateSignals, freshnessIndicators) {
  const hasLastUpdatedMeta = dateSignals.hasSchemaDateModified || dateSignals.hasDateModified;
  const hasClearDateFormat = !!(dateSignals.schemaDatePublished || dateSignals.schemaDateModified);
  const freshnessSchemaComplete = dateSignals.hasSchemaDatePublished && dateSignals.hasSchemaDateModified;
  let readinessScore = 0;
  if (hasLastUpdatedMeta)
    readinessScore += 30;
  if (hasClearDateFormat)
    readinessScore += 20;
  if (freshnessSchemaComplete)
    readinessScore += 30;
  if (freshnessIndicators.hasCurrentYearMention)
    readinessScore += 10;
  if (freshnessIndicators.hasUpdateNotice)
    readinessScore += 10;
  const aiCitationReadiness = readinessScore >= 70 ? "high" : readinessScore >= 40 ? "medium" : "low";
  return {
    hasLastUpdatedMeta,
    hasClearDateFormat,
    freshnessSchemaComplete,
    aiCitationReadiness
  };
}
function calculateFreshnessScore(dateSignals, freshnessIndicators, aiOptimization) {
  let score = 50;
  if (dateSignals.hasSchemaDatePublished)
    score += 10;
  if (dateSignals.hasSchemaDateModified)
    score += 15;
  if (dateSignals.visibleDateOnPage)
    score += 5;
  if (freshnessIndicators.hasCurrentYearMention)
    score += 10;
  if (freshnessIndicators.hasUpdateNotice)
    score += 10;
  if (freshnessIndicators.contentFreshnessSignal === "fresh")
    score += 10;
  else if (freshnessIndicators.contentFreshnessSignal === "dated")
    score -= 20;
  if (dateSignals.daysSinceModified !== null) {
    if (dateSignals.daysSinceModified < 30)
      score += 10;
    else if (dateSignals.daysSinceModified < 90)
      score += 5;
    else if (dateSignals.daysSinceModified > 365)
      score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}
function analyzeFreshnessSignals(html, url) {
  const $ = cheerio50.load(html);
  const issues = [];
  const dateSignals = extractDateSignals($, html);
  const freshnessIndicators = analyzeFreshnessIndicators($, html);
  const qdfRelevance = analyzeQDFRelevance($, html);
  const aiCitationOptimization = analyzeAICitationOptimization(dateSignals, freshnessIndicators);
  const freshnessScore = calculateFreshnessScore(
    dateSignals,
    freshnessIndicators,
    aiCitationOptimization
  );
  const recommendations = [];
  if (!dateSignals.hasSchemaDateModified) {
    recommendations.push("Add dateModified to schema - boosts AI citation odds by ~18%");
  }
  if (qdfRelevance.isLikelyQDFTopic && !freshnessIndicators.hasUpdateNotice) {
    recommendations.push(`This QDF topic should be updated ${qdfRelevance.updateFrequencyRecommendation}`);
  }
  if (!freshnessIndicators.hasCurrentYearMention && /\d{4}/.test($("title").text())) {
    recommendations.push("Update year references in title and content for freshness signals");
  }
  if (!dateSignals.hasSchemaDateModified) {
    issues.push({
      code: "NO_DATE_MODIFIED_SCHEMA",
      severity: "warning",
      category: "structured-data",
      title: "Missing dateModified in schema",
      description: "Schema markup lacks dateModified property.",
      impact: "dateModified signals content freshness to search engines and AI assistants, boosting citation odds by ~18%.",
      howToFix: "Add dateModified property to your Article/WebPage schema with ISO 8601 format.",
      affectedUrls: [url],
      details: {
        hasDatePublished: dateSignals.hasSchemaDatePublished
      }
    });
  }
  if (qdfRelevance.isLikelyQDFTopic && dateSignals.daysSinceModified && dateSignals.daysSinceModified > 180) {
    issues.push({
      code: "STALE_QDF_CONTENT",
      severity: "warning",
      category: "content",
      title: "Time-sensitive content may be stale",
      description: `Content was last modified ${dateSignals.daysSinceModified} days ago on a topic that benefits from freshness.`,
      impact: "Query Deserves Freshness (QDF) prioritizes fresh content for this topic type.",
      howToFix: `Update this content ${qdfRelevance.updateFrequencyRecommendation}. Add new data, stats, or insights.`,
      affectedUrls: [url],
      details: {
        daysSinceModified: dateSignals.daysSinceModified,
        qdfIndicators: qdfRelevance.qdfIndicators,
        updateFrequency: qdfRelevance.updateFrequencyRecommendation
      }
    });
  }
  const title = $("title").text();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const yearMatch = title.match(/20\d{2}/);
  if (yearMatch && parseInt(yearMatch[0]) < currentYear - 1) {
    issues.push({
      code: "OUTDATED_YEAR_IN_TITLE",
      severity: "warning",
      category: "on-page",
      title: "Title contains outdated year",
      description: `Title mentions ${yearMatch[0]} but current year is ${currentYear}.`,
      impact: "Outdated years in titles signal stale content and reduce CTR.",
      howToFix: `Update title to ${currentYear} and refresh the content to match.`,
      affectedUrls: [url],
      details: {
        yearInTitle: yearMatch[0],
        currentYear
      }
    });
  }
  if (!dateSignals.visibleDateOnPage && /blog|article|post|news/i.test(url)) {
    issues.push({
      code: "NO_VISIBLE_DATE",
      severity: "notice",
      category: "content",
      title: "No visible publish/update date",
      description: "Content page lacks a visible date for users.",
      impact: "Users prefer seeing when content was published/updated for credibility.",
      howToFix: "Display publish date and last updated date on the page.",
      affectedUrls: [url]
    });
  }
  if (aiCitationOptimization.aiCitationReadiness === "low" && qdfRelevance.isLikelyQDFTopic) {
    issues.push({
      code: "LOW_AI_CITATION_READINESS",
      severity: "notice",
      category: "content",
      title: "Low AI citation readiness for fresh content",
      description: "This page lacks freshness signals that AI assistants prioritize.",
      impact: "AI assistants cite content 25.7% fresher than organic results. Missing signals reduce citation odds.",
      howToFix: "Add dateModified schema, visible update date, and current year mentions.",
      affectedUrls: [url],
      details: {
        aiCitationReadiness: aiCitationOptimization.aiCitationReadiness,
        missingSignals: [
          !dateSignals.hasSchemaDateModified && "dateModified schema",
          !freshnessIndicators.hasUpdateNotice && "visible update notice",
          !freshnessIndicators.hasCurrentYearMention && "current year mention"
        ].filter(Boolean)
      }
    });
  }
  return {
    issues,
    data: {
      dateSignals,
      freshnessIndicators,
      qdfRelevance,
      aiCitationOptimization,
      freshnessScore,
      recommendations
    }
  };
}

// ../agent-runtime-premium/src/checks/ai-content-structure.ts
import * as cheerio51 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/rag-chunk-readiness.ts
import * as cheerio52 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/citation-quality.ts
import * as cheerio53 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/answer-conciseness.ts
import * as cheerio54 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/brand-mention-optimization.ts
import * as cheerio55 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/ai-citation-worthiness.ts
import * as cheerio56 from "https://esm.sh/cheerio@1.0.0";

// ../agent-runtime-premium/src/checks/review-ecosystem.ts
import * as cheerio57 from "https://esm.sh/cheerio@1.0.0";

// src/analyzers/geo-analyzer.ts
import * as cheerio58 from "https://esm.sh/cheerio@1.0.0";
function generateAIFriendlyRobotsTxt(siteUrl) {
  return `# AI-Optimized robots.txt
# Generated by RankCLI - https://rankcli.dev

# Allow all standard crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/static/
Disallow: /private/

# === AI Search Crawlers ===
# OpenAI (ChatGPT)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic (Claude)
User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Google AI (Gemini/Bard)
User-agent: Google-Extended
Allow: /

# Microsoft (Copilot)
User-agent: bingbot
Allow: /

# Apple Intelligence
User-agent: Applebot-Extended
Allow: /

# Meta AI
User-agent: meta-externalagent
Allow: /

# You.com
User-agent: YouBot
Allow: /

# Cohere
User-agent: cohere-ai
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;
}

// src/fixer/schemas.ts
function generateOrganizationSchema(data) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    foundingDate: data.foundingDate,
    founder: data.founders?.map((f) => ({
      "@type": "Person",
      name: f.name,
      url: f.url
    })),
    address: data.address ? {
      "@type": "PostalAddress",
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry
    } : void 0,
    contactPoint: data.contactPoint?.map((cp) => ({
      "@type": "ContactPoint",
      telephone: cp.telephone,
      contactType: cp.contactType,
      availableLanguage: cp.availableLanguage,
      areaServed: cp.areaServed
    })),
    sameAs: data.sameAs
  };
}
function generateWebSiteSchema(data) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    description: data.description,
    publisher: data.publisher ? {
      "@type": "Organization",
      name: data.publisher
    } : void 0,
    potentialAction: data.potentialAction ? {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: data.potentialAction.target
      },
      "query-input": data.potentialAction.queryInput
    } : void 0
  };
}

// src/fixer/deterministic.ts
function xmlEscape(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function sitemap(urls) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const entries = urls.map(
    (url) => `  <url>
    <loc>${xmlEscape(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by RankCLI - https://rankcli.dev -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}
function llmsTxt(siteName, siteUrl, description, pages) {
  const base = siteUrl.replace(/\/$/, "");
  const trim = (url) => url.replace(/\/$/, "");
  const links = pages.filter((url) => trim(url) !== base).map((url) => ({ url, path: url.replace(base, "").replace(/^$/, "/") })).filter((page) => page.path !== "/").slice(0, 20).map((page) => `- [${page.path}](${page.url})`).join("\n");
  return `# ${siteName}

${description ? `> ${description}

` : ""}${base}

## Pages
- [Home](${base}/)
${links}

<!-- Generated by RankCLI - https://rankcli.dev -->
`;
}
function jsonLdBlock(siteName, siteUrl, description) {
  const base = siteUrl.replace(/\/$/, "");
  const graph = [
    generateWebSiteSchema({ name: siteName, url: base, ...description ? { description } : {} }),
    generateOrganizationSchema({ name: siteName, url: base, ...description ? { description } : {} })
  ];
  return `    <script type="application/ld+json">
${JSON.stringify(graph, null, 2).split("\n").map((line) => `    ${line}`).join("\n")}
    </script>
`;
}
var SCHEMA_CODES = [
  "SCHEMA_MISSING",
  "SCHEMA_ORG_MISSING",
  "ORGANIZATION_SCHEMA_MISSING",
  "NO_ORGANIZATION_SCHEMA",
  "NO_ENTITY_SCHEMA",
  "STRUCTURED_DATA_MISSING"
];
function metaDescriptionOf(html) {
  if (!html)
    return null;
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return match?.[1]?.trim() || null;
}
function buildDeterministicFixes(input) {
  const codes = new Set(input.issueCodes);
  const has = (...wanted) => wanted.some((code) => codes.has(code));
  const root = input.appRoot || "";
  const publicDir = input.publicDir === void 0 ? "public/" : input.publicDir.replace(/\/?$/, input.publicDir ? "/" : "");
  const served = `${root}${publicDir}`;
  const files = [];
  const addressed = [];
  const base = input.siteUrl.replace(/\/$/, "");
  const pages = input.pages?.length ? input.pages : [`${base}/`];
  const description = input.description ?? metaDescriptionOf(input.existing.indexHtml);
  if (has("ROBOTS_TXT_MISSING", "AI_BOTS_BLOCKED", "AI_CRAWLERS_BLOCKED") && !input.existing.robotsTxt) {
    files.push({
      path: `${served}robots.txt`,
      content: generateAIFriendlyRobotsTxt(base),
      message: "fix(seo): add robots.txt allowing search and AI crawlers",
      action: "created"
    });
    addressed.push("ROBOTS_TXT_MISSING");
  }
  if (has("SITEMAP_MISSING") && !input.existing.sitemapXml) {
    files.push({
      path: `${served}sitemap.xml`,
      content: sitemap(pages),
      message: "fix(seo): add sitemap.xml",
      action: "created"
    });
    addressed.push("SITEMAP_MISSING");
  }
  if (has("LLMS_TXT_MISSING") && !input.existing.llmsTxt) {
    files.push({
      path: `${served}llms.txt`,
      content: llmsTxt(input.siteName, base, description, pages),
      message: "fix(seo): add llms.txt for AI assistants",
      action: "created"
    });
    addressed.push("LLMS_TXT_MISSING");
  }
  const indexHtml = input.existing.indexHtml;
  if (has(...SCHEMA_CODES) && indexHtml && !indexHtml.includes("application/ld+json") && indexHtml.includes("</head>")) {
    files.push({
      path: `${root}index.html`,
      content: indexHtml.replace("</head>", `${jsonLdBlock(input.siteName, base, description)}  </head>`),
      message: "fix(seo): add WebSite and Organization JSON-LD",
      action: "edited"
    });
    addressed.push(...SCHEMA_CODES.filter((code) => codes.has(code)));
  }
  const name = (file) => file.path.split("/").pop();
  const created = files.filter((f) => f.action === "created").map(name);
  const edited = files.filter((f) => f.action === "edited").map(name);
  const parts = [
    created.length ? `Added ${created.join(", ")}` : null,
    edited.length ? `updated ${edited.join(", ")}` : null
  ].filter(Boolean);
  const summary = files.length ? `${parts.join("; ")} from RankCLI's templates - generated from the site's URL and name, with no AI and nothing invented.` : "No template-generatable issues were open on this report.";
  return { files, addressed, summary };
}

// src/fixer/app-root.ts
var PREFERRED_NAMES = ["web", "app", "site", "www", "frontend", "client", "ui", "saas", "marketing", "docs"];
function directoryOf(path) {
  const cut = path.lastIndexOf("/");
  return cut === -1 ? "" : path.slice(0, cut);
}
function findAppRoot(files) {
  const real = files.filter((f) => !f.includes("node_modules/") && !f.startsWith("."));
  const packageDirs = new Set(
    real.filter((f) => f === "package.json" || f.endsWith("/package.json")).map(directoryOf)
  );
  const candidates = real.filter((f) => f === "index.html" || f.endsWith("/index.html")).map(directoryOf).map((dir) => dir.endsWith("/public") ? dir.slice(0, -"/public".length) : dir === "public" ? "" : dir).filter((dir) => packageDirs.has(dir));
  if (candidates.length > 0) {
    const depth = (dir) => dir === "" ? 0 : dir.split("/").length;
    candidates.sort((a, b) => {
      if (depth(a) !== depth(b))
        return depth(a) - depth(b);
      const rank = (dir) => {
        const name = dir.split("/").pop() ?? "";
        const index = PREFERRED_NAMES.indexOf(name);
        return index === -1 ? PREFERRED_NAMES.length : index;
      };
      return rank(a) - rank(b) || a.localeCompare(b);
    });
    const best = candidates[0];
    return best === "" ? "" : `${best}/`;
  }
  const PAGES_MARKERS = ["CNAME", ".nojekyll", "404.html", "site.webmanifest"];
  const staticRoots = real.filter((f) => f === "index.html" || f.endsWith("/index.html")).map(directoryOf).filter((dir) => PAGES_MARKERS.some((marker) => real.includes(dir ? `${dir}/${marker}` : marker)));
  if (staticRoots.length > 0) {
    staticRoots.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
    return staticRoots[0] === "" ? "" : `${staticRoots[0]}/`;
  }
  const nonRoot = [...packageDirs].filter((dir) => dir !== "");
  if (packageDirs.has("") || nonRoot.length === 0)
    return "";
  nonRoot.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
  return `${nonRoot[0]}/`;
}

// src/fixer/served-dir.ts
var SERVED_DIR = {
  // Bundlers and meta-frameworks that copy a public/ directory verbatim.
  react: "public/",
  vue: "public/",
  svelte: "public/",
  angular: "public/",
  solidjs: "public/",
  qwik: "public/",
  nextjs: "public/",
  nuxt: "public/",
  astro: "public/",
  sveltekit: "static/",
  // SvelteKit's is static/, not public/
  remix: "public/",
  fresh: "static/",
  // Gatsby, Hugo, Eleventy and Docusaurus all name theirs static/.
  gatsby: "static/",
  hugo: "static/",
  eleventy: "public/",
  docusaurus: "static/",
  // Server frameworks with a public document root.
  rails: "public/",
  laravel: "public/",
  symfony: "public/",
  phoenix: "priv/static/",
  spring: "src/main/resources/static/",
  aspnet: "wwwroot/",
  // Jekyll and Pelican copy their source tree, so the app root is the served root.
  jekyll: "",
  pelican: ""
  // Python web frameworks have no single convention; the tree decides below.
};
function servedDir(framework, files, appRoot = "") {
  const known = framework ? SERVED_DIR[framework] : void 0;
  if (known !== void 0)
    return known;
  for (const candidate of ["public/", "static/", "assets/"]) {
    if (files.some((f) => f.startsWith(`${appRoot}${candidate}`)))
      return candidate;
  }
  return "";
}

// src/fixer/safety.ts
var HTML_EXT = /\.html?$/i;
var SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|astro)$/i;
function attributeValues(html, pattern) {
  const found = /* @__PURE__ */ new Set();
  for (const match of html.matchAll(pattern)) {
    const value = match[1]?.trim();
    if (value)
      found.add(value);
  }
  return found;
}
function scriptSources(html) {
  return attributeValues(html, /<script[^>]+src=["']([^"']+)["']/gi);
}
function stylesheetHrefs(html) {
  return attributeValues(html, /<link[^>]+href=["']([^"']+)["'][^>]*>/gi);
}
function verificationTokens(html) {
  const found = /* @__PURE__ */ new Set();
  for (const match of html.matchAll(/<meta[^>]+name=["']([^"']*(?:site-verification|verify|verification)[^"']*)["'][^>]*>/gi)) {
    found.add(match[1].toLowerCase());
  }
  return found;
}
function importSpecifiers(source) {
  const found = /* @__PURE__ */ new Set();
  for (const match of source.matchAll(/\bfrom\s+["']([^"']+)["']/g))
    found.add(match[1]);
  for (const match of source.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g))
    found.add(match[1]);
  return found;
}
function missing(before, after) {
  return [...before].filter((value) => !after.has(value));
}
function xmlConcern(xml) {
  const stack = [];
  for (const match of xml.matchAll(/<\/?([A-Za-z_][\w:.-]*)[^>]*?(\/?)>/g)) {
    const [tag, name, selfClosing] = match;
    if (tag.startsWith("<?") || tag.startsWith("<!"))
      continue;
    if (tag.startsWith("</")) {
      if (stack.pop() !== name)
        return `unbalanced </${name}>`;
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  return stack.length ? `unclosed <${stack[stack.length - 1]}>` : null;
}
function sitemapUrlCount(xml) {
  return [...xml.matchAll(/<loc>/gi)].length;
}
function newestLastmod(xml) {
  const dates = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)].map((m) => Date.parse(m[1].trim())).filter((t) => !Number.isNaN(t));
  return dates.length ? Math.max(...dates) : null;
}
function jsonLdConcerns(html) {
  const bad = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      bad.push(error.message);
    }
  }
  return bad;
}
var PLACEHOLDERS = [
  { pattern: /\+?1[-\s.]?\(?800\)?[-\s.]?555[-\s.]?\d{4}/i, what: "a reserved 555 phone number" },
  { pattern: /\b555[-\s.]?01\d{2}\b/, what: "a reserved 555 phone number" },
  { pattern: /\bAnytown\b/i, what: '"Anytown"' },
  { pattern: /\b123 Main (Street|St)\b/i, what: '"123 Main Street"' },
  { pattern: /your_[a-z_]+/i, what: 'an unfilled "your_..." placeholder' },
  { pattern: /\b(yourdomain|your-domain|example)\.(com|org|net)\b/i, what: "a placeholder domain" },
  { pattern: /\blorem ipsum\b/i, what: "lorem ipsum" },
  { pattern: /\bXXX-XXX-XXXX\b/i, what: "an unfilled phone template" }
];
function isSharedShell(html) {
  return /<div[^>]+id=["'](root|app|__next|__nuxt)["']/i.test(html);
}
function assessReplacement(path, original, replacement) {
  const concerns = [];
  const add = (code, detail) => concerns.push({ code, detail });
  for (const { pattern, what } of PLACEHOLDERS) {
    const hit = replacement.match(pattern);
    if (hit && !(original && pattern.test(original))) {
      add("placeholder_content", `contains ${what} (${hit[0]})`);
    }
  }
  if (/\.html?$/i.test(path) && isSharedShell(replacement)) {
    const addsCanonical = /<link[^>]+rel=["']canonical["']/i.test(replacement) && !(original && /<link[^>]+rel=["']canonical["']/i.test(original));
    if (addsCanonical) {
      add(
        "canonical_in_shared_shell",
        `${path} mounts a single-page app, so a canonical here applies to every route`
      );
    }
  }
  if (/\.json$/i.test(path) || /\.webmanifest$/i.test(path)) {
    try {
      JSON.parse(replacement);
    } catch (error) {
      add("invalid_json", error.message);
    }
  }
  if (/\.xml$/i.test(path)) {
    const problem = xmlConcern(replacement);
    if (problem)
      add("invalid_xml", problem);
  }
  if (HTML_EXT.test(path)) {
    for (const problem of jsonLdConcerns(replacement))
      add("invalid_json_ld", problem);
  }
  if (original === null)
    return concerns;
  if (replacement.length < original.length * 0.6) {
    add("shrunk", `${Math.round(replacement.length / original.length * 100)}% of the original length`);
  }
  if (HTML_EXT.test(path)) {
    for (const tag of ["</head>", "</body>", "</html>"]) {
      if (original.includes(tag) && !replacement.includes(tag))
        add("lost_closing_tag", tag);
    }
    const lostScripts = missing(scriptSources(original), scriptSources(replacement));
    if (lostScripts.length)
      add("lost_script", lostScripts.join(", "));
    const lostStyles = missing(stylesheetHrefs(original), stylesheetHrefs(replacement));
    if (lostStyles.length)
      add("lost_stylesheet", lostStyles.join(", "));
    const lostVerification = missing(verificationTokens(original), verificationTokens(replacement));
    if (lostVerification.length)
      add("lost_verification", lostVerification.join(", "));
  }
  if (SOURCE_EXT.test(path)) {
    const lostImports = missing(importSpecifiers(original), importSpecifiers(replacement));
    if (lostImports.length)
      add("lost_import", lostImports.join(", "));
  }
  if (/sitemap[^/]*\.xml$/i.test(path)) {
    const before = sitemapUrlCount(original);
    const after = sitemapUrlCount(replacement);
    if (after < before)
      add("fewer_sitemap_urls", `${before} -> ${after}`);
    const newestBefore = newestLastmod(original);
    const newestAfter = newestLastmod(replacement);
    if (newestBefore !== null && newestAfter !== null && newestAfter < newestBefore) {
      add(
        "lastmod_moved_backwards",
        `${new Date(newestBefore).toISOString().slice(0, 10)} -> ${new Date(newestAfter).toISOString().slice(0, 10)}`
      );
    }
  }
  return concerns;
}
function describeConcerns(concerns) {
  return concerns.map((c) => `${c.code} (${c.detail})`).join("; ");
}

// src/fixer/framework-guidance.ts
var DEFAULT_MAX_CHARS = 4e3;
function checkBlock(check) {
  const fix = check.howToFix?.trim();
  return [
    `### ${check.title}${check.code ? ` (${check.code})` : ""}`,
    check.description?.trim(),
    fix ? `How this framework wants it fixed:
${fix}` : null
  ].filter(Boolean).join("\n");
}
function buildFrameworkGuidance(recipe, options = {}) {
  if (!recipe)
    return "";
  const budget = options.maxChars ?? DEFAULT_MAX_CHARS;
  const reported = new Set(options.issueCodes ?? []);
  const header = [
    `## ${recipe.display_name} conventions`,
    `Renders on the server by default: ${recipe.ssr_default ? "yes" : "no"}.`,
    recipe.seo_challenges?.length ? `Known traps in this framework:
${recipe.seo_challenges.map((c) => `- ${c}`).join("\n")}` : null
  ].filter(Boolean).join("\n");
  const checks = recipe.checks ?? [];
  const relevant = checks.filter((c) => c.code && reported.has(c.code));
  const rest = checks.filter((c) => !relevant.includes(c));
  let out = header;
  let included = 0;
  for (const check of [...relevant, ...rest]) {
    const block = checkBlock(check);
    if (out.length + block.length + 2 > budget)
      break;
    out += `

${block}`;
    included++;
  }
  if (included < checks.length) {
    out += `

_(${checks.length - included} more ${recipe.display_name} checks omitted.)_`;
  }
  return out;
}

// src/tracking/github-action-template.ts
function generateWorkflow(config) {
  const cronSchedule = getCronSchedule(config.schedule);
  const sync = !!config.syncToDashboard;
  const autoFixPRs = config.features.autoFix && config.features.createPRs;
  const keyEnv = sync ? `
        env:
          RANKCLI_API_KEY: \${{ secrets.RANKCLI_API_KEY }}` : "";
  const permissions = [
    `      contents: ${autoFixPRs ? "write" : "read"}`,
    ...config.features.createIssues ? ["      issues: write"] : [],
    ...autoFixPRs ? ["      pull-requests: write"] : []
  ].join("\n");
  return `# RankCLI - Automated SEO Monitoring
# https://rankcli.dev - generated by \`rankcli setup --github-action\`

name: RankCLI SEO Check

on:
  schedule:
    - cron: '${cronSchedule}'

  workflow_dispatch:

env:
  SITE_URL: '${config.siteUrl}'

jobs:
  seo-check:
    runs-on: ubuntu-latest
    permissions:
${permissions}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install RankCLI
        run: npm install -g @rankcli/cli
${sync ? `
      # Fails fast if the secret is missing or the key was revoked, instead
      # of silently auditing on the Free tier.
      - name: Verify RankCLI API key${keyEnv}
        run: |
          if [ -z "$RANKCLI_API_KEY" ]; then
            echo "::error::The RANKCLI_API_KEY secret is not set - see .github/SEO_SETUP.md"
            exit 1
          fi
          rankcli login
` : ""}
      # Exit codes: 0 ok, 1 a gate tripped, 2 bad invocation, 3 site
      # unreachable or the URL answered 4xx/5xx. To fail this job on SEO
      # regressions, add gates, e.g.: --fail-on error --min-score 80
      - name: Run SEO audit
        id: audit${keyEnv}
        run: rankcli audit --url "$SITE_URL" --output json > "$RUNNER_TEMP/audit-report.json"
${config.features.createIssues ? `
      - name: Create/update SEO report issue
        if: \${{ !cancelled() && steps.audit.outcome != 'skipped' }}
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let report = {};
            try {
              report = JSON.parse(fs.readFileSync(process.env.RUNNER_TEMP + '/audit-report.json', 'utf8'));
            } catch (e) {
              core.setFailed('audit-report.json is not valid JSON: ' + e.message);
              return;
            }
            const all = report.issues || [];
            const errors = all.filter(i => i.severity === 'error' || i.severity === 'critical');
            const warnings = all.filter(i => i.severity === 'warning');
            const notices = all.filter(i => i.severity === 'notice' || i.severity === 'info');

            const lines = [
              \`## RankCLI SEO Report\`,
              '',
            ];
            if (report.error) {
              lines.push(\`> **Audit failed:** \${report.error}\`, '');
            }
            lines.push(
              \`**Score:** \${report.score ?? 0}/100 \xB7 **Errors:** \${errors.length} \xB7 **Warnings:** \${warnings.length} \xB7 **Notices:** \${notices.length}\`,
              '',
            );
            if (report.gate && !report.gate.passed) {
              lines.push('### CI gate failed', ...report.gate.failures.map(f => \`- \${f}\`), '');
            }
            if (errors.length > 0) {
              lines.push('### Errors', ...errors.slice(0, 15).map(i => \`- \${i.title}\`), '');
            }
            if (warnings.length > 0) {
              lines.push('### Warnings', ...warnings.slice(0, 15).map(i => \`- \${i.title}\`), '');
            }
            if (report.dashboardUrl) {
              lines.push(\`[View full report on the RankCLI dashboard](\${report.dashboardUrl})\`);
            }
            const body = lines.join('\\n');
            const title = 'SEO Report - ' + new Date().toISOString().split('T')[0];

            const issues = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'seo-report',
              state: 'open',
            });

            if (issues.data.length > 0) {
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issues.data[0].number,
                body,
              });
            } else {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title,
                body,
                labels: ['seo-report', 'automated'],
              });
            }
` : ""}${autoFixPRs ? `
      # Auto-fix needs a Solo+ plan (resolved from RANKCLI_API_KEY). It
      # always writes JSON - appliedCount is 0 when there was nothing to fix
      # or the plan doesn't include auto-fix.
      - name: Auto-fix issues
        id: autofix
        if: \${{ !cancelled() && steps.audit.outcome != 'skipped' }}${keyEnv}
        run: rankcli fix --url "$SITE_URL" --auto --output json > "$RUNNER_TEMP/fixes.json"

      - name: Check if any fixes were applied
        id: fixes
        if: \${{ !cancelled() && steps.autofix.outcome != 'skipped' }}
        run: |
          APPLIED=$(node -e "let r = {}; try { r = JSON.parse(require('fs').readFileSync(process.env.RUNNER_TEMP + '/fixes.json', 'utf8')); } catch {} console.log(r.appliedCount || 0)")
          echo "applied=$APPLIED" >> "$GITHUB_OUTPUT"

      - name: Create PR with fixes
        if: \${{ !cancelled() && steps.fixes.outputs.applied != '' && steps.fixes.outputs.applied != '0' }}
        uses: peter-evans/create-pull-request@v6
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          commit-message: 'fix(seo): automated SEO improvements'
          title: '\u{1F527} SEO Auto-Fix: Automated Improvements'
          body: |
            ## Automated SEO Fixes

            This PR was automatically generated by [RankCLI](https://rankcli.dev).

            ### Review Checklist
            - [ ] Changes look correct
            - [ ] No unintended modifications
            - [ ] Tests pass
          branch: rankcli-autofix-\${{ github.run_number }}
          labels: seo, automated
` : ""}
      - name: Save report artifact
        if: \${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: rankcli-report-\${{ github.run_number }}
          path: |
            \${{ runner.temp }}/audit-report.json${autoFixPRs ? `
            \${{ runner.temp }}/fixes.json` : ""}
          if-no-files-found: ignore
          retention-days: 90
`;
}
function getCronSchedule(schedule) {
  switch (schedule) {
    case "daily":
      return "0 9 * * *";
    case "weekly":
      return "0 9 * * 1";
    case "monthly":
      return "0 9 1 * *";
    case "manual":
      return "0 0 31 2 *";
    default:
      return "0 9 * * 1";
  }
}
function generateSecretsDoc(config) {
  let secrets = `# Required GitHub Secrets

Go to your repository Settings > Secrets and variables > Actions

`;
  if (config.syncToDashboard) {
    secrets += `
## RankCLI (required - sends audits to your dashboard)

1. \`RANKCLI_API_KEY\`
   - Create one at https://rankcli.dev/account?tab=api-keys
   - It is only passed to the RankCLI steps. The "Verify RankCLI API key"
     step fails the run if the secret is missing or the key was revoked,
     rather than silently auditing on the Free tier.
   - Your plan comes from the key: auto-fix PRs need Solo or higher.

`;
  } else {
    secrets += `
No secrets are required for this workflow as configured - it runs a local
audit and files the results as a GitHub issue using the repository's
built-in GITHUB_TOKEN. To also sync results to your RankCLI dashboard and
get auto-fix PRs (Solo plan or higher), re-run
\`rankcli setup --github-action --sync\` and add a \`RANKCLI_API_KEY\` secret.

`;
  }
  return secrets;
}

// src/audit/discovery/link-crawler.ts
var HIGH_PRIORITY_PATTERNS = [
  /^\/(pricing|about|features|contact|demo|signup|login|blog)\/?$/i,
  /^\/(products?|services?|solutions?|plans?)\/?$/i,
  /^\/(docs?|documentation|help|support|faq)\/?$/i,
  /^\/(careers?|jobs?|team|company)\/?$/i
];
var MEDIUM_PRIORITY_PATTERNS = [
  /^\/(privacy|terms|legal|security)\/?$/i,
  /^\/[a-z0-9-]+\/?$/i
  // Top-level pages
];
var EXCLUDE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|zip|tar|gz)$/i,
  // Images & archives
  /\.(json|xml|txt|webmanifest|rss|atom)$/i,
  // Data files (not HTML)
  /^(mailto:|tel:|javascript:|#)/i,
  // Non-HTTP
  /\/(api|_next|static|assets|cdn)\//i,
  // Technical paths
  /[?&](utm_|ref=|source=)/i
  // Tracking params
];
function extractLinks2(html, baseUrl) {
  const base = new URL(baseUrl);
  const links = /* @__PURE__ */ new Set();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(href))) {
        continue;
      }
      let url;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        url = new URL(href);
      } else if (href.startsWith("/")) {
        url = new URL(href, base);
      } else {
        continue;
      }
      if (url.hostname !== base.hostname) {
        continue;
      }
      const normalized = normalizeUrl3(url);
      if (normalized) {
        links.add(normalized);
      }
    } catch {
    }
  }
  return Array.from(links);
}
function normalizeUrl3(url) {
  url.hash = "";
  const paramsToRemove = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"];
  for (const param of paramsToRemove) {
    url.searchParams.delete(param);
  }
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname === "" || pathname === "/") {
    return null;
  }
  return `${url.protocol}//${url.hostname}${pathname}${url.search}`;
}
function calculatePriority(url) {
  try {
    const pathname = new URL(url).pathname;
    for (const pattern of HIGH_PRIORITY_PATTERNS) {
      if (pattern.test(pathname)) {
        return 9;
      }
    }
    for (const pattern of MEDIUM_PRIORITY_PATTERNS) {
      if (pattern.test(pathname)) {
        return 6;
      }
    }
    const depth = (pathname.match(/\//g) || []).length;
    if (depth >= 3) {
      return 2;
    }
    if (depth === 2) {
      return 4;
    }
    return 5;
  } catch {
    return 1;
  }
}
function discoverPagesFromLinks(baseUrl, html, maxPages = 5) {
  const links = extractLinks2(html, baseUrl);
  const pages = links.map((url) => ({
    url,
    source: "internal-link",
    priority: calculatePriority(url)
  }));
  pages.sort((a, b) => b.priority - a.priority);
  return pages.slice(0, maxPages);
}
function parseSitemap(xml, baseUrl) {
  const pages = [];
  const base = new URL(baseUrl);
  const locRegex = /<loc>([^<]+)<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    try {
      const url = new URL(match[1]);
      if (url.hostname !== base.hostname) {
        continue;
      }
      if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        continue;
      }
      pages.push({
        url: url.href,
        source: "sitemap",
        priority: calculatePriority(url.href)
      });
    } catch {
    }
  }
  return pages;
}
function mergePages(...pageSets) {
  const seen = /* @__PURE__ */ new Map();
  for (const pages of pageSets) {
    for (const page of pages) {
      const existing = seen.get(page.url);
      if (!existing || page.priority > existing.priority) {
        seen.set(page.url, page);
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => b.priority - a.priority);
}

// src/audit/discovery/repo-routes.ts
function detectFramework3(packageJson, files) {
  if (!packageJson)
    return "unknown";
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps["next"]) {
    return "nextjs";
  }
  if (deps["astro"]) {
    return "astro";
  }
  if (deps["@sveltejs/kit"]) {
    return "sveltekit";
  }
  if (deps["vue-router"] || deps["@vue/router"]) {
    return "vue";
  }
  if (deps["react"] && deps["vite"]) {
    return "react-vite";
  }
  if (deps["react"] || deps["react-dom"]) {
    const hasRouterFile = files.some(
      (f) => f.match(/routes?\.(tsx?|jsx?)$/) || f.includes("router") || f.endsWith("App.tsx") || f.endsWith("App.jsx")
    );
    if (hasRouterFile) {
      return "react";
    }
  }
  return "unknown";
}
async function discoverRoutesFromRepo(files, framework, fetchFile) {
  switch (framework) {
    case "nextjs":
      return discoverNextRoutes(files);
    case "astro":
      return discoverAstroRoutes(files);
    case "react":
    case "react-vite":
      return discoverReactRouterRoutes(files, fetchFile);
    case "vue":
      return discoverVueRouterRoutes(files, fetchFile);
    case "sveltekit":
      return discoverSvelteRoutes(files);
    default:
      return [];
  }
}
function discoverNextRoutes(files) {
  const routes = [];
  for (const file of files) {
    const appMatch = file.match(/^app\/(.*)\/page\.(tsx?|jsx?)$/);
    if (appMatch) {
      let path = "/" + appMatch[1];
      path = path.replace(/\/\([^)]+\)/g, "");
      if (path === "/")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
      continue;
    }
    if (file.match(/^app\/page\.(tsx?|jsx?)$/)) {
      routes.push({
        path: "/",
        type: "static",
        sourceFile: file
      });
      continue;
    }
    const pagesMatch = file.match(/^pages\/(.+)\.(tsx?|jsx?)$/);
    if (pagesMatch) {
      const pagePath = pagesMatch[1];
      if (pagePath.startsWith("_") || pagePath.startsWith("api/")) {
        continue;
      }
      let path = "/" + pagePath;
      path = path.replace(/\/index$/, "");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  const seen = /* @__PURE__ */ new Map();
  for (const route of routes) {
    if (!seen.has(route.path)) {
      seen.set(route.path, route);
    }
  }
  return Array.from(seen.values());
}
function discoverAstroRoutes(files) {
  const routes = [];
  for (const file of files) {
    const match = file.match(/^src\/pages\/(.+)\.(astro|md|mdx)$/);
    if (match) {
      let path = "/" + match[1];
      path = path.replace(/\/index$/, "");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  return routes;
}
function discoverSvelteRoutes(files) {
  const routes = [];
  for (const file of files) {
    const match = file.match(/^src\/routes\/(.*)\/?\+page\.svelte$/);
    if (match) {
      let path = "/" + (match[1] || "");
      path = path.replace(/\/\([^)]+\)/g, "");
      path = path.replace(/\/+/g, "/");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  return routes;
}
async function discoverReactRouterRoutes(files, fetchFile) {
  const routerFiles = files.filter(
    (f) => f.match(/routes?\.(tsx?|jsx?)$/) || f.includes("router") || f.endsWith("App.tsx") || f.endsWith("App.jsx") || f.includes("Router")
  );
  const routes = [];
  for (const file of routerFiles) {
    const content = await fetchFile(file);
    if (!content)
      continue;
    const patterns = [
      /<Route[^>]*\spath=["']([^"']+)["']/g,
      /{\s*path:\s*["']([^"']+)["']/g,
      /createBrowserRouter\([^)]*path:\s*["']([^"']+)["']/g
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1];
        if (path === "*" || path.includes("*"))
          continue;
        routes.push({
          path,
          type: path.includes(":") ? "dynamic" : "static",
          sourceFile: file
        });
      }
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return routes.filter((r) => {
    if (seen.has(r.path))
      return false;
    seen.add(r.path);
    return true;
  });
}
async function discoverVueRouterRoutes(files, fetchFile) {
  const routerFiles = files.filter(
    (f) => f.match(/router\/index\.(ts|js)$/) || f.match(/router\.(ts|js)$/) || f.includes("routes")
  );
  const routes = [];
  for (const file of routerFiles) {
    const content = await fetchFile(file);
    if (!content)
      continue;
    const pathRegex = /path:\s*["']([^"']+)["']/g;
    let match;
    while ((match = pathRegex.exec(content)) !== null) {
      const path = match[1];
      if (path.includes("*") || path === "/:pathMatch(.*)")
        continue;
      routes.push({
        path,
        type: path.includes(":") ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return routes.filter((r) => {
    if (seen.has(r.path))
      return false;
    seen.add(r.path);
    return true;
  });
}
function routesToUrls(routes, baseUrl, maxUrls = 5) {
  const base = new URL(baseUrl);
  return routes.filter((r) => r.type === "static").slice(0, maxUrls).map((r) => {
    const url = new URL(r.path, base);
    return url.href;
  });
}
export {
  ISSUE_DEFINITIONS,
  analyzeAnchorText,
  analyzeCanonicalAdvanced,
  analyzeClientRendering,
  analyzeContentFreshness,
  analyzeConversionElements,
  analyzeDOMStructure,
  analyzeEntitySEO,
  analyzeFreshnessSignals,
  analyzeFunnelIntent,
  analyzeHreflang,
  analyzeImages,
  analyzeInteractiveTools,
  analyzeKeywordPlacement,
  analyzeKeywords,
  analyzeLinks,
  analyzeLocalSEO,
  analyzeMobile,
  analyzeModernImages,
  analyzeNavBoostSignals,
  analyzeOnPage,
  analyzePagination,
  analyzePerformance,
  analyzePlatformPresence,
  analyzeRedirectChain,
  analyzeRedirects,
  analyzeResponsiveImages,
  analyzeSERPPreview,
  analyzeSecurity,
  analyzeSecurityHeaders,
  analyzeSocialMeta,
  analyzeStructuredData,
  analyzeTopicalClusters,
  analyzeTrackerBloat,
  analyzeUrlSafety,
  assessReplacement,
  buildDeterministicFixes,
  buildFrameworkGuidance,
  checkAIBotBlocking,
  checkCertificate,
  checkLlmsTxt,
  checkMobileResources,
  checkRedirects,
  checkRobotsTxt,
  checkSitemap,
  describeConcerns,
  detectFramework3 as detectFramework,
  detectSoft404,
  detectTechnologies,
  discoverPagesFromLinks,
  discoverRoutesFromRepo,
  findAppRoot,
  formatReport,
  generateSecretsDoc,
  generateWorkflow,
  loadRecipe,
  mergePages,
  parseSitemap,
  routesToUrls,
  runAIReadinessChecks,
  runCrawlabilityChecks,
  runFullAudit,
  servedDir,
  suggestSchemaTypes,
  urlSafetyDatabase
};
