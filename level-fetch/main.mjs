const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'DeviceData';

exports.handler = async (event) => {
    try {
        // Extract query parameters
        const { device, startDate, endDate } = event.queryStringParameters;

        // Validate query parameters
        if (!device || !startDate || !endDate) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid query parameters. "device", "startDate", and "endDate" are required.' }),
            };
        }

        // Query DynamoDB
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'device = :device AND #timestamp BETWEEN :startDate AND :endDate',
            ExpressionAttributeNames: {
                '#timestamp': 'timestamp', // Use ExpressionAttributeNames to handle reserved keywords
            },
            ExpressionAttributeValues: {
                ':device': device,
                ':startDate': startDate,
                ':endDate': endDate,
            },
            ScanIndexForward: true, // Order by timestamp (ascending)
        };

        const result = await dynamoDB.query(params).promise();

        // Return the data
        return {
            statusCode: 200,
            body: JSON.stringify({ data: result.Items }),
        };
    } catch (error) {
        console.error('Error querying data from DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};