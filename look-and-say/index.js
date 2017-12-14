(function init() {
  let n = new URLSearchParams(location.search).get("n");
  document.getElementById("n").value = Number(n) || 10;
  document.getElementById("generate").onclick = generate;
  document.getElementById("clear").onclick = clear;
})();

const cacheSize = 8;

function* process(g) {
  let prev = g.next().value;
  let count = 1;
  for (const item of g) {
    if (prev === item) {
      count++;
    } else {
      yield count;
      yield prev;
      prev = item;
      count = 1;
    }
  }
  yield count;
  yield prev;
}

function* ant(n) {
  if (n <= 0) {
    yield 1;
    return;
  }
  let c = cache[(n - 10) % 3];
  if (n >= 10 && c) {
    yield* c;
    yield* drop(cacheSize, process(ant(n - 1)));
  } else {
    yield* process(ant(n - 1));
  }
}

function* take(n, g) {
  while (n-- > 0) {
    yield g.next().value;
  }
}

function drop(n, g) {
  while (n-- > 0) {
    g.next();
  }
  return g;
}

const cache = [];
for (let i = 10; i < 13; i++) {
  cache[i - 10] = [...take(cacheSize, ant(i))];
}

function* buffer(g) {
  let b = "";
  for (const item of g) {
    b += item;
    if (Math.random() < 0.1) {
      yield b;
      b = "";
    }
  }
  yield b;
}

const m = new Set();

function generate() {
  const result = document.getElementById("result");
  const n = Number(document.getElementById("n").value);

  const div = result.appendChild(document.createElement("div"));
  div.classList.add("line");
  m.add(div);

  const progress = div.appendChild(document.createElement("div"));
  progress.classList.add("progress");

  const title = div.appendChild(document.createElement("div"));

  const output = div.appendChild(document.createElement("div"));
  output.className = "output";

  const g = buffer(ant(n));

  let length = 0;
  let estimate = 2.04 * Math.exp(0.265 * n);
  window.requestAnimationFrame(function r() {
    try {
      const { value, done } = g.next();

      if (!m.has(div)) {
        return;
      }
      if (!done) {
        length += String(value).length;

        const percent =
          Number(Math.min(100, 100 * (length / estimate))).toFixed(2) + "%";

        title.textContent = `${n}: ${length} (${percent})`;
        progress.style.width = percent;
        output.appendChild(document.createTextNode(value));

        window.requestAnimationFrame(r);
      } else {
        title.textContent = `${n}: ${length}`;
        div.removeChild(progress);
        output.appendChild(document.createTextNode("."));
      }
    } catch (e) {
      title.textContent = `${n}: Failed`;
      const pre = document.createElement("pre");
      pre.textContent = e.stack;
      output.appendChild(pre);
    }
  });
}

function clear() {
  m.clear();
  const result = document.getElementById("result");
  result.innerText = "";
}
