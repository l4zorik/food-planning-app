// Local, deterministic vector artwork. Run with: node scripts/generate-problem-art.mjs
import { mkdir, writeFile } from 'node:fs/promises'
import { problemCatalog } from '../desktop/lite/problem-catalog.js'

const path = d => `<path d="${d}"/>`
const rect = (x, y, w, h, r = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`
const circle = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`
const line = (x, y, a, b) => `<path d="M${x} ${y}L${a} ${b}"/>`
const phone = rect(59, 19, 42, 72, 8) + line(73, 26, 87, 26) + line(77, 83, 83, 83)
const browser = rect(34, 25, 92, 64, 7) + line(34, 40, 126, 40) + circle(43, 33, 1) + circle(50, 33, 1) + circle(57, 33, 1)
const chat = path('M43 29h74v48H71L53 90V77H43Z')
const book = path('M80 36Q58 22 36 31v56q22-9 44 5 22-14 44-5V31Q102 22 80 36Z') + line(80, 36, 80, 92)
const heart = path('M80 88 47 57C24 33 61 11 80 40c19-29 56-7 33 17Z')
const coin = circle(80, 57, 31) + circle(80, 57, 23) + path('M91 43H76q-15 0-12 12 1 7 16 7 16 0 15 10-1 8-15 8H66M80 35v52')
const lock = rect(59, 53, 42, 35, 7) + path('M67 53V42a13 13 0 0 1 26 0v11') + circle(80, 69, 3) + line(80, 72, 80, 77)
const star = path('m80 22 10 23 25 3-19 18 5 25-21-12-22 12 5-25-18-18 25-3Z')
const leaf = path('M47 86C28 30 78 19 121 27c-2 49-25 77-74 59ZM47 86l54-43M66 68V49M82 52h19')
const page = rect(51, 22, 59, 72, 5) + line(63, 39, 96, 39) + line(63, 49, 96, 49) + line(63, 59, 86, 59)
const clock = circle(80, 58, 32) + line(80, 58, 80, 37) + line(80, 58, 97, 66) + line(80, 31, 80, 32) + line(54, 58, 55, 58)
const cloud = path('M49 77a16 16 0 1 1 2-31 23 23 0 0 1 44-4 18 18 0 1 1 16 35Z')
const house = path('m35 53 45-31 45 31M45 47v44h70V47M70 91V64h21v27')
const battery = rect(40, 39, 75, 39, 6) + rect(115, 50, 8, 17, 2)
const figures = {
  cannabis: path('M80 100V46M80 75Q54 58 57 29q23 11 23 46ZM80 75q0-33 25-46 2 29-25 46ZM80 75Q37 72 31 48q31 1 49 27ZM80 75q18-26 49-27-6 24-49 27ZM80 75Q53 96 41 83q15-14 39-8ZM80 75q24-6 39 8-12 13-39-8ZM80 67Q66 38 80 13q14 25 0 54Z'),
  fashion: circle(80, 27, 9) + path('M72 39h16l11 15-9 13 17 30H53l17-30-9-13ZM65 45 49 66l7 8M95 45l16 21-7 8M73 98v7M87 98v7M72 67h16'),
  bowl: path('M35 56h90q-3 33-45 35-42-2-45-35ZM32 56h96M61 96h38M58 26q-8 8 0 16M80 19q-10 11 0 22M102 26q-8 8 0 16') + path('M53 55q4-14 15-5 6-15 18-5 11-6 18 10'),
  'browser-lock': browser + `<g transform="translate(24 3) scale(.7)">${lock}</g>`,
  capsule: path('m55 80 45-48a17 17 0 0 1 25 23L80 103a17 17 0 0 1-25-23Z') + line(77, 56, 101, 80) + line(68, 76, 62, 83),
  bottle: path('M69 20h22v21l13 15v36H56V56l13-15ZM69 28h22M57 65h47M57 82h47') + rect(72, 67, 16, 12, 3),
  vape: rect(54, 48, 52, 42, 6) + rect(71, 30, 18, 18, 2) + path('M76 23q-11-12 3-19M89 23q12-11 3-17') + circle(80, 69, 6),
  dice: rect(48, 25, 66, 66, 12) + circle(63, 40, 3) + circle(99, 40, 3) + circle(81, 58, 3) + circle(63, 77, 3) + circle(99, 77, 3),
  gamepad: path('M59 42h42q16 0 23 32 5 24-12 19L96 78H64L47 93Q30 98 36 74q7-32 23-32ZM55 55v19M46 64h19') + circle(102, 59, 3) + circle(112, 69, 3),
  social: chat + circle(64, 54, 4) + circle(84, 54, 4) + circle(104, 54, 4),
  play: phone + path('m73 45 19 12-19 13Z'),
  bag: path('M48 45h64l7 48H41ZM64 45V35a16 16 0 0 1 32 0v10') + path('M69 65q11 12 22 0'),
  candy: path('M60 42 41 31l2 22-13 17 23 2M100 42l19-11-2 22 13 17-23 2') + rect(55, 40, 50, 39, 13) + line(69, 41, 91, 78),
  phone: phone + path('M69 59h22M80 48v22'),
  bell: path('M50 79h60l-8-13V49a22 22 0 0 0-44 0v17ZM70 87q10 13 20 0M77 20h6') + path('M43 40q-8 11-7 23M117 40q8 11 7 23'),
  browser: browser + circle(80, 64, 17) + path('M63 64h34M80 47q-14 17 0 34 14-17 0-34Z'),
  news: rect(40, 25, 80, 68, 4) + rect(48, 37, 25, 25, 2) + line(83, 39, 110, 39) + line(83, 49, 110, 49) + line(83, 59, 106, 59) + line(49, 73, 109, 73) + line(49, 83, 91, 83),
  windows: rect(30, 22, 67, 49, 5) + rect(48, 39, 67, 49, 5) + rect(66, 56, 67, 41, 5) + line(67, 68, 133, 68),
  mail: rect(38, 33, 84, 57, 5) + path('m39 36 41 29 41-29M39 88l29-27M121 88 94 62') + circle(117, 28, 10),
  folder: path('M36 43V30h33l10 12h45v49H36Z') + line(36, 52, 124, 52) + path('M65 67h31M65 77h22'),
  'moon-phone': phone + path('M121 20a17 17 0 1 0 17 23 19 19 0 0 1-17-23Z'),
  'sun-phone': phone + circle(122, 31, 12) + path('M122 11V6M122 56v-5M101 31h-5M144 31h5M107 16l-4-4M137 46l4 4'),
  compare: rect(32, 32, 39, 57, 6) + rect(90, 20, 39, 69, 6) + path('m75 53 11-7M75 66l11 7') + circle(51, 48, 7) + circle(109, 38, 7),
  storm: cloud + path('m82 75-12 15h13l-8 15M48 88l-5 8M108 88l-5 8'),
  cloud: cloud + path('M57 87h45M69 97h22'),
  horizon: path('M30 78h100M42 77a38 38 0 0 1 76 0M80 32V19M46 41l-9-10M114 41l9-10M69 91h22') + circle(80, 61, 8),
  puzzle: path('M45 32h27a10 10 0 1 1 19 0h24v24a10 10 0 1 0 0 19v19H91a10 10 0 1 0-19 0H45V73a10 10 0 1 1 0-18Z'),
  flame: path('M80 17q5 26 24 32 23 21 3 43-25 18-50-2-19-20 1-42 1 12 12 15-8-25 10-46ZM81 64Q58 83 81 94q24-9 0-30Z'),
  balance: path('M80 22v66M59 92h42M41 40h78M49 40 35 68h28ZM111 40 97 68h28ZM35 68q14 21 28 0M97 68q14 21 28 0') + circle(80, 25, 5),
  mask: path('M43 30q37 13 74 0v36Q110 87 80 98 50 87 43 66ZM55 50q10-9 20 0M88 50q10-9 20 0M65 76q15-10 30 0'),
  diamond: path('M32 43 52 23h56l20 20-48 53ZM32 43h96M52 23l13 20 15 53 15-53 13-20M65 43l15-20 15 20'),
  spiral: path('M80 58q-10-7-13 4t15 15q23 2 26-19t-24-30Q45 24 43 61t45 40'),
  signpost: path('M79 23v76M35 32h70l15 12-15 12H35ZM125 64H55L40 76l15 12h70Z'),
  compass: circle(80, 58, 37) + path('m96 34-8 32-25 15 9-32ZM73 49l15 17M80 16v-5M80 100v4') + circle(80, 58, 3),
  spark: path('M80 23q2 32 32 35-30 3-32 35-2-32-32-35 30-3 32-35ZM120 20v16M112 28h16M37 80v14M30 87h14'),
  target: circle(80, 58, 35) + circle(80, 58, 23) + circle(80, 58, 10) + path('m80 58 40-39M109 17v13h15'),
  fork: path('M80 98V67L50 37M80 67l30-30M39 37h11V26M110 26v11h11'),
  gem: path('m80 21 38 22-15 40-23 15-23-15-15-40ZM42 43h76M80 21 66 43l14 55 14-55Z'),
  candle: rect(62, 48, 36, 45, 4) + path('M80 48V36M80 14q-22 22 0 22 22 0 0-22M51 97h58M70 49v17q7 10 14-2V50'),
  anchor: circle(80, 26, 9) + path('M80 35v58M58 48h44M43 68q1 25 37 25 36 0 37-25M35 75l8-7 7 7M110 75l7-7 8 7'),
  door: path('M45 94V23h70v71M60 94V34l40-9v69ZM44 94h74') + circle(91, 61, 2),
  yarn: circle(80, 57, 32) + path('M50 44q29-15 57 6M48 59q30-20 60 5M53 77q27-22 55-2M65 29q36 22 36 51M91 27Q65 48 58 77M106 81q30 8 25 17'),
  telescope: path('m44 70 53-37 15 24-54 30ZM97 33l15-9 17 27-17 6M76 78l-9 22M76 78l19 22') + line(33, 80, 43, 73),
  sprout: path('M80 94V54M80 65Q44 68 43 36q34-6 37 29ZM80 54q2-32 35-29 0 31-35 29M60 97h40'),
  megaphone: path('M43 49h24l44-23v64L67 67H43ZM58 68l9 26h15L72 71M121 44l12-6M121 72l12 6M124 58h14'),
  plant: path('M57 73h47L97 98H64ZM80 73V34M80 56Q50 59 46 33q29-6 34 23ZM80 43q4-25 32-23-1 26-32 23'),
  shield: path('M80 22q18 12 37 10v30Q110 86 80 99 50 86 43 62V32q19 2 37-10ZM65 58l11 11 23-25'),
  hands: path('m32 60 22-23 25 10 26-10 24 23-33 33-11-3-9 3-37-30M61 47l-12 9 17 16M80 47 65 62l8 8 18-12 25 20M79 80l11 11M89 70l13 14'),
  kite: path('m80 19 27 37-27 29-27-29ZM80 19v66M53 56h54M80 85q-15 8 0 15t-9 10') + path('m77 92 9 4-9 4'),
  parachute: path('M36 56a44 35 0 0 1 88 0ZM36 56l44 41 44-41M60 56l20 41 20-41M60 56q0-35 20-35 20 0 20 35') + rect(73, 94, 14, 8, 2),
  mountain: path('m23 96 40-70 20 34 17-40 38 76ZM48 53l15 8 10-16M86 52l14 11 13-13') + path('M100 20V9l20 6-20 6'),
  mirror: `<ellipse cx="80" cy="49" rx="27" ry="34"/>` + path('M72 82v17h16V82M60 99h40M68 51l22-22M76 64l15-15'),
  medal: path('m57 20 4 29 19 14 20-14 4-29H87l-7 17-7-17Z') + circle(80, 73, 25) + `<g transform="translate(32 37) scale(.6)">${star}</g>`,
  island: path('M33 91q47-22 94 0M27 98q11 6 22 0t22 0 22 0 22 0 22 0M76 86q13-35-2-52M74 34q-22-14-31 4 18-3 31-4ZM74 34q16-19 34-7-19 1-34 7ZM74 34q21 0 31 20-19-10-31-20Z'),
  lightning: path('m88 17-35 44h24l-8 36 37-48H82Z'),
  hearts: `<g transform="translate(-12 4) scale(.8)">${heart}</g><g transform="translate(42 23) scale(.7)">${heart}</g>`,
  house,
  'broken-heart': heart + path('m83 34-10 18 15 8-17 15 9 13'),
  lock,
  eyes: `<ellipse cx="57" cy="58" rx="23" ry="32"/><ellipse cx="104" cy="58" rx="23" ry="32"/>` + circle(64, 61, 9) + circle(110, 61, 9),
  letter: rect(35, 36, 90, 57, 4) + path('m35 38 45 33 45-33') + `<g transform="translate(50 -1) scale(.4)">${heart}</g>`,
  bubbles: path('M31 24h68v40H57L40 77V64h-9ZM104 43h26v42h-11v13l-18-13H70V72'),
  lifebuoy: circle(80, 57, 36) + circle(80, 57, 18) + path('m54 31 14 14M92 69l14 14M54 83l14-14M92 45l14-14'),
  hourglass: path('M53 23h54M53 94h54M57 23q0 25 23 35-23 10-23 36M103 23q0 25-23 35 23 10 23 36M62 85l18-13 18 13ZM65 36h30L80 48Z'),
  butterfly: path('M79 50Q51 11 38 33t25 34Q35 69 50 91t29-19Q110 114 117 88T97 66q41-21 22-38T81 50M80 46v39M80 48l-8-18M80 48l8-18'),
  battery: battery + rect(49, 47, 45, 23, 2) + path('M64 51v15M58 58h12'),
  briefcase: rect(34, 39, 92, 52, 6) + path('M65 39V27h30v12M35 57q45 22 90 0') + rect(73, 59, 14, 13, 2),
  'empty-battery': battery + rect(49, 47, 10, 23, 2) + line(69, 58, 91, 58),
  pin: path('M62 25h37l-6 20 15 15v8H52v-8l16-15ZM80 68v29M56 25h48'),
  clipboard: rect(49, 27, 64, 68, 5) + rect(66, 19, 30, 16, 4) + path('m59 53 4 4 8-9M80 53h21M59 72l4 4 8-9M80 72h21'),
  clock: clock + path('M51 21 39 32M109 21l12 11M57 85l-6 12M103 85l6 12'),
  blocks: rect(33, 60, 29, 29, 3) + rect(67, 60, 29, 29, 3) + rect(101, 60, 29, 29, 3) + rect(67, 26, 29, 29, 3) + line(32, 96, 132, 96),
  stop: path('M55 92 42 63q-5-16 7-16l13 19V33q0-14 10-5v29-37q10-8 12 3v34-32q10-8 12 4v31-21q10-8 12 5v31q-1 13-13 20Z'),
  wallet: rect(35, 33, 91, 57, 7) + path('M35 47V29l76-8v12') + rect(91, 52, 35, 24, 4) + circle(102, 64, 3),
  receipt: path('M51 20h59v77l-10-6-10 6-10-6-10 6-10-6-9 6ZM63 37h35M63 50h35M63 63h20M63 76h35'),
  piggy: path('M45 49q0-25 35-25 28 0 36 25l12 3v22l-16 5-4 17H95l-4-12H68l-4 12H51l-6-24Q24 68 35 51M55 31l-2-15 19 10M69 35h22') + circle(104, 50, 2),
  card: rect(33, 31, 95, 59, 7) + line(34, 48, 127, 48) + line(34, 58, 127, 58) + line(47, 76, 68, 76) + line(78, 76, 91, 76),
  bills: `<g transform="translate(14 -6)">${page}</g><g transform="translate(-9 3)">${page}</g>` + circle(102, 84, 13) + path('M102 77v8M102 90v1'),
  calculator: rect(53, 17, 54, 80, 6) + rect(62, 27, 36, 17, 2) + path('M64 56h3M78 56h3M92 56h3M64 70h3M78 70h3M92 70h3M64 84h3M78 84h3M92 84h3'),
  coin,
  chart: path('M38 22v69h88M48 42l21 17 20-11 29 29M106 77h12V65') + circle(48, 42, 3),
  'money-talk': chat + path('M88 39H74q-10 0-10 8 0 7 16 7t16 9q0 7-12 7H69M81 33v43'),
  shopping: path('M45 43h70l6 52H39ZM65 43V31a15 15 0 0 1 30 0v12') + `<g transform="translate(48 40) scale(.4)">${star}</g>`,
  graduation: path('m24 44 56-25 56 25-56 25ZM47 55v25q33 19 66 0V55M134 44v37M131 81h6v12h-6'),
  book,
  books: rect(35, 69, 89, 20, 3) + rect(42, 46, 75, 19, 3) + rect(49, 24, 60, 18, 3) + path('M48 78h61M54 56h49M58 33h42'),
  globe: circle(80, 57, 35) + path('M45 57h70M80 22q-31 35 0 70 31-35 0-70M51 38h58M51 76h58'),
  laptop: rect(41, 26, 79, 53, 5) + path('m41 79-13 15h104l-12-15ZM68 86h25') + path('m69 43-9 9 9 9M91 43l9 9-9 9'),
  certificate: rect(35, 25, 90, 64, 3) + rect(43, 33, 74, 48, 2) + line(62, 45, 98, 45) + line(62, 56, 92, 56) + circle(96, 76, 10) + path('m89 83-3 18 10-6 9 6-2-18'),
  tools: path('M55 22q-19 8-5 27l43 45q13 8 18-5 0-6-8-11L67 44q9-20-7-24l4 15-10 4-9-7M104 23 81 49M80 64 48 96l-10-10 28-32'),
  feedback: page + path('m65 72 9 8 25-21M117 34h17v26l-11 7'),
  antenna: path('M81 57v39M63 96h36M61 37q-21 21 0 42M46 24q-33 34 0 68M101 37q21 21 0 42M116 24q33 34 0 68') + circle(81, 57, 7),
  magnifier: circle(72, 49, 27) + path('m91 69 29 29-10 10-29-29M60 49h24M72 37v24'),
  bed: path('M31 92V39h12v40h83V59H76V45h38q12 0 12 14v33M43 60h29V45H43M31 79h95'),
  calendar: rect(39, 27, 83, 67, 6) + path('M39 45h83M58 19v17M103 19v17M54 58h8M77 58h8M100 58h8M54 73h8M77 73h8M100 73h8'),
  sun: circle(80, 57, 24) + path('M80 23V12M80 91v11M46 57H34M114 57h12M56 33l-8-8M104 81l8 8M56 81l-8 8M104 33l8-8'),
  shoe: path('M38 34h26q6 24 30 31l30 7v20H35V65ZM35 81h89M75 53l-12 8M88 61l-11 9M97 66l-8 10'),
  plate: circle(80, 58, 31) + circle(80, 58, 23) + path('M32 23v29M24 23v16q0 13 16 0V23M32 52v45M127 97V23q-14 12-11 38h11'),
  water: path('m58 32 6 63h34l6-63ZM61 57q12-6 23 0t18 0M80 13q-18 20 0 20t0-20Z'),
  chair: rect(50, 22, 57, 39, 7) + rect(45, 65, 68, 13, 4) + path('M55 61v4M103 61v4M55 78v22M103 78v22M57 43h43'),
  basket: path('M34 50h94l-12 45H46ZM54 50l14-25M108 50 94 25M61 61l5 23M80 61v23M100 61l-5 23M36 50l-6-10M126 50l6-10'),
  broom: path('m99 18-20 43M65 55l31 15-13 30-44-21ZM58 72l30 14M58 79l-6 8M68 84l-6 8M78 89l-6 8'),
  leaf,
}

const directory = new URL('../desktop/lite/assets/problems/', import.meta.url)
await mkdir(directory, { recursive: true })
for (const problem of problemCatalog) {
  const figure = figures[problem.artwork]
  if (!figure) throw Error(`Missing illustration: ${problem.artwork}`)
  const tilt = Number(problem.id) % 2 ? -5 : 5
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 112" role="img" aria-labelledby="title"><title id="title">${problem.name}</title><defs><linearGradient id="paper" x2=".7" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="${problem.background}"/></linearGradient></defs><rect width="160" height="112" rx="16" fill="${problem.background}"/><circle cx="82" cy="54" r="43" fill="#fff" opacity=".42"/><ellipse cx="81" cy="102" rx="40" ry="5" fill="${problem.color}" opacity=".12"/><g fill="none" stroke="${problem.color}" stroke-width="1.4" opacity=".45"><path d="M23 33h8m-4-4v8M129 83h8m-4-4v8"/><circle cx="133" cy="23" r="2.5"/><circle cx="23" cy="82" r="2"/></g><g transform="translate(14 5) scale(.83) rotate(${tilt} 80 58)" fill="${problem.color}" opacity=".13">${figure}</g><g transform="translate(12 1) scale(.83) rotate(${tilt} 80 58)" fill="url(#paper)" stroke="${problem.color}" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round">${figure}</g></svg>\n`
  await writeFile(new URL(`${problem.id}.svg`, directory), svg)
}
console.log(`Created ${problemCatalog.length} local SVG illustrations.`)
