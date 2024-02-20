import { CSV } from "https://js.sabae.cc/CSV.js";
import { XLSX } from "https://taisukef.github.io/sheetjs-es/es/XLSX.js";

const forcedl = false;

const list = await CSV.fetchJSON("./list.csv");
for (const l of list) {
  const fn = l.url.substring(l.url.lastIndexOf("/") + 1);
  if (!forcedl) {
    try {
      await Deno.readFile(fn);
      continue;
    } catch (e) {
    }
  }
  if (fn.endsWith(".xlsx")) {
    const bin = new Uint8Array(await (await fetch(l.url)).arrayBuffer());
    const ws = XLSX.decode(bin);
    const csv = XLSX.toCSV(ws);
    await Deno.writeTextFile(fn.substring(0, fn.length - 4) + "csv", CSV.encode(csv));
  } else if (fn.endsWith(".csv")) {
    let data = await CSV.fetch(l.url);
    if (l.opt.indexOf("cut_first_line") >= 0) {
      data.splice(0, 1);
    }
    if (l.opt.indexOf("separate_pos") >= 0) {
      const list = CSV.toJSON(data);
      data = CSV.fromJSON(list.map(i => {
        const res = {};
        for (const name in i) {
          if (name == "位置情報") {
            const ll = i[name].split(",");
            res.緯度 = ll[0].trim();
            res.経度 = ll[1].trim();
          } else {
            res[name] = i[name];
          }
        }
        return res;
      }));
    }
    await Deno.writeTextFile(fn, CSV.encode(data));
  } else {
    const bin = new Uint8Array(await (await fetch(l.url)).arrayBuffer());
    await Deno.writeFile(fn, bin);
  }
}
