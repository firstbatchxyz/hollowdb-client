const {HollowClient} = require('../build/src/index.js');

async function main() {
  const client = await HollowClient.createAsync({
    apiKey: '032c17ddb874904f112057bda9082c28',
    db: 'test',
    protocol: 'groth16',
  });

  const key = 'hdbaas-client-test-4';

  console.log('Starting the test..');

  try {
    console.log('put test');
    await client.put(key, payload);
  } catch (e) {
    console.log(e);
  }

  try {
    console.log('get test');
    const getResult = await client.get(key);
    console.log(getResult);
  } catch (e) {
    console.log(e);
  }
}

main();

const payload = {
  interests: {
    DeFi: 0.38030211707174877,
    Protocols: 0.38016503898823484,
    'Beauty Saloons': 0.2935222672064777,
    Pop: 0.2573386375297823,
    Ethereum: 0.2505840992622548,
    'High-end, Luxury': 0.23886639676113358,
    'Zero-knowledge Technology': 0.23451807088331886,
    "Invesment & VC's": 0.23017614885961454,
    'Smart Contracts': 0.22965795145156784,
    'App Design': 0.2254933629245764,
    Solana: 0.22065309217686857,
    'Crypto Exchanges': 0.2205198582857853,
    'Blockchain Technology': 0.21791694010669177,
    Entrepreneurship: 0.21661612818443843,
    Modelling: 0.19799794932108958,
    Avalanche: 0.19176427479589334,
    Artworks: 0.19104132616381134,
    'Product Design': 0.19082480982931,
    'Hip Hop': 0.1875938487029462,
    'UX/UI Design': 0.1836022840265331,
    "Women's Fashion": 0.18029708426572097,
    'RnB - Soul': 0.1780665872728214,
    Infrastructure: 0.17293256033722068,
    Metaverses: 0.16831329442338033,
    'Digital Art': 0.15834729492376365,
    'Crypto Trading': 0.15490087776064776,
    'Binance Chain': 0.1547013949112419,
    Engineering: 0.1456586568937685,
    "Men's Fashion": 0.1440620782726046,
    'Interior Design': 0.13865066884063684,
    NBA: 0.13501931995974223,
    'Artificial Intelligence': 0.13373061837698197,
    Polygon: 0.13043478260869565,
    'Web Development': 0.12710646312450435,
    'Colleges & Universities': 0.12629605997766788,
    'Caravan/Minivan': 0.12195121951219512,
    'Nail Saloons': 0.12078272604588394,
    'Piercing & Tatoos': 0.11867755532139093,
    Healthcare: 0.1132650158321789,
    'Self-Improvement': 0.11152623046225474,
    NBL: 0.10604256200486718,
  },
  social_accounts: {
    twitter: [
      'Beauty Mavens',
      'Music Guru',
      'Developer',
      'Web3.0 Citizen',
      'Researcher',
      'Automotive Enthusiasts',
      'Sports Fan',
      'Education Oriented',
      'Web3 Builder',
      'Garden & Decoration',
      'Designer',
      'Tech Guru',
      'Artist',
      'Fashionable',
      'Business',
      'Bookworm',
    ],
  },
  personhood: 5,
  last_update: '03/07/2023',
};
