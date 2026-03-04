export function formatDateToWeekDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
}

export function formatDateToMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(date);
}

export function formatPublicId(publicId: number) {
  return `#${publicId.toString().padStart(3, "0")}`;
}

export function formatSeasonAndYear(
  season: string | null,
  year: number | null,
) {
  if (season && year && ["SUMMER", "WINTER"].includes(season)) {
    if (season === "SUMMER") {
      return `(SoSe ${year.toString().slice(2)})`;
    }
    return `(WiSe ${year.toString().slice(2)}/${(year + 1).toString().slice(2)})`;
  } else if (year) {
    return year.toString();
  }
}

export function formatTime(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}
