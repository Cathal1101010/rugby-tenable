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
  ['2026-11-24', {
    id: 'ireland-recent-number-tens-2026-11-24',
    question: 'The most recent players to wear the number 10 shirt for Ireland',
    context: 'Senior men’s Test starts only. Each player appears once, ordered by their most recent start in the number 10 shirt, as of 24 November 2026.',
    source: 'https://en.rugby-japan.jp/schedule/starting/29969/18640/',
    choices: worldCupPlayers,
    aliases: {'johnny sexton':'Jonathan Sexton'},
    showDetails: true,
    answers: [
      [
            "Sam Prendergast",
            "vs South Africa 2026"
      ],
      [
            "Ciarán Frawley",
            "vs Japan 2026"
      ],
      [
            "Jack Crowley",
            "vs Scotland 2026"
      ],
      [
            "Jonathan Sexton",
            "vs New Zealand 2023"
      ],
      [
            "Ross Byrne",
            "vs England 2023"
      ],
      [
            "Joey Carbery",
            "vs Fiji 2022"
      ],
      [
            "Billy Burns",
            "vs France 2021"
      ],
      [
            "Jack Carty",
            "vs Japan 2019"
      ],
      [
            "Paddy Jackson",
            "vs Japan 2017"
      ],
      [
            "Ian Madigan",
            "vs Argentina 2015"
      ]
]
  }],
  ['2026-11-23', {
    id: 'ireland-sa-ratings-2026-11-21',
    question: 'Irish players to receive a score of 8/10 or higher against South Africa on November 21st 2026, based on The Irish Times Player Ratings',
    context: 'Ranked by rating, highest first. Ties are ordered by ascending shirt number. Only starters qualify; players omitted either did not start or were rated 7/10 or lower.',
    source: 'https://www.irishtimes.com/sport/rugby/2026/11/21/ireland-player-ratings-v-south-africa-rob-baloucoune-puts-in-stunning-display/',
    choices: worldCupPlayers,
    aliases: {'robert balacoune':'Robert Baloucoune', 'jamison gibson park':'Jamison Gibson-Park'},
    unit: '/10',
    answers: [
      ["Ronan Kelleher", 9],
      ["Robert Baloucoune", 9],
      ["Tadhg Furlong", 8],
      ["Joe McCarthy", 8],
      ["Ryan Baird", 8],
      ["Josh Van Der Flier", 8],
      ["Dan Sheehan", 8],
      ["Jamison Gibson-Park", 8],
      ["Mack Hansen", 8],
      ["Stuart McCloskey", 8],
    ],
  }],
  ['2026-11-16', {
    question: "The 10 most recent winners of the World Rugby Men's 15s Player of the Year award",
    context: 'Each player appears once, on the year of their most recent win. Awards through 2025.',
    source: 'https://www.world.rugby/tournaments/awards/past-winners/2025',
    choices: worldCupPlayers.map(name => name === 'Jonathan Sexton' ? 'Johnny Sexton' : name),
    aliases: {'jonathan sexton':'Johnny Sexton'},
    answers: [
      ['Malcolm Marx', 2025],
      ['Pieter-Steph du Toit', 2024],
      ['Ardie Savea', 2023],
      ['Josh Van Der Flier', 2022],
      ['Antoine Dupont', 2021],
      ['Johnny Sexton', 2018],
      ['Beauden Barrett', 2017],
      ['Dan Carter', 2015],
      ['Brodie Retallick', 2014],
      ['Kieran Read', 2013],
    ],
  }],

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

