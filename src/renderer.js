function renderTelemetry() {
  const s = Ephemeris.getSeasonStatus(new Date());
  const days = s.daysRemaining;

  document.getElementById('nextFestival').textContent = s.nextSabbat;
  document.getElementById('daysRemaining').textContent = days + (days === 1 ? ' Day' : ' Days');
}

renderTelemetry();
setInterval(renderTelemetry, 60 * 60 * 1000);

const needle = document.getElementById('dial-needle');
let needleRotation = 0;

function updateNeedle() {
  const target = Ephemeris.getCivilNeedleAngle(new Date());
  // Take the shortest path so the 360 -> 0 wrap doesn't spin the needle backwards.
  needleRotation += ((target - needleRotation + 540) % 360) - 180;
  needle.style.transform = 'rotate(' + needleRotation + 'deg)';
}

updateNeedle();
setInterval(updateNeedle, 10 * 60 * 1000);
window.addEventListener('focus', () => { updateNeedle(); renderTelemetry(); });
