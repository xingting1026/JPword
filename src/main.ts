import { renderStart, runRound, type AppState } from "./ui";
import { LEVELS } from "./levels";
import type { Level, Mode } from "./types";

const root = document.getElementById("app");
if (!root) throw new Error("#app not found");

const params = new URLSearchParams(location.search);
const requested = (params.get("level") ?? "N5")
  .split(",")
  .map((s) => s.trim().toUpperCase())
  .filter((l): l is Level => (LEVELS as readonly string[]).includes(l));
const mode: Mode = params.get("mode") === "reading" ? "reading" : "meaning";

const state: AppState = { highest: null, selected: requested.length ? requested : ["N5"], mode };

function home(): void {
  renderStart(root!, state, () => {
    void runRound(root!, state, home);
  });
}
home();
