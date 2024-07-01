
const axios = require('axios');

exports.dukeBasedNetID = async (event) => {
    try {
        const netID = event.pathParameters.netID;

        if (!netID) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'NetID is a required field' })
            };
        }

        const netIDurl = `https://streamer.oit.duke.edu/ldap/people/netid/${netID}?access_token=${process.env.DUKE_API_KEY}`;
        const result = await axios.get(netIDurl);

        console.log('result:', result.data  )

        return {
            statusCode: 200,
            body: JSON.stringify(result.data),
            headers: {
                'Content-Type': 'application/json',
            }
        };

    } catch (error) {
        console.error('Error in dukeBasedNetID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    }
}