(function (root) {
  'use strict';

  const RAD = Math.PI / 180;
  const MS_PER_DAY = 86400000;
  const J2000_JD = 2451545.0;
  const SABBAT_SPAN = 45;

  // Solar ecliptic longitudes, ordered by increasing longitude.
  const SABBATS = [
    { name: 'Ostara', longitude: 0 },
    { name: 'Beltane', longitude: 45 },
    { name: 'Litha', longitude: 90 },
    { name: 'Lughnasadh', longitude: 135 },
    { name: 'Mabon', longitude: 180 },
    { name: 'Samhain', longitude: 225 },
    { name: 'Yule', longitude: 270 },
    { name: 'Imbolc', longitude: 315 }
  ];

  // Traditional civil anchors (month is 1-based). `eve` shifts the countdown
  // target to the start of the preceding day (Samhain Eve, Oct 31).
  const CIVIL_DATES = {
    Samhain: { month: 11, day: 1, eve: true },
    Yule: { month: 12, day: 21 },
    Imbolc: { month: 2, day: 1 },
    Ostara: { month: 3, day: 20 },
    Beltane: { month: 5, day: 1 },
    Litha: { month: 6, day: 21 },
    Lughnasadh: { month: 8, day: 1 },
    Mabon: { month: 9, day: 21 }
  };
  SABBATS.forEach((s) => { s.civil = CIVIL_DATES[s.name]; });

  // Samhain (225 deg) sits at the top of the wheel.
  const WHEEL_ORIGIN_LONGITUDE = 225;

  const norm360 = (d) => ((d % 360) + 360) % 360;
  const signed180 = (d) => norm360(d + 180) - 180;

  function toJulianDay(date) {
    return date.getTime() / MS_PER_DAY + 2440587.5;
  }

  /**
   * Apparent geocentric ecliptic longitude of the Sun (degrees, 0-360).
   * Truncated VSOP87 Earth series (Meeus, ch. 25): equation of centre
   * terms, aberration and nutation. Accuracy is roughly 0.01 deg (~15 min).
   */
  function getSunLongitude(date) {
    const T = (toJulianDay(date) - J2000_JD) / 36525;

    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mr = M * RAD;

    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
      0.000289 * Math.sin(3 * Mr);

    const trueLong = L0 + C;
    const omega = (125.04 - 1934.136 * T) * RAD;

    return norm360(trueLong - 0.00569 - 0.00478 * Math.sin(omega));
  }

  /** Needle rotation (0-360, clockwise from 12 o'clock) with Samhain at 0. */
  function getNeedleAngle(date = new Date()) {
    return norm360(getSunLongitude(date) - WHEEL_ORIGIN_LONGITUDE);
  }

  /** Date on which the Sun reaches targetLongitude, nearest to `near`. */
  function findSolarPeak(targetLongitude, near) {
    let t = near.getTime();
    for (let i = 0; i < 8; i++) {
      const diff = signed180(targetLongitude - getSunLongitude(new Date(t)));
      // Mean solar motion ~0.9856 deg/day.
      t += (diff / 0.9856) * MS_PER_DAY;
      if (Math.abs(diff) < 1e-6) break;
    }
    return new Date(t);
  }

  /**
   * Needle angle driven by civil dates: each Sabbat's anchor (local midnight
   * of its civil date) maps to its wheel angle, and the needle interpolates
   * linearly in time across the 45 deg sector to the next anchor.
   */
  function getCivilNeedleAngle(date = new Date()) {
    const anchors = [];
    for (let y = date.getFullYear() - 1; y <= date.getFullYear() + 1; y++) {
      SABBATS.forEach((s) => {
        anchors.push({
          time: new Date(y, s.civil.month - 1, s.civil.day).getTime(),
          angle: norm360(s.longitude - WHEEL_ORIGIN_LONGITUDE)
        });
      });
    }
    anchors.sort((a, b) => a.time - b.time);

    const now = date.getTime();
    let i = 0;
    while (i < anchors.length - 2 && anchors[i + 1].time <= now) i++;
    const prev = anchors[i];
    const next = anchors[i + 1];

    const fraction = (now - prev.time) / (next.time - prev.time);
    return norm360(prev.angle + SABBAT_SPAN * fraction);
  }

  function getSeasonStatus(date = new Date()) {
    const lambda = getSunLongitude(date);
    const idx = Math.floor(lambda / SABBAT_SPAN) % SABBATS.length;
    const current = SABBATS[idx];
    const next = SABBATS[(idx + 1) % SABBATS.length];

    const progressPercent = Math.min(
      100,
      Math.max(0, ((lambda - current.longitude) / SABBAT_SPAN) * 100)
    );

    const remainingDeg = norm360(next.longitude - lambda);
    const guess = new Date(date.getTime() + (remainingDeg / 0.9856) * MS_PER_DAY);
    const nextPeak = findSolarPeak(next.longitude, guess);
    const astronomicalDaysRemaining = Math.max(
      0,
      Math.round((nextPeak.getTime() - date.getTime()) / MS_PER_DAY)
    );

    // Civil countdown: whole local calendar days to the festival's midnight.
    // The year follows the astronomical peak so an already-passed civil date
    // (e.g. Nov 3 before the Nov 7 peak) clamps to 0 rather than a year out.
    const { month, day, eve } = next.civil;
    const civilTarget = new Date(nextPeak.getFullYear(), month - 1, day - (eve ? 1 : 0));
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysRemaining = Math.max(
      0,
      Math.round((civilTarget.getTime() - today.getTime()) / MS_PER_DAY)
    );

    return {
      currentSabbat: current.name,
      nextSabbat: next.name,
      progressPercent,
      daysRemaining,
      civilDate: civilTarget,
      astronomicalPeakDate: nextPeak,
      astronomicalDaysRemaining,
      nextPeak
    };
  }

  const api = { SABBATS, getSunLongitude, getNeedleAngle, getCivilNeedleAngle, getSeasonStatus };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Ephemeris = api;
})(typeof window !== 'undefined' ? window : globalThis);
