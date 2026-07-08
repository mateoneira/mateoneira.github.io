// Interactive referent-mixture map for the geographic world model post.
// Pick an ambiguous city name: circles show the referents at their true
// locations, sized by the measured mixture weight recovered from the
// bare-name activation; the star is the bare-name probe prediction.

class GeollmMixture {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container ${containerId} not found`);
        this.blue = "#2e6f95";
        this.red = "#d1495b";
        this.name = "London";
        Promise.all([
            fetch("/assets/geollm_world_outline.json").then(r => r.json()),
            fetch("/assets/geollm_mixture_data.json").then(r => r.json()),
        ]).then(([outline, data]) => {
            this.outline = outline;
            this.data = data;
            this.render();
        });
    }

    el(tag, attrs, parent, text) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (text !== undefined) e.textContent = text;
        (parent || this.svg).appendChild(e);
        return e;
    }

    haversineKm(a, b) {
        const r = Math.PI / 180, R = 6371;
        const s = Math.sin((b[0] - a[0]) * r / 2) ** 2 +
            Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin((b[1] - a[1]) * r / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(s));
    }

    render() {
        this.container.innerHTML = "";
        this.container.style.textAlign = "center";

        const controls = document.createElement("div");
        controls.style.cssText = "font-family:Helvetica,Arial,sans-serif;font-size:14px;margin:6px 0;";
        const sel = document.createElement("select");
        sel.style.cssText = "font-size:14px;padding:2px 6px;";
        for (const d of [...this.data].sort((a, b) => a.name.localeCompare(b.name))) {
            const o = document.createElement("option");
            o.value = d.name;
            o.textContent = d.name;
            if (d.name === this.name) o.selected = true;
            sel.appendChild(o);
        }
        sel.addEventListener("change", () => { this.name = sel.value; this.update(); });
        controls.append("ambiguous name: ", sel);
        this.container.appendChild(controls);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 900 460");
        this.svg.setAttribute("style", "max-width:900px;width:100%;height:auto;font-family:Helvetica,Arial,sans-serif;background:#fcfcfc;border:1px solid #dddddd;border-radius:8px;");
        this.container.appendChild(this.svg);
        this.update();
    }

    // fit an equirectangular viewport around the referents + prediction
    makeProjection(entry) {
        const pts = entry.refs.map(r => [r.lat, r.lon]).concat([entry.pred]);
        let latMin = Math.min(...pts.map(p => p[0])), latMax = Math.max(...pts.map(p => p[0]));
        let lonMin = Math.min(...pts.map(p => p[1])), lonMax = Math.max(...pts.map(p => p[1]));
        const pad = Math.max(6, (latMax - latMin) * 0.35, (lonMax - lonMin) * 0.18);
        latMin -= pad; latMax += pad; lonMin -= pad * 1.6; lonMax += pad * 1.6;
        const midLat = (latMin + latMax) / 2;
        const kx = Math.cos(midLat * Math.PI / 180);   // plate carrée aspect fix
        const w = 900, h = 460;
        const scale = Math.min(w / ((lonMax - lonMin) * kx), h / (latMax - latMin));
        const cx = (lonMin + lonMax) / 2, cy = midLat;
        return ([lat, lon]) => [
            w / 2 + (lon - cx) * kx * scale,
            h / 2 - (lat - cy) * scale,
        ];
    }

    update() {
        this.svg.innerHTML = "";
        const entry = this.data.find(d => d.name === this.name);
        const proj = this.makeProjection(entry);

        // coastline
        let d = "";
        for (const ring of this.outline) {
            ring.forEach(([lon, lat], i) => {
                const [x, y] = proj([lat, lon]);
                d += (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
            });
            d += "Z";
        }
        this.el("path", { d, fill: "#f2f2f2", stroke: "#cccccc", "stroke-width": 0.8 });

        const refs = [...entry.refs].sort((a, b) => b.w - a.w);
        const top = refs[0];
        const pred = proj(entry.pred);

        // dashed pulls from each referent to the prediction
        for (const r of refs) {
            const [x, y] = proj([r.lat, r.lon]);
            this.el("line", {
                x1: x, y1: y, x2: pred[0], y2: pred[1],
                stroke: "#bbbbbb", "stroke-width": 1, "stroke-dasharray": "4 3",
            });
        }
        // referents, sized by measured weight
        for (const r of refs) {
            const [x, y] = proj([r.lat, r.lon]);
            const rad = 5 + 24 * Math.sqrt(r.w);
            this.el("circle", { cx: x, cy: y, r: rad, fill: this.blue, "fill-opacity": 0.75 });
            this.el("text", {
                x, y: y - rad - 6, "text-anchor": "middle", "font-size": 12.5, fill: "#333333",
            }, null, `${r.country} · w = ${r.w.toFixed(2)}`);
        }
        // prediction star
        const s = 11, star = [];
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.45 : s;
            star.push([(pred[0] + rr * Math.cos(a)).toFixed(1), (pred[1] + rr * Math.sin(a)).toFixed(1)]);
        }
        this.el("path", { d: "M" + star.map(p => p.join(",")).join("L") + "Z", fill: this.red });
        const km = this.haversineKm(entry.pred, [top.lat, top.lon]);
        this.el("text", {
            x: pred[0], y: pred[1] + 26, "text-anchor": "middle", "font-size": 12.5, fill: this.red,
        }, null, `bare-name prediction · ${Math.round(km).toLocaleString()} km from ${top.country}`);

        // prompt label
        this.el("text", {
            x: 16, y: 28, "font-size": 14, fill: "#333333",
            "font-family": "Menlo, Consolas, monospace",
        }, null, `The city of ${entry.name}`);
        this.el("text", { x: 16, y: 446, "font-size": 11, fill: "#888888" }, null,
            "circle area ∝ mixture weight recovered from the bare-name activation (convex reconstruction, layer 22)");
    }
}
