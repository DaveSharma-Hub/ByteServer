import Client from "../index.js";

const main = async() => {
    const schema = {
        id: 'number',
        name: 'string',
        comment: 'string'
    };

    const client = new Client({url: 'http://localhost:3000'});
    const result = await client.post(schema)('/test', {
        id: 3,
        name: 'Cooley',
        isAdmin: false,
        age: 54,
        projectId: 344,
        project: 'cool_123_id'
    });
    console.log(result);
}

main();