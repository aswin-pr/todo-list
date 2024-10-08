const taskinput = document.getElementById('taskinput');
const button = document.getElementById('inputSubmit');
const taskArea = document.getElementById('taskArea');

button.addEventListener('click', (e) => {
    const value = taskinput.value;
    if (!value) {
        window.alert('Enter a task')
    } else {
        createTask(value, taskCounter)
        taskCounter++
        taskinput.value = '';
        postToBackend(value)
    }
})

let taskCounter = 1;

//create task elements with value
function createTask(val, count) {
    const task = document.createElement('p');
    const taskDiv = document.createElement('div');
    const deleteBtn = document.createElement('button')
    const checkBtn = document.createElement('button')

    //setting attributes & styling
    taskDiv.setAttribute('id', `taskDiv${count}`)
    

    deleteBtn.setAttribute('class', 'deleteBtn');
    deleteBtn.innerText = 'delete';
    taskDiv.style.display = 'flex';

    checkBtn.setAttribute('class', 'checkBtn');
    checkBtn.innerText = 'Mark as done';

    task.innerText = val


    //all appends
    taskDiv.appendChild(task)
    taskDiv.appendChild(deleteBtn)
    taskDiv.appendChild(checkBtn)
    taskArea.append(taskDiv);


    //All event listeners here
    deleteBtn.addEventListener('click', (event) => {
        deleteTask(event)
    })
    checkBtn.addEventListener('click', (e) => {
        if (checkBtn.innerText !== 'Mark as unresolved') {
            checkDone(e)
            checkBtn.innerText = 'Mark as unresolved'
            console.log('operationd one')
        } else {
            unCheck(e)
            checkBtn.innerText = 'Mark as done';
        }
    })
}

async function deleteTask(e) {
    //logic - get current div id & delete it
    const target = e.target;
    const parentNode = target.parentNode;
    console.log(parentNode)

    const valToFetch = parentNode.id.toString()
    const id = valToFetch.match(/(\d+)/)[0]


    parentNode.remove();

    if (id) {
        const response = await fetch('/data', {
            headers: { "Content-Type": "application/json" },
            method: 'DELETE',
            body: JSON.stringify({id: id})
        })

        if (response.status !== 204) {
            console.log("Cannot delete your item from list");
        }
    } else {
        console.log('cant find id at the deleteTask function')
    }
}

function checkDone(e) {
    const target = e.target;
    const targetNode = target.parentNode.firstChild;
    targetNode.style.textDecoration = 'line-through'
}

function unCheck(e) {
    const target = e.target;
    const targetNode = target.parentNode.firstChild;
    targetNode.style.textDecoration = 'none'
}


window.addEventListener('load', async (e) => {
    checktaskCounter();
    try {
        const response = await fetch('/data');
        const text = await response.text();
        const data = JSON.parse(text)

        if (taskArea.children.length > 0) {
            taskArea.innerHTML = ''
            data.map(item => {
                console.log(item)
                createTask(item.taskValue, item.task)
            })
        } else {
            data.map(item => {
                console.log(item)
                createTask(item.taskValue, item.task)
            })
        }

    } catch (error) {
        console.log('Error:', error);
    }
})


function postToBackend(val) {
    fetch('/data', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                task: taskCounter,
                taskValue: val
            })
        })
        .then(() => {
            console.log('Post successful' + val)
        })
        .catch((err) => {
            console.error('Theres an error ' + err)
        })
}

async function checktaskCounter() {
    await fetch('/data')
    .then(response => response.json())
    .then(result => {
        taskCounter = result.pop().task;
        console.log(taskCounter + ' Value when the checker func is called')
    })
    .catch(err => console.log('Error: ' + err))
}
