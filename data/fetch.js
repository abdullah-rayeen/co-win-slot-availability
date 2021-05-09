const states = require('./states.json');
const http = require('../lib/http');
const fs = require('fs');
const headers = {
    'authority': 'cdn-api.co-vin.in',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'origin': 'https://selfregistration.cowin.gov.in',
    'sec-fetch-site': 'cross-site',
    'sec-ch-ua': ' Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
    'sec-ch-ua-mobile': '?0'
};
setTimeout(async function() {
    try {
        for(let i = 0; i < states.length; i++) {
            const { state_id } = states[i];
            const uri = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`;
            const resText = await http.get({uri, headers});
            const data = JSON.parse(resText);
            const { districts } = data;
            for(let i = 0; i < districts.length; i++) {
                const district = districts[i];
                fs.appendFileSync('./district.json', `,${JSON.stringify(district)}`);
            }
        }
    } catch(err) {
        console.log(`System Error`, err);
    }
}, 0);