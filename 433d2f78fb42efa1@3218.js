// https://observablehq.com/@notanaccent/transitioning-hierarchical-layouts@3218
import define1 from "./5432439324f2c616@168.js";
import define2 from "./e93997d5089d7165@2283.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Transitioning Hierarchical Layouts`
)});
  main.variable(observer("viewof currLayout")).define("viewof currLayout", ["radio","root"], function(radio,root){return(
radio({
  // radio buttons borrowed from Jeremy Ashkenas
  // observablehq.com/@jashkenas/inputs#radioDemo
  options: Object.keys(root.layout),
  value: Object.keys(root.layout)[0]
})
)});
  main.variable(observer("currLayout")).define("currLayout", ["Generators", "viewof currLayout"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["exposeLayout","d3","width","height","root","linkBook"], function(exposeLayout,d3,width,height,root,linkBook)
{
  const layout = "Icicle"; // Initial layout
  exposeLayout(layout); // pulls layout parameters to surface of each node

  const svg = d3
    .create("svg")
    .attr("viewBox", [-10, -10, width + 20, height + 20]);

  // Lines between node shapes
  const links = svg
    .append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("class", "links")
    .attr("d", d => linkBook[layout](d))
    .attr("id", d => "i" + d.target.id);

  // Rectangles morph into circles when rx/ry set
  const nodes = svg
    .append("g")
    .selectAll("rect")
    .data(root.descendants())
    .join("rect")
    .attr("class", "nodes")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("id", d => "n" + d.id);

  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`The chart will be as tall as **height**:`
)});
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer()).define(["transition","currLayout","md"], function(transition,currLayout,md)
{
  // links radio buttons to the transition function
  transition(currLayout);
  return md`Each new layout calls **transition**:`;
}
);
  main.variable(observer("transition")).define("transition", ["d3","exposeLayout","simBook","linkBook"], function(d3,exposeLayout,simBook,linkBook){return(
layout => {
  // morphs the nodes & links to a new layout
  let nodes = d3.selectAll(".nodes");
  let links = d3.selectAll(".links");

  exposeLayout(layout); // brings layout parameters to surface

  simBook.current ? simBook.current.stop() : null; // stops any active sim

  const t = d3.transition().duration(2500);

  nodes
    .transition(t)
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("rx", d => d.rx)
    .attr("ry", d => d.ry)
    .attr("height", d => d.h)
    .attr("width", d => d.w)
    .attr("stroke", d => d.s)
    .attr("stroke-opacity", d => d.so)
    .attr("stroke-width", d => d.sw)
    .attr("fill", d => d.f)
    .attr("fill-opacity", d => d.fo);

  links
    .transition(t)
    .attr("d", d => linkBook[layout](d))
    .attr("stroke", d => d.target.l)
    .attr("stroke-width", d => d.target.lw)
    .attr("stroke-opacity", d => d.target.lo);

  linkBook.current = linkBook[layout]; // applys the layout's link generator

  simBook.current = simBook[layout](); // applys the layout's simulation if able

  return layout;
}
)});
  main.variable(observer("exposeLayout")).define("exposeLayout", ["root"], function(root){return(
function(layout) {
  // pulls parameters for selected layout to surface of each node
  root.descendants().forEach(d => {
    let q = d.layout[layout];

    if (layout != "Force") {
      d.x = q.x;
      d.y = q.y;
    }
    for (const p in q) {
      if (q != "x" || q != "y") {
        d[p] = q[p];
      }
    }
  });

  return root;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Layouts are prepared by embedding parameters within **root**:`
)});
  main.variable(observer()).define(["height","width","d3","root","linkBook","link","simBook","animateForces","md"], function(height,width,d3,root,linkBook,link,simBook,animateForces,md)
{
  let ref = "https://observablehq.com/@d3/force-directed-tree";
  let layout = "Forces";
  let radius = Math.min(height, width) / 2;
  let mid = { x: width / 2, y: height / 2 };

  d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(root);

  root.descendants().forEach((d, i) => {
    let r = 3.5;
    d.layout[layout] = {
      children: d.children,
      x: mid.x - d.y * Math.sin(d.x),
      y: mid.y - d.y * Math.cos(d.x),
      x0: mid.x - d.y * Math.sin(d.x) - r,
      y0: mid.y - d.y * Math.cos(d.x) - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: d.children ? "#000" : "#fff",
      so: 1,
      sw: 1.5,
      f: d.children ? "#fff" : "#000",
      fo: 1,
      l: "#999",
      lw: 1.4,
      lo: 0.6
    };
  });

  linkBook[layout] = d => link.Straight(d);

  simBook[layout] = animateForces;

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","width","height","root","linkBook","link","simBook","md"], function(d3,width,height,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/circle-packing-monochrome";
  let layout = "Circles";
  d3
    .pack()
    .size([width, height])
    .padding(3)(root);

  let mid = { x: width / 2, y: height / 2 };

  root.descendants().forEach((d, i) => {
    let r = d.r;
    d.layout[layout] = {
      children: d.children,
      x: d.x,
      y: d.y,
      x0: d.x - r,
      y0: d.y - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: "0.4",
      l: "#555",
      lw: 1.4,
      lo: 0
    };
  });

  linkBook[layout] = d => link.Straight(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["height","width","d3","root","linkBook","link","simBook","md"], function(height,width,d3,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/radial-tidy-tree";
  let layout = "rTree";
  let radius = Math.min(height, width) / 2;
  let mid = { x: width / 2, y: height / 2 };

  d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(root);

  root.descendants().forEach((d, i) => {
    let r = 3;
    d.layout[layout] = {
      children: d.children,
      x: mid.x - d.y * Math.sin(d.x),
      y: mid.y - d.y * Math.cos(d.x),
      x0: mid.x - d.y * Math.sin(d.x) - r,
      y0: mid.y - d.y * Math.cos(d.x) - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.Radial(d, mid);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["width","height","d3","root","linkBook","link","simBook","md"], function(width,height,d3,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/radial-dendrogram";
  let layout = "rDendro";
  let mid = { x: width / 2, y: height / 2 };

  d3.cluster().size([2 * Math.PI, Math.min(height, width) / 2])(root);

  root.descendants().forEach((d, i) => {
    let r = 3;
    d.layout[layout] = {
      children: d.children,
      cpx: mid.x,
      cpy: mid.y,
      x: mid.x - d.y * Math.sin(d.x),
      y: mid.y - d.y * Math.cos(d.x),
      x0: mid.x - d.y * Math.sin(d.x) - r,
      y0: mid.y - d.y * Math.cos(d.x) - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.Radial(d, mid);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","height","width","root","linkBook","link","simBook","md"], function(d3,height,width,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/cluster-dendrogram";
  let layout = "cDendro";

  d3.cluster().size([height, width])(root);

  root.descendants().forEach((d, i) => {
    let r = 4;
    d.layout[layout] = {
      children: d.children,
      x: d.y,
      y: d.x,
      x0: d.y - r,
      y0: d.x - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555", //"lightsteelblue",
      fo: d.children ? 1 : 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.Horizontal(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","height","width","root","linkBook","link","simBook","md"], function(d3,height,width,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/tidy-tree";
  let layout = "vTree";

  d3.tree().size([height, width])(root);

  root.descendants().forEach((d, i) => {
    let r = 4;
    d.layout[layout] = {
      children: d.children,
      x: d.y,
      y: d.x,
      x0: d.y - r,
      y0: d.x - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555", //"lightsteelblue",
      fo: d.children ? 1 : 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.Horizontal(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","width","height","root","linkBook","link","simBook","md"], function(d3,width,height,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/tidy-tree"; // but flipped
  let layout = "hTree";

  d3.tree().size([width, height])(root);

  root.descendants().forEach((d, i) => {
    let r = 4;
    d.layout[layout] = {
      children: d.children,
      x: d.x,
      y: d.y,
      x0: d.x - r,
      y0: d.y - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555", //"lightsteelblue",
      fo: d.children ? 1 : 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.Vertical(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","height","width","root","linkBook","link","simBook","md"], function(d3,height,width,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/nested-treemap";
  let layout = "Treemap";

  d3
    .treemap()
    .size([height, width])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)(root);

  root.descendants().forEach((d, i) => {
    let dx = Math.abs(d.x0 - d.x1);
    let dy = Math.abs(d.y0 - d.y1);
    let r = Math.min(dx, dy) / 2;
    d.layout[layout] = {
      children: d.children,
      x: d.y0 + dy / 2,
      y: d.x0 + dx / 2,
      x0: d.y0,
      y0: d.x0,
      rx: 0,
      ry: 0,
      h: dx,
      w: dy,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: d.height == 0 ? 0.4 : 0,
      l: "#555",
      lw: 1.4,
      lo: 0
    };
  });

  linkBook[layout] = d => link.Straight(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["d3","height","width","root","linkBook","link","simBook","md"], function(d3,height,width,root,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/icicle"
  let layout = "Icicle";

  d3
    .partition()
    .size([height, width])
    .padding(1)(root);

  root.descendants().forEach((d, i) => {
    let dx = Math.abs(d.x0 - d.x1);
    let dy = Math.abs(d.y0 - d.y1);
    let r = Math.min(dx, dy) / 2;
    d.layout[layout] = {
      children: d.children,
      x: d.y0 + dy / 2,
      y: d.x0 + dx / 2,
      x0: d.y0,
      y0: d.x0,
      w: dy,
      h: dx,
      rx: 0,
      ry: 0,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: 0.4,
      l: "#555",
      lw: 1.4,
      lo: 0
    };
  });

  linkBook[layout] = d => link.Horizontal(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["width","root","height","linkBook","link","simBook","md"], function(width,root,height,linkBook,link,simBook,md)
{
  let ref = "https://observablehq.com/@d3/indented-tree"
  let layout = "Indented";
  let i = 0;
  let spacing = {
    x: width / (root.height + 1) / 4,
    y: height / root.descendants().length
  };

  root.eachBefore(d => (d.index = i++)).sort((a, b) => a.value - b.value);

  root.descendants().forEach((d, i) => {
    let r = 3;
    d.layout[layout] = {
      children: d.children,
      x: d.depth * spacing.x + 1,
      y: d.index * spacing.y + 1,
      x0: d.depth * spacing.x - r,
      y0: d.index * spacing.y - r,
      rx: r,
      ry: r,
      h: 2 * r,
      w: 2 * r,
      s: "#555",
      so: 0.4,
      sw: 1.4,
      f: "#555",
      fo: "0.4",
      l: "#555",
      lw: 1.4,
      lo: 0.4
    };
  });

  linkBook[layout] = d => link.CornerVertical(d);

  simBook[layout] = d => {};

  return md`[${layout}](${ref})`;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`Collection of link generators. Matching path geometry for smooth transitions.`
)});
  main.variable(observer("link")).define("link", ["d3","point2Radial"], function(d3,point2Radial)
{
  // variety pack of link path generators
  // similar to d3.linkHorizontal ect.
  // but with 0-length lines for smooth transitions with other links
  // https://github.com/d3/d3-shape/blob/v1.3.7/README.md#links
  var x0, y0, x1, y1, p;

  function init(d) {
    // Common code
    x0 = d.source.x;
    y0 = d.source.y;
    x1 = d.target.x;
    y1 = d.target.y;
    p = d3.path();
    p.moveTo(x0, y0);
  }

  return {
    CornerVertical: d => {
      // 90 degree corner starting vertically from source
      init(d);

      p.lineTo(x0, y1);
      p.bezierCurveTo(x0, y1, x0, y1, x1, y1);
      p.lineTo(x1, y1);
      return p.toString();
    },

    CornerHorizontal: d => {
      // 90 degree corner starting horizontally from source
      init(d);

      p.lineTo(x1, y0);
      p.bezierCurveTo(x1, y0, x1, y0, x1, y1);
      p.lineTo(x1, y1);
      return p.toString();
    },

    Straight: d => {
      // just a straight line
      init(d);

      p.lineTo(x0, y0);
      p.bezierCurveTo(x0, y0, x1, y1, x1, y1);
      p.lineTo(x1, y1);
      return p.toString();
    },

    Radial: (d, cp) => {
      // similar to d3.linkRadial
      // github.com/d3/d3-shape/blob/master/src/link/index.js#L62
      init(d);

      let [a0, r0] = point2Radial(x0 - cp.x, y0 - cp.y);
      let [a1, r1] = point2Radial(x1 - cp.x, y1 - cp.y);

      let [xc1, yc1] = d3.pointRadial(a0, (r1 + r0) / 2);
      let [xc2, yc2] = d3.pointRadial(a1, (r1 + r0) / 2);

      p.lineTo(x0, y0);
      p.bezierCurveTo(xc1 + cp.x, yc1 + cp.y, xc2 + cp.x, yc2 + cp.y, x1, y1);
      p.lineTo(x1, y1);
      let str = p.toString();

      return str;
    },

    Vertical: d => {
      // similar to d3.linkVertical
      init(d);

      p.lineTo(x0, y0);
      p.bezierCurveTo(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, x1, y1);
      p.lineTo(x1, y1);
      return p.toString();
    },

    Horizontal: d => {
      // similar to d3.linkHorizontal
      init(d);

      p.lineTo(x0, y0);
      p.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
      p.lineTo(x1, y1);
      return p.toString();
    }
  };
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`Helper functions for force simulation:`
)});
  main.variable(observer("updateMotion")).define("updateMotion", ["d3","linkBook"], function(d3,linkBook){return(
function() {
  // observablehq.com/@d3/force-directed-tree
  let nodes = d3.selectAll(".nodes");
  let links = d3.selectAll(".links");

  links.attr("d", d => linkBook.current(d));

  nodes
    .attr("x", d => (d.x0 = d.x - d3.select("#n" + d.id).attr("width") / 2))
    .attr("y", d => (d.y0 = d.y - d3.select("#n" + d.id).attr("height") / 2));
}
)});
  main.variable(observer("animateForces")).define("animateForces", ["root","d3","height","width","updateMotion"], function(root,d3,height,width,updateMotion){return(
function() {
  // observablehq.com/@d3/force-directed-tree
  let nodes = root.descendants();
  let links = root.links();

  let sim = d3
    .forceSimulation(nodes)
    .alpha(0.5)
    .force(
      "link",
      d3
        .forceLink(links)
        .id(d => d.id)
        .distance(0)
        .strength(0.5)
    )
    .force("charge", d3.forceManyBody().strength((-50 * height) / 800))
    .force("y", d3.forceX(width / 2))
    .force("x", d3.forceY(height / 2))
    .on("tick", () => updateMotion());

  return sim;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Nodes are stored in **root**, link generators in **linkBook**, and simulations in **simBook**:`
)});
  main.variable(observer("simBook")).define("simBook", function()
{
  // holds a simulation per layout
  return { current: null };
}
);
  main.variable(observer("linkBook")).define("linkBook", function()
{
  // holds a link generator per layout
  return { current: null };
}
);
  main.variable(observer("root")).define("root", ["d3","data"], function(d3,data)
{
  // Constructs a root node
  // github.com/d3/d3-hierarchy/blob/v1.1.9/README.md#hierarchy
  let x = d3
    .hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => a.value - b.value);

  x.descendants().forEach((d, i) => {
    d.id = i; // passed to svg element id
    d.layout = {}; // where each layout will be stored
  });

  return x;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`[Borrowed](https://observablehq.com/@observablehq/introduction-to-imports) from elsewhere on Observable:`
)});
  const child1 = runtime.module(define1);
  main.import("data", child1);
  const child2 = runtime.module(define2);
  main.import("radio", child2);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Other:`
)});
  main.variable(observer("point2Radial")).define("point2Radial", function(){return(
(dx, dy) => {
  // Opposite of https://github.com/d3/d3-shape/blob/master/src/pointRadial.js
  let a = Math.atan2(dy, dx) + Math.PI / 2;
  let r = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));

  return [a, r];
}
)});
  main.variable(observer()).define(["width"], function(width){return(
"width = " + width
)});
  main.variable(observer()).define(function(){return(
"TODO"
)});
  main.variable(observer()).define(function(){return(
"Notes:"
)});
  return main;
}
