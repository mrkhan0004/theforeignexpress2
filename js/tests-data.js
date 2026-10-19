/* ============================================================
   THE FOREIGN EXPRESS — Test Content (original mock sets)
   NOTE: Content below is ORIGINAL (Express-authored), written in
   authentic IELTS style. Replace/license real papers in production.
============================================================ */
const FE_SECTIONS={
'R11-1':{type:'reading',title:'Reading — The Rise of Urban Rooftop Gardens',mins:30,
passage:`<p><b>Section A.</b> Rooftop farming was once dismissed as a hobby for idealists with too much time and too little soil. Today it has become a serious industry. In Paris, the world's largest urban farm spreads across 14,000 square metres of a building's roof and supplies fruit and vegetables directly to local residents. In Cairo, rooftop gardens have become a source of income for hundreds of families who sell herbs and salads to neighbourhood restaurants.</p>
<p><b>Section B.</b> The benefits extend well beyond fresh food. A green roof acts as a natural air conditioner, cutting a building's cooling costs by as much as 30 per cent. It absorbs rainwater that would otherwise overwhelm city drains during storms, and it offers a habitat for insects and birds whose natural spaces are shrinking year by year.</p>
<p><b>Section C.</b> City governments have started to take notice. Toronto became the first city in North America to make green roofs compulsory for new buildings above a certain size, and France now requires commercial rooftops to host either plants or solar panels. Property values, several studies suggest, rise noticeably when buildings carry living roofs.</p>
<p><b>Section D.</b> Critics warn of practical limits. Not every roof can bear the weight of deep soil, and installation remains expensive. Irrigation systems must be maintained, and during hot summers plants die without constant attention. Yet as climate pressures intensify, most urban planners now argue that the question is no longer whether cities should green their roofs, but how quickly they can afford to do it.</p>`,
questions:[
 {t:'tf',q:'1. Rooftop farming was initially regarded as an impractical activity.',a:0,why:'Section A: "once dismissed as a hobby for idealists" = impractical → True.',hint:'Look at the very first sentence of Section A.'},
 {t:'tf',q:'2. The Paris farm sells its produce only to restaurants.',a:1,why:'Section A says it supplies "directly to local residents", not only restaurants → False.',hint:'Check who receives the fruit and vegetables in Section A.'},
 {t:'tf',q:'3. Green roofs can reduce the cost of keeping buildings cool.',a:0,why:'Section B: "cutting a building\'s cooling costs by as much as 30 per cent" → True.',hint:'Section B mentions a percentage related to cooling.'},
 {t:'tf',q:'4. Toronto requires green roofs on all new buildings regardless of size.',a:1,why:'Section C says "above a certain size", not all buildings → False.',hint:'Read the Toronto sentence carefully in Section C.'},
 {t:'mcq',q:'5. According to the passage, green roofs help city drainage systems by…',opts:['absorbing rainwater','heating water','filtering air','lowering rents'],a:0,why:'Section B: "It absorbs rainwater that would otherwise overwhelm city drains".',hint:'Which problem during storms is mentioned in Section B?'},
 {t:'mcq',q:'6. Which country requires commercial rooftops to host plants or solar panels?',opts:['Canada','France','Egypt','Japan'],a:1,why:'Section C: "France now requires commercial rooftops to host either plants or solar panels".',hint:'Two countries are named in Section C — which one has the commercial rule?'},
 {t:'mcq',q:'7. What concern do critics raise?',opts:['Green roofs lower property values','Some roofs cannot support the weight of soil','Plants attract destructive insects','Solar panels are more attractive'],a:1,why:'Section D: "Not every roof can bear the weight of deep soil".',hint:'Read Section D — what physical limitation is mentioned?'},
 {t:'fib',q:'8. How many square metres does the Paris urban farm cover?',accept:['14000','14,000'],a:'14000',why:'Section A: "14,000 square metres".',hint:'A number appears in Section A.'},
 {t:'fib',q:'9. Green roofs provide a habitat for insects and ______. (ONE WORD)',accept:['birds'],a:'birds',why:'Section B: "a habitat for insects and birds".',hint:'Which animals are mentioned along with insects?'},
 {t:'fib',q:'10. According to studies, what rises when buildings have living roofs? (ONE OR TWO WORDS)',accept:['property values','values','property value'],a:'property values',why:'Section C: "Property values … rise noticeably".',hint:'Something financial is mentioned at the end of Section C.'}]},

'L11-1':{type:'listening',title:'Listening — City Library Orientation',mins:15,
chunks:[
 'Good morning, and welcome to the Central City Library. My name is Daniel, and I will be guiding you through today\'s orientation for new members.',
 'First, a little about membership. To borrow books, you will need a membership card, which you can collect from the front desk on the ground floor. Please bring one form of photo identification with you when you register.',
 'The library is open Monday to Friday from nine in the morning until eight at night. On Saturdays we close earlier, at five, and the library is closed all day on Sundays.',
 'Our collection is spread over three floors. Fiction is on the first floor, together with the children\'s section. The second floor holds journals, newspapers and the reference collection.',
 'Now, a few rules. You may borrow up to six books at a time, and each book is issued for two weeks. If a book is returned late, a fine of fifty pence per day is charged to your account.',
 'Finally, free Wi-Fi is available throughout the building. The password changes every month — simply ask at the front desk. If you need any help, look for our staff, who all wear red badges. Enjoy your visit!'],
questions:[
 {t:'fib',q:'1. Membership card is collected from the front desk on the ______ floor.',accept:['ground'],a:'ground',why:'Chunk 2: "front desk on the ground floor".',hint:'Listen for the floor name in the membership part.'},
 {t:'fib',q:'2. Bring one form of ______ identification. (ONE WORD)',accept:['photo'],a:'photo',why:'Chunk 2: "one form of photo identification".',hint:'What type of ID is required?'},
 {t:'fib',q:'3. Monday–Friday closing time: ______ at night.',accept:['eight','8'],a:'eight',why:'Chunk 3: "until eight at night".',hint:'A number word in the opening hours.'},
 {t:'fib',q:'4. Saturday closing time: ______ .',accept:['five','5'],a:'five',why:'Chunk 3: "we close earlier, at five".',hint:'Earlier than eight.'},
 {t:'fib',q:'5. Journals and newspapers are on the ______ floor.',accept:['second','2nd'],a:'second',why:'Chunk 4: "The second floor holds journals, newspapers".',hint:'Third thing mentioned about floors.'},
 {t:'fib',q:'6. Late fine: ______ pence per day.',accept:['fifty','50'],a:'fifty',why:'Chunk 5: "a fine of fifty pence per day".',hint:'A money amount in the rules section.'},
 {t:'mcq',q:'7. How many books may a member borrow at a time?',opts:['Four','Five','Six','Eight'],a:2,why:'Chunk 5: "up to six books at a time".',hint:'Listen to the borrowing rules.'},
 {t:'mcq',q:'8. How long is each loan period?',opts:['One week','Two weeks','Three weeks','One month'],a:1,why:'Chunk 5: "each book is issued for two weeks".',hint:'Right after the number of books.'},
 {t:'mcq',q:'9. Where do members get the monthly Wi-Fi password?',opts:['The website','The front desk','Security staff','The noticeboard'],a:1,why:'Chunk 6: "simply ask at the front desk".',hint:'Last chunk explains Wi-Fi.'},
 {t:'mcq',q:'10. Library staff who can help are identified by…',opts:['blue lanyards','red badges','green jackets','name tags only'],a:1,why:'Chunk 6: "our staff, who all wear red badges".',hint:'What colour item is mentioned at the very end?'}]},

'W11-1':{type:'writing',title:'Writing — Academic Tasks 1 & 2',mins:60,
tasks:[
 {id:'w1',label:'Task 1',title:'Academic Writing Task 1 — transport table',mins:20,
  prompt:'The table below shows the percentage of commuters using three forms of transport in a city in 2000 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  table:[['Transport','2000','2025'],['Car','62%','48%'],['Bus','22%','27%'],['Bicycle','16%','25%']]},
 {id:'w2',label:'Task 2',title:'Academic Writing Task 2 — university fees',mins:40,
  prompt:'Some people believe that university education should be free for all students, funded by the government. Others argue that students should pay for their own studies because they benefit personally from their degrees.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.'}
]},
'S11-1':{type:'speaking',title:'Speaking — Academic Practice (Parts 1–3)',mins:15,
 parts:[
  {label:'Part 1',title:'Introduction and interview',prepSec:0,answerSec:300,questions:['Do you work or are you a student?','What do you enjoy most about your work or studies?','How do you usually organise your day?','Do you prefer studying alone or with other people?']},
  {label:'Part 2',title:'Individual long turn',prepSec:60,answerSec:120,cue:'Describe a place you would like to visit again. You should say where it is, when you first went there, what you did there, and explain why you would like to return.',questions:['Where is the place?','When did you first visit it?','What did you do there?','Why would you like to return?']},
  {label:'Part 3',title:'Discussion',prepSec:0,answerSec:300,questions:['Why do some people prefer travelling to familiar places?','How can tourism benefit local communities?','What responsibilities do visitors have when they travel?','Do you think international travel will change in the future?']}
 ]}
};

const FE_TESTS={
'R-11-1':{name:'Express Academic Demo — Reading',skill:'Reading',mins:30,secs:['R11-1']},
'L-11-1':{name:'Express Academic Demo — Listening',skill:'Listening',mins:15,secs:['L11-1']},
'W-11-1':{name:'Express Academic Demo — Writing Task 1 & 2',skill:'Writing',mins:60,secs:['W11-1']},
'S-11-1':{name:'Express Academic Demo — Speaking Parts 1–3',skill:'Speaking',mins:15,secs:['S11-1']},
'F-11-1':{name:'Express Academic Demo Suite — Reading, Listening & Writing',skill:'Full',mins:105,secs:['R11-1','L11-1','W11-1']}};

/* Locked original practice placeholders — no General Training cards or assets. */
const FE_SOON=[];
[12,13,14].forEach(set=>[1,2].forEach(t=>['Full','Listening','Reading','Writing','Speaking'].forEach(sk=>{
  FE_SOON.push({id:`X-${set}-${t}-${sk}`,name:`Express Academic ${set} — ${sk} Test ${t}`,skill:sk});
})));