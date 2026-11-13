import {worldCupPlayers} from './players.mjs';

const guide = 'https://resources.worldrugby-rims.pulselive.com/worldrugby/document/2025/12/01/e25075c4-f00c-4594-9448-1f8fc0c1cc31/RWC-2027-Draw-Media-Guide-EN.pdf';
const archive = 'https://www.rugbyworldcup.com/2027/en/past-tournaments/';
const allTime = [
  // Team, wins, tries. World Rugby's records through 2023.
  ['New Zealand',54,396], ['Australia',44,241],
  ['England',42,190], ['South Africa',42,201],
  ['France',40,213], ['Wales',30,159], ['Ireland',28,164],
  ['Scotland',26,167], ['Argentina',25,134], ['Italy',15,83],
  ['Samoa',14,94], ['Fiji',13,98], ['Japan',10,85]
];
const pools2023 = [
  ['France',18,178], ['New Zealand',15,206], ['Italy',10,-67], ['Uruguay',5,-99], ['Namibia',0,-218],
  ['Ireland',19,144], ['South Africa',15,117], ['Scotland',10,75], ['Tonga',5,-81], ['Romania',0,-255],
  ['Wales',19,84], ['Fiji',11,5], ['Australia',11,-1], ['Portugal',6,-39], ['Georgia',3,-49],
  ['England',18,111], ['Argentina',14,58], ['Japan',9,2], ['Samoa',7,17], ['Chile',0,-188]
];
const pools2015 = [
  ['Australia',17,106], ['Wales',13,49], ['England',11,58], ['Fiji',5,-17], ['Uruguay',0,-196],
  ['South Africa',16,120], ['Scotland',14,43], ['Japan',12,-2], ['Samoa',6,-55], ['United States',0,-106],
  ['New Zealand',19,125], ['Argentina',15,110], ['Georgia',8,-70], ['Tonga',6,-60], ['Namibia',1,-104],
  ['Ireland',18,124], ['France',14,57], ['Italy',10,-14], ['Romania',4,-69], ['Canada',2,-73]
];
const historic = 'Men’s Rugby World Cup · 1987–2023';
const pool = year => `Men’s Rugby World Cup · ${year} pool stage`;
function ranked(question, context, source, rows, column, unit) {
  const sorted = [...rows].sort((a,b) => b[column] - a[column] || a[0].localeCompare(b[0], 'en'));
  return {question, context, source, unit, answers: sorted.slice(0,10).map(row => [row[0], row[column]])};
}
// Keep the starter rotation stable for saved games.
export const puzzles = [
  ranked('Which teams have the most World Cup wins?', historic, guide, allTime, 1, 'wins'),
  ranked('Who earned the most pool points in 2023?', pool(2023), archive+'2023?group=poolD', pools2023, 1, 'pts'),
  ranked('Which teams have scored the most World Cup tries?', historic, guide, allTime, 2, 'tries'),
  ranked('Who earned the most pool points in 2015?', pool(2015), archive+'2015?lang=en', pools2015, 1, 'pts'),
  ranked('Who had the best pool points difference in 2015?', pool(2015), archive+'2015?lang=en', pools2015, 2, 'PD'),
  ranked('Who had the best pool points difference in 2023?', pool(2023), archive+'2023?group=poolD', pools2023, 2, 'PD')
];
// Add future quizzes here using YYYY-MM-DD UTC keys and the ranked helper above.
export const datedPuzzles = new Map([
  ['2026-11-14', {
    question: 'Players wearing numbers 1 through 10 for Ireland against South Africa at the 2023 Rugby World Cup.',
    context: 'Ireland vs South Africa · 23 September 2023',
    source: 'https://www.rugbyworldcup.com/news/862453/rugby-world-cup-2023-south-africa-ireland-preview',
    choices: worldCupPlayers,
    aliases: {'johnny sexton':'Jonathan Sexton', 'jonathan sexton':'Jonathan Sexton'},
    answers: [
      'Andrew Porter', 'Ronan Kelleher', 'Tadhg Furlong', 'Tadhg Beirne', 'James Ryan',
      "Peter O'Mahony", 'Josh Van Der Flier', 'Caelan Doris', 'Jamison Gibson-Park', 'Jonathan Sexton'
    ].map((name,index)=>[name,index+1])
  }],
]);

