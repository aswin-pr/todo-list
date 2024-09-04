//All doc requirements go here
const express = require('express');
const path = require('path');
const fs = require('fs');


//initatize express into an app for calling
const app = express();
app.use(express.json());

// ----
// Removing this line because now we are using @vercel/static to serve static assets
// ----
// app.use(express.static(path.join(__dirname, 'public')));

// const data = {
// }

// ----
// Removing this block because it's duplicating with what we do in Line 11.
// In fact, this is just a subset of what we do in Line 11, since we are only
// serving the index.html file here whereas in Line 11 we are serving the entire
// public folder.
// ----
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', index.html), function (err) {
//         if (err) {
//             console.log('Error sending file: ' + err);
//             res.status(500).send('Error sending file');
//         } else {
//             console.log('File sent:')
//         }
//     })
// })

// ----
// Removing this block because now @vercel/node should handle how to setup, run
// and attach the server
// ----
// app.listen(5000, () => {
//     console.log('Server running at 5000');
// });

// app.post('/data', async (req, res) => {
//     const result = await req.body;
//     let arry = [];
//     const string = JSON.stringify(result)
//     arry.push(string)
//     console.log(arry)
//     res.status(200).send('Thanks')
//     console.log(result)

//     fs.writeFile('tasks.txt', '\n' + arry, {
//         flag: 'a'
//     }, (err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log('successful')
//         }
//     })
// })


let getTasks = (req, res) => {
    fs.readFile('tasks.txt', {
        encoding: 'utf-8'
    }, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred' + err);
        } else {
            res.send(data);
        }
    });
};

let deleteTask = (req, res) => {
    const idToDel = req.body.id;

    fs.readFile('tasks.txt', {
        encoding: 'utf-8'
    }, async (err, data) => {
        try {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred' + err);
            } else {
                //find the id 
                //then remove the json with the id
                const jsonmeth = JSON.parse(data);
                const itemToDel = jsonmeth.find(item => item.task == idToDel);
                if (itemToDel === -1) {
                    res.sendStatus(500).send('Error on itemtodel');
                    return;
                }
                const indexOfItem = jsonmeth.indexOf(itemToDel);
                const x = jsonmeth.splice(indexOfItem, 1);
                const updatedValues = JSON.stringify(jsonmeth, null, 2);

                // write file after matching
                fs.writeFile('tasks.txt', updatedValues, (writeErr) => {
                    if (writeErr) {
                        console.log(writeErr);
                        res.status(500).send('Error writing to the file');
                    } else {
                        res.status(204).send('Delete and update done');
                        console.log('dpne write');
                    }
                });
            }
        } catch (err) {
            console.log('ERRORRR at delete post' + err);
        }
    });
};



//from chatGPT

let newTask = async (req, res) => {
    const newTask = req.body; // New task object from the request body

    // Step 1: Read the existing file content
    fs.readFile('tasks.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') { // Ignore the error if file doesn't exist
            console.log(err);
            res.status(500).send('Error reading the file');
        }

        let tasksArray = [];

        // Step 2: Parse the file content to get the array (if the file is not empty)
        if (data) {
            try {
                tasksArray = JSON.parse(data); // Parse existing data as an array
            } catch (parseError) {
                console.log(parseError);
                res.status(500).send('Error parsing the file content');
            }
        }

        // Step 3: Add the new task to the array
        tasksArray.push(newTask);

        // Step 4: Convert the updated array back to a JSON string
        const updatedData = JSON.stringify(tasksArray, null, 2); // Pretty print with 2 spaces

        // Step 5: Write the entire array back to the file
        fs.writeFile('tasks.txt', updatedData, (writeErr) => {
            if (writeErr) {
                console.log(writeErr);
                res.status(500).send('Error writing to the file');
            }

            console.log('File successfully updated');
            res.status(200).send('Task added successfully');
        });
    });
};

// function reWriteFile(val) {
//     fs.writeFile('tasks.txt', val, (writeErr) => {
//         if (writeErr) {
//             console.log(writeErr);
//             return res.status(500).send('Error writing to the file');
//         } else {
//             res.status(200).send('Delete and update done');
//         }
//     });
// }

app.use(async (req, res) => {
    console.debug(req.method, req.url);
    switch (req.url) {
        case '/data':
            switch (req.method) {
                case 'GET':
                    await getTasks(req, res);
                    break;
                case 'POST':
                    await newTask(req, res);
                    break;
                case 'DELETE':
                    await deleteTask(req, res);
                    break;
                default:
                    res.status(400).json({ok: false, error: 'Method not allowed'});
            }
            break;
        default:
            res.status(404).json({ok: false, error: 'Route not found'});
    }
});

module.exports = app;
