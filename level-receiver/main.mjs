const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'DeviceData';

exports.handler = async (event) => {
    try {
        // Parse the incoming request body
        const body = JSON.parse(event.body);

        // Validate the payload
        if (!body.device || typeof body.level !== 'number') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid payload. "device" and "level" are required.' }),
            };
        }

        // Prepare the item to be stored in DynamoDB
        const item = {
            device: body.device,
            level: body.level,
            timestamp: new Date().toISOString(),
        };

        // Save the item to DynamoDB
        await dynamoDB
            .put({
                TableName: TABLE_NAME,
                Item: item,
            })
            .promise();

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully', item }),
        };
    } catch (error) {
        console.error('Error saving data to DynamoDB:', error);

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};