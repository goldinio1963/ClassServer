const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const validation = require('./middleware/validationToken');
const { Students } = require('./studentModel');
const mongoose = require( 'mongoose' );
const core = require('./middleware/core');
const {DATABASE_URL,PORT} = require('./config');

const app = express();
app.use( core );
const jsonParser = bodyParser.json();
app.use( express.static("public"));
app.use (morgan('dev'));
app.use (validation);


let listOfStudents = [
    {
        name: "Marcel",
        id : 123
    },
    {
        name: "Martha",
        id: 456
    },
    {
        name: "Julieta",
        id:789
    }
];

app.get( '/api/students', ( req, res ) => {

    console.log( "Getting all students." );

    Students
        .getAllSudents()
        .then(result => {
            return res.status( 200 ).json( result );
        });
   
});


//http://localhost:8080/api/students

app.get('/api/studentById', (req, res) => {
    console.log("Getting a student by id");

    console.log(req.query);

    let id = req.query.id;
    
    if(id === undefined) {  //!id
        res.statusMessage = "Please send the 'id' as parameter"
        return res.status(406).end();
    }

    let result = listOfStudents.find( (student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage = `There are no students with the provided id=${id}`;
        return res.status(404).end();
    }

    return res.status(200).json(result);
});

app.get('/api/getStudentById/:id', (req, res) => {
    console.log("Getting a student bu id by usaing the integrated param.")
    console.log(req.params);

    let id = req.params.id;

    let result = listOfStudents.find( (student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage = `There are no students with the provided id=${id}`;
        return res.status(404).end();
    }

    return res.status(200).json(result);    
});

//http://localhost:8080/api/getStudentById/something(456)

app.post( '/api/createStudent', jsonParser,(req, res) => {
    console.log("Create a new student in the list");
    console.log("Body", req.body);

    let name = req.body.name;
    let id = req.body.id;

    if (!id || !name) {
        res.statusMessage = "One of the parameters is missing in the request 'id' or 'name'";
        return res.status(406).end();
    }

    if (typeof(id) !== 'number') {
        res.statusMessage = "This 'id' is not a number";
        return res.status(403).end();
    };

    //validate that the id doesnt exist

    const newStudent = {
        id,
        name
    }

    Students
        .createStudent( newStudent )
        .then (result => {
            return res.status( 201 ).json(result);
        })
        .catch (err => {
            res.statusMessage = "Something went wrong with the DB. Try again later.";
            return res.status (500).end()
        });    
});

app.delete( '/api/removeStudent', (req,res) => {
    let id = req.query.id;

    if(!id) {
        res.statusMessage = "Please send the 'id' to delete a student";
        return res.status(406).end();
    }

    let itemToRemove = listOfStudents.findIndex( (student) =>{
        if(student.id === Number(id)) {
            return true;
        }
    });

    if(itemToRemove < 0){
        res.statusMessage = "That 'id' was not found in the list of students"
        return res.status(400).end();
    };

    listOfStudents.splice(itemToRemove,1);
    return res.status(204).end();

});

app.listen( PORT, () => {
    console.log( "This server is running on port 8080" );
    new Promise( ( resolve, reject ) => {
        const settings = {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true
        };
        mongoose.connect( DATABASE_URL, settings, ( err ) => {
            if( err ){
                return reject( err );
            }
            else{
                console.log( "Database connected successfully." );
                return resolve();
            }
        })
    })
    .catch( err => {
        console.log( err );
    });
});

//http://localhost:8080

//mongodb+srv://admin:HoTUV2v5PjyKzgUB@myfirstcluster-rkqut.mongodb.net/studentsdb?retryWrites=true&w=majority