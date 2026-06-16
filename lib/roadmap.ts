import { STEPS } from "@/data/roadmap/steps";

type RoadmapData = {
  plannedStudienkollegs: string[];
  citizenships: string[];
  countryOfHighschool: string;
};

export class Roadmap {
  private _steps = STEPS;

  constructor(private _data: RoadmapData) {}

  get steps() {
    const conditionalSteps = {
      research: this._data.plannedStudienkollegs.length === 0,
      visa: !this._data.citizenships.includes("EU"),
      aps: ["China", "Vietnam", "India", "Mongolia"].includes(
        this._data.countryOfHighschool,
      ),
    };

    return this._steps.map((s) => ({
      ...s,
      necessary: Object.keys(conditionalSteps).includes(s.key)
        ? conditionalSteps[s.key as keyof typeof conditionalSteps]
        : s.necessary,
    }));
  }
}
