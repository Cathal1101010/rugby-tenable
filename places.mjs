// UN member states (ISO 3166-1 codes, omitting GB), plus the two observer states.
// https://www.un.org/about-us/member-states
// https://research.un.org/en/unmembers/observers
const codes = `
AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI
CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE
SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM
JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX
FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT
QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH
SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE US UY UZ VU VE VN YE ZM ZW PS VA
`.trim().split(/\s+/);
const englishNames = new Intl.DisplayNames('en', {type:'region'});
const commonNames = {CI:'Côte d’Ivoire', PS:'Palestine', VA:'Vatican City', CD:'Democratic Republic of the Congo', CG:'Republic of the Congo', CV:'Cape Verde', MM:'Myanmar', TR:'Türkiye'};

// Rugby sides representing places outside the UN state list.
// https://www.world.rugby/organisation/membership/
const rugbyRegions = [
  'American Samoa','Bermuda','British Virgin Islands','Cayman Islands','Chinese Taipei',
  'Cook Islands','England','Guam','Hong Kong China','Niue','Scotland','Wales',
  // Separately represented in regional rugby competition.
  'New Caledonia','Tahiti','Kosovo','Gibraltar'
];

export const teams = [...codes.map(code => commonNames[code] ?? englishNames.of(code)), ...rugbyRegions]
  .sort((a,b)=>a.localeCompare(b,'en'));

export const aliases = {
  'all blacks':'New Zealand', nz:'New Zealand', springboks:'South Africa',
  wallabies:'Australia', usa:'United States', 'united states of america':'United States',
  pumas:'Argentina', 'los pumas':'Argentina', 'ivory coast':'Côte d’Ivoire',
  'hong kong':'Hong Kong China', 'western samoa':'Samoa', taiwan:'Chinese Taipei',
  'czech republic':'Czechia', swaziland:'Eswatini', burma:'Myanmar',
  'holy see':'Vatican City', 'state of palestine':'Palestine', turkey:'Türkiye',
  'cabo verde':'Cape Verde', 'east timor':'Timor-Leste', 'dr congo':'Democratic Republic of the Congo',
  'democratic republic of congo':'Democratic Republic of the Congo', 'french polynesia':'Tahiti',
  'republic of korea':'South Korea', 'russian federation':'Russia'
};
