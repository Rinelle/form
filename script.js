const form = document.querySelector('.form'),
    sumbitButton = document.querySelector('#outside-button'),
    errorsList = document.querySelector('.errors-list ul'),
    petInfoBlockSwitcher = document.querySelector('#pet-info-block-switcher'),
    errors = [],
    sendedDataBlock = document.querySelector('#sendedData');    

const ERROR_MESSAGES = {
    firstName: '<b>Имя</b> обязательно для заполнения и должно состоять из текста',
    lastName: '<b>Фамилия</b> обязательна для заполнения и должна состоять из текста',
    surname: '<b>Отчество</b> должно состоять из текста',
    petName: '<b>Имя питомца</b> должно состоять из текста'
};


/** Событие отправки формы */
form.addEventListener('submit', submitFormHandler);


/** Событие нажатия на кнопку снаружи формы для отправки формы */
sumbitButton.addEventListener('click', submitFormHandler);


/** Пользователь выбирает checkbox - есть питомец.
 *  Добавляем/убираем блок с формой для данных по питомцу */
petInfoBlockSwitcher.addEventListener('change', (e) => {
    const petInfoBlock = document.querySelector('.pet-info');
    petInfoBlock.innerHTML = '';

    if (e.target.checked) {
        petInfoBlock.classList.add('form-field');
        petInfoBlock.append(...[
            createLabelWithInput('Имя животного', 'petName'),
            createSelect(['Кошка', 'Собака', 'Попугай', 'Хомяк', 'Черепаха'], 'Вид животного', 'petType')
        ]);

        return;
    }

    petInfoBlock.classList.remove('form-field');
});


/** Отлавливаем события ввода данных в input и убираем класс ошибки если он есть */
form.addEventListener('input', (e) => {
    const elem = e.target;
    
    if (elem.classList.contains('error')) {
        showError(elem, true)
    }
});


/** Запуск сбора данных формы, валидации и отправки данных если форма прошла валидацию
 * @param {Event} event - объект события
 */
function submitFormHandler(event) {
    //Запрещаем событие по умолчанию
    event.preventDefault();

    const data = getData();
    
    errors.length = 0;    
    sendedDataBlock.innerHTML = '';
    
    data.forEach(item => {
        showError(item.elem, validateField(item), ERROR_MESSAGES[item.name])
    });

    showErrorList(errors);

    if (errors.length) {        
        sendedDataBlock.innerHTML = 'Данные не отправлены';

        return;
    }

    sendData(data);    
}


/** Иммитация отправки данных. Вывод данных в текстовом виде.
* @param {{name: string; value: string}[]} data - объект события
*/
function sendData(data) {
    sendedDataBlock.innerHTML = '';

    data.forEach(item => {
        const box = document.createElement('div');
        box.innerHTML = `<b>${item.name}</b>: ${item.value}`;

        sendedDataBlock.append(box);
    });
};


/** Вовзвращает массив данных всеx input формы
 * @returns { {name: string; value: string; elem: Element}[] }
 */
function getData() {    
    const inputs = form.querySelectorAll('input'),
        selects = form.querySelectorAll('select'),
        data = [];

    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        const inputName = input.name;

        if (!inputName) {
            continue;
        }

        if (input.type === 'radio') {
            if (data.find(item => item.name === inputName)) {
                continue;
            }

            input = findInCollection(inputs, (item) => item.type === 'radio' && item.checked && item.name) || inputs[i];
        }

        data.push({
            name: inputName,
            value: input.value,
            elem: input
        });           
         
        
        function findInCollection(collection, exp) {
            for (let i = 0; i < collection.length; i++) {
                const item = collection[i];
                if (exp(item)) {
                    return item;
                }
            }
        }
    }

    selects.forEach(select => {
        const selectName = select.name;

        if (selectName) {
            data.push({
                name: selectName,
                value: select.value,
                elem: select
            })
        }
    });    

    return data;
};


/** Проверяет переданное поле на ошибки и возвращает результат проверки
 * @param {{name: string; value: string; elem: Element}} fieldData - данные input
 */
function validateField(fieldData) {

    switch(fieldData.name) {
        case 'firstName':       
            return validate({ required: true, type: 'text' });            
        case 'lastName':
            return validate({ required: true, type: 'text' });           
        case 'surname':
            return validate({ type: 'text' });            
        case 'petName':
            return validate({ type: 'text' });           
        default: 
            return true;
    }
    

    /** Валидация поля в зависимости от передаваемых параметров     
     * @param {{required: boolean; type: string}} validation - параметры валидации:
     * required - проверка на обязательность заполнения
     * type - проверка на тип поля (text - текстовое)
     */
    function validate(validation = { required: false }) {        

        if (validation.required && fieldData.value === '' ||
                (validation?.type === 'text' && !(isNaN(Number(fieldData.value)) || fieldData.value === ''))) {          
            return false;
        }    
        
        return true;
    }
}


/** Присваивает передаваемому input класс ошибки или снимает его
 * @param {Element} elem - элемент input
 * @param {boolean} isValid - флаг валидности. По умолчанию false,
 * @param {{empty: string; error: string}} errorMessages - пользовательские тексты с ошибками: 
 * empty - ошибка не заполненного поля. 
 * error - ошибка типа данных поля.
 */
function showError(elem, isValid = false, errorMessages = '') {
    const defaultErrorMessage = `Поле <b>${elem.name}</b> заполненно не верно`;

    if (isValid) {
        elem.classList.remove('error');
        return;
    }

    errors.push(errorMessages || defaultErrorMessage);

    elem.classList.add('error');
}


/** Присваивает передаваемому input класс ошибки или снимает его
 * @param {string[]} errors - массив с текстами ошибок
 */
function showErrorList(errors) {
    errorsList.innerHTML = '';

    errors.forEach(error => {
        const listItem = document.createElement('li');

        listItem.innerHTML = error;
        errorsList.append(listItem);
    });    
}


/** Конструктор создания label с input для формы
 * @param {string} labelText - текст лейбла
 * @param {string} inputName - name элемента input
 */
function createLabelWithInput(labelText = '', inputName = '') {
    const labelBlock = document.createElement('label'),
        input = document.createElement('input'),
        labelTextBlock = document.createElement('div');
    
    labelTextBlock.className = 'label-text';
    labelTextBlock.innerText = labelText;

    input.name = inputName;
    input.type = 'text';

    labelBlock.append(...[labelTextBlock, input]);

    return labelBlock;
}

/** Конструктор создания label с select для формы
 * @param {string|number[]} optionsValues - значения для option
 * @param {string} labelText - текст лейбла
 * @param {string} inputName - name элемента input
 */
function createSelect(optionsValues, labelText = '', selectName = '') {
    const selectBlock = document.createElement('select'),
        labelBlock = document.createElement('label'),
        labelTextBlock = document.createElement('div'),

        options = optionsValues.map(value => {
            const option = document.createElement('option');
            option.value = value;
            option.innerText = value;

            return option;
        });

    labelTextBlock.className = 'label-text';
    labelTextBlock.innerText = labelText;

    selectBlock.append(...options);
    selectBlock.name = selectName;

    labelBlock.append(...[labelTextBlock, selectBlock])
    
    return labelBlock;
}




