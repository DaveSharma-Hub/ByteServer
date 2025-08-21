import Server from '../index.js';

const main = async() => {
    const schema = {
        id: 'number',
        name: 'string',
        isAdmin: 'boolean',
        age: 'number',
        projectId: 'number',
        project: 'string',
        value: {
            id: 'number',
            name: 'string'
        }
    }

    const server = new Server();

    server.use('*',(req, res, next)=>{
        console.log("Auth middleware");
        next();
        console.log("After");
    });
    server.use('/test',(req, res, next)=>{
        console.log("Other");
    });

    server.post('/test', (req, res)=>{
        const { projectId, project, value } = req.body.params;
        console.log(req);
        res.send({
            name:'Bob',
            id:2,
            comment:`Can you hear me?? this is the new id: ${projectId}_${project}`,
            arr: [9,8],
            arr2: [
                {
                    id: value.id,
                    location: 'string1'
                },
                {
                    id:34,
                    location: 'string2'
                },
                {
                    id:12,
                    location: 'string3'
                },
            ]
        });
    }, schema);
    server.post('/test2', (req, res)=>{
        console.log(req);
        res.send({
            name:'Janice',
            id:1,
            comment:'Yes I can'
        });
    }, schema);
    server.listen(3000, ()=>{console.log('Listening on port 3000')});
}

main();