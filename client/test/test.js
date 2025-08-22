import Client from "../index.js";

const main = async() => {
    const schema = {
        id: 'number',
        name: 'string',
        comment: 'string',
        arr: ['number'],
        arr2: [{
            id:'number',
            location: 'string'
        }]
    };

    const client = new Client({url: 'http://localhost:3000'});
    const a = await client.get({
        id:'number'
    })('/another?id=1&name=john');
    console.log(a);
    // const result = await client.post(schema)('/test', {
    //     id: 3,
    //     name: 'Cooley',
    //     isAdmin: false,
    //     age: 54,
    //     projectId: 344,
    //     project: 'cool_123_id',
    //     value: {
    //         id:323,
    //         name:'Hello'
    //     }
    // });
    // const result2 = await client.post(schema)('/test2', [
    //     {
    //         id: 3,
    //         name: 'Cooley',
    //         isAdmin: false,
    //         age: 54,
    //     },
    //     {
    //         id: 6,
    //         name: 'Bailyn',
    //         isAdmin: true,
    //         age: 34,
    //     },
    // ]);
    // console.log(result2);
}

main();