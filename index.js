const http = require('./lib/http');
const moment = require('moment');
const twilio = require('twilio');

//===== Set the frequency time to run the script
const isCronJob = false; // Make it `true` if want to run as cron job. If it is true then next config is important to set the frequency time.
const frequencyTimeInMs = 10 * 60 * 1000; // time in Milliseconds. Default value is: 10 min.
//===== Whatsapp integration: Twilio config.
const accountSid = '*****';
const authToken = '*****';
const fromNumber = 'whatsapp:+11111111111'; //twilio sandbox number
const toNumber = 'whatsapp:+911111111111'; // number where to send the notification
//===== CoWin API's Config
const filterAgeGroup = 18; // Enum: 18,45
const districtId = 581; // district id. Refer id from data/district.json
const qtyMinThershould = 5; // alert when min slot capacity is available.
const curDate = moment().format("DD-MM-YYYY");
const uri = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${districtId}&date=${curDate}`;
const headers = {
    'authority': 'cdn-api.co-vin.in',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'origin': 'https://selfregistration.cowin.gov.in',
    'sec-fetch-site': 'cross-site',
    'sec-ch-ua': ' Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
    'sec-ch-ua-mobile': '?0'
};
//=====

function sendWhatsAppMessage(message) {
    const client = twilio(accountSid, authToken);

    client.messages
    .create({
        body: message,
        from: fromNumber,
        to: toNumber
    })
    .then(message => console.log('twilio session id: ', message.sid))
    .catch(err => console.log('twilio error: ', err.message));
}

const script = async function() {
    try {
        const availableCenters = [];
        const resText = await http.get({uri, headers});
        const data = JSON.parse(resText);
        const { centers } = data;
        if(centers) {
            for(let i = 0; i < centers.length; i++) {
                const { name, address, block_name, state_name, district_name, pincode, sessions, vaccine_fees=[] } = centers[i];
                for(let i = 0; i < sessions.length; i++) {
                    const { date, available_capacity, min_age_limit, vaccine, slots } = sessions[i];
                    const [vaccine_fee=0] = vaccine_fees;


                    if(available_capacity >= qtyMinThershould && filterAgeGroup === min_age_limit) {
                        availableCenters.push({
                            name, address, block_name, state_name, district_name, pincode, date, vaccine, slots, vaccine_fee, available_capacity
                        });
                    }
                }
            }
        }

        if(availableCenters.length > 0) {
            let text = `Top 10 Available Vaccine Centers for district:[${districtId}] and ageGroup:[${filterAgeGroup}]:`;
            for(let i = 0; i < Math.min(availableCenters.length, 10); i++) {
                const availableCenter = availableCenters[i];
                const { name, address, block_name, state_name, district_name, pincode, date, vaccine, slots, vaccine_fee, available_capacity } = availableCenter;
                text += `\nDate: ${date} | ${vaccine} | ${name}, ${address}, ${district_name}-${pincode} | Fee: ${vaccine_fee} | Available: [${available_capacity}]`;
            }
            console.log(text);
            sendWhatsAppMessage(text);
        } else {
            console.log(`No vaccines are available for districtId: [${districtId}] and ageGroup: [${filterAgeGroup}]`);
        }

    } catch(err) {
        console.log(`System Error`, err);
    }
}

if(isCronJob) {
    setInterval(script, frequencyTimeInMs);
} else {
    (script)();
}
