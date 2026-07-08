// Interactive probing-pipeline diagram for the geographic world model post.
// Drag the layer slider to move the residual-stream readout and see the
// measured probe accuracy at that layer (template "The city of {name}").

class GeollmPipeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container ${containerId} not found`);

        // [layer, R2 lat, R2 lon, median km] — outputs/results/probe_results.csv
        this.DATA = [
            [0, 0.296, 0.474, 3619], [1, 0.394, 0.600, 3054], [2, 0.468, 0.676, 2867],
            [3, 0.648, 0.773, 2311], [4, 0.720, 0.818, 1993], [5, 0.759, 0.852, 1815],
            [6, 0.787, 0.858, 1769], [7, 0.824, 0.877, 1630], [8, 0.845, 0.893, 1417],
            [9, 0.845, 0.897, 1360], [10, 0.846, 0.903, 1323], [11, 0.848, 0.904, 1304],
            [12, 0.848, 0.903, 1375], [13, 0.851, 0.905, 1300], [14, 0.848, 0.905, 1311],
            [15, 0.858, 0.916, 1177], [16, 0.875, 0.927, 1076], [17, 0.895, 0.936, 962],
            [18, 0.904, 0.939, 870], [19, 0.904, 0.941, 855], [20, 0.913, 0.945, 763],
            [21, 0.912, 0.947, 766], [22, 0.912, 0.947, 750], [23, 0.911, 0.947, 773],
            [24, 0.910, 0.948, 783], [25, 0.911, 0.945, 776], [26, 0.910, 0.945, 763],
            [27, 0.910, 0.944, 796], [28, 0.907, 0.944, 792], [29, 0.906, 0.944, 818],
            [30, 0.903, 0.943, 825], [31, 0.901, 0.939, 868], [32, 0.901, 0.941, 836],
        ];
        this.layer = 22;
        this.blue = "#2e6f95";
        this.render();
    }

    el(tag, attrs, parent, text) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (text !== undefined) e.textContent = text;
        (parent || this.svg).appendChild(e);
        return e;
    }

    // layer L (0 = embeddings out, 32 = last block out) -> tap y
    tapY(L) { return 428 - (L / 32) * 240; }

    render() {
        this.container.innerHTML = "";
        this.container.style.textAlign = "center";

        const controls = document.createElement("div");
        controls.style.cssText = "font-family:Helvetica,Arial,sans-serif;font-size:14px;margin:6px 0;";
        controls.innerHTML =
            `read the residual stream after layer <b><span id="gp-lnum">22</span></b> ` +
            `&nbsp;<input id="gp-slider" type="range" min="0" max="32" value="22" ` +
            `style="width:220px;vertical-align:middle">`;
        this.container.appendChild(controls);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 980 560");
        this.svg.setAttribute("style", "max-width:980px;width:100%;height:auto;font-family:Helvetica,Arial,sans-serif;");
        this.container.appendChild(this.svg);

        const defs = this.el("defs", {});
        for (const [id, color] of [["gp-arr", "#444444"], ["gp-arrb", this.blue]]) {
            const m = this.el("marker", {
                id, viewBox: "0 0 10 10", refX: 9, refY: 5,
                markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse",
            }, defs);
            this.el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color }, m);
        }

        // residual stream lines
        const xs = [90, 155, 220, 285, 350];
        for (const x of xs) {
            this.el("line", { x1: x, y1: 476, x2: x, y2: 150, stroke: "#bbbbbb", "stroke-width": 1.5, "marker-end": "url(#gp-arr)" });
        }
        this.el("line", { x1: 415, y1: 476, x2: 415, y2: 150, stroke: this.blue, "stroke-width": 2.5, "marker-end": "url(#gp-arrb)" });

        // bands: embeddings + blocks
        const band = (y, label, hi) => {
            this.el("rect", {
                x: 60, y, width: 420, height: 30, rx: 6,
                fill: hi ? "#eef4f8" : "#f4f4f4",
                stroke: hi ? this.blue : "#888888", "stroke-width": hi ? 1.5 : 1,
            });
            this.el("text", { x: 270, y: y + 19, "text-anchor": "middle", "font-size": 13, fill: hi ? this.blue : "#333333" }, null, label);
        };
        band(430, "token embeddings");
        band(370, "transformer block 1");
        band(280, "transformer blocks 2 … 31");
        band(190, "transformer block 32");
        for (const cy of [340, 347, 354, 250, 257, 264]) {
            this.el("circle", { cx: 270, cy, r: 1.6, fill: "#666666" });
        }
        this.el("text", { x: 270, y: 138, "text-anchor": "middle", "font-size": 12, fill: "#999999" }, null,
            "next-token prediction (training objective, unused here)");

        // token boxes
        const toks = [["〈bos〉", "#777777"], ["The", "#333333"], [" city", "#333333"], [" of", "#333333"], [" Q", "#333333"], ["uito", this.blue]];
        toks.forEach(([t, color], i) => {
            const x = 61 + i * 65, hi = i === 5;
            this.el("rect", {
                x, y: 478, width: 58, height: 26, rx: 5,
                fill: hi ? "#e3edf3" : "#fafafa", stroke: hi ? this.blue : "#999999",
                "stroke-width": hi ? 1.5 : 1,
            });
            this.el("text", { x: x + 29, y: 495, "text-anchor": "middle", "font-size": i === 0 ? 11 : 13, fill: color }, null, t);
        });
        this.el("text", { x: 415, y: 522, "text-anchor": "middle", "font-size": 11, fill: this.blue }, null, "final token of the place name");
        this.el("text", { x: 270, y: 548, "text-anchor": "middle", "font-size": 11.5, fill: "#888888" }, null,
            "prompt ends at the name: under causal attention, later tokens could not affect the readout");

        // moving tap (elbow path into the activation vector)
        this.tap = this.el("path", { fill: "none", stroke: this.blue, "stroke-width": 2, "marker-end": "url(#gp-arrb)" });
        this.tapLabel = this.el("text", { "font-size": 11.5, fill: this.blue, "text-anchor": "middle" });

        // activation vector
        this.el("rect", { x: 556, y: 180, width: 26, height: 180, rx: 4, fill: "#ffffff", stroke: this.blue, "stroke-width": 1.5 });
        for (let y = 210; y <= 330; y += 30) {
            this.el("line", { x1: 556, y1: y, x2: 582, y2: y, stroke: "#9fc0d4", "stroke-width": 1 });
        }
        this.el("text", { x: 563, y: 386, "text-anchor": "middle", "font-size": 12.5, fill: this.blue, "font-style": "italic" }, null, "h");
        this.el("text", { x: 572, y: 390, "text-anchor": "middle", "font-size": 9.5, fill: this.blue }, null, "ℓ");
        this.el("text", { x: 569, y: 406, "text-anchor": "middle", "font-size": 11, fill: this.blue }, null, "4096 dims");

        // probe box + output
        this.el("line", { x1: 585, y1: 270, x2: 637, y2: 270, stroke: "#444444", "stroke-width": 1.5, "marker-end": "url(#gp-arr)" });
        this.el("rect", { x: 640, y: 235, width: 180, height: 70, rx: 8, fill: "#fdf6ee", stroke: "#c98a2b", "stroke-width": 1.5 });
        this.el("text", { x: 730, y: 262, "text-anchor": "middle", "font-size": 13, fill: "#333333" }, null, "ridge regression");
        this.el("text", { x: 688, y: 286, "font-size": 13, fill: "#333333", "font-style": "italic" }, null, "ŷ = W h");
        this.el("text", { x: 742, y: 290, "font-size": 9.5, fill: "#333333", "font-style": "italic" }, null, "ℓ");
        this.el("text", { x: 750, y: 286, "font-size": 13, fill: "#333333", "font-style": "italic" }, null, "+ b");
        this.el("line", { x1: 823, y1: 270, x2: 867, y2: 270, stroke: "#444444", "stroke-width": 1.5, "marker-end": "url(#gp-arr)" });
        this.el("rect", { x: 870, y: 235, width: 96, height: 70, rx: 8, fill: "#ffffff", stroke: "#888888" });
        this.el("text", { x: 918, y: 262, "text-anchor": "middle", "font-size": 13, fill: "#333333", "font-style": "italic" }, null, "(lat, lon)");
        this.el("text", { x: 918, y: 285, "text-anchor": "middle", "font-size": 11, fill: "#777777" }, null, "predicted");

        // measured-accuracy panel + sparkline
        this.stats = this.el("text", { x: 640, y: 350, "font-size": 12.5, fill: "#333333" });
        this.el("text", { x: 640, y: 375, "font-size": 11, fill: "#888888" }, null, "median error by layer:");
        const sx = l => 640 + (l / 32) * 200, sy = km => 470 - ((3700 - km) / 3000) * 80;
        let d = "";
        this.DATA.forEach((r, i) => { d += (i ? "L" : "M") + sx(r[0]).toFixed(1) + "," + sy(r[3]).toFixed(1); });
        this.el("path", { d, fill: "none", stroke: "#bbbbbb", "stroke-width": 1.5 });
        this.el("text", { x: 845, y: 474, "font-size": 10, fill: "#999999" }, null, "layer 32");
        this.el("text", { x: 640, y: 486, "font-size": 10, fill: "#999999" }, null, "layer 0");
        this.marker = this.el("circle", { r: 4, fill: "#d1495b" });
        this.sx = sx; this.sy = sy;

        document.getElementById("gp-slider").addEventListener("input", e => {
            this.layer = +e.target.value;
            this.update();
        });
        this.update();
    }

    update() {
        const L = this.layer, y = this.tapY(L), r = this.DATA[L];
        document.getElementById("gp-lnum").textContent = L;
        this.tap.setAttribute("d", `M 418 ${y} L 500 ${y} L 500 270 L 553 270`);
        this.tapLabel.setAttribute("x", 505);
        this.tapLabel.setAttribute("y", y - 8);
        this.tapLabel.textContent = `after layer ${L}`;
        this.stats.textContent =
            `layer ${L}:  R² lat ${r[1].toFixed(2)} · lon ${r[2].toFixed(2)} · median ${r[3]} km`;
        this.marker.setAttribute("cx", this.sx(L));
        this.marker.setAttribute("cy", this.sy(r[3]));
    }
}
