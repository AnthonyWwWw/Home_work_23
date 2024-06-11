let saveStatusPOST = true;

const getResponse = async () => {
    return fetch('http://localhost:5002/todos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
}

document.querySelector('#buttonGetTask').addEventListener('click', async () => {
    if (saveStatusPOST){
        const response = await getResponse(); 
        const data = await response.json();
        checkingAvailabilityTasks(data);
    }else{
        alert('No new tasks have been added');
    }
    saveStatusPOST = false;
});

function checkingAvailabilityTasks(data) {
    if (data.length === 0) {
        console.log('The database does not contain tasks');
    } else {
        const tbodyConteiner = document.querySelector('#tbody-conteiner');
        tbodyConteiner.innerHTML = '';
        renderTask(data);
    }
}

function renderTask(data) {
    const tbodyConteiner = document.querySelector('#tbody-conteiner');
    data.forEach(task => {
        const newTask = document.createElement('tr');
        newTask.innerHTML = `
            <th scope="row">${task._id}</th>
            <td>${task.text}</td>
            <td data-progress>${task.done ? 'Done' : 'In progress'}</td>
            <td>
                <button type="button" data-id="${task._id}" class="btn btn-danger button-delete">Delete</button>
                <button type="button" data-id="${task._id}" class="btn btn-success ms-1 button-finished">Finished</button>
            </td>
        `;
        tbodyConteiner.append(newTask);
    });

    document.querySelectorAll('.button-delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const targetButton = event.target;
            const idDeleteElement = targetButton.getAttribute('data-id');
            const response = await deleteResponse(idDeleteElement);
            if (response.ok) {
                targetButton.closest('tr').remove();
            } else {
                console.error('Failed to delete task');
            }
        });
    });

    document.querySelectorAll('.button-finished').forEach(button => {
        button.addEventListener('click', async (event) => {
            const targetButton = event.target;
            const idElement = targetButton.getAttribute('data-id');
            const row = targetButton.closest('tr');
            const doneCell = row.querySelector('td[data-progress]');
            let doneValue = doneCell.textContent === 'Done';
            if (doneValue) {
                doneCell.textContent = 'In progress';
            } else {
                doneCell.textContent = 'Done';
            }

            const response = await putResponse(idElement, !doneValue); 
            if (!response.ok) {
                console.error('Failed to update task');
                if (doneValue) {
                    doneCell.textContent = 'Done';
                } else {
                    doneCell.textContent = 'In progress';
                }
            }
        });
    });
}

const putResponse = async (idElement, done) => {
    return fetch(`http://localhost:5002/todos/${idElement}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
    });
}


const postResponse = async (text) => {
    return fetch('http://localhost:5002/todos', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: text,
            done: false,
            checked: false,
        })
    })
}

document.querySelector('#buttonPostTask').addEventListener('click', async () => {
    const input = document.querySelector('#input');
    const verificationValue = verificationEnteredData(input.value);
    if (verificationValue) {
        const response = await postResponse(input.value);
        const data = await response.json();
        saveStatusPOST = true;
        input.value = '';
    } else {
        console.error('Input value = null');
    }
});

function verificationEnteredData(text) {
    if (isNaN(text) && text.trim() !== '') {
        const validation = validationText(text.trim(), /^.{3,120}$/);
        return validation;
    } else {
        alert('The field must be filled');
    }
}

function validationText(text, regex) {
    return regex.test(text);
}

const deleteResponse = async (idElement) => {
    return fetch(`http://localhost:5002/todos/${idElement}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
}



