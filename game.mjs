import {datedPuzzles, puzzles} from './data.mjs';
import {aliases, teams} from './places.mjs';
export const dayLength = 86400000;
const startDay = Math.floor(Date.UTC(2026,10,13) / dayLength);
export const storageKey = 'rugby-tenable:v1:';
export const utcDay = (time = Date.now()) => Math.floor(time / dayLength);
export const dateLabel = day => new Date(day * dayLength).toISOString().slice(0,10);
export const puzzleFor = day => {
  const index = ((day - startDay) % puzzles.length + puzzles.length) % puzzles.length;
  return datedPuzzles.get(dateLabel(day)) ?? puzzles[index];
};
export const normalize = text => text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const names = new Map(teams.map(team => [normalize(team), team]));
export function identify(text) {
  const key = normalize(text);
  return names.get(key) ?? (Object.hasOwn(aliases,key) ? aliases[key] : undefined);
}
export function suggestions(text) {
  const query = normalize(text);
  if (query.replace(/[^a-z]/g,'').length < 2) return [];
  return teams.filter(team => normalize(team).includes(query));
}
export function resolveGuess(text, options, highlighted = -1) {
  return options[highlighted] ?? options[0] ?? text;
}
export const newGame = () => ({correct:[], wrong:[], revealed:false});
export const finished = game => game.correct.length === 10 || game.wrong.length === 3;
export function submit(game,puzzle,text) {
  if (finished(game)) return {kind:'finished',game};
  if (!normalize(text)) return {kind:'empty',game};
  const team = identify(text);
  if (!team) return {kind:'unknown',game};
  const key = team;
  if (game.correct.includes(key) || game.wrong.includes(key)) return {kind:'duplicate',game,team};
  const rank = puzzle.answers.findIndex(([answer]) => answer === team);
  if (rank >= 0) return {kind:'correct',game:{...game,correct:[...game.correct,team]},team,rank};
  return {kind:'wrong',game:{...game,wrong:[...game.wrong,key]}};
}
export function statsFor(records,today) {
  const complete = records.filter(([day,game]) => day <= today && finished(game));
  const scores = new Map(complete.map(([day,game]) => [day,game.correct.length]));
  const distribution = Array(11).fill(0);
  for (const score of scores.values()) distribution[score]++;
  let day = scores.has(today) ? today : today-1;
  let streak = 0;
  while (scores.get(day--) === 10) streak++;
  return {played:scores.size,streak,distribution};
}
export function shareText(game,puzzle,day,url) {
  const tiles = puzzle.answers.map(([team])=>game.correct.includes(team) ? '🟩' : '⬜');
  return ['Rugby Tenable · '+dateLabel(day),game.correct.length+'/10 · '+game.wrong.length+'/3 misses',tiles.slice(0,5).join('')+' '+tiles.slice(5).join(''),url].filter(Boolean).join('\n');
}

