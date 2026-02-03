import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Legacy users data from users.sql
const legacyUsers = [
  { username: 'SKB4862', email: 'dy694911@gmail.com', credit: 30806.00, user_type: 'admin', image: 'https://i.imgur.com/i7LgQPi.jpeg' },
  { username: 'djoat789', email: 'djoatsr789@gmail.com', credit: 51.00, user_type: 'staff', image: null },
  { username: 'SEK123', email: 'djsekremix5@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DJFOLKLK', email: 'zfezfolk@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'KonRemix', email: 'warapornsaetan7@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/iXZUqMt.jpg' },
  { username: 'prmixz007', email: 'watcharapong.pee0624@gmail.com', credit: 0.00, user_type: 'admin', image: 'https://i.imgur.com/UKxNMGY.png' },
  { username: 'nopremix', email: 'djnop100@gmail.com', credit: 0.00, user_type: 'admin', image: null },
  { username: 'artremixver2', email: 'artremixver2@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'porschercz123', email: 'djpbmwm3@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'saha24', email: 'taxw@outlook.co.th', credit: 0.00, user_type: 'user', image: null },
  { username: 'Parinyapap', email: 'parinyapap123@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'zak0012', email: 'tyuryuyu000012@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Panwadee', email: 'kanjana160438@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'putrakiet', email: 'afifputracahya@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/cBP8OUW.jpg' },
  { username: 'Lzremix', email: 'lzremix330@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'PetchHoupai', email: 'petch2547hee@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Apirak', email: 'Apirak549@icloud.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'mwme145', email: '062608kajon@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'ArmKtp', email: 'filmf807@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Thitiphong1', email: 'thitiphong202@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Prpproject', email: 'phxrapat001@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/nWg1Qs4.jpeg' },
  { username: 'pongsakorn', email: 'pongsakorngalaxy11@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'mawastore', email: 'liftmos7@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'AitkungZ', email: 'rungchats001@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'ball1412ff', email: 'kaphathrphanaratn14@gmail.cm', credit: 0.02, user_type: 'user', image: null },
  { username: 'pepper', email: 'pepper.mm@hotmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'petchhoupai012', email: 'petchphatchanok@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Rattapum', email: 'djfilmremix2@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DJMoNReMiX', email: 'jirayupingkasan.5@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Thirawat', email: 'gtaivpro123@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Deaw25', email: 'mamazung5@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Somkiatzz', email: 'somkiatkin3@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'peach44', email: 'matouch2011@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BASTYKIMICHI', email: 'basfii.09989@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Djmumremix', email: 'wattmum01@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/lS8DT4n.jpeg' },
  { username: 'RTEIDID', email: 'remixxdjbank@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'pnw1299', email: 'panuwatsaeoueng@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'yedhee123', email: 'kunehee1234@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Lek96907', email: 'leklek96907@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Monrit555', email: 'monrit444@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DeejayzDen', email: 'deejayzden007@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'chanasak2003', email: 'Chanasak15366@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'kanawatdeewun77', email: 'kanawatdeewun77@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'AONGAENG', email: 'epkokz22@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Poowanart', email: 'djpoocandy3500mt@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DJGIMRMX', email: 'plakim0925@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BiwzRemix', email: 'djbzyremix11@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'aezakmi1', email: 'wilove153@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Panyathinan', email: 'panya1998@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'samzy55', email: 'kamprana2550@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'T4SSRMX', email: 'guzaza0023@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BossKunGx', email: 'gtazaa111@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DJBlack0147', email: 'djsontkainarak@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'tossatum12', email: 'tossatum12za@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'FLUKERONGLAAB', email: 'flukecap125@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'dnz221100', email: 'dnz221100@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'T4NGR3MiX', email: 'nattadol2546@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'wayboy', email: 'settoonsuna@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DjMumkung', email: 'watthanachai55021@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'ptrx2064', email: 'pzon1203@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'phaicyn', email: 'khunphai1101@hotmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/OrCTObQ.jpeg' },
  { username: 'thanakorn', email: 'fhgfjk282@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Jirasin', email: 'Nutjirasinkukham@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'hutmaxzy1412', email: 'nontarrak25662@gmail.com', credit: 1.70, user_type: 'user', image: null },
  { username: 'FZEE1233', email: 'sainttheephop@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'weerachai', email: 'hnumzakaratak55@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'paperpepoo1', email: 'NOOL.WORRAWOUT@GMAIL.COM', credit: 0.00, user_type: 'user', image: null },
  { username: 'Phoukao', email: 'khunthanou123@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Kenchin', email: 'santggyui12@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'audioequipmentthremix', email: 'chja1199@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/GZKUsq8.png' },
  { username: 'KUNTARRMX', email: 'KUNTARRMXZX@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Gotsamsun', email: 'tanogtouy@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'aunremix', email: 'aunsayzing@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'thswrmx', email: 'txnzyrmx@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'fzremix', email: 'sahdow12.12@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'folk90lklk', email: 'dggzjrtttizn@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BNiXREMIX', email: 'thanaphat37754@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'myoarkarlin1999', email: 'myoarkarlin1999@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'lateamix24', email: 'toonmc1507@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Joniibanez92', email: 'jhonimualangfc@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Jhoniibanez', email: 'gidasnovandi@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'KenKhaito', email: 'kenkhaito6@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BANKREMIX', email: 'dicebaengkhrimiksx@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'OXYGEN', email: 'ssrz2545@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Phetchabun', email: 'nuengqq2026@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'BF081164', email: 'boyshop1187@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'MARKET1941', email: 'fam30524@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'iiiiaaaaa', email: 'hih825770@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'warpbar', email: 'artherthz@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'peezx31', email: 'samsung.ssg1263@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Wattana', email: 'wathnakhasaed15@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'VcSot9', email: 'thirathep7979@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Donrmx', email: '0652672973qwe@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'CHEETAR121', email: 'kkunammarineiei@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Watcharaphonrmx', email: 'wachrphlkhabuytri@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'galex1995', email: 'galaxslick@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'MAEwTY', email: 'maewtyloveyou@gmail.com', credit: 300.00, user_type: 'user', image: null },
  { username: 'BLACKREMIX', email: 'djblackofficial6@gmail.com', credit: 52.00, user_type: 'user', image: null },
  { username: 'Apriyanta', email: 'h3h3h3wkwkw@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Rosyploy', email: 'sayhigh075@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'OTacung008', email: 'ananda7h@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'sengsense20', email: 'sengsense20@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'zskrmx', email: 'ssainoep@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Night123864', email: 'Siripon.pimnon@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'dnz2110', email: 'danaithepdk211045@gmail.com', credit: 0.11, user_type: 'user', image: null },
  { username: 'warayut29', email: 'warayut29peangkaew@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'phumza', email: 'poomza6529@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Pondremixx000', email: 'pirzremix@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'topfy555', email: 'monrit5544@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'peeremixofficial', email: 'prathanphonthosaeng@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'KaoREMiXV3', email: 'mabonc2005@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Taentnt', email: 'jektay6666@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'FRAMEREMIX01', email: 'framee7789@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Maewrmx25', email: 'maewno06@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'drjdjdj', email: 'gon66hw6@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'gtasas', email: 'r92025@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Wintefell123', email: 'boltwinterfell@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Anuphong', email: 'coach255qq@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'GONrmx', email: 'ponu101039@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Jamechilltoxz', email: 'jamechilltoxz@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/WRSUnFz.jpeg' },
  { username: 'Surachk18', email: 'surachaikaewnil98@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'KUNGRMx', email: 'kung08251259622545@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'KatoRemix', email: 'kato.remix2546@gmail.com', credit: 0.00, user_type: 'user', image: 'https://i.imgur.com/4fnlO9d.jpeg' },
  { username: 'KILMOIIII', email: 'zwezee7d@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'NonRemix', email: 'remix065657@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'crmxxx', email: 'champforwork2110@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'minthada', email: 'minthada095@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'bangjob', email: 'supanut.job@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'jaophat2207', email: 'psk.6707za@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Kfjwsk', email: 'gcrgod948@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'sitthichok', email: 'jtreixm@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'ThanawatTnp', email: 'wanchanapongtha17@icloud.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'iiamtxm', email: 'info.iiamsaso2@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DfsEran', email: 'gaje1238@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'DJWITREMIX', email: 'mansome7582@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Khunka', email: 'ctate6652@email.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Hutrmx', email: 'mahachai112548@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Barmiwanthana', email: 'petchtae89@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'icezy2148', email: 'siwapongphon@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'RACHAIN', email: 'siripathseekeaw05@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Nopkun', email: 'hale2612b@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Nopkun1', email: 'lol37no1@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'gunzeedrex', email: 'work@thanakirt.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'metasitDomDZ', email: 'metasit55576@gmail.con', credit: 160.00, user_type: 'user', image: null },
  { username: 'pingkungXD', email: 'mymini063@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'donlee', email: 'nizremix1996@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'jackxa', email: 'ptest4291@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Kanzer', email: 'djkansr23@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'nuzy77', email: 'nuremix90@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'anusacks', email: 'djrwetet@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'private', email: 'privatejet@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'JCCLUB', email: 'ammarin424@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'mxszii', email: 'theerawat.2623@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'COTTDK', email: 'cotpip1111@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'djmzyremix', email: 'mzyremixth@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'RainPi', email: 'rainkungz7242@gmail.com', credit: 0.10, user_type: 'user', image: null },
  { username: 'gtrrg106gmailcom', email: 'gtrrg106@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Bzradio', email: 'kiki85354@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Chayanon234669', email: 'chayanonthongmuang30157@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'tarutklongzing', email: 'djrutlamley@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'nutkub', email: 'wqdwqdwdwqdwq@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'hutmaxzy14120', email: 'nontharakbeat2004@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'uthen3097', email: 'Uthen1995nam@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'djgolftsu', email: 'golftsu1@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Ratchanon', email: 'ratchanon082183@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'mrputrakiet', email: 'rahstudiomusic@gmai.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'HeartzyDz', email: 'ffx2345@gmail.com', credit: 40.00, user_type: 'user', image: null },
  { username: 'Palmvybug', email: 'm0967972540@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Palm123', email: 'Kawin123@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'polly147', email: 'thrphlmingemuxng25@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'tongnza', email: 'lzremix02@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Rattapumrmx', email: 'rattapumk555@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'Aemlnwza', email: 'xaemx9148@gmail.com', credit: 0.00, user_type: 'user', image: null },
  { username: 'deenexe', email: '0x01000100.hex@gmail.com', credit: 0.00, user_type: 'user', image: null },
];

async function migrateLegacyUsers() {
  console.log('🚀 Starting legacy user migration...');
  console.log(`📊 Total legacy users to migrate: ${legacyUsers.length}`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const legacyUser of legacyUsers) {
    try {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: legacyUser.email.toLowerCase() },
      });

      if (existingUser) {
        console.log(`⏭️  Skipped (exists): ${legacyUser.email}`);
        skipped++;
        continue;
      }

      // Map user_type to role
      const role = ['admin', 'staff'].includes(legacyUser.user_type) ? 'ADMIN' : 'USER';

      // Create user with null password (legacy user)
      await prisma.user.create({
        data: {
          email: legacyUser.email.toLowerCase(),
          name: legacyUser.username,
          password: null, // Legacy user - requires password reset
          role: role,
          creditBalance: legacyUser.credit,
          image: legacyUser.image,
        },
      });

      console.log(`✅ Imported: ${legacyUser.username} (${legacyUser.email}) - Credit: ${legacyUser.credit}`);
      imported++;
    } catch (error) {
      console.error(`❌ Error importing ${legacyUser.email}:`, error);
      errors++;
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📊 Total: ${legacyUsers.length}`);
}

migrateLegacyUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
