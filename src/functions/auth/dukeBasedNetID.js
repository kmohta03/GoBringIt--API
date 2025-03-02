// IMPORTANT! DUKE API KEY MUST BE REPLACED YEARLY IN AWS SSM CONSOLE

// AWS SSM Console:
// https://us-east-1.console.aws.amazon.com/systems-manager/parameters/?region=us-east-1&tab=Table 

// DUKE API KEY (any duke affiliated person can get this):
// https://streamer.oit.duke.edu/dev_console/api_keys

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