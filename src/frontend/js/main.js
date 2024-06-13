document.addEventListener('DOMContentLoaded', () =>{
    let databaseHasElements;
    
    (async () => {
        databaseHasElements = await checkDatabaseCompleteness();
    })();

    async function checkDatabaseCompleteness() {
        const response = await fetch('http://localhost:5002/check_data_on_load', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return data;
    }
    
    document.querySelector('#form').addEventListener('submit', event => {
        event.preventDefault();
        submitTask();
    })

    const LOCALL_STORAGE = 'task';
    const checkLocalStorage = JSON.parse(localStorage.getItem(LOCALL_STORAGE)) || [];
    if (checkLocalStorage){
        loadContentLocallStorage(checkLocalStorage);
    }

    function loadContentLocallStorage(tasks){
        renderTask(tasks);
        databaseHasElements = false;
    }

    const getTask = async () => {
        return fetch('http://localhost:5002/todos', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
    }

    setTimeout(() =>{
        document.querySelector('#buttonGetTask').classList.remove('disable-color');
        document.querySelector('#buttonGetTask').addEventListener('click', async () => {
            if (databaseHasElements){
                const response = await getTask(); 
                const data = await response.json();
                localStorage.setItem(LOCALL_STORAGE, JSON.stringify(data));
                checkingAvailabilityTasks(data);
            }else{
                alert('No new tasks have been added');
            }
            databaseHasElements = false;
        });
    }, 1000);

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
                <th id='th-id' scope="row"></th>
                <td>${task.text}</td>
                <td data-progress>${task.done ? 'Done' : 'In progress'}</td>
                <td>
                    <button type="button" data-id="${task._id}" class="btn btn-danger button-delete">Delete</button>
                    <button type="button" data-id="${task._id}" class="btn btn-success ms-1 button-finished">Finished</button>
                </td>
            `;
            tbodyConteiner.append(newTask);
        });

        function listNumbering() {
            const test = document.querySelectorAll('#th-id');
            test.forEach((element, index) => {
                element.textContent = index + 1;
            });
        }

        document.querySelectorAll('.button-delete').forEach(button => {
            button.addEventListener('click', async (event) => {
                const targetButton = event.target;
                const idDeleteElement = targetButton.getAttribute('data-id');
                const response = await deleteTask(idDeleteElement);
                if (response.ok) {
                    targetButton.closest('tr').remove();
                    const getTasksLocallStorage = JSON.parse(localStorage.getItem(LOCALL_STORAGE)) || [];
                    const upDate = upDateRemoveTaskLocallStorage(getTasksLocallStorage, idDeleteElement);
                    localStorage.setItem(LOCALL_STORAGE, JSON.stringify(upDate));
                    listNumbering();
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

                const response = await putTask(idElement, !doneValue); 
                if (!response.ok) {
                    console.error('Failed to update task');
                    if (doneValue) {
                        doneCell.textContent = 'Done';
                    } else {
                        doneCell.textContent = 'In progress';
                    }
                }

                upDateTaskLocallStorage(idElement, doneCell.textContent);
            });
        });

        listNumbering();
    }

    function upDateTaskLocallStorage(id, value){
        const getTasksLocallStorage = JSON.parse(localStorage.getItem(LOCALL_STORAGE)) || [];
        const upDate = getTasksLocallStorage.map(task => {
            if(task._id === id){
                task.done = value;
            }
            return task;
        })
        localStorage.setItem(LOCALL_STORAGE, JSON.stringify(upDate));
    }

    function upDateRemoveTaskLocallStorage(tasks, id){
        const updatedTasks = tasks.filter(task => {
            if (task._id === id){
                console.log(`Element ${task._id} removed`);
                return false; 
            }
            return true; 
        });
        return updatedTasks;
    }

    const putTask = async (idElement, done) => {
        return fetch(`http://localhost:5002/todos/${idElement}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done }),
        });
    }


    const postTask = async (text) => {
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

    document.querySelector('#buttonPostTask').addEventListener('click', () => {
        submitTask();
    });

    async function submitTask(){
        const input = document.querySelector('#input');
        const verificationValue = verificationEnteredData(input.value);
        if (verificationValue) {
            const response = await postTask(input.value);
            const data = await response.json();
            databaseHasElements = true;
            input.value = '';
        } else {
            console.error('Input value = null');
        }
    }

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

    const deleteTask = async (idElement) => {
        return fetch(`http://localhost:5002/todos/${idElement}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
    }

})


