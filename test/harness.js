// Loads game.js into a small stand-in for the browser (no dependencies), so the real game code runs under node --test.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function element(id) {
  const listeners = {};
  return {
    id, hidden: false, textContent: "", dataset: {}, width: 480, height: 480, listeners,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    dispatch(type, event = {}) { for (const fn of listeners[type] || []) fn({ preventDefault() {}, ...event }); },
    focus() {},
    getContext() {
      return new Proxy({}, { get: (target, key) => (key in target ? target[key] : () => {}), set: (target, key, value) => { target[key] = value; return true; } });
    },
  };
}

function loadGame({ stored = {}, random = () => 0.5 } = {}) {
  const elements = {};
  const byId = (id) => (elements[id] ||= element(id));
  const docListeners = {};
  const storage = { ...stored };
  const timers = [];
  const padButtons = ["up", "left", "down", "right"].map((dir) => Object.assign(element("pad-" + dir), { dataset: { dir } }));
  const context = {
    console,
    document: {
      documentElement: {},
      getElementById: byId,
      addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
      querySelectorAll: (selector) => (selector === ".pad button" ? padButtons : []),
    },
    getComputedStyle: () => ({ getPropertyValue: () => "#16212d" }),
    localStorage: {
      getItem: (key) => (key in storage ? storage[key] : null),
      setItem: (key, value) => { storage[key] = String(value); },
    },
    setInterval: (fn, ms) => { timers.push(ms); return timers.length; },
    clearInterval: () => {},
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext("Math.random = () => __random()", Object.assign(context, { __random: random }));
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8"), context, { filename: "game.js" });
  const key = (code) => { for (const fn of docListeners.keydown || []) fn({ code, preventDefault() {} }); };
  return { game: context.window.snake, elements: byId, storage, timers, key, padButtons };
}

// The free cells in the order game.js lists them (x outer, y inner), so a test can pick where food lands.
function randomFor(cell, taken, size = 20) {
  const busy = new Set(taken.map(([x, y]) => x + "," + y));
  const free = [];
  for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) if (!busy.has(x + "," + y)) free.push(x + "," + y);
  const index = free.indexOf(cell.join(","));
  if (index < 0) throw new Error("cell is taken");
  return (index + 0.5) / free.length;
}

module.exports = { loadGame, randomFor };
