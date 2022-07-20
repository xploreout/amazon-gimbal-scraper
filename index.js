const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const accountAuthToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, accountAuthToken);

const URL =
  'https://www.amazon.com/DJI-Smartphone-Stabilizer-Extension-ShotGuides/dp/B099ZXD27F/ref=sr_1_1_sspa?crid=38AYB9U8XVDBB&keywords=gimbal';

const targetPrice = 140
const item = {
  name: '',
  price: '',
  url: URL,
};

const handleInterval = setInterval(scrape, 10000)
async function scrape() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'axios 0.27.2',
      },
    });

    const $ = cheerio.load(data);
    const product = $('div#dp.photo.en_US');

    item.name = $(product).find('span#productTitle').text().slice(0,30);
    item.price = $(product)
      .find('span .a-price-whole')
      .first()
      .text()
      .replace(/[.,]/g, '');

    const priceNum = +item.price;
    console.log(`checking price for ${item.name} below price $${targetPrice}, now at $${item.price} `)

    if (priceNum < targetPrice) {
      console.log(`${item.name} is priced below $${item.price} now, click ${URL}`)
      clearInterval(handleInterval)

      // COMMENT OUT - waiting twilio to set up phone# 

      // client.messages.create({
      //   body: `${item.name} is priced below $${item.price} now, click ${URL}`,
      //   from: process.env.FROM_PHONE_NUMBER,
      //   to: process.env.TO_PHONE_NUMBER
      // }).then(message => {
      //   clearInterval(handleInterval)
      //   console.log(message)
      // });
    }
  } catch (error) {
    console.log(error);
  }
}

scrape();
